import type { AddressReport } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RoofCardProps = {
  roof: AddressReport["roof"];
};

const FALLBACK_SOURCES = new Set(["fallback-neighborhood", "nearby-median-fallback"]);

export function RoofCard({ roof }: RoofCardProps) {
  const showFallbackBadge = FALLBACK_SOURCES.has(roof.source);

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Roof potential</CardTitle>
          <CardDescription>
            Estimated maximum solar capacity for this roof.
          </CardDescription>
        </div>
        {showFallbackBadge ? (
          <CardAction>
            <Badge variant="outline">Neighborhood fallback</Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <p className="text-4xl font-semibold tracking-tight">{formatKw(roof.maxKw)}</p>
          <p className="text-sm text-muted-foreground">Maximum system size</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Panel count" value={formatWholeNumber(roof.estimatedPanelCount)} />
          <Stat label="Annual kWh" value={formatWholeNumber(roof.annualProductionKwh)} />
          <Stat label="Roof area" value={formatArea(roof.roofAreaM2)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function formatKw(value: number) {
  return `${value.toFixed(1)} kW`;
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatArea(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value)} sq m`;
}
