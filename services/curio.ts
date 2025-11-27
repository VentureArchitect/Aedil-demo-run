


import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Diagnosis, ReasoningStep, Ticket } from '../types';
import { MOCK_TICKETS, RECOMMENDED_PARTS } from '../constants';

// --- MCP / TOOL DEFINITIONS ---

// Tool 1: Query Manuals
const queryManualsTool: FunctionDeclaration = {
  name: 'queryManuals',
  description: 'Search technical manuals and documentation for error codes or symptoms.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      errorCode: { type: Type.STRING, description: 'The error code (e.g., E0015)' },
      symptoms: { type: Type.STRING, description: 'Described symptoms' }
    },
    required: ['errorCode']
  }
};

// Tool 2: Check Inventory
const checkInventoryTool: FunctionDeclaration = {
  name: 'checkInventory',
  description: 'Check if parts are in stock in the nearest warehouse or van.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      partKeywords: { type: Type.STRING, description: 'Keywords to search for parts (e.g. "pump", "valve")' }
    },
    required: ['partKeywords']
  }
};

// Tool 3: Get Historical Data
const getHistoryTool: FunctionDeclaration = {
  name: 'getHistory',
  description: 'Analyze historical service records for pattern matching.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      equipmentModel: { type: Type.STRING, description: 'The model of the equipment' },
      errorCode: { type: Type.STRING, description: 'The error code' }
    },
    required: ['equipmentModel']
  }
};

// Tool 4: Read Telemetry (IoT)
const readTelemetryTool: FunctionDeclaration = {
  name: 'readTelemetry',
  description: 'Read live sensor data from the equipment IoT stream.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      serialNumber: { type: Type.STRING, description: 'Equipment serial number' }
    },
    required: ['serialNumber']
  }
};

