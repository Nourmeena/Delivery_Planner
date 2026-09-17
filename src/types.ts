export interface Delivery {
  id: number;
  area: string;
  priority: number;
  weight: number;
}

export interface InvalidDelivery {
  raw: unknown;
  reason: string;
}

export interface Trip {
  tripNumber: number;
  deliveries: Delivery[];
  totalWeight: number;
  remainingCapacity: number;
  areas: string[];
  utilization: number;
}

export interface FinalResult {
  trips: Trip[];
  invalidDeliveries: InvalidDelivery[];
  summary: {
    totalDeliveries: number;
    validDeliveries: number;
    invalidDeliveries: number;
    totalTrips: number;
    totalWeight: number;
    averageUtilization: number;
  };
}
