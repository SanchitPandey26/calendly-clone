import prisma from '../config/prisma';
import { DayOfWeek } from '@prisma/client';

// ─── Types ──────────────────────────────────────────────────────────

interface Slot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

// ─── Helpers ────────────────────────────────────────────────────────

const DAY_MAP: DayOfWeek[] = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
];

function mapDateToDayOfWeek(date: Date): DayOfWeek {
  return DAY_MAP[date.getUTCDay()];
}

/**
 * Generate consecutive time slots within availability windows.
 * Each slot has `duration` minutes.
 */
function generateRawSlots(
  availWindows: { startTime: string; endTime: string }[],
  duration: number,
  dateStr: string, // YYYY-MM-DD
): Slot[] {
  const slots: Slot[] = [];

  for (const window of availWindows) {
    // Parse "HH:mm" into minutes since midnight
    const [startH, startM] = window.startTime.split(':').map(Number);
    const [endH, endM] = window.endTime.split(':').map(Number);
    const windowStartMin = startH * 60 + startM;
    const windowEndMin = endH * 60 + endM;

    let cursor = windowStartMin;
    while (cursor + duration <= windowEndMin) {
      const slotStartH = Math.floor(cursor / 60);
      const slotStartM = cursor % 60;
      const slotEndCursor = cursor + duration;
      const slotEndH = Math.floor(slotEndCursor / 60);
      const slotEndM = slotEndCursor % 60;

      const startISO = `${dateStr}T${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}:00.000Z`;
      const endISO = `${dateStr}T${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}:00.000Z`;

      slots.push({ startTime: startISO, endTime: endISO });
      cursor += duration;
    }
  }

  return slots;
}

/**
 * Remove slots that overlap with any existing booking.
 * Two time ranges overlap if: slotStart < bookingEnd AND slotEnd > bookingStart
 */
function removeBookedSlots(
  rawSlots: Slot[],
  bookings: { startTime: Date; endTime: Date }[],
): Slot[] {
  return rawSlots.filter((slot) => {
    const slotStart = new Date(slot.startTime).getTime();
    const slotEnd = new Date(slot.endTime).getTime();

    return !bookings.some((booking) => {
      const bookStart = booking.startTime.getTime();
      const bookEnd = booking.endTime.getTime();
      return slotStart < bookEnd && slotEnd > bookStart;
    });
  });
}

// ─── Main Service Function ──────────────────────────────────────────

export async function getAvailableSlots(eventTypeId: string, dateStr: string) {
  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    throw { status: 400, message: 'date must be in YYYY-MM-DD format.' };
  }

  // 1. Fetch event type to get duration
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
  });
  if (!eventType) {
    throw { status: 404, message: 'Event type not found.' };
  }

  // 2. Determine weekday from the date
  const date = new Date(dateStr + 'T00:00:00.000Z');
  const dayOfWeek = mapDateToDayOfWeek(date);

  // 3. Fetch availability windows for that day
  const availWindows = await prisma.availability.findMany({
    where: { dayOfWeek },
    orderBy: { startTime: 'asc' },
  });
  if (availWindows.length === 0) {
    throw { status: 404, message: `No availability set for ${dayOfWeek}.` };
  }

  // 4. Generate all possible slots from availability windows
  const rawSlots = generateRawSlots(availWindows, eventType.duration, dateStr);

  // 5. Fetch all SCHEDULED bookings for that date (across ALL event types)
  const dayStart = new Date(dateStr + 'T00:00:00.000Z');
  const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: 'SCHEDULED',
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // 6. Filter out booked slots
  const availableSlots = removeBookedSlots(rawSlots, bookings);

  // 7. Return
  return availableSlots;
}
