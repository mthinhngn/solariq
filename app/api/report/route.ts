import { NextResponse } from "next/server";

import { buildAddressReport } from "@/lib/report";

type ReportRequestBody = {
  address?: string;
  lat?: number;
  lng?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReportRequestBody;
    const address = body.address?.trim();
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!address || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        {
          error:
            "Request body must include address, lat, and lng with valid values.",
        },
        { status: 400 },
      );
    }

    const report = await buildAddressReport({
      address,
      coords: { lat, lng },
    });

    return NextResponse.json({ report });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown report assembly failure.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
