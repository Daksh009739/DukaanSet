import { createHash } from "node:crypto";
import type { Category, Language, PaymentMethod } from "../contracts";
const DOMAIN_ERROR_BRAND: unique symbol = Symbol.for("dukaanset.domain-error");

export class DomainError extends Error {
  readonly [DOMAIN_ERROR_BRAND] = true;
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
/** A private-symbol brand survives Next HMR without trusting JSON-shaped errors. */
export function isDomainError(error: unknown): error is DomainError {
  if (!(error instanceof Error)) return false;
  const value = error as DomainError & Record<symbol, unknown>;
  return value[DOMAIN_ERROR_BRAND] === true && typeof value.code === "string" && /^[A-Z_0-9]{1,60}$/.test(value.code) && Number.isInteger(value.status) && value.status >= 400 && value.status <= 599;
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new DomainError("INVALID_INPUT", "A JSON object is required.");
  return value as Record<string, unknown>;
}
export function keys(input: Record<string, unknown>, allowed: readonly string[]): void {
  if (Object.keys(input).some(key => !allowed.includes(key))) throw new DomainError("INVALID_INPUT", "Request contains unsupported fields.");
}
export function aliases(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 20) throw new DomainError("INVALID_INPUT", "Use at most 20 product aliases.");
  return [...new Map(value.map(alias => { const v = string(alias, "Alias", 100); return [v.normalize("NFKC").toLowerCase(), v] as const; })).values()];
}
export function unit(value: unknown): string {
  const v = string(value ?? "pcs", "Unit", 20).toLowerCase();
  if (!["pcs", "piece", "pieces", "unit", "pair", "box", "bottle", "packet", "pack", "kg", "g", "gram", "grams", "kilogram", "litre", "liter", "l", "ml", "meter", "metre", "m"].includes(v)) throw new DomainError("INVALID_UNIT", "Choose a supported piece, weight, volume, or length unit.");
  return v;
}
/** Exact compatible unit conversion; quantities remain integer thousandths. */
export function convertQuantity(quantityMilli: number, from: string, to: string, packSize: number | null = null): number {
  const groups: Record<string, [string, bigint]> = {
    kg: ["weight", 1000n], kilogram: ["weight", 1000n], g: ["weight", 1n], gram: ["weight", 1n], grams: ["weight", 1n],
    litre: ["volume", 1000n], liter: ["volume", 1000n], l: ["volume", 1000n], ml: ["volume", 1n],
    meter: ["length", 1n], metre: ["length", 1n], m: ["length", 1n],
    pcs: ["piece", 1n], piece: ["piece", 1n], pieces: ["piece", 1n], unit: ["piece", 1n],
  };
  const a = from.toLowerCase(), b = to.toLowerCase();
  if (a === b) return integer(quantityMilli, "Quantity", 1);
  let numerator = BigInt(quantityMilli), denominator = 1n;
  if (["box", "pack"].includes(a) && packSize && !["box", "pack"].includes(b)) numerator *= BigInt(packSize);
  else {
    if (!groups[a] || !groups[b] || groups[a][0] !== groups[b][0]) throw new DomainError("INVALID_UNIT", "These units cannot be converted for this product.");
    numerator *= groups[a][1]; denominator = groups[b][1];
  }
  if (numerator % denominator !== 0n) throw new DomainError("QUANTITY_PRECISION", "Quantity cannot be represented accurately in this product's unit.");
  const result = integer(Number(numerator / denominator), "Converted quantity", 1);
  assertWholeUnit(to, result);
  return result;
}
export function string(value: unknown, name: string, max = 160, optional = false): string {
  if (optional && (value === undefined || value === null || value === "")) return "";
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new DomainError("INVALID_INPUT", `${name} must contain 1–${max} characters.`);
  return value.trim();
}
export function integer(value: unknown, name: string, min = 0, max = 1_000_000_000): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) throw new DomainError("INVALID_INPUT", `${name} must be a whole number between ${min} and ${max}.`);
  return value;
}
export function oneOf<T extends string>(value: unknown, name: string, choices: readonly T[]): T {
  if (typeof value !== "string" || !choices.includes(value as T)) throw new DomainError("INVALID_INPUT", `${name} is invalid.`);
  return value as T;
}
export const language = (value: unknown): Language => oneOf(value ?? "hinglish", "Language", ["en", "hi", "hinglish"]);
export const category = (value: unknown): Category => oneOf(value ?? "general", "Category", ["grocery", "hardware", "vegetables", "mobile", "clothing", "general"]);
export const method = (value: unknown): PaymentMethod => oneOf(value ?? "cash", "Payment method", ["cash", "upi"]);
export function email(value: unknown): string {
  const v = string(value, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new DomainError("INVALID_INPUT", "Enter a valid email address.");
  return v;
}
export function password(value: unknown): string {
  if (typeof value !== "string" || value.length < 10 || value.length > 128) throw new DomainError("INVALID_INPUT", "Password must contain 10–128 characters.");
  return value;
}
export function date(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const v = string(value, "Date", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().slice(0, 10) !== v) throw new DomainError("INVALID_INPUT", "Date must be a valid YYYY-MM-DD date.");
  return v;
}
export function items(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) throw new DomainError("INVALID_INPUT", "Include between 1 and 100 items.");
  return value.map(object);
}
export function lineTotal(pricePaise: number, quantityMilli: number): number {
  const result = (BigInt(pricePaise) * BigInt(quantityMilli) + 500n) / 1000n;
  if (result > 1_000_000_000_000n) throw new DomainError("AMOUNT_TOO_LARGE", "This amount exceeds the supported limit.");
  return Number(result);
}
export function assertWholeUnit(unit: string, quantityMilli: number): void {
  if (["pcs", "piece", "pieces", "unit", "pair", "box", "bottle", "packet", "pack"].includes(unit.toLowerCase()) && quantityMilli % 1000 !== 0) throw new DomainError("FRACTIONAL_UNIT", `${unit} quantities must be whole units.`);
}
export function fingerprint(value: unknown): string {
  function canonical(v: unknown): unknown {
    if (Array.isArray(v)) return v.map(canonical);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, canonical(x)]));
    return v;
  }
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}
export function businessDay(timestamp = new Date().toISOString()): string { return new Date(Date.parse(timestamp) + 19_800_000).toISOString().slice(0, 10); }
