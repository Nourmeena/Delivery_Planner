import { readFileSync } from "node:fs";
import { parseCsv } from "./csv";
import { processDeliveries } from "./process";

function main(): void {
  const filePath = process.argv[2] ?? "sample/deliveries.csv";

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    console.error(`Could not read file: ${filePath}`);
    process.exit(1);
  }

  const raw = parseCsv(content);
  const result = processDeliveries(raw);

  printTrips(result);
  printInvalid(result);
  printSummary(result);
}

function printTrips(result: ReturnType<typeof processDeliveries>): void {
  console.log("\n=== TRIPS ===");
  for (const trip of result.trips) {
    const ids = trip.deliveries.map((d) => d.id).join(", ");
    const areas = trip.areas.join(", ");
    console.log(
      `Trip ${trip.tripNumber}: [${ids}] | Areas: ${areas} | ${trip.totalWeight} kg | ${trip.utilization.toFixed(1)}% used | Remaining: ${trip.remainingCapacity} kg`,
    );
  }
}

function printInvalid(result: ReturnType<typeof processDeliveries>): void {
  if (result.invalidDeliveries.length === 0) return;
  console.log("\n=== INVALID DELIVERIES ===");
  for (const inv of result.invalidDeliveries) {
    console.log(`Reason: ${inv.reason} | Raw: ${JSON.stringify(inv.raw)}`);
  }
}

function printSummary(result: ReturnType<typeof processDeliveries>): void {
  console.log("\n=== SUMMARY ===");
  const s = result.summary;
  console.log(`Total deliveries: ${s.totalDeliveries}`);
  console.log(`Valid: ${s.validDeliveries}`);
  console.log(`Invalid: ${s.invalidDeliveries}`);
  console.log(`Trips: ${s.totalTrips}`);
  console.log(`Total weight: ${s.totalWeight} kg`);
  console.log(`Average utilization: ${s.averageUtilization.toFixed(1)}%`);
}

main();
