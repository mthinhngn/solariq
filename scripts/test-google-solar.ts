import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { demoAddresses } from "@/lib/demo-addresses";
import { fetchSolarPotential } from "@/lib/google-solar";

const testCases = [
  {
    label: demoAddresses[0].address,
    lat: demoAddresses[0].lat,
    lng: demoAddresses[0].lng,
  },
  {
    label: "Broken coord at Oakland port water",
    lat: 37.791,
    lng: -122.332,
  },
];

function loadDotEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function run() {
  loadDotEnvLocal();

  for (const testCase of testCases) {
    try {
      const result = await fetchSolarPotential(testCase.lat, testCase.lng);
      console.log(`\n=== ${testCase.label} ===`);
      console.log(
        JSON.stringify(
          {
            input: testCase,
            result,
          },
          null,
          2,
        ),
      );
    } catch (error) {
      console.log(`\n=== ${testCase.label} ===`);
      console.error(
        JSON.stringify(
          {
            input: testCase,
            error: error instanceof Error ? error.message : String(error),
          },
          null,
          2,
        ),
      );
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
