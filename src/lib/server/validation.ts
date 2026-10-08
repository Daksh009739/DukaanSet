import { createHash } from "node:crypto";
import type { Category, Language, PaymentMethod } from "../contracts";

export class DomainError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); }
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new DomainError("INVALID_INPUT", "A JSON object is required.");
  return value as Record<string, unknown>;
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
