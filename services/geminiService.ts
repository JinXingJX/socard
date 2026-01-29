import { GoogleGenAI, Type, Schema } from '@google/genai';
import { CardData } from '../types';
import { SYSTEM_PROMPT } from '../constants';

// Initializing the GenAI client
// Using a factory function to ensure API key is fresh
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: "Creative name for the card, max 25 chars"
    },
    description: {
      type: Type.STRING,
      description: "Flavor text, max 2 sentences"
    },
    rarity: {
      type: Type.STRING,
      enum: ["Common", "Rare", "Epic", "Legendary", "Mythic"]
    },
    visualPrompt: {
      type: Type.STRING,
      description: "The final TCG card prompt generated from the template and rules in the system prompt."
    },
    varList: {
      type: Type.OBJECT,
      properties: {
        sourceWork: { type: Type.STRING },
        sourceMedia: { type: Type.STRING },
        stylePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        characterName: { type: Type.STRING },
        characterTitle: { type: Type.STRING },
        appearancePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaponProps: { type: Type.STRING },
        actionPose: { type: Type.STRING },
        skillName: { type: Type.STRING },
        visualEffects: { type: Type.STRING },
      }
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        attack: { type: Type.INTEGER, description: "Attack power 0-100" },
        defense: { type: Type.INTEGER, description: "Defense power 0-100" }
      },
      required: ["attack", "defense"]
    }
  },
  required: ["name", "description", "rarity", "visualPrompt", "varList", "stats"]
};

export const generateCardMetadata = async (
  userPrompt: string,
): Promise<Omit<CardData, 'imageUrl' | 'id' | 'priceSol' | 'metadataUri' | 'imageCid' | 'mintAddress'>> => {
  const ai = getAiClient();
  
  const promptText = `Create a fantasy character card based on this prompt: "${userPrompt}".
  Return JSON with all fields defined in the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating metadata:", error);
    throw error;
  }
};

export const generateCardImage = async (visualPrompt: string): Promise<string> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: visualPrompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: "3:4", 
            imageSize: "1K"
        }
      }
    });

    // Iterate through parts to find the image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
