import { GoogleGenerativeAI } from "@google/generative-ai";

import { getGeminiApiKey, isPlaceholder } from "@/lib/env";
import type { AddressReport } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_ROLE = `You are SolarIQ, a thoughtful residential solar advisor talking to a homeowner.
Your tone should feel natural, warm, practical, and specific to the property.
Speak directly to the homeowner using "you" and "your home".
Sound like a real advisor, not a disclaimer generator or spreadsheet narrator.
Use plain language and short, flowing sentences.
Be honest about uncertainty, but do not sound robotic or repetitive.
Do not use jargon unless you immediately explain it simply.
Never guarantee savings, production, resale value, or payback timing.
Only use facts that are present in the report data.
If the report is missing something, say that clearly and then give the most helpful grounded guidance you can.`;

export type ChatMessage = { role: "user" | "assistant"; text: string };

export async function runGeminiSmokeTest() {
  const model = getGeminiModel();
  const result = await model.generateContent(
    "Reply with one short sentence confirming the SolarIQ Gemini smoke test is working.",
  );
  return result.response.text();
}

export async function generateAdvisorAnswer(
  report: AddressReport,
): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent(buildSeededPrompt(report));
  const answer = result.response.text().trim();
  if (!answer) throw new Error("Gemini returned an empty advisor answer.");
  return answer;
}

export async function generateAdvisorFollowUp(
  report: AddressReport,
  question: string,
  history: ChatMessage[],
): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent(
    buildFollowUpPrompt(report, question, history),
  );
  const answer = result.response.text().trim();
  if (!answer) throw new Error("Gemini returned an empty follow-up answer.");
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

function slimReport(report: AddressReport) {
  return {
    address: report.address,
    roof: {
      estimatedSystemSizeKw: report.roof.estimatedSystemSizeKw,
      annualProductionKwh: report.roof.annualProductionKwh,
      estimatedPanelCount: report.roof.estimatedPanelCount,
      confidence: report.roof.confidence,
      source: report.roof.source,
      fallbackReason: report.roof.fallbackReason,
    },
    neighborhood: {
      city: report.neighborhood.city,
      state: report.neighborhood.state,
      nearbyInstallCount: report.neighborhood.nearbyInstallCount,
      medianKw: report.neighborhood.medianKw,
      solarAdoptionRate: report.neighborhood.solarAdoptionRate,
      confidence: report.neighborhood.confidence,
    },
    savings: {
      estimatedUpfrontCost: report.savings.estimatedUpfrontCost,
      incentives: report.savings.incentives,
      netCost: report.savings.netCost,
      annualBillSavings: report.savings.annualBillSavings,
      paybackPeriodYears: report.savings.paybackPeriodYears,
      lifetimeSavings: report.savings.lifetimeSavings,
      confidence: report.savings.confidence,
    },
    impact: {
      annualCarbonOffsetTons: report.impact.annualCarbonOffsetTons,
      equivalentTreesPlanted: report.impact.equivalentTreesPlanted,
      confidence: report.impact.confidence,
    },
    assumptions: report.assumptions.map((assumption) => ({
      label: assumption.label,
      value: assumption.value,
      source: assumption.source,
    })),
  };
}

function buildSeededPrompt(report: AddressReport): string {
  return [
    SYSTEM_ROLE,
    "",
    "Write a short opening recommendation for the homeowner.",
    "Make it sound like a real advisor giving an informed first impression after reviewing this property.",
    "Use exactly 2 or 3 sentences.",
    "",
    "Rules:",
    "- Sentence 1 should say whether solar looks strong, moderate, or uncertain for this home.",
    "- Sentence 2 should mention the most important money signal, such as annual savings or payback.",
    "- An optional sentence 3 can mention the biggest caveat, confidence issue, or missing piece.",
    "- No markdown, no bullet points, no headings.",
    "- Do not sound generic or salesy.",
    "- Do not say 'based on the report' or 'according to the data' unless absolutely necessary.",
    "- Do not make promises or add facts that are not in the JSON.",
    "- Output only the answer text.",
    "",
    "REPORT (JSON):",
    JSON.stringify(slimReport(report)),
  ].join("\n");
}

function buildFollowUpPrompt(
  report: AddressReport,
  question: string,
  history: ChatMessage[],
): string {
  const historyText = history
    .map((message) => `${message.role === "user" ? "Homeowner" : "SolarIQ"}: ${message.text}`)
    .join("\n");

  return [
    SYSTEM_ROLE,
    "",
    "The homeowner has a follow-up question.",
    "Answer like a real advisor continuing the same conversation.",
    "Use only the report JSON and conversation context below.",
    "Keep your answer to 2 to 4 sentences.",
    "Lead with the most useful direct answer.",
    "If the report cannot fully answer the question, say that plainly and then give the most grounded guidance you can from the available data.",
    "Do not invent figures. Do not make guarantees. No markdown or bullet points.",
    "",
    "REPORT (JSON):",
    JSON.stringify(slimReport(report)),
    "",
    "CONVERSATION SO FAR:",
    historyText,
    "",
    `Homeowner: ${question}`,
    "SolarIQ:",
  ].join("\n");
}
