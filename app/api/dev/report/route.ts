import { demoAddresses } from "@/lib/demo-addresses";
import { buildAddressReport } from "@/lib/report";
import type { AddressReport } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const demo = demoAddresses[0];

  try {
    const report: AddressReport = await buildAddressReport({
      address: demo.address,
      coords: {
        lat: demo.lat,
        lng: demo.lng,
      },
    });

    console.log("Scratch address report:");
    console.log(JSON.stringify(report, null, 2));

    return Response.json({
      ok: true,
      verifiedShape: hasAddressReportShape(report),
      report,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown report assembly failure.";

    console.error("Scratch address report failed:", message);

    return Response.json(
      {
        ok: false,
        verifiedShape: false,
        error: message,
      },
      { status: 500 },
    );
  }
}

function hasAddressReportShape(report: AddressReport): boolean {
  return Boolean(
    report.address &&
      report.generatedAt &&
      report.roof &&
      report.neighborhood &&
      report.savings &&
      report.impact &&
      Array.isArray(report.assumptions),
  );
}
