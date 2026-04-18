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
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Savings outlook</CardTitle>
          <CardDescription>
            Estimated financial upside based on annual solar production and local
            cost assumptions.
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant="outline">{formatConfidence(savings.confidence)} confidence</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <p className="text-4xl font-semibold tracking-tight">
            {formatCurrency(savings.annualBillSavings)}
          </p>
          <p className="text-sm text-muted-foreground">Estimated annual savings</p>
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

        <details className="rounded-lg border border-border/60 bg-muted/20">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground">
            Reveal assumptions behind this number
          </summary>
          <div className="border-t border-border/60 px-4 py-4">
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
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}

function AssumptionStat({ assumption }: { assumption: Assumption }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background p-3">
      <p className="text-sm font-medium">{assumption.label}</p>
      <p className="mt-1 text-lg font-semibold">{formatAssumptionValue(assumption)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
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
    if (key === "utility_rate" || key === "per_watt_cost" || key === "median_job_value") {
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
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSourceLabel(source: string) {
  if (source === "DEFAULT_ASSUMPTIONS.utilityRate") {
    return "Default utility rate";
  }

  if (source === "DEFAULT_ASSUMPTIONS.offsetFactor") {
    return "Default bill offset factor";
  }

  if (source === "DEFAULT_ASSUMPTIONS.perWattCost") {
    return "Default installed cost";
  }

  if (source === "DEFAULT_ASSUMPTIONS.taxCredit") {
    return "Federal tax credit default";
  }

  if (source === "DEFAULT_ASSUMPTIONS.lifetimeYears") {
    return "Default system lifetime";
  }

  if (source === "Provided medianJobValue") {
    return "Neighborhood median job values";
  }

  if (source === "Neighborhood records") {
    return "Neighborhood records";
  }

  return source;
}

function formatConfidence(value: AddressReport["savings"]["confidence"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
