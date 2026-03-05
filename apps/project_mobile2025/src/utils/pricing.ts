// src/utils/pricing.ts
export function parsePriceRange(priceRange?: string): { min: number; max: number } {
  if (!priceRange) return { min: 0, max: 0 };

  // รองรับ "120 - 180", "800 - 1200", "1,200 - 1,500"
  const cleaned = priceRange.replace(/,/g, '').trim();
  const parts = cleaned.split('-').map(s => s.trim());

  const min = Number(parts[0] ?? 0) || 0;
  const max = Number(parts[1] ?? parts[0] ?? 0) || 0;

  return { min, max };
}

export function hourFromTime(time: string): number {
  // "17:00" -> 17
  const h = Number((time || '0:00').split(':')[0]);
  return Number.isFinite(h) ? h : 0;
}

export function calcDurationHours(startTime: string, endTime: string): number {
  const s = hourFromTime(startTime);
  const e = hourFromTime(endTime);
  return Math.max(0, e - s);
}

export function getPricePerHourByTime(priceRange: string | undefined, startTime: string): number {
  const { min, max } = parsePriceRange(priceRange);
  const h = hourFromTime(startTime);

  // หลัง 17:00 ใช้ราคาช่วงสูง (max) ไม่งั้นใช้ min
  return h >= 17 ? (max || min) : (min || max);
}

export function calcTotalPrice(params: {
  priceRange?: string;
  startTime: string;
  endTime: string;
  units: number; // จำนวนคอร์ด/จำนวนสนาม
}): number {
  const duration = calcDurationHours(params.startTime, params.endTime);
  const pph = getPricePerHourByTime(params.priceRange, params.startTime);
  return Math.max(0, duration) * Math.max(0, pph) * Math.max(1, params.units);
}