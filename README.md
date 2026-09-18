# Delivery planner

## Intro

TypeScript program that takes delivery requests in CSV as input, organizes them, and results in organize trip with respect to (vehicle capacity, priority, and area grouping where possible)

### Problem

A delivery company has a vehicle that can carry at most 10 kg per trip. Each delivery has an ID, area, priority (1 = most urgent), and weight. The program:

- Assigns every valid delivery to exactly one trip.
- Never exceeds 10 kg per trip.
- Handles more urgent deliveries first.
- Groups same-area deliveries together where reasonably possible.
- Rejects invalid deliveries with a clear reason.

## Setup/run instructions

The project is built with TS, so there must be Node. js 23 or later

To run it:

```bash
git clone https://github.com/Nourmeena/Delivery_Planner.git
cd delivery_optimization
npm install --save-dev @types/node
cd src
npx ts-node index.ts
```

## Algorithm and my solutions here

### Input

I chose CSV for the input because it's the simplest human-readable tabular format.
The input CSV file has a header (id, area, weight, priority), and their order does not matter. Sample is in _(/src/sample/deliveries.csv)_.

### Parsing

Parsing handled in file _(/src/csv.ts)_ in function **parseCsv(content: string):unknown[]{}** as:

1. I split the file into an array of lines, remove the whitespace for each, and drop any empty line.

2. Take the first row as the header (so if it has fewer than 2 rows, I return an empty array), then split by comma, trim each cell, lowercase it, and find the position of each column name. If any column is missing, return empty.

3. Start parsing each data row starting from index 1 (as 0 is the header). Split each by comma, trim it, and build an object with the 4 string fields and return the array.

### Validation

The validation included in file _(/src/validation.ts)_ where:

1. function **validateDeliveries(rawItems: unknown[]): {valid: Delivery[];invalid: InvalidDelivery[]}{}** as outer loop, walks through every raw item, validates it using function (validateOne), and puts it in the right bucket. It also keeps a set of seen IDs so we can detect duplicates.

2. The function **validateOne(raw: unknown, seenIds: Set<number>):ValidationResult {}** take each row and, for each one, checks four fields in order:

- ID — must be a number, must not be a duplicate.
- Area — must be a non-empty string.
- Priority — must be an integer, at least 1.
- Weight — must be a number, greater than 0, not over 10 kg.
  If all four pass → put the record in the valid list.
  If any fails → put the record in the invalid list with a reason.

3. At the end, has Two arrays: valid (clean Delivery objects) and invalid (raw record + reason).

I made a function for each field to identify the error and its message and not use ZOD or JOI to understand over library shortcuts, and because duplicate ID detection needs cross-record logic.

### Delivery planning logic

How I organize the input requests into delivery trips while following the rules in file _(/src/deliver.ts)_ as:

1. in function **sortDeliveries(deliveries: Delivery[]): Delivery[]{}** I sort the delivery request by
   1. firstly sort priority from smallest to greatest → Because the one with lower priority is more urgent; that means it is the most important to start with
   2. secondly, weight from greatest to smallest → Because heavy items are hard to fit later, so it's better to start with them
   3. then area alphabetical → for stability
   4. Finally, ID

2. Then start in function **placeOfDelivery(deliveries: Delivery[], trips: Trip[]): void {}** to take each delivery and try three things in order: 1. Try 1: Is there a trip with the same area that has room? Yes: put it there. Done. 2. Try 2: Is there any trip with room? Yes: put it there. Done. 3. Try 3: No trip has room. Open a new trip. Put it there.
   Move to the next delivery. Repeat.

- To add a new trip, I make a function **addToTrip(delivery: Delivery, trips: Trip[]): void {}** that (adds the delivery to the list, increases total weight, decreases remaining capacity, and adds the area if it is new (so areas stay unique))
- for making new trip handled in function **openNewTrip(delivery: Delivery, trips: Trip): void {}**

3. function **finalTrips(deliveries: Delivery[], invalidDeliveries: InvalidDelivery[] = []): FinalResult{}** is the public entry point as it:

- Call the function (sortDeliveries) to get a sorted copy.
- Create an empty trips array.
- Loop through the sorted deliveries. For each one, call the function (placeDelivery).
- Sum up total weight across all trips.
- Compute average utilization.
- Return { trips, invalidDeliveries, summary }.

### Pipeline connector and the CLI Entry Point

1. I connected validation to delivery planning in file _src/process.ts_ exporting function **processDeliveries(rawItems: unknown[]): FinalResult {}**
2. The program that the user actually runs is in file _src/index.ts_ that:
   1. Reads the file path from the command line (default: sample/deliveries.csv). Read the file content with readFileSync.
   2. Call parseCsv(content) to get raw records.
   3. Call processDeliveries(raw) to run the full pipeline.
   4. Print trips, invalid records, and summary to the terminal.

