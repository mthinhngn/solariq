import Link from "next/link";

export const dynamic = "force-dynamic";

const checks = [
  {
    href: "/dev/supabase",
    title: "Supabase",
    detail: "Runs SELECT * LIMIT 5 against the configured main table.",
  },
  {
    href: "/dev/solar",
    title: "Google Solar",
    detail: "Calls buildingInsights.findClosest for a known California coordinate.",
  },
  {
    href: "/dev/gemini",
    title: "Gemini",
    detail: "Runs a one-off generateContent call and prints the returned text.",
  },
];

export default function DevIndexPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            SolarIQ Dev Checks
          </p>
          <h1 className="text-4xl font-semibold">Phase 0 verification</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Use these throwaway routes to verify Supabase, Google Solar, and
            Gemini before building the product flow.
          </p>
        </div>

        <div className="grid gap-4">
          {checks.map((check) => (
            <Link
              key={check.href}
              href={check.href}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-400 hover:bg-slate-900/80"
            >
              <div className="text-lg font-medium">{check.title}</div>
              <div className="mt-1 text-sm text-slate-300">{check.detail}</div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Assumptions: Supabase defaults to table <code>installations</code>.
          Override it with <code>?table=your_table_name</code> on the Supabase
          page if your primary table uses a different name.
        </div>
      </div>
    </main>
  );
}
