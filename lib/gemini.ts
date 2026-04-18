import { GoogleGenerativeAI } from "@google/generative-ai";

import { getGeminiApiKey, isPlaceholder } from "@/lib/env";

export async function runGeminiSmokeTest() {
  const apiKey = getGeminiApiKey();

  if (!apiKey || isPlaceholder(apiKey)) {
    throw new Error("Gemini API key is missing or still a placeholder.");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(
    "Reply with one short sentence confirming the SolarIQ Gemini smoke test is working.",
  );

  return result.response.text();
}
