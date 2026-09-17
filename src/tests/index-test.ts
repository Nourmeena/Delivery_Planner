import { processDeliveries } from "../process";

const raw = [
  { id: 1, area: "Nasr City", priority: 2, weight: 4.5 },
  { id: 2, area: "Maadi", priority: 1, weight: 2.0 },
  { id: 3, area: "Nasr City", priority: 3, weight: 1.2 },
  { id: 4, area: "Zamalek", priority: 1, weight: 7.0 },
  { id: 5, area: "Maadi", priority: 2, weight: 3.5 },
  { id: 6, area: "Nasr City", priority: 1, weight: 15.0 },
  { id: 7, area: "", priority: 1, weight: 3.0 },
  { id: 2, area: "Maadi", priority: 1, weight: 2.0 },
  { id: 8, area: "Zamalek", priority: 0, weight: 3.0 },
];

const result = processDeliveries(raw);

console.log("=== TRIPS ===");
for (const trip of result.trips) {
  const ids = trip.deliveries.map((d) => d.id).join(", ");
  console.log(
    `Trip ${trip.tripNumber}: [${ids}] | Areas: ${trip.areas.join(
      ", ",
    )} | Weight: ${trip.totalWeight} kg | Remaining: ${trip.remainingCapacity} kg`,
  );
}

console.log("\n=== INVALID ===");
for (const inv of result.invalidDeliveries) {
  console.log(`Reason: ${inv.reason}`);
}

console.log("\n=== SUMMARY ===");
console.log(result.summary);
