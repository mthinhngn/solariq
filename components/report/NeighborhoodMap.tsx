"use client";

import { useMemo, useState } from "react";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NearbyInstall, NeighborhoodData } from "@/types";

type NeighborhoodMapProps = {
  address: string;
  center: {
    lat: number;
    lng: number;
  };
  neighborhood: NeighborhoodData;
};

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

const MAP_ZOOM = 14;
const HOME_MARKER_ICON = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
const YEAR_MARKER_COLORS = [
  "red",
  "orange",
  "yellow",
  "green",
  "purple",
] as const;

export function NeighborhoodMap({
  address,
  center,
  neighborhood,
}: NeighborhoodMapProps) {
  const [selectedInstall, setSelectedInstall] = useState<NearbyInstall | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  const { isLoaded, loadError } = useJsApiLoader({
    id: "neighborhood-map",
    googleMapsApiKey: apiKey ?? "",
  });

  const installsByYear = useMemo(() => {
    return [...neighborhood.installsByYear].sort((left, right) => right.year - left.year);
  }, [neighborhood.installsByYear]);

  const markerColors = useMemo(() => {
    const distinctYears = [...new Set(
      neighborhood.installs
        .map((install) => parseInstallYear(install.installDate))
        .filter((year): year is number => year != null)
        .sort((left, right) => left - right),
    )];

    const yearToColor = new Map<number, string>();

    distinctYears.forEach((year, index) => {
      yearToColor.set(year, YEAR_MARKER_COLORS[index % YEAR_MARKER_COLORS.length]);
    });

    return yearToColor;
  }, [neighborhood.installs]);

  const topInstaller = neighborhood.topInstallers[0]?.installer ?? "Not available";
  const hasInstalls = neighborhood.totalInstalls > 0;
  const hasMapKey = Boolean(apiKey && apiKey.trim().length > 0);
  const shouldUseStaticFallback =
    typeof window !== "undefined" && window.location.hostname.endsWith("vercel.app");

  return (
    <Card className="report-card overflow-hidden rounded-[30px] border-t-2 border-t-cyan-300">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-white">Neighborhood map</CardTitle>
          <CardDescription className="text-slate-400">
            Nearby permit activity around {address}. Markers are color-coded by install year.
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant="outline" className="report-chip">
            {formatConfidence(neighborhood.confidence)} confidence
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_340px] overflow-x-hidden">
          <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black/18">
            <div className="h-[460px] w-full">
              {!hasMapKey ? (
                <MapState
                  title="Google Maps API key missing"
                  description="Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render the neighborhood map."
                />
              ) : shouldUseStaticFallback || loadError ? (
                <StaticInstallMap
                  center={center}
                  address={address}
                  installs={neighborhood.installs}
                  selectedInstall={selectedInstall}
                  onSelectInstall={setSelectedInstall}
                />
              ) : !isLoaded ? (
                <MapState
                  title="Loading map"
                  description="Pulling in nearby install markers now."
                />
              ) : (
                <GoogleMap
                  center={center}
                  zoom={MAP_ZOOM}
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  options={{
                    clickableIcons: false,
                    fullscreenControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                  }}
                >
                  <Marker
                    position={center}
                    icon={HOME_MARKER_ICON}
                    title={`Home: ${address}`}
                  />

                  {neighborhood.installs.map((install, index) => {
                    const year = parseInstallYear(install.installDate);
                    const color = year ? markerColors.get(year) ?? "red" : "red";

                    return (
                      <Marker
                        key={`${install.lat}-${install.lng}-${install.installDate ?? "unknown"}-${index}`}
                        position={{ lat: install.lat, lng: install.lng }}
                        icon={getInstallMarkerIcon(color)}
                        title={buildMarkerTitle(install)}
                        onClick={() => setSelectedInstall(install)}
                      />
                    );
                  })}

                  {selectedInstall ? (
                    <InfoWindow
                      position={{ lat: selectedInstall.lat, lng: selectedInstall.lng }}
                      onCloseClick={() => setSelectedInstall(null)}
                      options={{
                        disableAutoPan: true,
                        pixelOffset: new google.maps.Size(0, -8),
                      }}
                    >
                      <div className="w-[240px] animate-in fade-in zoom-in-95 duration-150 rounded-[20px] border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-[0_18px_55px_rgba(3,8,20,0.18)]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <p className="font-semibold text-black">
                              {formatDate(selectedInstall.installDate)}
                            </p>
                            <p className="text-black/80">
                              {formatKilowatts(selectedInstall.systemSizeKw)}
                            </p>
                            <p className="text-black/80">
                              {`Installer: ${selectedInstall.installer ?? "Not available"}`}
                            </p>
                            <p className="text-black/75">
                              {`Job value: ${formatCurrency(selectedInstall.jobValue)}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="rounded-full border border-black/10 px-2 py-0.5 text-xs font-medium text-black/65 transition-colors hover:bg-black/5 hover:text-black"
                            onClick={() => setSelectedInstall(null)}
                            aria-label="Close install details"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </InfoWindow>
                  ) : null}
                </GoogleMap>
              )}
            </div>
          </div>

          <aside className="space-y-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="grid gap-3 grid-cols-1">
              <SummaryStat
                label="Total installs"
                value={formatWholeNumber(neighborhood.totalInstalls)}
              />
              <SummaryStat
                label="Median system"
                value={formatKilowatts(neighborhood.medianKw)}
              />
              <SummaryStat label="Top installer" value={topInstaller} />
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Installs by year
              </p>
              {installsByYear.length > 0 ? (
                <div className="space-y-2">
                  {installsByYear.map((entry) => (
                    <div
                      key={entry.year}
                      className="flex items-center justify-between rounded-[18px] border border-white/8 bg-black/18 px-3 py-2 text-sm text-white"
                    >
                      <span>{entry.year}</span>
                      <span className="font-medium">{formatWholeNumber(entry.installs)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-[18px] border border-dashed border-white/10 px-3 py-4 text-sm text-slate-400">
                  No install history was available for this area yet.
                </p>
              )}
            </div>

            <div className="rounded-[18px] border border-white/8 bg-black/18 px-3 py-3 text-sm text-slate-400">
              {hasInstalls
                ? `Showing up to ${formatWholeNumber(neighborhood.installs.length)} nearby markers for readability.`
                : "No nearby installs were available to pin on the map."}
            </div>
          </aside>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-black/18 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function StaticInstallMap({
  center,
  address,
  installs,
  selectedInstall,
  onSelectInstall,
}: {
  center: { lat: number; lng: number };
  address: string;
  installs: NearbyInstall[];
  selectedInstall: NearbyInstall | null;
  onSelectInstall: (install: NearbyInstall | null) => void;
}) {
  const positions = useMemo(() => getInstallPlotPositions(center, installs), [center, installs]);

  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_top,#12203f_0%,#0b1225_55%,#060911_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(84,214,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(84,214,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute left-4 top-4 right-4 z-10 rounded-[18px] border border-white/10 bg-[#0d1730]/88 px-4 py-3 shadow-sm backdrop-blur-sm">
        <p className="text-sm font-semibold text-white">Neighborhood install view</p>
        <p className="mt-1 text-xs leading-5 text-slate-300">
          Google Maps was unavailable on this deployment, so this fallback plots the nearby installs relative to {address}.
        </p>
      </div>

      <div className="absolute inset-0">
        {positions.map(({ install, left, top, color }, index) => (
          <button
            key={`${install.lat}-${install.lng}-${install.installDate ?? "unknown"}-${index}`}
            type="button"
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
            style={{ left: `${left}%`, top: `${top}%` }}
            onClick={() => onSelectInstall(install)}
            aria-label={buildMarkerTitle(install)}
          >
            <span className={`block size-4 rounded-full border-2 border-white shadow-[0_0_22px_rgba(84,214,255,0.35)] ${getDotColorClass(color)}`} />
          </button>
        ))}

        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: "50%", top: "50%" }}
          aria-label={`Home: ${address}`}
        >
          <span className="flex size-5 items-center justify-center rounded-full border-2 border-white bg-cyan-400 shadow-[0_0_26px_rgba(84,214,255,0.55)]">
            <span className="size-1.5 rounded-full bg-white" />
          </span>
        </div>

        {selectedInstall ? (
          <div className="absolute bottom-4 left-4 right-4 z-20 rounded-[18px] border border-white/10 bg-[#0d1730]/94 px-4 py-3 text-sm shadow-lg backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold text-white">{formatDate(selectedInstall.installDate)}</p>
                <p className="text-slate-300">{formatKilowatts(selectedInstall.systemSizeKw)}</p>
                <p className="text-slate-300">{`Installer: ${selectedInstall.installer ?? "Not available"}`}</p>
                <p className="text-slate-300">{`Job value: ${formatCurrency(selectedInstall.jobValue)}`}</p>
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white"
                onClick={() => onSelectInstall(null)}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MapState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full items-center justify-center bg-muted/25 p-6 text-center">
      <div className="max-w-sm space-y-2">
        <p className="text-lg font-semibold tracking-tight text-white">{title}</p>
        <p className="text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function parseInstallYear(installDate: string | null) {
  if (!installDate) return null;

  const year = new Date(installDate).getUTCFullYear();
  return Number.isFinite(year) ? year : null;
}

function buildMarkerTitle(install: NearbyInstall) {
  const year = parseInstallYear(install.installDate);
  return year
    ? `${year} install${install.installer ? ` by ${install.installer}` : ""}`
    : "Solar install";
}

function getInstallMarkerIcon(color: string) {
  return `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;
}

function getInstallPlotPositions(center: { lat: number; lng: number }, installs: NearbyInstall[]) {
  if (installs.length === 0) {
    return [];
  }

  const latOffsets = installs.map((install) => install.lat - center.lat);
  const lngOffsets = installs.map((install) => install.lng - center.lng);
  const maxLatOffset = Math.max(...latOffsets.map((value) => Math.abs(value)), 0.001);
  const maxLngOffset = Math.max(...lngOffsets.map((value) => Math.abs(value)), 0.001);

  return installs.map((install) => {
    const year = parseInstallYear(install.installDate);
    const left = 50 + (((install.lng - center.lng) / maxLngOffset) * 32);
    const top = 50 - (((install.lat - center.lat) / maxLatOffset) * 32);

    return {
      install,
      color: yearColorName(year),
      left: clampPercent(left),
      top: clampPercent(top),
    };
  });
}

function yearColorName(year: number | null) {
  if (year == null) return "red";
  return YEAR_MARKER_COLORS[Math.abs(year) % YEAR_MARKER_COLORS.length];
}

function getDotColorClass(color: string) {
  switch (color) {
    case "orange":
      return "bg-orange-500";
    case "yellow":
      return "bg-yellow-500";
    case "green":
      return "bg-emerald-500";
    case "purple":
      return "bg-purple-500";
    default:
      return "bg-rose-500";
  }
}

function clampPercent(value: number) {
  return Math.min(Math.max(value, 10), 90);
}

function formatWholeNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatKilowatts(value: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return "Not available";
  }

  return `${value.toFixed(1)} kW`;
}

function formatCurrency(value: number | null) {
  if (value == null || !Number.isFinite(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Date unavailable";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatConfidence(value: NeighborhoodData["confidence"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