## The five reasoning questions

### 1. Explain your solution approach

In short, the CSV is parsed into raw records. Every value comes in as a string.

Each record is validated. Validation checks four fields in order: ID, area, priority, and weight. Invalid records go into a separate list with a reason, so the user can see what was rejected and why.

The valid deliveries are sorted. The sort order is priority ascending, then weight descending, then area alphabetically, then ID ascending. Every tie is broken, so the order is always the same for the same input.

Finally, the program places each delivery into a trip, one at a time, in sorted order. For each delivery, it tries three things in order: find a trip with the same area that has room; if none, find any trip with room; if none, open a new trip. It never violates the 10 kg limit because every check includes a capacity comparison before adding.

The output is the list of trips, the list of invalid records with reasons, and a summary with counts and average utilization.

### 2. What was the most difficult part of the assignment?

I think the assignment is not hard overall, but the most difficult part was trying to put the delivery request into trips while priority says urgent deliveries should be handled first and area grouping says same-area deliveries should be together. As a result, priority and area can conflict; for example, Zamalek with priority 1 / Zamalek with priority 2 / Maadi with priority 2.

I think in normal cases I could ask the customer if his goal is to decrease the number of trips, or deliver the urgent requests first. However, since the assignment says area grouping should happen "where reasonably possible," which gives permission to break the rule. I resolved this by making urgent deliveries always considered first as a strong constraint and making area grouping a placement preference as a soft constraint.

### 3. Are there situations where your algorithm may not produce the best possible grouping? Explain.

When there is more than one area with the same priority number, resulted in a group with mixed areas; then this trip will have to go to more than one area, but all will be urgent, so according to the assignment goal, this is fine.

### 4. If the input contained 1,000,000 delivery requests, what part of your solution might become slow or memory-intensive?

Okay, first of all, the time complexity is:

- O(n log n) for sorting
- O(n\*t) for placement of deliveries in trips (since the number of trips t is so small so consider it as O(n))

If there are 1 million delivery requests, then the bottleneck will be:

- Placement: here, if the number of trips goes larger, then the placement will be O(n\*t).
  - Solve this by indexing trips by area that could help
- Sorting: these millions of records must all be in memory RAM
  - Can be solved by splitting into memory chunks, sort each chunk, spill to the disk, then finally merge the sorted chunks into one sorted delivery
- Memory: the program builds multiple full copies of the entire dataset, one for each pipeline stage (raw file text → raw parsed records → validated objects → sorted array → trips); it keeps them alive at the same time instead of processing one by one.
  - Can be solved by processing in batches and streaming the file one by one

### 5. What would you improve if you had another day?

- I will solve the previous problem of memory by streaming the input file. Instead of loading the whole CSV into memory, read it line by line, validate each line as it arrives, and build trips incrementally.
  - This would allow the program to handle inputs far larger than memory, at the cost of a more complex main loop.
- Make the input be inserted and handled through CSV, text file, and JSON
  - This would allow the user to use whatever way he wanted to insert his delivery requests.
- Allow the user to choose if he wanted a strict area flag, instead of hardcoded.
  - This allows the business to tune the behavior without code changes.

## Extension Feature (utilization)

Utilization: is that each trip reports its utilization as the 10 kg capacity it actually uses. The summary reports the average utilization across all trips.

I see it as a useful feature because a plan with low average utilization is wasting capacity, which is a signal that either the sort order or the placement rule should be revisited. A plan with high average utilization is doing its job, and it will help to make further decisions for further extension of that small program.

## Edge cases

### No delivery

- The CSV parser returns an empty array.
- Validation returns { valid: [], invalid: [] }.
- The planner returns { trips: [], invalidDeliveries: [], summary: { totalDeliveries: 0, validDeliveries: 0, invalidDeliveries: 0, totalTrips: 0, totalWeight: 0, averageUtilization: 0 } }.
- The CLI prints empty trip and summary sections. No crash.

### Package heavier than 10 kg

- Validation rejects the record, giving a reason printed as "weight exceeds vehicle capacity of 10 kg".
- The record goes into the invalid list with the original raw record attached, and it never reaches the planner.

### Multiple deliveries have the same priority

Sorting includes three steps:

- Weight descending, with heavier deliveries first because heavy items are harder to fit later
- Area alphabetical, for stable ordering.
- ID ascending as the final tie-breaker, so the sort is fully deterministic, and the result is always the same for the same input.

### Adding the next package would exceed vehicle capacity

- We check trip.remainingCapacity >= delivery.weight before adding.
- If the current trip does not fit, it tries the next trip.
- If no trip fits, it opens a new one.
