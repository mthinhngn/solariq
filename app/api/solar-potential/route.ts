import { NextResponse } from "next/server";

import { fetchSolarPotential } from "@/lib/google-solar";

export const dynamic = "force-dynamic";

type SolarPotentialRequestBody = {
  lat?: unknown;
  lng?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SolarPotentialRequestBody;
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Request body must include numeric lat and lng values." },
        { status: 400 },
      );
    }

    const result = await fetchSolarPotential(lat, lng);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown solar potential failure.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
