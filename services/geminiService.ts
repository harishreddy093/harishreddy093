import { GoogleGenAI } from "@google/genai";
import { ProductAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductLink = async (url: string, manualPrompt?: string): Promise<ProductAnalysisResult> => {
  const modelId = "gemini-2.5-flash";

  let domainContext = "";
  let searchHint = "";

  // Helper to extract a clean search term from the URL
  const getSearchTermFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(p => p.length > 2);
      // Usually the last long segment is the product slug
      const slug = pathSegments[pathSegments.length - 1] || "";
      // Replace hyphens with spaces and take the first few words
      return slug.replace(/-/g, ' ').replace(/\d{5,}/g, '').split(' ').slice(0, 6).join(' ');
    } catch (e) {
      return "";
    }
  };

  const searchTerm = getSearchTermFromUrl(url);

  if (url.includes("reliancedigital.in")) {
    domainContext = `
      DOMAIN CONTEXT: Reliance Digital (India).
      - CURRENCY: INR (₹).
      - PRICE FORMAT: Often ends in '900' (e.g., 1,19,900, 1,34,900, 1,59,900).
      - KNOWN ISSUE: The digit '9' is often misread as '2' due to the font.
      - ERROR CORRECTION RULE: If you see "112900", it is INCORRECT. Change it to "119900".
      - ERROR CORRECTION RULE: If you see "119000", it is likely "119900".
      - LOGIC: Compare against standard Apple India pricing tiers (79900, 89900, 119900, 134900, 159900).
      - TARGET: Look specifically for "Deal Price" or "Offer Price". IGNORE "MRP" and "EMI".
    `;
    searchHint = `SEARCH QUERY: "Reliance Digital ${searchTerm} official price India"`;
  } else if (url.includes("amazon") || url.includes("flipkart")) {
    domainContext = `
      DOMAIN CONTEXT: Indian E-commerce (Amazon/Flipkart).
      - CURRENCY: INR.
      - TARGET: Largest, boldest price is the "Selling Price" (Deal Price).
      - EXCLUDE: "EMI" (monthly), "MRP" (crossed out), "Save up to".
    `;
    searchHint = `SEARCH QUERY: "${searchTerm} current price amazon flipkart India"`;
  } else {
    searchHint = `SEARCH QUERY: "${searchTerm} price"`;
  }

  const prompt = `
    Analyze this product URL: "${url}".
    ${domainContext}
    ${searchHint ? `Strategy: Use Google Search to find: '${searchHint}'` : ''}
    ${manualPrompt ? `Additional user context: ${manualPrompt}` : ''}
    
    TASK: Extract the EXACT CURRENT SELLING PRICE (Integer only).
    
    STEPS:
    1. IDENTIFY PRODUCT: accurately identify the model (e.g. iPhone 15 Pro 128GB vs 256GB).
    2. FIND PRICE: Locate the "Deal Price" or "Offer Price".
    3. VALIDATE: 
       - Is this price logical for this specific model? (e.g. An iPhone 15 Pro cannot be 1,12,000 if market rate is 1,19,900).
       - If the price looks like 112900, CORRECTION -> 119900.
       - If the price looks like 119000, CORRECTION -> 119900.
    4. OUTPUT: Return strictly JSON.

    Return the result strictly as a raw JSON object:
    {
      "productName": "string (concise product name)",
      "price": number (raw integer, e.g., 119900),
      "currency": "string (INR, USD, etc.)",
      "category": "string (Electronics, Fashion, Home, etc.)",
      "carbonFootprintKg": number (estimated CO2 impact)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "";
    
    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Find the first '{' and last '}' to extract JSON
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
       // Fallback: try to find just a price if JSON fails
       throw new Error("Invalid JSON response");
    }
    
    const jsonStr = text.substring(start, end + 1);
    const data = JSON.parse(jsonStr);

    // Fallback image map (since we can't reliably get the exact image url without scraping)
    const imageMap: Record<string, string> = {
      'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800',
      'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800',
      'Home': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=800',
      'Automotive': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?auto=format&fit=crop&q=80&w=800',
      'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800',
      'Other': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
    };

    return {
      productName: data.productName || "Unknown Product",
      price: typeof data.price === 'number' ? data.price : 0,
      currency: data.currency || "USD",
      category: data.category || "Other",
      carbonFootprintKg: data.carbonFootprintKg || 15,
      imageUrl: imageMap[data.category || 'Other'] || imageMap['Other']
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const getInsightMessage = async (goals: any[]): Promise<string> => {
   const modelId = "gemini-2.5-flash";
   const prompt = `
     Based on these saving goals: ${JSON.stringify(goals.map(g => ({ name: g.productName, progress: (g.currentAmount/g.targetAmount)*100, carbon: g.carbonFootprintKg })))}
     Give me a short, 1-sentence motivational quote or sustainability fact related to their progress.
   `;
   try {
     const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt
     });
     return response.text || "Keep pushing towards your goals!";
   } catch (e) {
     return "Consistency is the key to success.";
   }
}