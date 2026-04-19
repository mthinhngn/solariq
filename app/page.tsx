import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  Map,
  Radar,
  SunMedium,
  Waypoints,
} from "lucide-react";

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

const TOP_NAV = ["Intelligence", "Coverage", "Economics", "Methodology"];

const METRICS = [
  { label: "Permit records", value: "12k+", note: "localized install history" },
  { label: "Signal layers", value: "03", note: "roof, permits, neighborhood" },
  { label: "Decision speed", value: "60s", note: "to first-pass recommendation" },
];

const PANELS = [
  {
    icon: Radar,
    title: "Technical enough to trust",
    body: "A denser, more analytical interface that feels closer to energy ops than a marketing splash page.",
  },
  {
    icon: Map,
    title: "Map-room visual language",
    body: "Cool navy layers, steel-blue panels, and cyan highlights create the control-center feel from the reference.",
  },
  {
    icon: Activity,
    title: "Built for decisions",
    body: "The page still reads fast, but every section now frames the product as an intelligence tool, not a signup funnel.",
  },
];

export const metadata: Metadata = {
  title: "Home Solar Viability Reports",
  description:
    "Enter an address to generate a SolarIQ brief with roof potential, estimated savings, and neighborhood solar permit activity.",
};

export default async function Home() {
  const permitRecordCount = await getPermitRecordCount();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 command-grid" />
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-[28rem] w-[28rem] rounded-full bg-cyan-400/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-[8rem] h-[34rem] w-[34rem] rounded-full bg-indigo-400/18 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(67,177,255,0.18),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="command-shell rounded-[30px] px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[linear-gradient(135deg,#5fd2ff,#6f7dff)] text-sm font-extrabold text-slate-950 shadow-[0_16px_30px_rgba(95,210,255,0.25)]">
                SI
              </div>
              <div>
                <p className="font-heading text-2xl font-extrabold uppercase tracking-[0.14em] text-white">
                  SolarIQ
                </p>
                <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
                  Solar intelligence interface
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
              {TOP_NAV.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 transition hover:border-cyan-300/30 hover:text-white"
                >
                  {item}
                </span>
              ))}
            </nav>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch lg:py-10">
          <div className="grid gap-5">
            <div className="command-shell relative overflow-hidden rounded-[36px] px-6 py-6 sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-[44%] bg-[radial-gradient(circle_at_center,rgba(95,210,255,0.20),transparent_62%)]" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full border border-cyan-300/10" />

              <div className="relative flex flex-col gap-8">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200">
                  <Waypoints className="size-3.5" />
                  Solar sector UI direction
                </div>

                <div className="max-w-4xl">
                  <p className="text-sm uppercase tracking-[0.34em] text-slate-400">
                    Roof potential. Permit momentum. Payback clarity.
                  </p>
                  <h1 className="mt-5 font-heading text-[3.2rem] font-extrabold leading-[0.92] tracking-[-0.05em] text-white sm:text-[4.6rem] lg:text-[5.6rem]">
                    A cleaner,
                    <span className="block text-cyan-300">
                      smarter solar command center.
                    </span>
                  </h1>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                    SolarIQ turns an address into a decision-ready energy brief
                    using {permitRecordCount.toLocaleString()} permit records,
                    satellite roof modeling, and neighborhood install behavior.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {METRICS.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5"
                    >
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        {metric.label}
                      </p>
                      <p className="mt-3 font-heading text-4xl font-extrabold text-white">
                        {metric.value}
                      </p>
                      <p className="mt-2 text-sm text-slate-300/80">
                        {metric.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {PANELS.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="command-shell rounded-[30px] px-5 py-5 transition hover:-translate-y-0.5"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-200">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 font-heading text-2xl font-bold leading-tight text-white">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="command-shell rounded-[36px] px-6 py-6 sm:px-7 sm:py-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/78">
                    Run site analysis
                  </p>
                  <h2 className="mt-3 font-heading text-4xl font-extrabold tracking-[-0.04em] text-white">
                    Launch a property brief.
                  </h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-cyan-200">
                  <ArrowRight className="size-5" />
                </div>
              </div>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Enter an address to evaluate roof usability, likely system size,
                neighborhood adoption, and solar economics through a more
                technical interface.
              </p>

              <div className="mt-7">
                <LandingSearchForm />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="command-shell rounded-[30px] px-5 py-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Live signal stack
                </p>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-3">
                    <p className="text-sm text-white">Roof capacity modeling</p>
                    <div className="mt-2 h-2 rounded-full bg-white/8">
                      <div className="h-2 w-[78%] rounded-full bg-[linear-gradient(90deg,#54d6ff,#7b8cff)]" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-3">
                    <p className="text-sm text-white">Local permit density</p>
                    <div className="mt-2 h-2 rounded-full bg-white/8">
                      <div className="h-2 w-[66%] rounded-full bg-[linear-gradient(90deg,#54d6ff,#7b8cff)]" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-3">
                    <p className="text-sm text-white">Payback confidence</p>
                    <div className="mt-2 h-2 rounded-full bg-white/8">
                      <div className="h-2 w-[83%] rounded-full bg-[linear-gradient(90deg,#54d6ff,#7b8cff)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-cyan-300/14 bg-[linear-gradient(180deg,rgba(95,210,255,0.10),rgba(34,48,84,0.92))] px-5 py-5 shadow-[0_30px_80px_rgba(8,12,28,0.34)]">
                <div className="flex items-center gap-3 text-cyan-200">
                  <SunMedium className="size-5" />
                  <p className="text-xs uppercase tracking-[0.28em]">
                    Recommendation mode
                  </p>
                </div>
                <p className="mt-5 font-heading text-3xl font-extrabold leading-tight text-white">
                  High clarity without high friction.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200/88">
                  The new theme is cooler and more technical, but it still keeps
                  the core action obvious: check the address and get the answer.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="command-shell mt-auto rounded-[30px] px-5 py-5">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="font-heading text-3xl font-extrabold uppercase tracking-[0.12em] text-white">
                SolarIQ
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                A solar research interface shaped like an energy dashboard, not
                a startup landing-page template.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Inputs
                </p>
                <p className="mt-2 text-sm text-white/88">
                  Address, roof, permits, neighborhood data
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Outputs
                </p>
                <p className="mt-2 text-sm text-white/88">
                  Capacity, savings, timing, confidence
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Caveat
                </p>
                <p className="mt-2 text-sm text-white/88">
                  Informational only, not financial advice
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
