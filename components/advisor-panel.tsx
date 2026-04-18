"use client";

import { useEffect, useState } from "react";

import type { AddressReport } from "@/types";

type AdvisorPanelProps = {
  report: AddressReport;
};

export function AdvisorPanel({ report }: AdvisorPanelProps) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAdvisorAnswer() {
      setAnswer(null);
      setError(null);

      try {
        const response = await fetch("/api/advisor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ report }),
        });
        const payload = (await response.json()) as {
          answer?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Advisor request failed.");
        }

        if (!payload.answer) {
          throw new Error("Advisor response was missing an answer.");
        }

        if (!cancelled) {
          setAnswer(payload.answer);
        }
      } catch (advisorError) {
        if (!cancelled) {
          setError(
            advisorError instanceof Error
              ? advisorError.message
              : "Unknown advisor failure.",
          );
        }
      }
    }

    void loadAdvisorAnswer();

    return () => {
      cancelled = true;
    };
  }, [report]);

  return (
    <section className="border border-slate-300 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold">SolarIQ advisor</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        {error
          ? `Advisor unavailable: ${error}`
          : answer ?? "Generating personalized recommendation..."}
      </p>
    </section>
  );
}
