import prisma from '../config/prisma';
import { DayOfWeek } from '@prisma/client';

// ─── Types ──────────────────────────────────────────────────────────

interface CreateAvailabilityInput {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  timezone: string;
}

interface UpdateAvailabilityInput {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

const VALID_DAYS: string[] = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:mm 24-hour format

function validateCreateInput(data: CreateAvailabilityInput) {
  const errors: string[] = [];

  if (!data.dayOfWeek || !VALID_DAYS.includes(data.dayOfWeek)) {
    errors.push(`dayOfWeek must be one of: ${VALID_DAYS.join(', ')}.`);
  }
  if (!data.startTime || !TIME_REGEX.test(data.startTime)) {
    errors.push('startTime must be in HH:mm 24-hour format (e.g. "09:00").');
  }
  if (!data.endTime || !TIME_REGEX.test(data.endTime)) {
    errors.push('endTime must be in HH:mm 24-hour format (e.g. "17:00").');
  }
  if (data.startTime && data.endTime && TIME_REGEX.test(data.startTime) && TIME_REGEX.test(data.endTime)) {
    if (data.startTime >= data.endTime) {
      errors.push('startTime must be before endTime.');
    }
  }
  if (!data.timezone || data.timezone.trim().length === 0) {
    errors.push('timezone is required (IANA format, e.g. "America/New_York").');
  }

  return errors;
}

function validateUpdateInput(data: UpdateAvailabilityInput) {
  const errors: string[] = [];

  if (data.dayOfWeek !== undefined && !VALID_DAYS.includes(data.dayOfWeek)) {
    errors.push(`dayOfWeek must be one of: ${VALID_DAYS.join(', ')}.`);
  }
  if (data.startTime !== undefined && !TIME_REGEX.test(data.startTime)) {
    errors.push('startTime must be in HH:mm 24-hour format (e.g. "09:00").');
  }
  if (data.endTime !== undefined && !TIME_REGEX.test(data.endTime)) {
    errors.push('endTime must be in HH:mm 24-hour format (e.g. "17:00").');
  }
  if (data.timezone !== undefined && data.timezone.trim().length === 0) {
    errors.push('timezone cannot be empty.');
  }

  return errors;
}

// ─── Service Functions ──────────────────────────────────────────────

export async function getAllAvailability() {
  return prisma.availability.findMany({
    orderBy: { dayOfWeek: 'asc' },
  });
}

export async function getAvailabilityById(id: string) {
  return prisma.availability.findUnique({ where: { id } });
}

export async function createAvailability(data: CreateAvailabilityInput) {
  const errors = validateCreateInput(data);
  if (errors.length > 0) {
    throw { status: 400, message: 'Validation failed.', errors };
  }

  return prisma.availability.create({
    data: {
      dayOfWeek: data.dayOfWeek as DayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      timezone: data.timezone.trim(),
    },
  });
}

export async function updateAvailability(id: string, data: UpdateAvailabilityInput) {
  const existing = await prisma.availability.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Availability record not found.' };
  }

  const errors = validateUpdateInput(data);

  // Cross-field validation: check time ordering with merged values
  const finalStart = data.startTime ?? existing.startTime;
  const finalEnd = data.endTime ?? existing.endTime;
  if (TIME_REGEX.test(finalStart) && TIME_REGEX.test(finalEnd) && finalStart >= finalEnd) {
    errors.push('startTime must be before endTime.');
  }

  if (errors.length > 0) {
    throw { status: 400, message: 'Validation failed.', errors };
  }

  return prisma.availability.update({
    where: { id },
    data: {
      ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek as DayOfWeek }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.timezone !== undefined && { timezone: data.timezone.trim() }),
    },
  });
}

export async function deleteAvailability(id: string) {
  const existing = await prisma.availability.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Availability record not found.' };
  }

  return prisma.availability.delete({ where: { id } });
}

export async function updateTimezoneForAll(timezone: string) {
  if (!timezone || timezone.trim().length === 0) {
    throw { status: 400, message: 'Validation failed.', errors: ['timezone cannot be empty.'] };
  }
  
  return prisma.availability.updateMany({
    data: { timezone: timezone.trim() },
  });
}
