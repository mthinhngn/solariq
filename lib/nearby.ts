import { nearbyInstallsGroundTruth } from "@/lib/demo-addresses";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  Confidence,
  InstallsByYear,
  InstallerSummary,
  NeighborhoodData,
} from "@/types";

type SafeInstallRow = {
  city: string | null;
  state: string | null;
  postal_code: string | null;
  kilowatt_value: number | null;
  issue_date: string | null;
  company_name: string | null;
  job_value: number | null;
};

const EARTH_RADIUS_KM = 6371;
const DEFAULT_TABLE = nearbyInstallsGroundTruth.primaryTable;
const DEFAULT_RADIUS_KM = 5;
const TOP_INSTALLER_LIMIT = 5;
const SOLAR_ADOPTION_PROXY_HOMES = 1000;

export async function fetchNearby(
  lat: number,
  lng: number,
  radiusKm = DEFAULT_RADIUS_KM
): Promise<NeighborhoodData> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Latitude and longitude must be valid numbers.");
  }

  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    throw new Error("radiusKm must be a positive number.");
  }

  const supabase = getSupabaseClient();
  const bounds = getBoundingBox(lat, lng, radiusKm);
  const columnMap = nearbyInstallsGroundTruth.columnMap;
  const selectColumns = [
    columnMap.city,
    "state",
    "postal_code",
    columnMap.system_kw,
    columnMap.install_date,
    columnMap.installer,
    columnMap.job_value,
  ].filter((value): value is string => Boolean(value));

  const { data, error } = await supabase
    .from(DEFAULT_TABLE)
    .select(selectColumns.join(","))
    .gte(columnMap.lat, bounds.minLat)
    .lte(columnMap.lat, bounds.maxLat)
    .gte(columnMap.lng, bounds.minLng)
    .lte(columnMap.lng, bounds.maxLng);

  if (error) {
    throw new Error(`Failed to fetch nearby installs: ${error.message}`);
  }

  const safeRows = stripSensitiveFields(
    ((data ?? []) as unknown as RawInstallRow[]),
    columnMap
  );
  const totalInstalls = safeRows.length;
  const kwValues = safeRows
    .map((row) => row.kilowatt_value)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const jobValues = safeRows
    .map((row) => row.job_value)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  return {
    city: getMostCommonValue(safeRows.map((row) => row.city), "Unknown"),
    state: getMostCommonValue(safeRows.map((row) => row.state), "Unknown"),
    zip: getOptionalMostCommonValue(safeRows.map((row) => row.postal_code)),
    nearbyInstallCount: totalInstalls,
    averageSystemSizeKw: roundTo(average(kwValues), 2),
    totalInstalls,
    medianKw: roundTo(median(kwValues), 2),
    medianJobValue: jobValues.length > 0 ? roundTo(median(jobValues), 2) : null,
    topInstallers: summarizeTopInstallers(safeRows),
    installsByYear: summarizeInstallsByYear(safeRows),
    solarAdoptionRate: roundTo(
      Math.min(1, totalInstalls / SOLAR_ADOPTION_PROXY_HOMES),
      4
    ),
    confidence: getConfidence(totalInstalls),
  };
}

type RawInstallRow = Record<string, string | number | null>;

function stripSensitiveFields(
  rows: RawInstallRow[],
  columnMap: typeof nearbyInstallsGroundTruth.columnMap
): SafeInstallRow[] {
  return rows.map((row) => ({
    city: asNullableString(row[columnMap.city]),
    state: asNullableString(row.state),
    postal_code: asNullableString(row.postal_code),
    kilowatt_value: asNullableNumber(row[columnMap.system_kw]),
    issue_date: asNullableString(row[columnMap.install_date]),
    company_name: asNullableString(row[columnMap.installer]),
    job_value: columnMap.job_value ? asNullableNumber(row[columnMap.job_value]) : null,
  }));
}

function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiansToDegrees(radiusKm / EARTH_RADIUS_KM);
  const cosLat = Math.cos(degreesToRadians(lat));
  const lngDelta =
    Math.abs(cosLat) < 1e-12
      ? 180
      : radiansToDegrees(radiusKm / (EARTH_RADIUS_KM * Math.abs(cosLat)));

  return {
    minLat: clamp(lat - latDelta, -90, 90),
    maxLat: clamp(lat + latDelta, -90, 90),
    minLng: clampLongitude(lng - lngDelta),
    maxLng: clampLongitude(lng + lngDelta),
  };
}

function summarizeTopInstallers(rows: SafeInstallRow[]): InstallerSummary[] {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const installer = row.company_name?.trim();
    if (!installer) continue;

    counts.set(installer, (counts.get(installer) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, TOP_INSTALLER_LIMIT)
    .map(([installer, installs]) => ({ installer, installs }));
}

function summarizeInstallsByYear(rows: SafeInstallRow[]): InstallsByYear[] {
  const counts = new Map<number, number>();

  for (const row of rows) {
    if (!row.issue_date) continue;

    const year = new Date(row.issue_date).getUTCFullYear();
    if (!Number.isFinite(year)) continue;

    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([year, installs]) => ({ year, installs }));
}

function getMostCommonValue(values: Array<string | null>, fallback: string) {
  const value = getOptionalMostCommonValue(values);
  return value ?? fallback;
}

function getOptionalMostCommonValue(values: Array<string | null>) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized) continue;

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
  );

  return sorted[0]?.[0];
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]) {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function getConfidence(totalInstalls: number): Confidence {
  if (totalInstalls >= 100) return "high";
  if (totalInstalls >= 25) return "medium";
  return "low";
}

function asNullableString(value: string | number | null | undefined) {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function asNullableNumber(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampLongitude(value: number) {
  if (value < -180) return value + 360;
  if (value > 180) return value - 360;
  return value;
}

function roundTo(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
