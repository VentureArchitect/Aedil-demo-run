
/**
 * LLM Service Layer
 * Direct client-side call to OpenAI for the "Hybrid Prototype".
 * In production, this would be routed through a proxy to hide the API key.
 */

interface ExtractedData {
  ticketId: string;
  customer: string;
  debitorId: string;
  equipment: string;
  error: string;
  priority: string;
  desc: string;
}

export async function analyzeEmailWithGPT(text: string, apiKey: string): Promise<ExtractedData | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an industrial automation agent. Extract structured service data from the email text. 
            Return ONLY valid JSON with keys: ticketId (generate one if missing), customer, debitorId (guess if missing), equipment (serial number), error (code), priority (1-Very High, 2-High, 3-Medium), desc (short summary).
            If equipment serial is missing, look for patterns like 516...
            If data is missing, infer reasonable defaults based on context.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenAI Error:", data.error);
      throw new Error(data.error.message);
    }

    const content = data.choices[0].message.content;
    // Clean up markdown if present
    const jsonStr = content.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("LLM Analysis Failed:", error);
    return null;
  }
}
