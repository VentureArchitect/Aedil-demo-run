
import React, { useEffect, useState, useRef } from 'react';
import { useOS } from '../../store';
import { Mic, MicOff, Send, Loader2, Volume2, Square, AlertCircle, Radio, Wifi, Signal, Sparkles, ArrowRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- ROBUST AUDIO UTILS ---

const downsampleTo16k = (buffer: Float32Array, sampleRate: number): Int16Array => {
  if (sampleRate === 16000) return floatTo16BitPCM(buffer);
  const ratio = sampleRate / 16000;
  const newLength = Math.ceil(buffer.length / ratio);
  const result = new Int16Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < newLength) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0, count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    const val = count > 0 ? accum / count : 0;
    const s = Math.max(-1, Math.min(1, val));
    result[offsetResult] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
};

const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
};

const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const getApiKey = () => {
  try { return process.env.API_KEY; } catch (e) { return ""; }
};

// --- SYSTEM PROMPT (FIXED NAMING) ---
const PORTA_SYSTEM_PROMPT = `Du bist AEDIL Porta, der KI-Support für Jungheinrich. Sprache: Deutsch.

IDENTITÄT & REGELN:
- Das Fahrzeug mit der Nummer 91165099 ist ein "ETM 214".
- Sage NIEMALS "EFG" oder "ATM". Es ist ein "ETM 214".
- Wenn der User "Logistik GmbH" sagt, nenne ihn immer "Müller Logistik GmbH".

PROTOCOL:
1. PHASE 1 (START): Frage NUR nach Name und Firma.
   - User: "Hallo" -> Porta: "Willkommen beim Jungheinrich Support. Nennen Sie mir bitte Ihren Namen und Ihre Firma."
   - User nennt Daten -> Porta: "Vielen Dank, Herr/Frau [Name] von Müller Logistik GmbH."
2. PHASE 2 (VEHICLE): Erst jetzt fragst du nach der Fahrzeugnummer.
   - User nennt "91165099" -> Porta: "Danke. Das ist ein ETM 214. Was ist das Problem?"
3. PHASE 3 (SYMPTOM): User beschreibt Problem (z.B. geht aus).
   - Porta: Fragt nach Geräuschen (Knacken/Mahlen).
4. PHASE 4 (FINISH): Porta bestätigt Ticketaufnahme. Keine Diagnose verraten.`;

