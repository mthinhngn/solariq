import { NextResponse } from "next/server";

import { getGoogleMapsApiKey, isPlaceholder } from "@/lib/env";

export const dynamic = "force-dynamic";

type GeocodeRequestBody = {
  address?: unknown;
};

type GoogleGeocodingResponse = {
  results?: Array<{
    formatted_address?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
  status?: string;
  error_message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GeocodeRequestBody;
    const address =
      typeof body.address === "string" ? body.address.trim() : "";

    if (!address) {
      return NextResponse.json(
        { error: "Request body must include a non-empty address string." },
        { status: 400 },
      );
    }

    const apiKey = getGoogleMapsApiKey();

    if (!apiKey || isPlaceholder(apiKey)) {
      return NextResponse.json(
        { error: "Google Maps API key is missing or still a placeholder." },
        { status: 500 },
      );
    }

    const params = new URLSearchParams({
      address,
      key: apiKey,
    });
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Geocoding API ${response.status}: ${detail}`);
    }

    const payload = (await response.json()) as GoogleGeocodingResponse;
    const firstResult = payload.results?.[0];
    const lat = firstResult?.geometry?.location?.lat;
    const lng = firstResult?.geometry?.location?.lng;

    if (!firstResult || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      const detail = payload.error_message ?? payload.status ?? "ZERO_RESULTS";

      return NextResponse.json(
        { error: `Geocoding failed: ${detail}` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      formattedAddress: firstResult.formatted_address ?? address,
      lat,
      lng,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown geocoding failure.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
