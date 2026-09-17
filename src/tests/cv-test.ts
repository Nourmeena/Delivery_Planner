import { parseCsv } from "../csv";

const sample = `id,area,priority,weight
1,Nasr City,2,4.5
2,Maadi,1,2.0
3,Nasr City,3,1.2`;

const rows = parseCsv(sample);

console.log("Number of rows:", rows.length);
for (const row of rows) {
  console.log(row);
}
