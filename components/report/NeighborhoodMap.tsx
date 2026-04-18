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
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
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

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Neighborhood map</CardTitle>
          <CardDescription>
            Nearby permit activity around {address}. Markers are color-coded by install year.
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant="outline">
            {formatConfidence(neighborhood.confidence)} confidence
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_340px]">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
            <div className="h-[460px] w-full">
              {!hasMapKey ? (
                <MapState
                  title="Google Maps API key missing"
                  description="Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render the neighborhood map."
                />
              ) : loadError ? (
                <MapState
                  title="Map failed to load"
                  description="Google Maps returned an error while loading this view."
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
                    >
                      <div className="max-w-[220px] space-y-1 text-sm">
                        <p className="font-semibold">{formatDate(selectedInstall.installDate)}</p>
                        <p>{formatKilowatts(selectedInstall.systemSizeKw)}</p>
                        <p>{`Installer: ${selectedInstall.installer ?? "Not available"}`}</p>
                        <p>{`Job value: ${formatCurrency(selectedInstall.jobValue)}`}</p>
                      </div>
                    </InfoWindow>
                  ) : null}
                </GoogleMap>
              )}
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-border/70 bg-muted/15 p-5">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
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
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Installs by year
              </p>
              {installsByYear.length > 0 ? (
                <div className="space-y-2">
                  {installsByYear.map((entry) => (
                    <div
                      key={entry.year}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/85 px-3 py-2 text-sm"
                    >
                      <span>{entry.year}</span>
                      <span className="font-medium">{formatWholeNumber(entry.installs)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-sm text-muted-foreground">
                  No install history was available for this area yet.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border/60 bg-background/85 px-3 py-3 text-sm text-muted-foreground">
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
    <div className="rounded-lg border border-border/60 bg-background/85 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold leading-tight">{value}</p>
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
        <p className="text-lg font-semibold tracking-tight">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
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
