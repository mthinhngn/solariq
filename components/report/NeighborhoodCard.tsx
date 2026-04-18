import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AddressReport } from "@/types";

type NeighborhoodCardProps = {
  neighborhood: AddressReport["neighborhood"];
};

export function NeighborhoodCard({ neighborhood }: NeighborhoodCardProps) {
  const hasNearbyInstalls = neighborhood.nearbyInstallCount > 0;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Nearby installs</CardTitle>
          <CardDescription>
            Permit activity around {neighborhood.city}, {neighborhood.state}.
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant="outline">
            {formatConfidence(neighborhood.confidence)} confidence
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasNearbyInstalls ? (
          <>
            <div className="space-y-1">
              <p className="text-4xl font-semibold tracking-tight">
                {formatWholeNumber(neighborhood.nearbyInstallCount)}
              </p>
              <p className="text-sm text-muted-foreground">
                installs found near this address
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat
                label="Median size"
                value={`${neighborhood.medianKw.toFixed(1)} kW`}
              />
              <Stat
                label="Adoption rate"
                value={formatPercent(neighborhood.solarAdoptionRate)}
              />
              <Stat
                label="Top installer"
                value={neighborhood.topInstallers[0]?.installer ?? "Not available"}
              />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
            <p className="text-lg font-semibold tracking-tight">
              No nearby installs yet
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              We didn&apos;t find permit records in this area, so this result isn&apos;t
              broken. Try another nearby address later as more permit data comes in.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatConfidence(value: AddressReport["neighborhood"]["confidence"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
