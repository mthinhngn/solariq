import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Assumption } from "@/types";

type AssumptionsListProps = {
  assumptions: Assumption[];
};

export function AssumptionsList({ assumptions }: AssumptionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How we calculated this</CardTitle>
        <CardDescription>
          Each estimate below shows the assumption value we used and where it
          came from.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border rounded-lg border border-border/60">
          {assumptions.map((assumption) => (
            <li
              key={assumption.key}
              className="grid gap-1 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{assumption.label}</p>
              </div>
              <p className="font-mono text-sm text-foreground">
                {formatAssumptionValue(assumption.value)}
              </p>
              <p className="text-sm text-muted-foreground">
                Source: {formatSourceLabel(assumption.source)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function formatAssumptionValue(value: Assumption["value"]) {
  if (value === null) {
    return "Not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return value.toLocaleString("en-US");
    }

    return value.toLocaleString("en-US", {
      maximumFractionDigits: 4,
    });
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSourceLabel(source: string) {
  if (source === "google-solar") {
    return "Google Solar";
  }

  if (source === "nearby-median-fallback") {
    return "Zen dataset fallback";
  }

  return source;
}
