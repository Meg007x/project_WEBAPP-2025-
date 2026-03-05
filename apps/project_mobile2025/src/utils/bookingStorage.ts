export type SportType = "badminton" | "football";

export type Ticket = {
  id: number;
  ticketCode: string;

  sportType: SportType;

  venue: any;
  venueId?: number | string;
  venueName: string;

  partyName: string;

  dateISO: string;      // ISO string
  dateKey: string;      // yyyy-mm-dd

  startTime: string;    // "17:00"
  endTime: string;      // "19:00"
  startHour: number;
  endHour: number;

  courtIds: number[];   // ใช้ร่วมกันทั้ง court/field
  totalPrice: number;
  membersCount: number;

  status: "PAID" | "PENDING";
};

const STORAGE_KEY = "my_tickets";

export function toDateKey(dateISO: string): string {
  const d = new Date(dateISO);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function hourOf(time: string): number {
  // "17:00" -> 17
  const h = parseInt((time || "0:00").split(":")[0], 10);
  return Number.isFinite(h) ? h : 0;
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  // [start, end) ชนกันถ้า start < otherEnd และ end > otherStart
  return aStart < bEnd && aEnd > bStart;
}

export function getTickets(): Ticket[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Ticket[]) : [];
  } catch {
    return [];
  }
}

export function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function addTicket(ticket: Ticket) {
  const existing = getTickets();
  // ✅ ใหม่อยู่หน้า
  saveTickets([ticket, ...existing]);
}

export function deleteTicketById(id: number) {
  const existing = getTickets();
  const next = existing.filter(t => t.id !== id);
  saveTickets(next);
  return next;
}

export function findConflicts(params: {
  venueId?: number | string;
  dateISO: string;
  startTime: string;
  endTime: string;
  courtIds: number[];
}): Ticket[] {
  const { venueId, dateISO, startTime, endTime, courtIds } = params;

  const dk = toDateKey(dateISO);
  const ns = hourOf(startTime);
  const ne = hourOf(endTime);

  const tickets = getTickets();
  return tickets.filter(t => {
    const sameDate = t.dateKey === dk;
    const sameVenue = (venueId != null) ? (String(t.venueId ?? t.venue?.id) === String(venueId)) : true;
    const timeHit = overlaps(ns, ne, t.startHour, t.endHour);
    const courtHit = t.courtIds?.some(id => courtIds.includes(id));

    return sameDate && sameVenue && timeHit && courtHit;
  });
}

export function getOccupiedCourtIds(params: {
  venueId?: number | string;
  dateISO: string;
  startTime: string;
  endTime: string;
}): number[] {
  const { venueId, dateISO, startTime, endTime } = params;
  const dk = toDateKey(dateISO);
  const ns = hourOf(startTime);
  const ne = hourOf(endTime);

  const tickets = getTickets();
  const occupied = new Set<number>();

  for (const t of tickets) {
    const sameDate = t.dateKey === dk;
    const sameVenue = (venueId != null) ? (String(t.venueId ?? t.venue?.id) === String(venueId)) : true;
    if (!sameDate || !sameVenue) continue;

    if (overlaps(ns, ne, t.startHour, t.endHour)) {
      (t.courtIds || []).forEach(id => occupied.add(id));
    }
  }

  return Array.from(occupied);
}

export function parsePriceRangeToRate(priceRange?: string, startTime?: string): number {
  // "120 - 180" => กลางวัน=120, กลางคืน=180 (heuristic)
  // บอล: "800 - 1200"
  if (!priceRange) return 0;

  const nums = priceRange
    .replace(/,/g, "")
    .split(/-|–|—/g)
    .map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isFinite(n));

  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  const dayRate = nums[0];
  const nightRate = nums[1];

  const h = hourOf(startTime || "0:00");
  // สมมติ 17:00 ขึ้นไปเป็นช่วงเย็น/prime time
  return h >= 17 ? nightRate : dayRate;
}

export function makeTicketCode(prefix: string = "TX"): string {
  return `${prefix}-${Date.now()}`;
}