"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AddressReport } from "@/types";

type AdvisorPanelProps = {
  report: AddressReport;
};

export function AdvisorPanel({ report }: AdvisorPanelProps) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
  }, [report, retryCount]);

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>SolarIQ advisor</CardTitle>
          <CardDescription>
            Personalized guidance based on the roof and neighborhood signals.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!answer && !error ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[78%]" />
          </div>
        ) : null}

        {answer ? <p className="text-sm leading-6">{answer}</p> : null}

        {error ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Advisor unavailable: {error}
            </p>
            <Button
              variant="outline"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Retry
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
