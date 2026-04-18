import { LandingSearchForm } from "@/app/components/landing-search-form";
import { nearbyInstallsGroundTruth } from "@/lib/demo-addresses";
import { getSupabaseClient } from "@/lib/supabase";

const FALLBACK_PERMIT_RECORD_COUNT = 12000;

async function getPermitRecordCount() {
  try {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from(nearbyInstallsGroundTruth.primaryTable)
      .select("*", { count: "exact", head: true });

    if (error) {
      throw error;
    }

    return typeof count === "number" && count > 0
      ? count
      : FALLBACK_PERMIT_RECORD_COUNT;
  } catch {
    return FALLBACK_PERMIT_RECORD_COUNT;
  }
}

export default async function Home() {
  const permitRecordCount = await getPermitRecordCount();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fafaf9_0%,#f5f5f4_100%)] px-6 py-16 text-zinc-950">
      <div className="w-full max-w-3xl rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.08)] sm:p-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            SolarIQ
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Find your home&apos;s solar potential in under a minute.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
            Enter your address to estimate rooftop capacity, neighborhood solar
            activity, and what a system could mean for your monthly bill.
          </p>
        </div>

        <div className="mt-10 max-w-2xl">
          <LandingSearchForm permitRecordCount={permitRecordCount} />
        </div>
      </div>
    </main>
  );
}
