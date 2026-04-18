import {
  DEFAULT_ASSUMPTIONS,
  estimateAnnualSavings,
  estimateNetCost,
  lifetimeCO2Avoided,
  paybackYears,
} from "@/lib/calc";
import { demoAddresses } from "@/lib/demo-addresses";
import { fetchSolarPotential } from "@/lib/google-solar";
import { fetchNearby } from "@/lib/nearby";
import type { AddressReport, Assumption, NeighborhoodData } from "@/types";

type BuildAddressReportInput = {
  address: string;
  coords: {
    lat: number;
    lng: number;
  };
};

const DEFAULT_STATE = "CA";
const SOLAR_ADOPTION_PROXY_HOMES = 1000;

export async function buildAddressReport({
  address,
  coords,
}: BuildAddressReportInput): Promise<AddressReport> {
  const [roof, nearby] = await Promise.all([
    fetchSolarPotential(coords.lat, coords.lng),
    fetchNearbyWithFallback({ address, coords }),
  ]);

  const savingsResult = estimateAnnualSavings(roof.annualProductionKwh);
  const netCostResult = estimateNetCost(
    roof.estimatedSystemSizeKw,
    nearby.medianJobValue ?? undefined,
    nearby.totalInstalls,
  );
  const incentives =
    netCostResult.netCost *
    (DEFAULT_ASSUMPTIONS.taxCredit / (1 - DEFAULT_ASSUMPTIONS.taxCredit));
  const lifetimeSavings = savingsResult.savings * DEFAULT_ASSUMPTIONS.lifetimeYears;
  const annualCarbonOffsetTons = lifetimeCO2Avoided(
    roof.annualProductionKwh,
    1,
    DEFAULT_ASSUMPTIONS.gridFactor,
  );

    return {
      address,
      generatedAt: new Date().toISOString(),
      roof,
      neighborhood: nearby,
      savings: {
        estimatedUpfrontCost: netCostResult.netCost + incentives,
      incentives,
      netCost: netCostResult.netCost,
      annualBillSavings: savingsResult.savings,
      paybackPeriodYears: paybackYears(
        netCostResult.netCost,
        savingsResult.savings,
      ),
      lifetimeSavings,
        utilityRatePerKwh: DEFAULT_ASSUMPTIONS.utilityRate,
        confidence:
          roof.annualProductionKwh > 0 && netCostResult.netCost > 0
            ? "medium"
            : "low",
      },
      impact: {
        annualCarbonOffsetTons,
        equivalentTreesPlanted: annualCarbonOffsetTons * 16.5,
        gasolineGallonsAvoided: annualCarbonOffsetTons * 113,
        homesPoweredEquivalent:
          roof.annualProductionKwh > 0
            ? roof.annualProductionKwh / 10632
            : undefined,
        confidence: annualCarbonOffsetTons > 0 ? "medium" : "low",
      },
    assumptions: [
      ...savingsResult.assumptions,
      ...netCostResult.assumptions,
      {
        key: "nearby_source",
        label: "Nearby data source",
        value: "fetchNearby with demo fallback",
        source: "buildAddressReport",
      },
      {
        key: "solar_adoption_proxy_homes",
        label: "Adoption rate proxy home count",
        value: SOLAR_ADOPTION_PROXY_HOMES,
        source: "SolarIQ heuristic",
      },
      {
        key: "roof_source",
        label: "Roof data source",
        value: roof.source,
        source: "fetchSolarPotential",
      },
      {
        key: "roof_fallback_reason",
        label: "Roof fallback reason",
        value: roof.fallbackReason,
        source: "fetchSolarPotential",
      },
      {
        key: "lifetime_years",
        label: "System lifetime years",
        value: DEFAULT_ASSUMPTIONS.lifetimeYears,
        source: "DEFAULT_ASSUMPTIONS.lifetimeYears",
      },
      {
        key: "grid_factor",
        label: "Grid emissions factor",
        value: DEFAULT_ASSUMPTIONS.gridFactor,
        source: "DEFAULT_ASSUMPTIONS.gridFactor",
      },
    ],
  };
}

async function fetchNearbyWithFallback({
  address,
  coords,
}: BuildAddressReportInput): Promise<NeighborhoodData> {
  const parsedAddress = parseAddress(address);

  try {
    return await fetchNearby(coords.lat, coords.lng);
  } catch {
    const matchingDemo = demoAddresses.find(
      (demo) =>
        demo.lat === coords.lat &&
        demo.lng === coords.lng &&
        demo.address === address,
    );

    return {
      city: parsedAddress.city,
      state: parsedAddress.state,
      zip: parsedAddress.zip,
      nearbyInstallCount: matchingDemo?.expectedInstallCount ?? 0,
      averageSystemSizeKw: 7.2,
      totalInstalls: matchingDemo?.expectedInstallCount ?? 0,
      medianKw: 7.2,
      medianJobValue: null,
      topInstallers: [],
      installsByYear: [],
      solarAdoptionRate: matchingDemo
        ? Math.min(1, matchingDemo.expectedInstallCount / SOLAR_ADOPTION_PROXY_HOMES)
        : 0,
      confidence: matchingDemo ? "medium" : "low",
    };
  }
}

function parseAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim());
  const city = parts[1] ?? "Unknown";
  const stateZipMatch = parts[2]?.match(/([A-Z]{2})(?:\s+(\d{5}))?/);

  return {
    city,
    state: stateZipMatch?.[1] ?? DEFAULT_STATE,
    zip: stateZipMatch?.[2],
  };
}
