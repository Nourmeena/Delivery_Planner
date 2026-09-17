import { validateDeliveries } from "../validation";

const raw = [
  { id: 1, area: "Nasr City", priority: 2, weight: 4.5 },
  { id: 2, area: "Maadi", priority: 1, weight: 2.0 },
  { id: 2, area: "Maadi", priority: 1, weight: 2.0 },
  { id: 3, area: "Nasr City", priority: 3, weight: 15.0 },
  { id: 4, area: "", priority: 1, weight: 3.0 },
  { id: 5, area: "Zamalek", priority: 0, weight: 3.0 },
  { id: 6, area: "Zamalek", priority: 1, weight: -2.0 },
  { id: 7, area: "Zamalek", priority: 1.5, weight: 3.0 },
  { id: 8, area: "Zamalek", priority: 1, weight: 10.0 },
  { id: "nine", area: "Zamalek", priority: 1, weight: 3.0 },
  { id: 10, area: "Zamalek", priority: 1 },
  null,
];

const result = validateDeliveries(raw);

console.log("=== VALID ===");
for (const d of result.valid) {
  console.log(
    `ID ${d.id} | ${d.area} | priority ${d.priority} | ${d.weight} kg`,
  );
}

console.log("\n=== INVALID ===");
for (const inv of result.invalid) {
  console.log(`Reason: ${inv.reason}`);
}

console.log("\n=== COUNTS ===");
console.log(`Valid: ${result.valid.length}`);
console.log(`Invalid: ${result.invalid.length}`);
