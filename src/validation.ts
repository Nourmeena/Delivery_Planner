import type { Delivery, InvalidDelivery } from "./types.ts";

const MAX_WEIGHT = 10;

export function validateDeliveries(rawItems: unknown[]): {
  valid: Delivery[];
  invalid: InvalidDelivery[];
} {
  const valid: Delivery[] = [];
  const invalid: InvalidDelivery[] = [];
  const seenIds = new Set<number>();

  for (const raw of rawItems) {
    const result = validateOne(raw, seenIds);
    if (result.ok) {
      valid.push(result.delivery);
      seenIds.add(result.delivery.id);
    } else {
      invalid.push({ raw, reason: result.reason });
    }
  }

  return { valid, invalid };
}

type Parsed<T> = { value: T } | { error: string };

type ValidationResult =
  | { ok: true; delivery: Delivery }
  | { ok: false; reason: string };

function validateOne(raw: unknown, seenIds: Set<number>): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, reason: "record is not an object" };
  }

  const record = raw as Record<string, unknown>;

  const id = parseId(record.id);
  if ("error" in id) return { ok: false, reason: id.error };

  if (seenIds.has(id.value)) {
    return { ok: false, reason: "duplicate ID" };
  }

  const area = parseArea(record.area);
  if ("error" in area) return { ok: false, reason: area.error };

  const priority = parsePriority(record.priority);
  if ("error" in priority) return { ok: false, reason: priority.error };

  const weight = parseWeight(record.weight);
  if ("error" in weight) return { ok: false, reason: weight.error };

  return {
    ok: true,
    delivery: {
      id: id.value,
      area: area.value,
      priority: priority.value,
      weight: weight.value,
    },
  };
}
function parseId(value: unknown): Parsed<number> {
  if (value === undefined || value === null || value === "") {
    return { error: "missing ID" };
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return { error: "ID must be a number" };
  }
  return { value: num };
}

function parseArea(value: unknown): Parsed<string> {
  if (typeof value !== "string" || value.trim() === "") {
    return { error: "missing area" };
  }
  return { value: value.trim() };
}

function parsePriority(value: unknown): Parsed<number> {
  if (value === undefined || value === null || value === "") {
    return { error: "missing priority" };
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return { error: "priority must be a number" };
  }
  if (!Number.isInteger(num)) {
    return { error: "priority must be an integer" };
  }
  if (num < 1) {
    return { error: "priority must be at least 1" };
  }
  return { value: num };
}

function parseWeight(value: unknown): Parsed<number> {
  if (value === undefined || value === null || value === "") {
    return { error: "missing weight" };
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return { error: "weight must be a number" };
  }
  if (num <= 0) {
    return { error: "weight must be greater than 0" };
  }
  if (num > MAX_WEIGHT) {
    return { error: `weight exceeds vehicle capacity of ${MAX_WEIGHT} kg` };
  }
  return { value: num };
}