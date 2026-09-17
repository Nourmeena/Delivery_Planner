import { parseCsv } from "../csv";
import { processDeliveries } from "../process";

const sample = `id,area,priority,weight
1,Nasr City,2,4.5
2,Maadi,1,2.0
3,Nasr City,3,1.2
4,Zamalek,1,7.0
5,Maadi,2,3.5
6,Nasr City,1,15.0`;

const raw = parseCsv(sample);
const result = processDeliveries(raw);

console.log("=== TRIPS ===");
for (const trip of result.trips) {
  const ids = trip.deliveries.map((d) => d.id).join(", ");
  console.log(`Trip ${trip.tripNumber}: [${ids}] | ${trip.totalWeight} kg`);
}

console.log("\n=== INVALID ===");
for (const inv of result.invalidDeliveries) {
  console.log(`Reason: ${inv.reason}`);
}

console.log("\n=== SUMMARY ===");
console.log(result.summary);
