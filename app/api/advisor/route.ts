import { NextResponse } from "next/server";

import { generateAdvisorAnswer } from "@/lib/gemini";
import type { AddressReport } from "@/types";

export const dynamic = "force-dynamic";

type AdvisorRequestBody = {
  report?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdvisorRequestBody;

    if (!body.report || typeof body.report !== "object") {
      return NextResponse.json(
        { error: "Request body must include a report object." },
        { status: 400 },
      );
    }

    const answer = await generateAdvisorAnswer(body.report as AddressReport);

    return NextResponse.json({
      answer,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown advisor failure.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
