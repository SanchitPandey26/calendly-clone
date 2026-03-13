/**
 * Timezone conversion utilities for the public booking pages.
 *
 * The backend generates slots by encoding **availability-local** times
 * as UTC ISO strings (e.g. 09:00 IST → "T09:00:00.000Z").
 * These are NOT real UTC times.  All conversions below account for this.
 */

// ─── Types ──────────────────────────────────────────────────────────

export interface DisplaySlot {
  /** Original ISO string from the backend — always sent to the API */
  originalStartTime: string;
  /** Original ISO string from the backend — always sent to the API */
  originalEndTime: string;
  /** Display hours in the user's selected timezone (0-23) */
  displayStartH: number;
  /** Display minutes in the user's selected timezone */
  displayStartM: number;
  /** Display hours in the user's selected timezone (0-23) */
  displayEndH: number;
  /** Display minutes in the user's selected timezone */
  displayEndM: number;
}

// ─── Core helpers ───────────────────────────────────────────────────

/**
 * Get the UTC offset (in minutes) for a given IANA timezone at a
 * specific point in time.  Uses `Intl.DateTimeFormat` so no libraries
 * are needed.
 *
 * Returns **minutes ahead of UTC** (e.g. IST = +330, EST = -300).
 */
function getTimezoneOffsetMinutes(tzId: string, refDate: Date = new Date()): number {
  // Format in the target tz to extract the calendar parts
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tzId,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(refDate);

  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);

  // Build a UTC date from the tz-local calendar values
  const tzLocal = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  const utcMs = refDate.getTime();

  return Math.round((tzLocal - utcMs) / 60000);
}

/**
 * Convert a fake-UTC ISO slot time from `fromTz` into hours & minutes
 * in `toTz`.
 *
 * Example: "2026-03-13T09:00:00.000Z" in Asia/Kolkata → converted to
 * America/New_York would yield { h: 23, m: 30 } on the previous day
 * (9:00 IST = 03:30 UTC = 23:30 EST previous day).
 */
export function convertSlotTime(
  slotISO: string,
  fromTzId: string,
  toTzId: string,
): { h: number; m: number } {
  const d = new Date(slotISO);
  // The encoded hour/minute (these are actually fromTz local time)
  const encodedH = d.getUTCHours();
  const encodedM = d.getUTCMinutes();

  // Total minutes since midnight in fromTz
  const fromMinutes = encodedH * 60 + encodedM;

  // Offset difference: how many minutes toTz is ahead of fromTz
  const fromOffset = getTimezoneOffsetMinutes(fromTzId, d);
  const toOffset = getTimezoneOffsetMinutes(toTzId, d);
  const diff = toOffset - fromOffset; // positive means toTz is ahead

  let toMinutes = fromMinutes + diff;
  // Wrap within 0-1439
  toMinutes = ((toMinutes % 1440) + 1440) % 1440;

  return { h: Math.floor(toMinutes / 60), m: toMinutes % 60 };
}

// ─── Slot conversion ────────────────────────────────────────────────

/**
 * Convert an array of backend slots into display slots for a given
 * timezone pair.
 */
export function convertSlotsForDisplay(
  slots: { startTime: string; endTime: string }[],
  fromTzId: string,
  toTzId: string,
): DisplaySlot[] {
  return slots.map(slot => {
    const start = convertSlotTime(slot.startTime, fromTzId, toTzId);
    const end = convertSlotTime(slot.endTime, fromTzId, toTzId);
    return {
      originalStartTime: slot.startTime,
      originalEndTime: slot.endTime,
      displayStartH: start.h,
      displayStartM: start.m,
      displayEndH: end.h,
      displayEndM: end.m,
    };
  });
}

// ─── Time formatting ────────────────────────────────────────────────

/**
 * Format hours + minutes as "h:mm am/pm".
 */
export function formatHM(h: number, m: number): string {
  const ampm = h >= 12 ? 'pm' : 'am';
  let h12 = h % 12;
  h12 = h12 === 0 ? 12 : h12;
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

/**
 * Format a fake-UTC ISO string as "h:mm am/pm" in a given timezone.
 */
export function formatTimeInTimezone(
  slotISO: string,
  fromTzId: string,
  toTzId: string,
): string {
  const { h, m } = convertSlotTime(slotISO, fromTzId, toTzId);
  return formatHM(h, m);
}

// ─── "Now" in a timezone ────────────────────────────────────────────

/**
 * Get the current hours and minutes in a given IANA timezone.
 */
export function getNowInTimezone(tzId: string): { h: number; m: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tzId,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);
  return { h: get('hour'), m: get('minute') };
}

/**
 * Filter display slots to only include those whose display start time
 * is after the current time in the given timezone.
 */
export function filterPastSlots(
  displaySlots: DisplaySlot[],
  isToday: boolean,
  toTzId: string,
): DisplaySlot[] {
  if (!isToday) return displaySlots;

  const { h: nowH, m: nowM } = getNowInTimezone(toTzId);

  return displaySlots.filter(slot => {
    if (slot.displayStartH > nowH) return true;
    if (slot.displayStartH === nowH && slot.displayStartM > nowM) return true;
    return false;
  });
}
