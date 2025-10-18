
import { AIProvider } from "@/types/aiProviders";
import { toast } from "sonner";

type AIRequestParams = {
  aiProvider: AIProvider;
  serverUrl: string;
  selectedModel: string;
  apiKey: string;
  prompt: string;
};

export async function callAIProvider({
  aiProvider,
  serverUrl,
  selectedModel,
  apiKey,
  prompt
}: AIRequestParams) {
  let response;
  let result;

  switch (aiProvider) {
    case 'lmstudio':
      response = await fetch(serverUrl + "/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant that creates detailed mindmaps in JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error connecting to LM Studio: ${response.statusText}`);
      }
      
      result = await response.json();
      break;

    case 'ollama': {
      // Try /api/chat with chat payload, then /api/generate with flat prompt if 404
      async function tryOllamaChat() {
        return await fetch(serverUrl + "/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant that creates detailed mindmaps in JSON format."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          }),
        });
      }

      async function tryOllamaGenerate() {
        // For /api/generate, use flat prompt and disable streaming for easier parsing
        return await fetch(serverUrl + "/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: prompt,
            temperature: 0.7,
            // max_tokens is not always supported, but include if your Ollama version supports it
            max_tokens: 4000,
            stream: false
          }),
        });
      }

      response = await tryOllamaChat();
      if (response.status === 404) {
        response = await tryOllamaGenerate();
      }

      if (!response.ok) {
        throw new Error(`Error connecting to Ollama: ${response.status} ${response.statusText}`);
      }

      // Always expect a single JSON object (stream: false)
      result = await response.json();
      break;
    }

    case 'gemini': {
      if (!apiKey) {
        throw new Error("API key is required for Gemini");
      }

      // Normalize model name: if user passed e.g. "gemini-1.5-flash" or "gemini-1.5-flash-latest",
      // ensure we use a known latest suffix when appropriate.
      let modelName = selectedModel;
      if (/^gemini-\d+(\.\d+)?-/.test(selectedModel) && !selectedModel.endsWith("-latest")) {
        modelName = `${selectedModel}-latest`;
      }

      // Helper to call the given path and return parsed json (or null on 404)
      async function tryGeminiEndpoint(path: string) {
        const res = await fetch(`${serverUrl}${path}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are a helpful AI assistant that creates detailed mindmaps in JSON format. ${prompt}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000
            }
          }),
        });

        // Return the raw response object for caller to inspect status and json
        return res;
      }

      // Try v1beta first (current docs), but fall back to /v1 on 404
      const v1betaPath = `/v1beta/models/${modelName}:generateContent`;
      let geminiResponse = await tryGeminiEndpoint(v1betaPath);

      if (geminiResponse.status === 404) {
        // Try stable v1 path
        const v1Path = `/v1/models/${modelName}:generateContent`;
        geminiResponse = await tryGeminiEndpoint(v1Path);
      }

      if (!geminiResponse.ok) {
        // Provide a helpful error message including status code and text
        const text = await geminiResponse.text().catch(() => "");
        throw new Error(`Error connecting to Gemini API (${geminiResponse.status}): ${geminiResponse.statusText} ${text}`);
      }

      const geminiResult = await geminiResponse.json();

      // Gemini returns candidates array; extract the first candidate text safely
      const candidateText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text ||
        geminiResult?.candidates?.[0]?.content?.[0]?.text ||
        null;

      if (!candidateText) {
        throw new Error("Gemini response did not include candidate text");
      }

      result = {
        choices: [
          {
            message: {
              content: candidateText
            }
          }
        ]
      };

      break;
    }

    case 'grok':
      if (!apiKey) {
        throw new Error("API key is required for Grok API");
      }
      
      response = await fetch(`${serverUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant that creates detailed mindmaps in JSON format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error connecting to Grok API: ${response.statusText}`);
      }
      
      result = await response.json();
      break;

    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }
  
  // Extract the content from the response
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error(`No content returned from the AI provider`);
  }

  return content;
}

export function parseAIResponse(content: string) {
  // Extract the JSON from the content (it might be wrapped in markdown code blocks)
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                     content.match(/```\n([\s\S]*?)\n```/) || 
                     content.match(/{[\s\S]*}/);
  
  const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
  
  try {
    // Parse the JSON
    const mindmapData = JSON.parse(jsonString.replace(/```/g, '').trim());
    
    if (!mindmapData.nodes || !mindmapData.edges) {
      throw new Error("Invalid mindmap data format");
    }

    return mindmapData;
  } catch (parseError) {
    console.error("JSON parsing error:", parseError);
    console.log("Raw content:", content);
    throw new Error("Failed to parse AI response as valid JSON");
  }
}
