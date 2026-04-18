import { fetchSolarBuildingInsights } from "@/lib/google-solar";

export const dynamic = "force-dynamic";

const testLocation = {
  label: "Googleplex area, Mountain View, CA",
  lat: 37.422,
  lng: -122.0841,
};

export default async function DevSolarPage() {
  let result: unknown = null;
  let errorMessage: string | null = null;

  try {
    result = await fetchSolarBuildingInsights(
      testLocation.lat,
      testLocation.lng,
    );
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Unknown Solar API failure.";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <p
            className={`text-sm uppercase tracking-[0.3em] ${
              errorMessage ? "text-amber-300" : "text-emerald-300"
            }`}
          >
            0.9 Google Solar
          </p>
          <h1 className="text-3xl font-semibold">
            {errorMessage ? "Solar check failed" : "200 + data confirmed"}
          </h1>
          {!errorMessage ? (
            <p className="text-sm text-slate-300">
              Test location: {testLocation.label} ({testLocation.lat},{" "}
              {testLocation.lng})
            </p>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            {errorMessage}
          </div>
        ) : (
          <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-200">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
