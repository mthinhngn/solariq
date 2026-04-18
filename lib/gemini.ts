import { GoogleGenerativeAI } from "@google/generative-ai";

import { getGeminiApiKey, isPlaceholder } from "@/lib/env";
import type { AddressReport } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";

export async function runGeminiSmokeTest() {
  const model = getGeminiModel();
  const result = await model.generateContent(
    "Reply with one short sentence confirming the SolarIQ Gemini smoke test is working.",
  );

  return result.response.text();
}

export async function generateAdvisorAnswer(report: AddressReport) {
  const model = getGeminiModel();
  const prompt = buildAdvisorPrompt(report);
  const result = await model.generateContent(prompt);
  const answer = result.response.text().trim();

  if (!answer) {
    throw new Error("Gemini returned an empty advisor answer.");
  }

  return answer;
}

function getGeminiModel() {
  const apiKey = getGeminiApiKey();

  if (!apiKey || isPlaceholder(apiKey)) {
    throw new Error("Gemini API key is missing or still a placeholder.");
  }

  const client = new GoogleGenerativeAI(apiKey);
  return client.getGenerativeModel({ model: GEMINI_MODEL });
}

function buildAdvisorPrompt(report: AddressReport) {
  const assumptions = report.assumptions
    .map(
      (assumption) =>
        `- ${assumption.label}: ${String(assumption.value)} (source: ${assumption.source})`,
    )
    .join("\n");

  return [
    "You are SolarIQ, a practical residential solar advisor.",
    "Write a concise homeowner-facing recommendation based only on the report data below.",
    "Keep it under 180 words.",
    "Use plain English.",
    "Include:",
    "1. A direct recommendation on whether solar looks promising here.",
    "2. One sentence on financial upside using the estimated savings/payback.",
    "3. One sentence on local adoption or neighborhood context.",
    "4. One sentence on the biggest caveat or uncertainty from the assumptions.",
    "Do not use markdown bullets or headings.",
    "",
    `Address: ${report.address}`,
    `Generated at: ${report.generatedAt}`,
    "",
    "Roof:",
    `- Estimated system size (kW): ${report.roof.estimatedSystemSizeKw}`,
    `- Annual production (kWh): ${report.roof.annualProductionKwh}`,
    `- Panel count: ${report.roof.estimatedPanelCount}`,
    `- Roof confidence: ${report.roof.confidence}`,
    `- Roof source: ${report.roof.source}`,
    `- Roof fallback reason: ${report.roof.fallbackReason ?? "none"}`,
    "",
    "Neighborhood:",
    `- City: ${report.neighborhood.city}, ${report.neighborhood.state}`,
    `- Nearby installs: ${report.neighborhood.nearbyInstallCount}`,
    `- Total installs: ${report.neighborhood.totalInstalls}`,
    `- Median system size (kW): ${report.neighborhood.medianKw}`,
    `- Solar adoption rate: ${report.neighborhood.solarAdoptionRate}`,
    `- Neighborhood confidence: ${report.neighborhood.confidence}`,
    "",
    "Savings:",
    `- Estimated upfront cost: ${report.savings.estimatedUpfrontCost}`,
    `- Incentives: ${report.savings.incentives}`,
    `- Net cost: ${report.savings.netCost}`,
    `- Annual bill savings: ${report.savings.annualBillSavings}`,
    `- Payback period years: ${report.savings.paybackPeriodYears}`,
    `- Lifetime savings: ${report.savings.lifetimeSavings}`,
    `- Savings confidence: ${report.savings.confidence}`,
    "",
    "Impact:",
    `- Annual carbon offset tons: ${report.impact.annualCarbonOffsetTons}`,
    `- Equivalent trees planted: ${report.impact.equivalentTreesPlanted}`,
    `- Gasoline gallons avoided: ${report.impact.gasolineGallonsAvoided}`,
    `- Impact confidence: ${report.impact.confidence}`,
    "",
    "Assumptions:",
    assumptions,
  ].join("\n");
}
