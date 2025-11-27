

import React, { useEffect, useState, useRef } from 'react';
import { useOS } from '../../store';
import { Mic, MicOff, Send, Zap, Loader2, Volume2, Square, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- AUDIO UTILS (PCM Handling) ---
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

export const Porta: React.FC = () => {
  const { porta, addPortaMessage, finalizePortaSession, setPortaStatus } = useOS();
  const [isConnected, setIsConnected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [volume, setVolume] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Refs for Audio Context & Session
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const volumeAnimationFrame = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Transcription Accumulators
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  
  // Playback cursor
  const nextStartTimeRef = useRef<number>(0);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [porta.messages]);

  // CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      disconnectLiveSession(false); // Don't finalize on unmount, just cleanup
    };
  }, []);

  // Flush pending text to the store so it's not lost
  const flushTranscripts = () => {
      let hasNewData = false;
      if (currentInputTranscription.current.trim()) {
          addPortaMessage('user', currentInputTranscription.current);
          currentInputTranscription.current = '';
          hasNewData = true;
      }
      if (currentOutputTranscription.current.trim()) {
          addPortaMessage('ai', currentOutputTranscription.current);
          currentOutputTranscription.current = '';
          hasNewData = true;
      }
      return hasNewData;
  };

  const disconnectLiveSession = (shouldFinalize = false) => {
     if (reconnectTimeoutRef.current) {
         clearTimeout(reconnectTimeoutRef.current);
         reconnectTimeoutRef.current = null;
     }

     // Stop Volume Animation
     if (volumeAnimationFrame.current) {
         cancelAnimationFrame(volumeAnimationFrame.current);
     }

     // Flush any remaining text buffers
     flushTranscripts();

     // 1. Stop Microphone Stream
     if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
     }

     // 2. Disconnect Processor (Critical)
     if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
        processorRef.current = null;
     }
     
     if (analyserRef.current) {
         analyserRef.current.disconnect();
         analyserRef.current = null;
     }

     // 3. Suspend & Close Audio Contexts
     if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.suspend().then(() => audioContextRef.current?.close()).catch(() => {});
        audioContextRef.current = null;
     }
     if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.suspend().then(() => inputAudioContextRef.current?.close()).catch(() => {});
        inputAudioContextRef.current = null;
     }

     setIsConnected(false);
     setPortaStatus('idle');
     setVolume(0);
     nextStartTimeRef.current = 0;
     sessionPromiseRef.current = null;

     // Trigger workflow if requested
     if (shouldFinalize) {
         // Small delay to ensure state updates settle
         setTimeout(() => {
             finalizePortaSession();
         }, 300);
     }
  };

  const handleEndCall = () => {
      disconnectLiveSession(true);
  };

  const connectLiveSession = async () => {
    setErrorMsg(null);
    setIsRetrying(false);
    
    // Prevent double invocation
    if (sessionPromiseRef.current) return;

    if (!process.env.API_KEY) {
        setErrorMsg('No API Key found.');
        addPortaMessage('system', 'Error: No API Key found for Live connection.');
        return;
    }
    
    try {
        setPortaStatus('listening'); // Optimistic UI update
        addPortaMessage('system', 'Initializing audio uplink...');
        
        // --- 1. SETUP MEDIA STREAM ---
        // Ensure we ask for permissions first if not already granted
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                channelCount: 1, 
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 16000
            } 
        });
        mediaStreamRef.current = stream;

        // --- 2. SETUP AUDIO CONTEXTS ---
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        
        // Input Context: Force 16kHz to match Gemini preference
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        inputAudioContextRef.current = inputCtx;
        
        // Output Context: 24kHz for high quality output
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        // Resume contexts immediately (Critical for "sudden disruption" fix)
        await inputCtx.resume();
        await outputCtx.resume();

        // --- 3. BUILD AUDIO GRAPH ---
        const source = inputCtx.createMediaStreamSource(stream);
        
        // Analyser for Visualizer
        const analyser = inputCtx.createAnalyser();
        analyser.fftSize = 64; 
        analyser.smoothingTimeConstant = 0.5;
        analyserRef.current = analyser;
        
        // Processor for Gemini
        // 4096 buffer size = ~250ms latency but safer against glitches
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor; // Prevent GC
        
        // Routing: Source -> Analyser -> Processor -> Mute -> Destination
        source.connect(analyser);
        analyser.connect(processor);
        
        // IMPORTANT: Connect processor to destination via a mute gain node.
        const muteNode = inputCtx.createGain();
        muteNode.gain.value = 0;
        processor.connect(muteNode);
        muteNode.connect(inputCtx.destination);

        // Start Visualizer Loop
        const updateVolume = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            let sum = 0;
            for(let i=0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            
            // Normalize somewhat (0-255 -> 0-1)
            setVolume(avg);
            
            volumeAnimationFrame.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();

        // --- 4. CONNECT TO GEMINI ---
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const config = {
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                },
                // Enable Transcription so we can capture the text for the ticket!
                inputAudioTranscription: {}, 
                outputAudioTranscription: {},
                // More human-like personality
                systemInstruction: "You are Porta, a helpful, empathetic, and professional field service intake agent. Your goal is to have a natural conversation to collect: Company Name, Machine Model, Error Code, and Symptoms. Do not be robotic. Be conversational and concise. If the user gives info, acknowledge it naturally."
            }
        };

        const sessionPromise = ai.live.connect({
            model: config.model,
            config: config.config,
            callbacks: {
                onopen: () => {
                    console.log("[Porta] Connected");
                    setIsConnected(true);
                    addPortaMessage('system', 'Voice uplink established. Speak naturally.');
                    
                    // Start processing audio
                    processor.onaudioprocess = (e) => {
                        // Double check if context is still active
                        if (inputCtx.state === 'suspended') {
                            inputCtx.resume();
                        }

                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcm16 = floatTo16BitPCM(inputData);
                        
                        // Convert to Base64
                        const uint8 = new Uint8Array(pcm16.buffer);
                        let binary = '';
                        const len = uint8.byteLength;
                        for (let i = 0; i < len; i++) binary += String.fromCharCode(uint8[i]);
                        const b64 = btoa(binary);

                        // Send to Gemini
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: {
                                    mimeType: 'audio/pcm;rate=16000',
                                    data: b64
                                }
                            });
                        }).catch(e => {
                            console.error("Send Error", e);
                            // SIlent fail for individual chunks
                        });
                    };
                },
                onmessage: async (msg: LiveServerMessage) => {
                    // 1. Handle Transcription (Text)
                    if (msg.serverContent?.outputTranscription) {
                        currentOutputTranscription.current += msg.serverContent.outputTranscription.text;
                    } 
                    if (msg.serverContent?.inputTranscription) {
                        currentInputTranscription.current += msg.serverContent.inputTranscription.text;
                    }
                    
                    // 2. Commit Text to Chat History on Turn Complete
                    if (msg.serverContent?.turnComplete) {
                        flushTranscripts();
                    }

                    // 3. Handle Audio Output
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) {
                        setPortaStatus('speaking');
                        
                        const pcmData = base64ToUint8Array(audioData);
                        const int16Array = new Int16Array(pcmData.buffer);
                        const float32Array = new Float32Array(int16Array.length);
                        for (let i = 0; i < int16Array.length; i++) {
                            float32Array[i] = int16Array[i] / 32768.0;
                        }
                        
                        const buffer = outputCtx.createBuffer(1, float32Array.length, 24000);
                        buffer.getChannelData(0).set(float32Array);
                        
                        const source = outputCtx.createBufferSource();
                        source.buffer = buffer;
                        source.connect(outputCtx.destination);
                        
                        // Gapless Scheduling
                        const currentTime = outputCtx.currentTime;
                        if (nextStartTimeRef.current < currentTime) {
                            nextStartTimeRef.current = currentTime;
                        }
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buffer.duration;
                        
                        source.onended = () => {
                             // Reset status to listening if no more audio is scheduled soon
                             if (outputCtx && outputCtx.currentTime >= nextStartTimeRef.current - 0.2) {
                                 setPortaStatus('listening');
                             }
                        };
                    }
                    
                    if (msg.serverContent?.interrupted) {
                        console.log("[Porta] Interrupted");
                        // Reset audio queue
                        nextStartTimeRef.current = 0;
                        setPortaStatus('listening');
                        // Capture whatever text was interrupted
                        flushTranscripts();
                    }
                },
                onclose: () => {
                    console.log("[Porta] Session Closed");
                    setIsConnected(false);
                    setPortaStatus('idle');
                    addPortaMessage('system', 'Connection closed.');
                    sessionPromiseRef.current = null;
                },
                onerror: (err) => {
                    console.error("[Porta] Error", err);
                    const msg = (err as any)?.message || "Connection Error";
                    setErrorMsg(msg);
                    addPortaMessage('system', `Connection disrupted: ${msg}`);
                    setIsConnected(false);
                    setPortaStatus('idle');
                    sessionPromiseRef.current = null;
                }
            }
        });

        sessionPromiseRef.current = sessionPromise;

        // Catch initial connection errors (e.g., Service Unavailable)
        sessionPromise.catch(e => {
            console.error("[Porta] Connection Initialization Failed", e);
            setErrorMsg("Service Unavailable");
            addPortaMessage('system', 'Service unavailable. Retrying in 2s...');
            setIsConnected(false);
            setPortaStatus('idle');
            sessionPromiseRef.current = null;
            
            // Auto Retry logic
            if (!isRetrying) {
                setIsRetrying(true);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectLiveSession();
                }, 2000);
            }
        });

    } catch (e) {
        console.error("Setup Failed", e);
        setErrorMsg('Setup Failed');
        addPortaMessage('system', 'Failed to initialize audio subsystem.');
        setIsConnected(false);
        setPortaStatus('idle');
        sessionPromiseRef.current = null;
    }
  };

  const handleSendText = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    addPortaMessage('user', inputValue);
    
    if (sessionPromiseRef.current && isConnected) {
         sessionPromiseRef.current.then(session => {
            session.sendRealtimeInput({
                 media: {
                     mimeType: 'text/plain',
                     data: btoa(inputValue)
                 }
            });
         });
    }
    setInputValue('');
  };

  return (
    <div className="h-full bg-black text-white flex flex-col font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F12] to-black pointer-events-none"></div>

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-black/40 backdrop-blur-sm">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <Zap className="w-4 h-4 text-white fill-white" />
             </div>
             <div>
                 <div className="font-bold text-sm tracking-wide text-white">AEDIL Porta</div>
                 <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Live Voice Agent</div>
             </div>
         </div>
         <button 
             onClick={() => finalizePortaSession()}
             className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold border border-white/10 transition-colors text-zinc-300 hover:text-white"
         >
             Create Ticket
         </button>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-0">
          
          {/* Central Orb / Waveform */}
          <div className="relative mb-12">
             {/* Glow Layer */}
             <div 
                className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-200 ${
                    porta.status === 'listening' ? 'bg-emerald-500/20' : 
                    porta.status === 'speaking' ? 'bg-indigo-500/40' : 'bg-transparent'
                }`}
                style={{ transform: `scale(${1 + (volume/50)})` }}
             ></div>
             
             {/* Button Wrapper */}
             <div className="relative flex items-center justify-center">
                 <button 
                     onClick={isConnected ? handleEndCall : connectLiveSession}
                     style={{ transform: `scale(${1 + (volume/200)})` }}
                     className={`w-32 h-32 rounded-full border-[3px] transition-all duration-300 flex items-center justify-center backdrop-blur-sm cursor-pointer z-10 ${
                     isConnected 
                        ? (porta.status === 'speaking' 
                            ? 'border-indigo-400/50 bg-indigo-500/10' 
                            : 'border-emerald-500/50 bg-emerald-500/10')
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                 }`}>
                     {porta.status === 'processing' ? (
                         <Loader2 className="w-12 h-12 text-white animate-spin" />
                     ) : isConnected ? (
                         porta.status === 'speaking' ? (
                             <Volume2 className="w-12 h-12 text-indigo-400" />
                         ) : (
                             // Visualizer Bars inside the button
                             <div className="flex gap-1 items-end h-10">
                                 <div className="w-1.5 bg-emerald-500 rounded-full animate-[bounce_1s_infinite]" style={{ height: Math.max(10, volume/2) + 'px' }}></div>
                                 <div className="w-1.5 bg-emerald-500 rounded-full animate-[bounce_1.2s_infinite]" style={{ height: Math.max(15, volume/1.5) + 'px' }}></div>
                                 <div className="w-1.5 bg-emerald-500 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: Math.max(10, volume/2) + 'px' }}></div>
                             </div>
                         )
                     ) : (
                         <div className="flex flex-col items-center gap-2">
                            <MicOff className="w-10 h-10 text-zinc-600" />
                            <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-600">Tap to Talk</span>
                         </div>
                     )}
                 </button>
             </div>
          </div>

          <div className="text-center space-y-2 max-w-md px-6 min-h-[60px]">
              <h2 className="text-2xl font-light tracking-tight transition-all text-white">
                  {isConnected 
                    ? (porta.status === 'speaking' ? "Porta is speaking..." : "Listening...")
                    : "Ready to Connect"}
              </h2>
              <p className="text-zinc-500 text-sm flex items-center justify-center gap-2">
                 {errorMsg ? (
                     <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errorMsg}</span>
                 ) : (
                     isConnected ? "Live Audio Uplink Active" : "Start voice intake session"
                 )}
              </p>
          </div>
      </div>

      {/* Chat History (Fade in at bottom) */}
      <div className="h-48 px-6 pb-4 overflow-y-auto mask-fade-top space-y-3 z-10 relative">
          {porta.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed border ${
                      msg.sender === 'user' ? 'bg-[#1C1C1E] text-white border-white/10' : 
                      msg.sender === 'system' ? 'bg-transparent text-zinc-500 border-transparent text-center w-full italic' :
                      'bg-indigo-500/10 text-indigo-200 border-indigo-500/20'
                  }`}>
                      {msg.text}
                  </div>
              </div>
          ))}
          <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="h-20 bg-[#0A0A0A] border-t border-white/10 flex items-center px-6 gap-4 z-20">
          <button 
              onClick={isConnected ? handleEndCall : connectLiveSession}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isConnected ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
              title={isConnected ? "End Call & Process" : "Start Call"}
          >
              {isConnected ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <form onSubmit={handleSendText} className="flex-1 relative">
              <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isConnected ? "Type to interrupt..." : "Connect first..."}
                  disabled={!isConnected}
                  className="w-full h-12 bg-[#1C1C1E] border border-white/10 rounded-full px-5 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-50 placeholder:text-zinc-600"
              />
              <button 
                  type="submit"
                  disabled={!inputValue.trim() || !isConnected}
                  className="absolute right-2 top-2 bottom-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-white/10 transition-colors hover:bg-indigo-500 text-white"
              >
                  <Send className="w-4 h-4" />
              </button>
          </form>
      </div>

    </div>
  );
};
