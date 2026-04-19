import { Leaf } from "lucide-react";

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
    <Card className="report-card report-card-beam overflow-hidden rounded-[30px] border-t-2 border-t-cyan-300">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-white">Climate impact</CardTitle>
          <CardDescription className="text-slate-400">
            Estimated emissions avoided from the system&apos;s first 20 years.
          </CardDescription>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="report-chip">
              {formatConfidence(impact.confidence)} confidence
            </Badge>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-300/10">
              <Leaf className="size-4 text-cyan-300" strokeWidth={2} />
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
            {formatTons(lifetimeCarbonOffsetTons)}
          </p>
          <p className="text-sm text-slate-400">20-year CO2 tons avoided</p>
          <p className="text-sm text-slate-400">
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
    <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4 text-white">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
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
