# Delivery planner

## Intro

Typescript program that take delivery request in csv as input, organize them, and result in organize trip in respect to (vehicle capacity, priority and area grouping where possible)

### Problem

A delivery company has a vehicle that can carry at most 10 kg per trip. Each delivery has an ID, area, priority (1 = most urgent), and weight. The program:

- Assigns every valid delivery to exactly one trip.
- Never exceeds 10 kg per trip.
- Handles more urgent deliveries first.
- Groups same-area deliveries together where reasonably possible.
- Rejects invalid deliveries with a clear reason.

## Setup/run instructions

The project built with TS so their must be Node js 23 or later

To run it:

```bash
git clone <your-repo-url>
cd delivery_optimization/src
npm install --save-dev @types/node
npx ts-node index.ts
```

## Algorithm and my solutions here

### Input

I chose CSV for the input because it's the simplest human-readable tabular format.
The input in CSV file is with header (id, area, weight, priority) and their order of it not matter. Sample is in _(/src/sample/deliveries.csv)_.

### Parsing

Parsing handled in file _(/src/csv.ts)_ in function **parseCsv(content: string):unknown[]{}** as:

1. I split the file into array of lines, removing the white space for each and drop any empty line.

2. Take first row as the header (so if has less than 2 row I return empty array) then spilt by comma, trim each cell, lowercase it and find the position of each column name. If any column is missing, return empty.

3. Start parse each data row starting from index 1 (as 0 is the header). Split each by comma, trim it and build object with the 4 string fields and return the array.

### Validation

The validation included in file _(/src/validation.ts)_ where:

1. function **validateDeliveries(rawItems: unknown[]): {valid: Delivery[];invalid: InvalidDelivery[]}{}** as outer loop, walks through every raw item, validates it using function (validateOne), and puts it in the right bucket. It also keeps a set of seen IDs so we can detect duplicates.

2. function **validateOne(raw: unknown, seenIds: Set<number>):ValidationResult {}** take each row and For each one, check four fields in order:

- ID — must be a number, must not be a duplicate.
- Area — must be a non-empty string.
- Priority — must be an integer, at least 1.
- Weight — must be a number, greater than 0, not over 10 kg.
  If all four pass → put the record in the valid list.
  If any fails → put the record in the invalid list with its a reason.

3. At end has Two arrays, valid (clean Delivery objects) and invalid (raw record + reason).

I made function for each field for identify the error and its message and not use ZOD or JOI to understand over library shortcuts, and because duplicate ID detection needs cross-record logic.

### Delivery planning logic

How I organizes the input requests into delivery trips while following the rules in file _(/src/deliver.ts)_ as:

1. in function **sortDeliveries(deliveries: Delivery[]): Delivery[]{}** I sort the delivery request by
   1. firstly sort priority from smallest to greatest → Because the one with lower priority is more urgent thats mean it is the most important to start with
   2. secondly weight from greatest to smallest → Because heavy items are hard to fit later so better to start with it
   3. then area alphabetical → for stability
   4. finally id

2. Then start in function **placeOfDelivery(deliveries: Delivery[], trips: Trip[]): void {}** to take each delivery and try three things in order: 1. Try 1: Is there a trip with the same area that has room? Yes: put it there. Done. 2. Try 2: Is there any trip with room? Yes: put it there. Done. 3. Try 3: No trip has room. Open a new trip. Put it there.
   Move to the next delivery. Repeat.

- to add a new trip I make function **addToTrip(delivery: Delivery, trips: Trip[]): void {}** that (Add the delivery to the list, increase total weight, decrease remaining capacity, and add the area if it is new (so areas stays unique))
- for making new trip handled in function **openNewTrip(delivery: Delivery, trips: Trip): void {}**

3. function **finalTrips(deliveries: Delivery[], invalidDeliveries: InvalidDelivery[] = []): FinalResult{}** is the public entry point as it:

- Call function (sortDeliveries) to get a sorted copy.
- Create an empty trips array.
- Loop through the sorted deliveries. For each one, call function (placeDelivery).
- Sum up total weight across all trips.
- Compute average utilization.
- Return { trips, invalidDeliveries, summary }.

### Pipeline connector and the CLI Entry Point

1. I connected validation to delivery planning in file _src/process.ts_ exporting function **processDeliveries(rawItems: unknown[]): FinalResult {}**
2. The program that user use actually to run is in file _src/index.ts_ that:
   1. read the file path from the command line (default: sample/deliveries.csv). Read the file content with readFileSync.
   2. Call parseCsv(content) to get raw records.
   3. Call processDeliveries(raw) to run the full pipeline.
   4. Print trips, invalid records, and summary to the terminal.

