import type{ Delivery, Trip, FinalResult, InvalidDelivery } from "./types";

const MAX_CAPACITY = 10;

function sortDeliveries(deliveries: Delivery[]): Delivery[] {
  return [...deliveries].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.weight !== b.weight) return b.weight - a.weight;
    if (a.area !== b.area) return a.area.localeCompare(b.area);
    return a.id - b.id;
  });
}

function placeOfDelivery(delivery: Delivery, trips: Trip[]): void {
  
    const hasEnoughWeight = (trip: Trip): boolean => {
    return trip.remainingCapacity >= delivery.weight;
  };

  const sameAreaTrip = trips.find(
    (trip) => trip.areas.includes(delivery.area) && hasEnoughWeight(trip),
  );

  if (sameAreaTrip) {
    addToTrip(sameAreaTrip, delivery);
    return;
  }

  const anyTrip = trips.find((trip) => hasEnoughWeight(trip));

  if (anyTrip) {
    addToTrip(anyTrip, delivery);
    return;
  }

  openNewTrip(delivery, trips);
}

function addToTrip(trip: Trip, delivery: Delivery): void {
  trip.deliveries.push(delivery);
  trip.totalWeight += delivery.weight;
  trip.remainingCapacity -= delivery.weight;
  trip.utilization = (trip.totalWeight / MAX_CAPACITY) * 100;
  if (!trip.areas.includes(delivery.area)) {
    trip.areas.push(delivery.area);
  }
}

function openNewTrip(delivery: Delivery, trips: Trip[]): void {
  trips.push({
    tripNumber: trips.length + 1,
    deliveries: [delivery],
    totalWeight: delivery.weight,
    remainingCapacity: MAX_CAPACITY - delivery.weight,
    areas: [delivery.area],
    utilization: (delivery.weight / MAX_CAPACITY) * 100,
  });
}


export function finalTrips(
  deliveries: Delivery[],
  invalidDeliveries: InvalidDelivery[] = [],
): FinalResult {
  const sorted = sortDeliveries(deliveries);
  const trips: Trip[] = [];

  for (const delivery of sorted) {
    placeOfDelivery(delivery, trips);
  }

  const totalWeight = trips.reduce((sum, trip) => sum + trip.totalWeight, 0);
  const averageUtilization =
  trips.length === 0
    ? 0
    : trips.reduce((sum, trip) => sum + trip.utilization, 0) / trips.length;
  return {
    trips,
    invalidDeliveries,
    summary: {
      totalDeliveries: deliveries.length + invalidDeliveries.length,
      validDeliveries: deliveries.length,
      invalidDeliveries: invalidDeliveries.length,
      totalTrips: trips.length,
      totalWeight,
      averageUtilization,
    },
  };
}




