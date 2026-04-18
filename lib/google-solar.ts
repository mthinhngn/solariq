import { getGoogleSolarApiKey, isPlaceholder } from "@/lib/env";
import { nearbyInstallsGroundTruth } from "@/lib/demo-addresses";
import { getSupabaseClient } from "@/lib/supabase";
import type { Confidence, RoofData } from "@/types";

export type SolarCheckResult = {
  name?: string;
  center?: {
    latitude?: number;
    longitude?: number;
  };
  solarPotential?: {
    maxArrayPanelsCount?: number;
    maxArrayAreaMeters2?: number;
    maxSunshineHoursPerYear?: number;
    maxArrayCapacityWatts?: number;
    carbonOffsetFactorKgPerMwh?: number;
  };
};

type NearbyMedianFallback = {
  maxKw: number;
  sampleCount: number;
  radiusDegrees: number;
};

const WATTS_PER_PANEL = 400;
const DEFAULT_PANEL_AREA_M2 = 1.9;
const FALLBACK_KWH_PER_KW = 1400;
const SEARCH_RADII_DEGREES = [0.01, 0.02, 0.05, 0.1];
const MIN_FALLBACK_SAMPLE_COUNT = 5;

function validateCoordinates(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Latitude and longitude must be finite numbers.");
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Latitude must be between -90 and 90, longitude between -180 and 180.");
  }
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length === 0) {
    return null;
  }

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function normalizeFromGoogleSolar(result: SolarCheckResult): RoofData {
  const solarPotential = result.solarPotential;
  const panelCount = solarPotential?.maxArrayPanelsCount ?? 0;
  const roofAreaM2 =
    solarPotential?.maxArrayAreaMeters2 ?? panelCount * DEFAULT_PANEL_AREA_M2;
  const sunshineHours = solarPotential?.maxSunshineHoursPerYear ?? 0;
  const maxKw =
    solarPotential?.maxArrayCapacityWatts != null
      ? solarPotential.maxArrayCapacityWatts / 1000
      : panelCount * (WATTS_PER_PANEL / 1000);
  const annualKwh = maxKw * sunshineHours;

  return buildRoofData({
    source: "google-solar",
    maxKw,
    annualKwh,
    panelCount,
    roofAreaM2,
    sunshineHours,
    confidence: "high",
    fallbackReason: null,
  });
}

function buildRoofData(input: {
  source: RoofData["source"];
  maxKw: number;
  annualKwh: number;
  panelCount: number;
  roofAreaM2: number;
  sunshineHours: number;
  confidence: Confidence;
  fallbackReason: string | null;
}): RoofData {
  const roofAreaM2 = round(Math.max(input.roofAreaM2, 0), 1);
  const maxKw = round(Math.max(input.maxKw, 0), 2);
  const annualKwh = round(Math.max(input.annualKwh, 0), 0);
  const panelCount = Math.max(Math.round(input.panelCount), 0);
  const sunshineHours = round(Math.max(input.sunshineHours, 0), 0);

  return {
    source: input.source,
    maxKw,
    annualKwh,
    panelCount,
    roofAreaM2,
    sunshineHours,
    confidence: input.confidence,
    fallbackReason: input.fallbackReason,
    usableAreaSqFt: round(roofAreaM2 * 10.7639, 1),
    usableAreaSqM: roofAreaM2,
    estimatedPanelCount: panelCount,
    estimatedSystemSizeKw: maxKw,
    annualSunlightHours: sunshineHours,
    annualProductionKwh: annualKwh,
  };
}

async function estimateNearbyMedianSystemKw(
  lat: number,
  lng: number,
): Promise<NearbyMedianFallback | null> {
  const supabase = getSupabaseClient();
  let bestMatch: NearbyMedianFallback | null = null;

  for (const radiusDegrees of SEARCH_RADII_DEGREES) {
    const { data, error } = await supabase
      .from(nearbyInstallsGroundTruth.primaryTable)
      .select(nearbyInstallsGroundTruth.columnMap.system_kw)
      .gte(nearbyInstallsGroundTruth.columnMap.lat, lat - radiusDegrees)
      .lte(nearbyInstallsGroundTruth.columnMap.lat, lat + radiusDegrees)
      .gte(nearbyInstallsGroundTruth.columnMap.lng, lng - radiusDegrees)
      .lte(nearbyInstallsGroundTruth.columnMap.lng, lng + radiusDegrees)
      .limit(250);

    if (error) {
      throw new Error(`Supabase fallback query failed: ${error.message}`);
    }

    const values = (data ?? [])
      .map((row) => Number(row[nearbyInstallsGroundTruth.columnMap.system_kw]))
      .filter((value) => Number.isFinite(value) && value > 0);

    const medianKw = median(values);

    if (medianKw != null) {
      const candidate = {
        maxKw: medianKw,
        sampleCount: values.length,
        radiusDegrees,
      };

      if (!bestMatch || candidate.sampleCount > bestMatch.sampleCount) {
        bestMatch = candidate;
      }

      if (candidate.sampleCount >= MIN_FALLBACK_SAMPLE_COUNT) {
        return candidate;
      }
    }
  }

  return bestMatch;
}

async function buildFallbackRoofData(
  lat: number,
  lng: number,
  error: unknown,
): Promise<RoofData> {
  const fallback = await estimateNearbyMedianSystemKw(lat, lng);
  const message = error instanceof Error ? error.message : "Unknown Solar API failure.";

  if (!fallback) {
    throw new Error(`Solar API failed and fallback had no nearby installs: ${message}`);
  }

  const panelCount = Math.max(Math.round(fallback.maxKw / (WATTS_PER_PANEL / 1000)), 1);
  const roofAreaM2 = panelCount * DEFAULT_PANEL_AREA_M2;
  const sunshineHours = FALLBACK_KWH_PER_KW;
  const confidence: Confidence =
    fallback.sampleCount >= 25 ? "medium" : "low";

  return buildRoofData({
    source: "nearby-median-fallback",
    maxKw: fallback.maxKw,
    annualKwh: fallback.maxKw * FALLBACK_KWH_PER_KW,
    panelCount,
    roofAreaM2,
    sunshineHours,
    confidence,
    fallbackReason: `${message} Estimated from nearby median system_kw using ${fallback.sampleCount} installs within ${fallback.radiusDegrees.toFixed(2)} degrees.`,
  });
}

export async function fetchSolarBuildingInsights(lat: number, lng: number) {
  validateCoordinates(lat, lng);

  const apiKey = getGoogleSolarApiKey();

  if (!apiKey || isPlaceholder(apiKey)) {
    throw new Error("Google Solar API key is missing or still a placeholder.");
  }

  const params = new URLSearchParams({
    "location.latitude": String(lat),
    "location.longitude": String(lng),
    requiredQuality: "HIGH",
    key: apiKey,
  });

  const response = await fetch(
    `https://solar.googleapis.com/v1/buildingInsights:findClosest?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Solar API ${response.status}: ${detail}`);
  }

  return (await response.json()) as SolarCheckResult;
}

export async function fetchSolarPotential(
  lat: number,
  lng: number,
): Promise<RoofData> {
  validateCoordinates(lat, lng);

  try {
    const result = await fetchSolarBuildingInsights(lat, lng);
    return normalizeFromGoogleSolar(result);
  } catch (error) {
    return buildFallbackRoofData(lat, lng, error);
  }
}
