export type Confidence = "high" | "medium" | "low";

export type RoofDataSource = "google-solar" | "nearby-median-fallback";

export type InstallerSummary = {
  installer: string;
  installs: number;
};

export type InstallsByYear = {
  year: number;
  installs: number;
};

export type NearbyInstall = {
  lat: number;
  lng: number;
  systemSizeKw: number | null;
  installDate: string | null;
  installer: string | null;
  jobValue: number | null;
};

export type Assumption = {
  key: string;
  label: string;
  value: string | number | boolean | null;
  source: string;
};

export type RoofData = {
  source: RoofDataSource;
  maxKw: number;
  annualKwh: number;
  panelCount: number;
  roofAreaM2: number;
  sunshineHours: number;
  fallbackReason: string | null;
  usableAreaSqFt: number;
  usableAreaSqM: number;
  estimatedPanelCount: number;
  estimatedSystemSizeKw: number;
  annualSunlightHours: number;
  annualProductionKwh: number;
  confidence: Confidence;
};

export type NeighborhoodData = {
  city: string;
  state: string;
  zip?: string;
  nearbyInstallCount: number;
  averageSystemSizeKw: number;
  totalInstalls: number;
  medianKw: number;
  medianJobValue: number | null;
  topInstallers: InstallerSummary[];
  installsByYear: InstallsByYear[];
  installs: NearbyInstall[];
  solarAdoptionRate: number;
  medianHomeValue?: number;
  confidence: Confidence;
};

export type SavingsData = {
  estimatedUpfrontCost: number;
  incentives: number;
  netCost: number;
  annualBillSavings: number;
  paybackPeriodYears: number;
  lifetimeSavings: number;
  utilityRatePerKwh?: number;
  confidence: Confidence;
};

export type ImpactData = {
  annualCarbonOffsetTons: number;
  equivalentTreesPlanted: number;
  gasolineGallonsAvoided: number;
  homesPoweredEquivalent?: number;
  confidence: Confidence;
};

export type AddressReport = {
  address: string;
  generatedAt: string;
  roof: RoofData;
  neighborhood: NeighborhoodData;
  savings: SavingsData;
  impact: ImpactData;
  assumptions: Assumption[];
};
