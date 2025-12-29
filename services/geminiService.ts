import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSkinLore = async (weaponName: string, skinName: string, rarity: string): Promise<string> => {
  if (!apiKey) {
    return "API Key missing. Cannot analyze skin pattern.";
  }

  try {
    const prompt = `
      You are a tactical weapons expert in a shooter game like Standoff 2 or CS:GO.
      Write a short, cool, one-sentence description (lore) for a weapon skin.
      Weapon: ${weaponName}
      Skin Name: ${skinName}
      Rarity: ${rarity}
      
      The description should sound exclusive and tactical. 
      Example: "Forged in the fires of a dying star, this polymer coating reflects the void of space."
      Keep it under 25 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "No description available from HQ.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection to command center failed. Lore unavailable.";
  }
};
