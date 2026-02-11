
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const CACHE_PREFIX = 'fuelwatch_ai_cache_';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes for persistent session cache

// In-memory track of active requests to prevent race conditions/duplicate calls
const activeRequests = new Set<string>();

/**
 * Gets cached data from sessionStorage if valid
 */
const getCache = (key: string): string | null => {
  try {
    const item = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp < CACHE_TTL) return data;
    sessionStorage.removeItem(CACHE_PREFIX + key);
    return null;
  } catch {
    return null;
  }
};

/**
 * Sets data to sessionStorage
 */
const setCache = (key: string, data: string) => {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn("Storage full or unavailable", e);
  }
};

/**
 * Robust wrapper for API calls with exponential backoff retry logic
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isRateLimit = errorMsg.includes("429") || error?.status === 429 || errorMsg.includes("quota");
    
    if (isRateLimit && retries > 0) {
      console.warn(`Quota limit reached. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getMarketInsights = async (city: string, stations: any[]) => {
  // Minimize station data to reduce token count and create a stable cache key
  const stationSummary = stations.map(s => ({
    n: s.name,
    p: s.petrolPrice,
    d: s.dieselPrice,
    s: s.availability
  }));
  
  const cacheKey = `market_${city}_${btoa(JSON.stringify(stationSummary)).substring(0, 32)}`;
  const cachedData = getCache(cacheKey);
  
  if (cachedData) return cachedData;
  if (activeRequests.has(cacheKey)) return "Analysis in progress...";

  activeRequests.add(cacheKey);

  try {
    const text = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyst for South Sudan. City: ${city}. Data: ${JSON.stringify(stationSummary)}. Based on current internet information and the provided local data, provide a 60-word summary of prices, the cheapest station, and any shortages. Use a professional, helpful tone.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text || "Insight generation failed.";
    });

    setCache(cacheKey, text);
    return text;
  } catch (error: any) {
    console.error("Gemini Quota Error:", error);
    if (error?.message?.includes("429") || error?.message?.includes("quota")) {
      return "AI analysis is currently paused due to high regional demand. Standard price tracking remains active below.";
    }
    return "Market insights briefly unavailable. Please check the live station list for current pricing.";
  } finally {
    activeRequests.delete(cacheKey);
  }
};

export const getTrendAnalysis = async (history: any[]) => {
  const cacheKey = `trends_global_${btoa(JSON.stringify(history)).substring(0, 32)}`;
  const cachedData = getCache(cacheKey);
  
  if (cachedData) return cachedData;
  if (activeRequests.has(cacheKey)) return "Economic analysis in progress...";

  activeRequests.add(cacheKey);

  try {
    const text = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Fuel data history: ${JSON.stringify(history)}. Write a 80-word economic outlook for South Sudan fuel markets. Focus on supply chain stability.`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text || "No trend analysis available.";
    });

    setCache(cacheKey, text);
    return text;
  } catch (error: any) {
    if (error?.message?.includes("429") || error?.message?.includes("quota")) {
      return "Global trend analysis is currently offline. We are prioritizing local station price updates.";
    }
    return "Supply chain outlook unavailable at the moment. National data suggests typical seasonal variations.";
  } finally {
    activeRequests.delete(cacheKey);
  }
};
