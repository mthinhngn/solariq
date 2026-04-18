export const nearbyInstallsGroundTruth = {
  primaryTable: "records",
  columnMap: {
    lat: "latitude",
    lng: "longitude",
    install_date: "issue_date",
    system_kw: "kilowatt_value",
    job_value: null,
    installer: "company_name",
    city: "city",
  },
} as const

export type DemoAddress = {
  address: string
  lat: number
  lng: number
  expectedInstallCount: number
}

export const demoAddresses: DemoAddress[] = [
  {
    address: "20 Rolling Green, Pleasant Hill, CA 94523",
    lat: 37.9462728,
    lng: -122.0756641,
    expectedInstallCount: 987,
  },
  {
    address: "2894 Delaware St, Oakland, CA 94602",
    lat: 37.7968585,
    lng: -122.2078157,
    expectedInstallCount: 655,
  },
  {
    address: "7246 Bullock Dr, San Diego, CA 92114",
    lat: 32.6973603,
    lng: -117.0396351,
    expectedInstallCount: 75,
  },
]
