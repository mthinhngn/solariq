import { ResultsClient } from "@/app/results/results-client";

export const dynamic = "force-dynamic";

type ResultsSearchParams = {
  address?: string;
  lat?: string;
  lng?: string;
};

type PageProps = {
  searchParams: Promise<ResultsSearchParams>;
};

export default async function ResultsPage({ searchParams }: PageProps) {
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

  return <ResultsClient address={address} lat={lat} lng={lng} />;
}
