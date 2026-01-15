
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe } from "../types";

const API_KEY = process.env.API_KEY as string;

// Helper: Decode base64 to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper: Decode raw PCM data to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzeFridgeImage = async (base64Image: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1],
          },
        },
        {
          text: "List all visible ingredients and food items in this fridge as a simple comma-separated list. Be very specific (e.g., 'half a lemon' instead of 'citrus').",
        },
      ],
    },
  });

  const text = response.text || "";
  return text.split(',').map(item => item.trim()).filter(item => item.length > 0);
};

export const getRecipeSuggestions = async (ingredients: string[], filters: string[]): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Based on these ingredients found in my fridge: ${ingredients.join(', ')}. 
    Suggest 4 distinct recipes. Apply these dietary filters if specified: ${filters.join(', ')}.
    Each recipe must include an ID, title, brief description, difficulty (Easy, Medium, Hard), 
    prep time in minutes, calories, list of ingredients (name, amount, isOwned), 
    and detailed step-by-step instructions. 
    "isOwned" should be true if the ingredient was in the original list.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            prepTime: { type: Type.INTEGER },
            calories: { type: Type.INTEGER },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  isOwned: { type: Type.BOOLEAN }
                },
                required: ["name", "amount", "isOwned"]
              }
            },
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            dietaryTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["id", "title", "description", "difficulty", "prepTime", "calories", "ingredients", "steps", "dietaryTags"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

export const speakStep = async (text: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Instruction: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const bytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, audioContext, 24000, 1);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      return new Promise((resolve) => {
        source.onended = resolve;
      });
    }
  } catch (error) {
    console.error("TTS failed:", error);
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    return new Promise((resolve) => {
      utterance.onend = resolve;
    });
  }
};
