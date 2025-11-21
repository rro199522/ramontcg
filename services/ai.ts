import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCardArt = async (cardName: string, cardType: string): Promise<string | null> => {
  try {
    // Updated prompt: Explicitly forbidding text/letters/words
    const prompt = `Anime style elemental visual effect for a RPG attack card named "${cardName}" of element ${cardType}. Style: High quality cel-shaded digital art, similar to Pokémon move animations or Genshin Impact skill icons. Dynamic composition, bright vivid colors, elemental energy (fire, water, lightning, etc.) swirling or exploding. ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO ALPHABET. Pure elemental abstract representation.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
        outputMimeType: 'image/png'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      return `data:image/png;base64,${imageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating art:", error);
    throw error;
  }
};

export const generateElementalTexture = async (typeLabel: string): Promise<string | null> => {
  try {
    const prompt = `Seamless abstract dark background texture representing the element ${typeLabel}. Style: Flat, minimal, RPG fantasy art. Solid colors with subtle elemental patterns (fire, water, ice). High contrast, wallpaper style. NO TEXT, NO CHARACTERS, NO OBJECTS.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/png'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      return `data:image/png;base64,${imageBytes}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating texture:", error);
    throw error;
  }
};