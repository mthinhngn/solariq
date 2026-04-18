import { NextResponse } from "next/server";

import { fetchNearby } from "@/lib/nearby";

export const dynamic = "force-dynamic";

type NearbyRequestBody = {
  lat?: unknown;
  lng?: unknown;
  radiusKm?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NearbyRequestBody;
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const radiusKm =
      body.radiusKm == null || body.radiusKm === ""
        ? undefined
        : Number(body.radiusKm);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Request body must include numeric lat and lng values." },
        { status: 400 },
      );
    }

    if (radiusKm != null && !Number.isFinite(radiusKm)) {
      return NextResponse.json(
        { error: "radiusKm must be a number when provided." },
        { status: 400 },
      );
    }

    const result = await fetchNearby(lat, lng, radiusKm);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown nearby lookup failure.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
