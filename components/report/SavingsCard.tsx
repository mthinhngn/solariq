import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AddressReport, Assumption } from "@/types";

type SavingsCardProps = {
  savings: AddressReport["savings"];
  assumptions: AddressReport["assumptions"];
};

const DRIVER_KEYS = new Set([
  "utility_rate",
  "offset_factor",
  "cost_basis",
  "median_job_value",
  "median_record_count",
  "per_watt_cost",
  "tax_credit",
  "lifetime_years",
]);

export function SavingsCard({ savings, assumptions }: SavingsCardProps) {
  const savingsDrivers = assumptions.filter((assumption) =>
    DRIVER_KEYS.has(assumption.key),
  );

  return (
    <Card className="report-card report-card-beam overflow-hidden rounded-[30px] border-t-2 border-t-cyan-300">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-white">Savings outlook</CardTitle>
          <CardDescription className="text-slate-400">
            Estimated financial upside based on annual solar production and
            local cost assumptions.
          </CardDescription>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="report-chip">
              {formatConfidence(savings.confidence)} confidence
            </Badge>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              <TrendingUp className="size-4 text-cyan-300" strokeWidth={2} />
            </div>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <p
            className="text-5xl font-semibold tracking-tight text-cyan-300"
            style={{ animation: "count-in 0.5s ease-out 0.25s both" }}
          >
            {formatCurrency(savings.annualBillSavings)}
          </p>
          <p className="text-sm text-slate-400">Estimated annual savings</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Stat
            label="Payback period"
            value={formatPayback(savings.paybackPeriodYears)}
            helper="Estimated years to recover the net system cost."
          />
          <Stat
            label="Net system cost"
            value={formatCurrency(savings.netCost)}
            helper={`After ${formatPercent(savings.estimatedUpfrontCost === 0 ? 0 : savings.incentives / savings.estimatedUpfrontCost)} incentives.`}
          />
        </div>

        <details className="rounded-[22px] border border-white/8 bg-white/[0.03]">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-white transition hover:text-cyan-200">
            Reveal assumptions behind this number
          </summary>
          <div className="border-t border-white/8 px-4 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {savingsDrivers.map((assumption) => (
                <AssumptionStat key={assumption.key} assumption={assumption} />
              ))}
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4 text-white">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-slate-300/82">{helper}</p>
    </div>
  );
}

function AssumptionStat({ assumption }: { assumption: Assumption }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-black/16 p-3">
      <p className="text-sm font-medium text-white">{assumption.label}</p>
      <p className="mt-1 text-lg font-semibold text-cyan-200">
        {formatAssumptionValue(assumption)}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Source: {formatSourceLabel(assumption.source)}
      </p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPayback(value: number) {
  if (!Number.isFinite(value)) {
    return "Not available";
  }

  return `${value.toFixed(1)} years`;
}

function formatAssumptionValue(assumption: Assumption) {
  const { key, value } = assumption;

  if (value === null) {
    return "Not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    if (
      key === "utility_rate" ||
      key === "per_watt_cost" ||
      key === "median_job_value"
    ) {
      return formatCurrency(value);
    }

    if (key === "tax_credit" || key === "offset_factor") {
      return formatPercent(value);
    }

    if (key === "lifetime_years") {
      return `${value} years`;
    }

    return value.toLocaleString("en-US", {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    });
  }

  return value
    .split("_")
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSourceLabel(source: string) {
  if (source === "DEFAULT_ASSUMPTIONS.utilityRate") return "Default utility rate";
  if (source === "DEFAULT_ASSUMPTIONS.offsetFactor") return "Default bill offset factor";
  if (source === "DEFAULT_ASSUMPTIONS.perWattCost") return "Default installed cost";
  if (source === "DEFAULT_ASSUMPTIONS.taxCredit") return "Federal tax credit default";
  if (source === "DEFAULT_ASSUMPTIONS.lifetimeYears") return "Default system lifetime";
  if (source === "Provided medianJobValue") return "Neighborhood median job values";
  if (source === "Neighborhood records") return "Neighborhood records";
  return source;
}

function formatConfidence(value: AddressReport["savings"]["confidence"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
