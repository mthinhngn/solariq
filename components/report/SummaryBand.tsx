import { MapPin, Sun } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShareButton } from "@/components/report/ShareButton";
import type { AddressReport, Confidence } from "@/types";

type SummaryBandProps = {
  report: AddressReport;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const confidenceRank: Record<Confidence, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function SummaryBand({ report }: SummaryBandProps) {
  const confidence = getOverallConfidence(report);
  const addressLines = formatAddress(report.address);
  const recommendation = buildRecommendation(report);

  return (
    <Card
      className="relative overflow-hidden border-none py-0 text-white shadow-[0_32px_90px_rgba(8,18,42,0.38)] ring-0"
      style={{
        background:
          "linear-gradient(135deg, #17274f 0%, #1a3162 38%, #204780 70%, #1b3569 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-y-[-20%] w-28 bg-gradient-to-r from-transparent via-white/18 to-transparent"
          style={{ animation: "beam-sweep 5.8s ease-in-out infinite" }}
        />
      </div>

      <div
        className="pointer-events-none absolute -right-16 top-0 h-full w-[38%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_68%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-[56%] size-72 rounded-full bg-cyan-300/10 blur-3xl"
        aria-hidden="true"
      />

      <CardContent className="grid gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1.4fr_auto] lg:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-white/20 bg-white/12 text-white" variant="secondary">
                {confidenceLabel(confidence)} confidence
              </Badge>
              <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.24em] text-white/72">
                <Sun className="size-3.5" />
                Summary
              </span>
            </div>
            <ShareButton />
          </div>

          <p
            className="max-w-3xl text-lg font-medium leading-8 text-balance sm:text-2xl sm:leading-9"
            style={{ animation: "count-in 0.6s ease-out 0.35s both" }}
          >
            {recommendation}
          </p>
        </div>

        <div
          className="rounded-[28px] border border-white/18 bg-white/10 p-4 backdrop-blur-sm sm:p-5"
          style={{ animation: "pop-in 0.5s ease-out 0.5s both" }}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-full bg-white/12 p-2 text-white/88">
              <MapPin className="size-4" />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/68">
                Property
              </p>
              <p className="text-sm font-semibold text-white sm:text-base">
                {addressLines[0]}
              </p>
              {addressLines[1] ? (
                <p className="text-sm text-white/74">{addressLines[1]}</p>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function buildRecommendation(report: AddressReport) {
  const annualSavings = report.savings.annualBillSavings;
  const payback = report.savings.paybackPeriodYears;
  const sizeKw = report.roof.estimatedSystemSizeKw;
  const installCount = report.neighborhood.totalInstalls;

  if (annualSavings >= 1500 || (payback > 0 && payback <= 8 && sizeKw >= 5)) {
    return `This home looks like a strong solar candidate, with roughly ${currencyFormatter.format(annualSavings)} in yearly bill savings and a payback period near ${formatYears(payback)}.`;
  }

  if (annualSavings >= 900 || (payback > 0 && payback <= 12 && sizeKw >= 4)) {
    return `This property appears promising for solar, and the estimated ${currencyFormatter.format(annualSavings)} in annual savings suggests it is worth getting installer quotes now.`;
  }

  if (sizeKw >= 3 || installCount >= 25) {
    return "Solar could still make sense here, but the economics look more moderate today, so comparing a few right-sized proposals will matter more than rushing in.";
  }

  return "This address looks like a lower-confidence solar fit right now, so treat the numbers as directional and validate roof conditions with a local installer before making a decision.";
}

function getOverallConfidence(report: AddressReport): Confidence {
  const values: Confidence[] = [
    report.roof.confidence,
    report.neighborhood.confidence,
    report.savings.confidence,
    report.impact.confidence,
  ];

  return values.reduce((lowest, current) =>
    confidenceRank[current] < confidenceRank[lowest] ? current : lowest,
  );
}

function confidenceLabel(confidence: Confidence) {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}

function formatYears(value: number) {
  return `${value.toFixed(1)} years`;
}

function formatAddress(address: string) {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [address];
  }

  return [parts[0], parts.slice(1).join(", ")];
}
