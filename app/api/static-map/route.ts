import { NextResponse } from "next/server";

import { getGoogleSolarApiKey, isPlaceholder } from "@/lib/env";

export const dynamic = "force-dynamic";

const MAP_SIZE = "1280x920";
const MAP_SCALE = "2";
const HOME_MARKER = "size:mid|color:blue";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const center = searchParams.get("center");
  const markers = searchParams.getAll("markers");
  const key = getGoogleSolarApiKey();

  if (!center) {
    return NextResponse.json(
      { error: "Missing required center query parameter." },
      { status: 400 },
    );
  }

  if (!key || isPlaceholder(key)) {
    return NextResponse.json(
      { error: "Google Static Maps API key is missing." },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    center,
    zoom: "14",
    size: MAP_SIZE,
    scale: MAP_SCALE,
    maptype: "roadmap",
    key,
  });

  params.append("markers", `${HOME_MARKER}|${center}`);

  for (const marker of markers) {
    params.append("markers", marker);
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: `Static Maps API ${response.status}: ${detail}` },
      { status: 500 },
    );
  }

  const imageBuffer = await response.arrayBuffer();

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "image/png",
      "Cache-Control": "no-store",
    },
  });
}
