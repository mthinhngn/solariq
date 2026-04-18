import { Suspense } from "react";

import { AdvisorPanel } from "@/components/advisor-panel";
import { buildAddressReport } from "@/lib/report";

export const dynamic = "force-dynamic";

type ResultsSearchParams = {
  address?: string;
  lat?: string;
  lng?: string;
};

type PageProps = {
  searchParams: Promise<ResultsSearchParams>;
};

export default function ResultsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <ResultsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResultsContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const address = params.address?.trim();
  const lat = Number(params.lat);
  const lng = Number(params.lng);

  if (!address || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return (
      <main>
        <pre>
          {JSON.stringify(
            {
              error:
                "Missing or invalid search params. Expected address, lat, and lng.",
              received: {
                address: params.address ?? null,
                lat: params.lat ?? null,
                lng: params.lng ?? null,
              },
            },
            null,
            2,
          )}
        </pre>
      </main>
    );
  }

  const report = await buildAddressReport({
    address,
    coords: { lat, lng },
  });

  return (
    <main className="space-y-4 p-6">
      <AdvisorPanel report={report} />
      <pre>{JSON.stringify({ address: report.address }, null, 2)}</pre>
      <pre>{JSON.stringify({ generatedAt: report.generatedAt }, null, 2)}</pre>
      <pre>{JSON.stringify(report.roof, null, 2)}</pre>
      <pre>{JSON.stringify(report.neighborhood, null, 2)}</pre>
      <pre>{JSON.stringify(report.savings, null, 2)}</pre>
      <pre>{JSON.stringify(report.impact, null, 2)}</pre>
      <pre>{JSON.stringify(report.assumptions, null, 2)}</pre>
    </main>
  );
}
