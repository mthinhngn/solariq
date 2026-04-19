"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { AdvisorChat } from "@/components/report/AdvisorChat";
import { AssumptionsList } from "@/components/report/AssumptionsList";
import { ImpactCard } from "@/components/report/ImpactCard";
import { NeighborhoodMap } from "@/components/report/NeighborhoodMap";
import { ReportCardSkeleton } from "@/components/report/ReportCardSkeleton";
import { ReportErrorCard } from "@/components/report/ReportErrorCard";
import { RoofCard } from "@/components/report/RoofCard";
import { SavingsCard } from "@/components/report/SavingsCard";
import { SummaryBand } from "@/components/report/SummaryBand";
import type { AddressReport } from "@/types";

type ResultsClientProps = {
  address: string;
  lat: number;
  lng: number;
};

type ReportState =
  | { status: "loading"; error: null; report: null }
  | { status: "error"; error: string; report: null }
  | { status: "success"; error: null; report: AddressReport };

export function ResultsClient({ address, lat, lng }: ResultsClientProps) {
  const [state, setState] = useState<ReportState>({
    status: "loading",
    error: null,
    report: null,
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      setState({ status: "loading", error: null, report: null });

      try {
        const response = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, lat, lng }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          report?: AddressReport;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Report request failed.");
        }

        if (!payload.report) {
          throw new Error("Report response was missing data.");
        }

        setState({ status: "success", error: null, report: payload.report });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          error:
            error instanceof Error ? error.message : "Unknown report failure.",
          report: null,
        });
      }
    }

    void loadReport();
    return () => {
      controller.abort();
    };
  }, [address, lat, lng, retryCount]);

  return (
    <main className="dark relative min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,#0b1530_0%,#040814_58%,#02040c_100%)] px-6 py-10 text-white sm:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[10%] report-solar-scene"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 report-grid opacity-55"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[8%] top-[8%] size-[420px] rounded-full bg-cyan-400/10 blur-[120px]"
        style={{ animation: "orb-drift 18s ease-in-out infinite" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[4%] top-[24%] size-[460px] rounded-full bg-indigo-500/14 blur-[150px]"
        style={{ animation: "orb-drift 22s ease-in-out infinite reverse" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[36%] bottom-[8%] size-[360px] rounded-full bg-sky-400/8 blur-[130px]"
        style={{ animation: "orb-drift 26s ease-in-out infinite" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 70% at 50% 50%, transparent 36%, rgba(0,0,0,0.62) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-md transition hover:border-cyan-300/30 hover:bg-white/[0.08] hover:text-white"
          style={{ animation: "fade-up 0.4s ease-out both" }}
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          New search
        </Link>

        {state.status === "loading" ? (
          <>
            <ReportCardSkeleton />
            <section className="grid gap-6 lg:grid-cols-2">
              <ReportCardSkeleton />
              <ReportCardSkeleton />
              <ReportCardSkeleton />
              <ReportCardSkeleton />
            </section>
          </>
        ) : null}

        {state.status === "error" ? (
          <ReportErrorCard
            message={state.error}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        ) : null}

        {state.status === "success" ? (
          <>
            <div style={{ animation: "fade-up 0.5s ease-out 0.05s both" }}>
              <SummaryBand report={state.report} />
            </div>

            <hr
              className="h-px border-0 bg-gradient-to-r from-transparent via-cyan-300/24 to-transparent"
              style={{ animation: "fade-up 0.4s ease-out 0.15s both" }}
            />

            <section
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              style={{ animation: "fade-up 0.55s ease-out 0.2s both" }}
            >
              <RoofCard roof={state.report.roof} />
              <SavingsCard
                savings={state.report.savings}
                assumptions={state.report.assumptions}
              />
              <ImpactCard impact={state.report.impact} />
            </section>

            <hr
              className="h-px border-0 bg-gradient-to-r from-transparent via-cyan-300/24 to-transparent"
              style={{ animation: "fade-up 0.4s ease-out 0.35s both" }}
            />

            <div style={{ animation: "fade-up 0.55s ease-out 0.4s both" }}>
              <NeighborhoodMap
                address={address}
                center={{ lat, lng }}
                neighborhood={state.report.neighborhood}
              />
            </div>

            <hr
              className="h-px border-0 bg-gradient-to-r from-transparent via-cyan-300/24 to-transparent"
              style={{ animation: "fade-up 0.4s ease-out 0.5s both" }}
            />

            <div style={{ animation: "fade-up 0.55s ease-out 0.55s both" }}>
              <AssumptionsList assumptions={state.report.assumptions} />
            </div>

            <AdvisorChat report={state.report} />
          </>
        ) : null}
      </div>
    </main>
  );
}