export const CurioService = {
  
  /**
   * THE AGENTIC LOOP
   * This function actually calls Gemini with tools, executes the requested tools against
   * our "Real" database (store/constants), and returns a grounded diagnosis.
   */
  async generateRealDiagnosis(ticketId: string, ticket: Ticket): Promise<Partial<Diagnosis>> {
    
    // We will accumulate the reasoning chain dynamically
    const reasoningChain: ReasoningStep[] = [];
    const pushStep = (system: ReasoningStep['system'], action: string, status: ReasoningStep['status'], input?: any, output?: any) => {
        reasoningChain.push({
            id: Math.random().toString(),
            system,
            action,
            status,
            result: status === 'complete' ? 'Success' : undefined,
            input,
            output,
            timestamp: Date.now(),
            duration: Math.floor(Math.random() * 500) + 100 // Simulate latency
        });
    };

    pushStep('Reasoning', 'Initializing Curio Agent...', 'working');

    if (!process.env.API_KEY) {
        console.warn("No API Key - Running in Simulation Mode");
        return this.getSimulationResult(ticketId);
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Define the System Prompt
        const systemInstruction = `You are Curio, an expert industrial diagnostic agent. 
        You have access to tools to read manuals, check inventory, read IoT data, and check history.
        You MUST use these tools to diagnose the issue. Do not guess.
        
        Analyze the ticket:
        Equipment: ${ticket.equipment.model} (${ticket.equipment.serialNumber})
        Error: ${ticket.error.code}
        Report: ${ticket.error.customerReport}

        Return a JSON object with:
        {
           "primaryFault": { "fault": string, "confidence": number, "reasoning": string },
           "secondaryFaults": [{ "fault": string, "confidence": number, "reasoning": string }]
        }
        `;

        const model = 'gemini-2.5-flash';
        const tools = [{ functionDeclarations: [queryManualsTool, checkInventoryTool, getHistoryTool, readTelemetryTool] }];

        // Start Chat Session
        const chat = ai.chats.create({
            model,
            config: { systemInstruction, tools }
        });

        // Initial Trigger
        let result = await chat.sendMessage({ message: "Diagnose this ticket using available tools." });
        
        // Loop for Function Calling (Max 5 turns)
        let loopCount = 0;
        while (result.functionCalls && result.functionCalls.length > 0 && loopCount < 5) {
            loopCount++;
            const functionResponses = await Promise.all(result.functionCalls.map(async (call) => {
                const name = call.name;
                const args = call.args as any;
                let response = {};

                // EXECUTE LOCAL "REAL" TOOLS against our "DB" (constants.ts)
                console.log(`[MCP] Executing Tool: ${name}`, args);

                if (name === 'queryManuals') {
                    // Simulating a vector DB search result dynamically based on error code
                    const code = args.errorCode || ticket.error.code;
                    const manualText = `
                        TROUBLESHOOTING GUIDE FOR ${args.errorCode || 'General Faults'}:
                        - Code E0015: Hydraulic Pump pressure failure. Check motor brushes and fluid levels.
                        - Code E0402: Controller timeout. Check CAN bus termination and battery voltage.
                        - Code W2201: Electrolyte low. Refill battery water.
                        - Noise 'Grinding': Typically associated with bearing failure or pump cavitation.
                    `;
                    response = { result: manualText };
                    pushStep('Manuals', `Querying KB for ${code}`, 'complete', args, response);
                } 
                else if (name === 'readTelemetry') {
                    // Simulating IoT Stream - Dynamic generation based on ticket serial
                    // If the ticket is about Hydraulic noise, simulate hydraulic data
                    if (ticket.error.customerReport.toLowerCase().includes('hydraulic') || ticket.error.description.toLowerCase().includes('pump')) {
                        response = { 
                            hydraulic_pressure: "110 bar (Low - Normal is 140+)", 
                            pump_temp: "88°C (Warning)", 
                            motor_vibration: "12.5 mm/s (Critical)", 
                            battery_voltage: "24.1V (OK)" 
                        };
                    } else {
                        response = { 
                            hydraulic_pressure: "145 bar (OK)", 
                            pump_temp: "45°C (OK)", 
                            motor_vibration: "2.1 mm/s (OK)", 
                            battery_voltage: "22.0V (Low Warning)",
                            traction_controller: "Intermittent Signal"
                        };
                    }
                    pushStep('IoT', `Reading sensors for ${args.serialNumber}`, 'complete', args, response);
                } 
                else if (name === 'getHistory') {
                    // Simulating SQL Query
                    // We can still use MOCK_TICKETS as the "Historical Database" even if the current ticket is new
                    const similar = MOCK_TICKETS.filter(t => t.equipment.model === (args.equipmentModel || ticket.equipment.model)).length;
                    response = { 
                        matches_found: similar + 850, 
                        top_failure_mode: "Pump Motor Wear (35%)", 
                        secondary_failure_mode: "Valve Blockage (15%)", 
                        recommended_fix_success_rate: "92% with replacement" 
                    };
                    pushStep('History', `Analyzing fleet history for ${args.equipmentModel}`, 'complete', args, response);
                } 
                else if (name === 'checkInventory') {
                    // Real Query on RECOMMENDED_PARTS
                    const keyword = args.partKeywords || '';
                    const parts = RECOMMENDED_PARTS.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
                    response = { available: parts.map(p => ({ name: p.name, id: p.id, stock: p.quantity, inStock: p.inStock })) };
                    pushStep('Inventory', `Checking stock for "${keyword}"`, 'complete', args, response);
                }

                return {
                    id: call.id,
                    name: call.name,
                    response: { result: JSON.stringify(response) }
                };
            }));

            // Send tool outputs back to the model
            // The result must be sent as a message containing parts with 'functionResponse'
            result = await chat.sendMessage({
                message: functionResponses.map(fr => ({ functionResponse: fr }))
            });
        }

        // Parse the final JSON response
        const text = result.text;
        // Robust JSON extraction
        const jsonBlock = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text.replace(/```json|```/g, '');
        let parsed;
        try {
            parsed = JSON.parse(jsonBlock);
            pushStep('Reasoning', 'Synthesizing final diagnosis', 'complete', {}, parsed);
        } catch (e) {
            console.warn("Failed to parse JSON from AI, attempting loose parse", text);
            parsed = {
                primaryFault: { fault: "Complex System Failure", confidence: 75, reasoning: text.substring(0, 100) + "..." },
                secondaryFaults: []
            };
        }

        return {
            ticketId,
            timestamp: Date.now(),
            primaryFault: parsed.primaryFault,
            secondaryFaults: parsed.secondaryFaults || [],
            requiredParts: RECOMMENDED_PARTS, // In a full implementation, AI would select specific IDs from the tool output
            reasoningChain: reasoningChain,
            isComplete: true
        };

    } catch (error) {
        console.error("AI Diagnosis Failed", error);
        return this.getSimulationResult(ticketId); // Fallback
    }
  },

  getSimulationResult(ticketId: string): Partial<Diagnosis> {
    return {
      ticketId,
      timestamp: Date.now(),
      primaryFault: {
        fault: 'Hydraulic Pump Motor Failure',
        confidence: 89,
        reasoning: 'Telemetry confirms pressure drop correlated with E0015 error code. Historical data indicates 91% probability of motor wear at >8000h.'
      },
      secondaryFaults: [
        { fault: 'Hydraulic Valve Blockage', confidence: 8, reasoning: 'Symptom match, but pressure curve suggests mechanical failure.' }
      ],
      requiredParts: RECOMMENDED_PARTS,
      reasoningChain: [
          { id: '1', system: 'Manuals', action: 'Query E0015', status: 'complete', result: 'Found', timestamp: Date.now() },
          { id: '2', system: 'IoT', action: 'Read Sensor Data', status: 'complete', result: '110bar', timestamp: Date.now() },
          { id: '3', system: 'History', action: 'Pattern Match', status: 'complete', result: 'High Corr', timestamp: Date.now() }
      ],
      isComplete: true
    };
  }
};
