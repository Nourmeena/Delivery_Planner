import { validateDeliveries } from "./validation";
import { finalTrips } from "./delivery";
import type { FinalResult } from "./types";

export function processDeliveries(rawItems: unknown[]): FinalResult {
  const { valid, invalid } = validateDeliveries(rawItems);
  return finalTrips(valid, invalid);
}
