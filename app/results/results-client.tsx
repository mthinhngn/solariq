"use client";

import { useEffect, useState } from "react";

import { AdvisorPanel } from "@/components/advisor-panel";
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
          headers: {
            "Content-Type": "application/json",
          },
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
        if (controller.signal.aborted) {
          return;
        }

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ef_100%)] px-6 py-10 text-zinc-950 sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
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
            <SummaryBand report={state.report} />
            <NeighborhoodMap
              address={address}
              center={{ lat, lng }}
              neighborhood={state.report.neighborhood}
            />
            <section className="grid gap-6 lg:grid-cols-2">
              <RoofCard roof={state.report.roof} />
              <SavingsCard
                savings={state.report.savings}
                assumptions={state.report.assumptions}
              />
              <ImpactCard impact={state.report.impact} />
            </section>
            <AssumptionsList assumptions={state.report.assumptions} />
            <AdvisorPanel report={state.report} />
          </>
        ) : null}
      </div>
    </main>
  );
}
