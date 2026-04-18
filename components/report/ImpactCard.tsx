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

type ImpactCardProps = {
  impact: AddressReport["impact"];
};

const VEHICLE_EMISSIONS_TONS_PER_YEAR = 4.6;

export function ImpactCard({ impact }: ImpactCardProps) {
  const lifetimeCarbonOffsetTons = impact.annualCarbonOffsetTons * 20;
  const carsOffRoadEquivalent =
    lifetimeCarbonOffsetTons / VEHICLE_EMISSIONS_TONS_PER_YEAR;

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Climate impact</CardTitle>
          <CardDescription>
            Estimated emissions avoided from the system&apos;s first 20 years.
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant="outline">{formatConfidence(impact.confidence)} confidence</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <p className="text-4xl font-semibold tracking-tight">
            {formatTons(lifetimeCarbonOffsetTons)}
          </p>
          <p className="text-sm text-muted-foreground">20-year CO2 tons avoided</p>
          <p className="text-sm text-muted-foreground">
            = {formatWholeNumber(carsOffRoadEquivalent)} cars off the road
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Annual CO2 avoided"
            value={formatTons(impact.annualCarbonOffsetTons)}
          />
          <Stat
            label="Gas gallons avoided"
            value={formatWholeNumber(impact.gasolineGallonsAvoided)}
          />
          <Stat
            label="Trees equivalent"
            value={formatWholeNumber(impact.equivalentTreesPlanted)}
          />
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

function formatTons(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value)} tons`;
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatConfidence(value: AddressReport["impact"]["confidence"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
