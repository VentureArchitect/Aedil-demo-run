
import { Diagnosis, ReasoningStep, Ticket, Part } from '../types';
import { RECOMMENDED_PARTS } from '../constants';

export const CurioService = {
  async generateRealDiagnosis(ticketId: string, ticket: Ticket): Promise<Partial<Diagnosis>> {
    const reasoningChain: ReasoningStep[] = [];
    
    // Helper to log steps (simulated backend logs)
    const pushStep = (system: ReasoningStep['system'], action: string, status: ReasoningStep['status'], input?: any, output?: any) => {
        reasoningChain.push({
            id: Math.random().toString(),
            system, action, status,
            result: status === 'complete' ? 'Success' : undefined,
            input, output,
            timestamp: Date.now(),
            duration: Math.floor(Math.random() * 500) + 100
        });
    };

    // 🔴 FORCE GOLDEN PATH FOR SAP OVERLAY DEMO
    // We explicitly check for 'context-ticket' which is passed from the SAP "Run Diagnosis" button.
    const isOverlayTriggered = ticketId === 'context-ticket';
    
    const isGoldStandardCase = 
      isOverlayTriggered ||
      ticket.equipment.model.includes('214') || 
      ticket.equipment.serialNumber.includes('91165099') ||
      ticket.customer.name.toLowerCase().includes('müller') ||
      ticket.customer.name.toLowerCase().includes('gmbh');

    if (isGoldStandardCase) {
        // --- CINEMATIC SEQUENCE ENFORCEMENT ---
        // We artificially delay each step to match the UI animation timing (now approx 1.1s per step)
        
        // 1. INITIALIZATION & HISTORY (0s - 1.5s)
        pushStep('Reasoning', 'Initializing Curio Agent...', 'working');
        await new Promise(r => setTimeout(r, 1500)); 
        pushStep('History', 'Checking Service History (SN 91165099)', 'complete', { serial: '91165099' }, { result: '39 service entries found.' });
        
        // 2. MANUALS CORRELATION (1.5s - 2.8s)
        await new Promise(r => setTimeout(r, 1300));
        pushStep('Manuals', 'Correlating 3xxx Errors with Technical Manuals', 'complete', { codes: '3xxx' }, { result: 'Matches voltage drop symptom patterns.' });
        
        // 3. IOT TELEMETRY (2.8s - 4.1s)
        await new Promise(r => setTimeout(r, 1300));
        pushStep('IoT', 'Monitoring CAN-Bus Node 4 Activity', 'complete', { node: 4 }, { result: 'High latency detected. No sensor faults.' });

        // 4. REASONING & ROOT CAUSE (4.1s - 5.4s)
        await new Promise(r => setTimeout(r, 1300));
        pushStep('Reasoning', 'Isolating Root Cause via Discriminator Logic', 'complete', {}, { result: 'Root Cause: Mechanical Resistance (Drehkranzlager).' });

        // 5. FINALIZING (5.4s - 6.0s)
        await new Promise(r => setTimeout(r, 600));

        // --- RESULT GENERATION ---
        const enrichedParts: Part[] = RECOMMENDED_PARTS.filter(p => ['50452065', '51509314', '51470075'].includes(p.id)).map(p => {
             if (p.id === '50452065') return { ...p, rank: 1, confidence: 48.33, reasoning: "Hauptursache: Mechanische Überlastung führt zu Stromspitzen." };
             if (p.id === '51509314') return { ...p, rank: 2, confidence: 13.13, reasoning: "Sekundärverdacht: Sensorlager (unwahrscheinlich ohne Pos-Fehler)." };
             if (p.id === '51470075') return { ...p, rank: 3, confidence: 11.54, reasoning: "Geringe Wahrscheinlichkeit: Initiator." };
             return p;
        });

        return {
            ticketId,
            timestamp: Date.now(),
            primaryFault: {
                fault: 'Rep. Satz; Drehkranzlager (Rang 1)',
                confidence: 48.33,
                shortReasoning: 'Mechanischer Widerstand verursacht Spannungsabfall und Abschaltung. Keine Sensorfehler (3154).',
                reasoning: 'Das Drehkranzlager der Lenkung ist stark verschlissen. Der Lenkmotor muss permanent gegen hohen Widerstand ankämpfen, was das elektrische System bis zum Zusammenbruch belastet (Spannungseinbrüche).'
            },
            secondaryFaults: [
                { fault: 'Sensorlager; kpl. montiert (Rang 2)', confidence: 13.13, reasoning: 'Liefert falsche Werte, erklärt aber nicht den totalen Spannungsabfall.' },
                { fault: 'Initiator (Sonder NPN) (Rang 3)', confidence: 11.54, reasoning: 'Würde eher zu Schleichgang führen.' }
            ],
            requiredParts: enrichedParts.sort((a,b) => (a.rank || 99) - (b.rank || 99)),
            reasoningChain: reasoningChain,
            isComplete: true
        };
    }

    // Fallback for non-demo scenarios (Standard Speed)
    await new Promise(r => setTimeout(r, 2000));
    return {
      ticketId,
      timestamp: Date.now(),
      primaryFault: {
        fault: 'Hydraulic Pump Failure',
        confidence: 92.00,
        reasoning: 'Symptoms match Cluster 3 (Hydraulics).',
        shortReasoning: 'Hydraulic pressure loss detected.'
      },
      secondaryFaults: [],
      requiredParts: RECOMMENDED_PARTS.slice(0, 2),
      reasoningChain: [],
      isComplete: true
    };
  }
};
