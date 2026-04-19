import { Zap } from "lucide-react";

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

const FALLBACK_SOURCES = new Set([
  "fallback-neighborhood",
  "nearby-median-fallback",
]);
const MAX_RESIDENTIAL_KW = 25;

export function RoofCard({ roof }: RoofCardProps) {
  const showFallbackBadge = FALLBACK_SOURCES.has(roof.source);
  const capacityPct = Math.min((roof.maxKw / MAX_RESIDENTIAL_KW) * 100, 100);

  return (
    <Card className="report-card report-card-beam overflow-hidden rounded-[30px] border-t-2 border-t-cyan-300">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-white">Roof potential</CardTitle>
          <CardDescription className="text-slate-400">
            Estimated maximum solar capacity for this roof.
          </CardDescription>
        </div>
        <CardAction>
          <div className="flex items-center gap-2">
            {showFallbackBadge ? (
              <Badge variant="outline" className="report-chip">
                Neighborhood fallback
              </Badge>
            ) : null}
            <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              <Zap className="size-4 text-cyan-300" strokeWidth={2} />
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
            {formatKw(roof.maxKw)}
          </p>
          <p className="text-sm text-slate-400">Maximum system size</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Roof capacity estimate</span>
            <span className="font-semibold text-cyan-200">
              {Math.round(capacityPct)}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full origin-left rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"
              style={{
                width: `${capacityPct}%`,
                animation:
                  "fill-bar 1.2s cubic-bezier(0.34, 1.1, 0.64, 1) 0.4s both",
              }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            label="Panel count"
            value={formatWholeNumber(roof.estimatedPanelCount)}
          />
          <Stat
            label="Annual kWh"
            value={formatWholeNumber(roof.annualProductionKwh)}
          />
          <Stat label="Roof area" value={formatArea(roof.roofAreaM2)} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
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