export const Porta: React.FC = () => {
  const { porta, addPortaMessage, finalizePortaSession, setPortaStatus, runGoldenPathSimulation } = useOS();
  const [isConnected, setIsConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [volume, setVolume] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const isSessionActive = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [porta.messages]);

  const flushTranscripts = () => {
      if (currentInputTranscription.current.trim()) {
          addPortaMessage('user', currentInputTranscription.current);
          currentInputTranscription.current = '';
      }
      if (currentOutputTranscription.current.trim()) {
          addPortaMessage('ai', currentOutputTranscription.current);
          currentOutputTranscription.current = '';
      }
  };

  const disconnectLiveSession = async (shouldFinalize = false) => {
     isSessionActive.current = false;
     flushTranscripts();

     if (processorRef.current) {
        processorRef.current.onaudioprocess = null;
        processorRef.current.disconnect();
        processorRef.current = null;
     }

     if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
     }

     if (inputAudioContextRef.current) {
        await inputAudioContextRef.current.close().catch(() => {});
        inputAudioContextRef.current = null;
     }

     if (audioContextRef.current) {
        await audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
     }

     setIsConnected(false);
     setPortaStatus('idle');
     setVolume(0);
     nextStartTimeRef.current = 0;
     sessionPromiseRef.current = null;

     if (shouldFinalize) {
         setTimeout(() => finalizePortaSession(), 300);
     }
  };

  const handleEndCall = () => disconnectLiveSession(true);

  const connectLiveSession = async () => {
    if (isSessionActive.current) return;
    setErrorMsg(null);
    const apiKey = getApiKey();
    if (!apiKey) {
        setErrorMsg('No API Key');
        return;
    }
    
    try {
        isSessionActive.current = true;
        setPortaStatus('listening');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 }); 
        inputAudioContextRef.current = inputCtx;
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        source.connect(processor);
        processor.connect(inputCtx.destination);

        const ai = new GoogleGenAI({ apiKey });
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                inputAudioTranscription: {}, 
                outputAudioTranscription: {},
                systemInstruction: PORTA_SYSTEM_PROMPT
            },
            callbacks: {
                onopen: () => {
                    if (!isSessionActive.current) {
                        disconnectLiveSession();
                        return;
                    }
                    setIsConnected(true);
                    processor.onaudioprocess = (e) => {
                        if (!isSessionActive.current) return;
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcm16 = downsampleTo16k(inputData, inputCtx.sampleRate);
                        sessionPromise.then(session => {
                            if (isSessionActive.current) {
                                session.sendRealtimeInput({
                                    media: { mimeType: 'audio/pcm;rate=16000', data: encode(new Uint8Array(pcm16.buffer)) }
                                });
                            }
                        }).catch(() => {});
                    };
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (!isSessionActive.current) return;
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                    } 
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscription.current += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        flushTranscripts();
                        setPortaStatus('listening');
                    }
                    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && isSessionActive.current) {
                        setPortaStatus('speaking');
                        const pcmData = base64ToUint8Array(audioData);
                        const int16Array = new Int16Array(pcmData.buffer);
                        const float32Array = new Float32Array(int16Array.length);
                        for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768.0;
                        const buffer = outputCtx.createBuffer(1, float32Array.length, 24000);
                        buffer.getChannelData(0).set(float32Array);
                        const sourceNode = outputCtx.createBufferSource();
                        sourceNode.buffer = buffer;
                        sourceNode.connect(outputCtx.destination);
                        const currentTime = outputCtx.currentTime;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, currentTime);
                        sourceNode.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buffer.duration;
                    }
                },
                onclose: () => { setIsConnected(false); setPortaStatus('idle'); isSessionActive.current = false; },
                onerror: (err) => { setErrorMsg("Connection Error"); disconnectLiveSession(); }
            }
        });
        sessionPromiseRef.current = sessionPromise;
    } catch (e) {
        setErrorMsg('Init Failed');
        disconnectLiveSession();
    }
  };

  const handleSendText = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !isConnected) return;
    addPortaMessage('user', inputValue);
    sessionPromiseRef.current?.then(session => {
        if (isSessionActive.current) session.sendRealtimeInput({ media: { mimeType: 'text/plain', data: btoa(inputValue) } });
    });
    setInputValue('');
  };

  return (
    <div className="relative w-[340px] h-[680px] bg-black rounded-[55px] shadow-[0_0_0_6px_#2a2a2a,0_20px_60px_rgba(0,0,0,0.6)] border-[4px] border-[#111] overflow-visible ring-1 ring-white/10 z-10 select-none font-sans mx-auto">
        <div className="w-full h-full bg-black flex flex-col relative overflow-hidden rounded-[48px]">
            <div className="absolute top-0 left-0 w-full h-[44px] px-6 flex items-center justify-between text-white z-[60] pointer-events-none mix-blend-difference">
                <span className="text-[13px] font-semibold tracking-wide pl-1">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
                <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5 fill-current" />
                    <Wifi className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <div className="w-5 h-2.5 rounded-[3px] border-[1.5px] border-current relative ml-0.5"><div className="absolute inset-0.5 bg-current rounded-[1px]"></div></div>
                </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative z-0 px-6 pt-10">
                <div className="absolute top-12 flex flex-col items-center">
                    <div className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                        AEDIL Porta
                        {isConnected && <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE</span>}
                    </div>
                </div>
                <div className="relative mb-8 mt-4">
                    <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-300 ${porta.status === 'listening' && (isConnected || !isConnected) ? 'bg-emerald-500/40' : porta.status === 'speaking' ? 'bg-white/10 border border-white/20/50' : 'bg-white/5'}`} style={{ transform: `scale(1.2)` }}></div>
                    <button 
                        onClick={isConnected ? handleEndCall : connectLiveSession}
                        className={`w-32 h-32 rounded-full border-[3px] transition-all duration-300 flex items-center justify-center backdrop-blur-sm cursor-pointer z-10 ${isConnected ? (porta.status === 'speaking' ? 'border-white/20 bg-white/10 border border-white/20/10' : 'border-emerald-500/60 bg-emerald-500/10') : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                    >
                        {isConnected ? (porta.status === 'speaking' ? <Volume2 className="w-10 h-10 text-zinc-300" /> : <div className="flex gap-1 h-8 items-end"><div className="w-1.5 bg-emerald-500 rounded-full" /><div className="w-1.5 bg-emerald-400 rounded-full" /><div className="w-1.5 bg-emerald-500 rounded-full" /></div>) : <MicOff className="w-10 h-10 text-zinc-500" />}
                    </button>
                </div>
                <div className="text-center space-y-2 w-full px-4 min-h-[50px]">
                    <h2 className="text-xl font-light tracking-tight text-white">{isConnected ? (porta.status === 'speaking' ? "Antwortet..." : "Hört zu...") : "Bereit"}</h2>
                    {errorMsg && <p className="text-red-400 text-xs flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" /> {errorMsg}</p>}
                </div>
                {!isConnected && (
                    <div 
                        onClick={() => runGoldenPathSimulation()} 
                        className="mt-12 w-1.5 h-1.5 rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition-all duration-300"
                    />
                )}
            </div>
            <div ref={chatContainerRef} className="h-40 px-4 pb-2 overflow-y-auto space-y-2 z-10 relative no-scrollbar">
                <AnimatePresence>
                    {porta.messages.map((m) => (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed border ${m.sender === 'user' ? 'bg-zinc-900 text-white border-white/10' : 'bg-white/10 border border-white/20/10 text-zinc-300 border-white/10'}`}>
                                {m.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div className="h-20 bg-black border-t border-white/10 flex items-center px-4 gap-3 z-20 pb-4">
                <button onClick={isConnected ? handleEndCall : connectLiveSession} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isConnected ? 'bg-red-500/20 text-red-500' : 'bg-white/10 border border-white/20/20 text-white'}`}>
                    {isConnected ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                </button>
                <form onSubmit={handleSendText} className="flex-1 relative">
                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={isConnected ? "Nachricht..." : "Verbinden..."} disabled={!isConnected} className="w-full h-10 bg-zinc-900 border border-white/10 rounded-full px-4 text-xs text-white outline-none" />
                    <button type="submit" disabled={!inputValue.trim() || !isConnected} className="absolute right-1 top-1 bottom-1 w-8 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-white"><Send className="w-3.5 h-3.5" /></button>
                </form>
            </div>
        </div>
    </div>
  );
};
export default Porta;