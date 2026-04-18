import type { Assumption } from "@/types";

export const DEFAULT_ASSUMPTIONS = {
  utilityRate: 0.34,
  taxCredit: 0.3,
  perWattCost: 3.1,
  gridFactor: 0.0004,
  offsetFactor: 0.85,
  lifetimeYears: 25,
  minimumRecordsForMedianJobValue: 5,
} as const;

const DEFAULT_SOURCE = "Default";
const ZEN_DATASET_MEDIAN_SOURCE = "Zen dataset median";

export function estimateAnnualSavings(
  annualKwh: number,
  utilityRate: number = DEFAULT_ASSUMPTIONS.utilityRate,
  offsetFactor: number = DEFAULT_ASSUMPTIONS.offsetFactor,
): { savings: number; assumptions: Assumption[] } {
  const savings = annualKwh * utilityRate * offsetFactor;

  return {
    savings,
    assumptions: [
      {
        key: "utility_rate",
        label: "Utility rate",
        value: utilityRate,
        source: DEFAULT_SOURCE,
      },
      {
        key: "offset_factor",
        label: "Bill offset factor",
        value: offsetFactor,
        source: DEFAULT_SOURCE,
      },
    ],
  };
}

export function estimateNetCost(
  systemKw: number,
  medianJobValue?: number,
  recordCount: number = 0,
): { netCost: number; assumptions: Assumption[] } {
  const enoughMedianRecords =
    medianJobValue !== undefined &&
    recordCount >= DEFAULT_ASSUMPTIONS.minimumRecordsForMedianJobValue;

  const grossCost = enoughMedianRecords
    ? medianJobValue
    : systemKw * 1000 * DEFAULT_ASSUMPTIONS.perWattCost;
  const netCost = grossCost * (1 - DEFAULT_ASSUMPTIONS.taxCredit);

  return {
    netCost,
    assumptions: [
      {
        key: "cost_basis",
        label: "Cost basis",
        value: enoughMedianRecords ? "median_job_value" : "per_watt_default",
        source: enoughMedianRecords ? ZEN_DATASET_MEDIAN_SOURCE : DEFAULT_SOURCE,
      },
      {
        key: "median_job_value",
        label: "Median neighborhood job value",
        value: medianJobValue ?? null,
        source: ZEN_DATASET_MEDIAN_SOURCE,
      },
      {
        key: "median_record_count",
        label: "Median cost record count",
        value: recordCount,
        source: ZEN_DATASET_MEDIAN_SOURCE,
      },
      {
        key: "per_watt_cost",
        label: "Default installed cost per watt",
        value: DEFAULT_ASSUMPTIONS.perWattCost,
        source: DEFAULT_SOURCE,
      },
      {
        key: "tax_credit",
        label: "Federal tax credit",
        value: DEFAULT_ASSUMPTIONS.taxCredit,
        source: DEFAULT_SOURCE,
      },
    ],
  };
}

export function paybackYears(netCost: number, annualSavings: number): number {
  if (annualSavings <= 0) {
    return Number.POSITIVE_INFINITY;
  }

  return netCost / annualSavings;
}

export function lifetimeCO2Avoided(
  annualKwh: number,
  years: number = DEFAULT_ASSUMPTIONS.lifetimeYears,
  gridFactor: number = DEFAULT_ASSUMPTIONS.gridFactor,
): number {
  return annualKwh * years * gridFactor;
}
