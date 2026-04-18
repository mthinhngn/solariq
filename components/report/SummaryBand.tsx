import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border-none bg-[linear-gradient(135deg,#14532d_0%,#166534_38%,#f4d03f_140%)] py-0 text-white shadow-[0_24px_60px_rgba(20,83,45,0.28)] ring-0">
      <CardContent className="grid gap-6 px-6 py-6 sm:px-8 sm:py-7 lg:grid-cols-[1.4fr_auto] lg:items-center">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={confidenceBadgeClassName(confidence)}
              variant="secondary"
            >
              {confidenceLabel(confidence)} confidence
            </Badge>
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/72">
              Summary
            </span>
          </div>

          <p className="max-w-3xl text-lg leading-8 font-medium text-balance sm:text-2xl sm:leading-9">
            {recommendation}
          </p>
        </div>

        <div className="rounded-2xl border border-white/18 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
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

function confidenceBadgeClassName(confidence: Confidence) {
  if (confidence === "high") {
    return "border-emerald-200/30 bg-emerald-50 text-emerald-900";
  }

  if (confidence === "medium") {
    return "border-amber-200/40 bg-amber-50 text-amber-950";
  }

  return "border-white/20 bg-white/12 text-white";
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