## The five reasoning questions

### 1. Explain your solution approach

In short, the CSV is parsed into raw records. Every value comes in as a string.

Each record is validated. Validation checks four fields in order: ID, area, priority, and weight. Invalid records go into a separate list with a reason, so the user can see what was rejected and why.

The valid deliveries are sorted. The sort order is priority ascending, then weight descending , then area alphabetically, then ID ascending. Every tie is broken, so the order is always the same for the same input.

Finally the program places each delivery into a trip, one at a time, in sorted order. For each delivery it tries three things in order: find a trip with the same area that has room and if none, find any trip with room, if none, open a new trip. It never violates the 10 kg limit because every check includes a capacity comparison before adding.

The output is the list of trips, the list of invalid records with reasons, and a summary with counts and average utilization.

### 2. What was the most difficult part of the assignment?

I think the assignment is not hard overall but may be most difficult part was when trying to put the delivery request in trips while priority says urgent deliveries should be handled first and area grouping says same area deliveries should be together. As result priority and area can conflict, for example Zamalek with prirority 1 / Zamalek with prirority 2 / Maadi with priority 2.

I think in normal cases I could ask the customer if his goal is to decrease number of trips, or deliver the urgent requests first. However since the assignment says area grouping should happen "where reasonably possible,". which gives permission to break the rule. I resolved this by making urgent deliveries are always considered first as it strong constraint and making area grouping a placement preference as it soft constraint.

### 3. Are there situations where your algorithm may not produce the best possible grouping? Explain.

When their is more than one area has the same priority number, resulted in a group with mixing areas then this trip will have to go to more than one area, but all will be urgent so according to the assignment goal this is fine.

### 4. If the input contained 1,000,000 delivery requests, what part of your solution might become slow or memory-intensive?

Okay first of all the time complexity is:

- O(n log n) for sorting
- O(n\*t) for placement of delivery in trips (since the number of trips t is so small so consider it as O(n))

If has 1 million delivery requests then the bottleneck will be:

- Placement: here the number of trips if go larger then the placement will be O(n\*t).
  - solve this by indexing trips by area that could help
- Sorting: this millions of record must all be in the memory RAM
  - can be solved by split the into memory to chunk, sort each chunk, spill to the disk then finally merge the sorted chunk to one sorted delivery
- Memory: the program builds multiple full copies of the entire dataset, one for each pipeline stage (raw file text → raw parsed records → validated objects → sorted array → trips),it keeps them alive at the same time instead of processing one by one.
  - can be solved by process in batches and stream the file one by one

### 5. What would you improve if you had another day?

- I will solve the previous problem of memory by streaming the input file. Instead of loading the whole CSV into memory, read it line by line, validate each line as it arrives, and build trips incrementally.
  - This would allow the program to handle inputs far larger than memory, at the cost of a more complex main loop.
- Make the input be inserted and handled through csv, text file and Json
  - This would allow the user to use whatever way he wanted to insert his delivery requests.
- Allow the user to choose if he wanted to strict area flag,instead of hardcoded.
  - This allow the business can tune the behavior without code changes.

## Extension Feature (utilization)

Utilization: is that each trip reports its utilization as the 10 kg capacity it actually uses. The summary reports the average utilization across all trips.

I see it as useful feature because a plan with low average utilization is wasting capacity, which is a signal that either the sort order or the placement rule should be revisited. A plan with high average utilization is doing its job, and it will help to take further decision for further extension of that small program.

## Edge cases

### No delivery

- The CSV parser returns an empty array.
- Validation returns { valid: [], invalid: [] }.
- The planner returns { trips: [], invalidDeliveries: [], summary: { totalDeliveries: 0, validDeliveries: 0, invalidDeliveries: 0, totalTrips: 0, totalWeight: 0, averageUtilization: 0 } }.
- The CLI prints empty trip and summary sections. No crash.

### Package heavier than 10 kg

- Validation rejects the record giving a reason printed as "weight exceeds vehicle capacity of 10 kg".
- The record goes into the invalid list with the original raw record attached and it never reaches the planner.

### Multiple deliveries have the same priority

Sorting include in three steps:

- Weight descending as heavier deliveries first because heavy items are harder to fit later
- Area alphabetical, for stable ordering.
- ID ascending it final tie-breaker, so the sort is fully deterministic and the result is always the same for the same input.

### Adding the next package would exceed vehicle capacity

- We check trip.remainingCapacity >= delivery.weight before adding.
- If the current trip does not fit, it tries the next trip.
- If no trip fits, it opens a new one.
