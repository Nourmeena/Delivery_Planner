import { finalTrips } from "../delivery";
import { Delivery } from "../types";

const sample: Delivery[] = [
  { id: 1, area: "Nasr City", priority: 2, weight: 4.5 },
  { id: 2, area: "Maadi", priority: 1, weight: 2.0 },
  { id: 3, area: "Nasr City", priority: 3, weight: 1.2 },
  { id: 4, area: "Zamalek", priority: 1, weight: 7.0 },
  { id: 5, area: "Maadi", priority: 2, weight: 3.5 },
  { id: 6, area: "Nasr City", priority: 1, weight: 10.0 },
];

const result = finalTrips(sample);

console.log("Trips:");

for (const trip of result.trips) {
  console.log(
    `Trip ${trip.tripNumber}: IDs [${trip.deliveries
      .map((d) => d.id)
      .join(", ")}] | Areas: ${trip.areas.join(", ")} | Weight: ${
      trip.totalWeight
    } kg | Remaining: ${trip.remainingCapacity} kg`,
  );
}

console.log("\nSummary:");
console.log(result.summary);
