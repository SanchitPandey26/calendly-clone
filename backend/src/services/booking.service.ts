import prisma from '../config/prisma';

// ─── Types ──────────────────────────────────────────────────────────

interface CreateBookingInput {
  eventTypeId: string;
  startTime: string;  // ISO string from Slot Service
  endTime: string;    // ISO string from Slot Service
  inviteeName: string;
  inviteeEmail: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCreateInput(data: CreateBookingInput) {
  const errors: string[] = [];

  if (!data.eventTypeId || data.eventTypeId.trim().length === 0) {
    errors.push('eventTypeId is required.');
  }
  if (!data.startTime) {
    errors.push('startTime is required.');
  } else if (isNaN(Date.parse(data.startTime))) {
    errors.push('startTime must be a valid ISO date string.');
  }
  if (!data.endTime) {
    errors.push('endTime is required.');
  } else if (isNaN(Date.parse(data.endTime))) {
    errors.push('endTime must be a valid ISO date string.');
  }
  if (data.startTime && data.endTime && !isNaN(Date.parse(data.startTime)) && !isNaN(Date.parse(data.endTime))) {
    if (new Date(data.startTime) >= new Date(data.endTime)) {
      errors.push('startTime must be before endTime.');
    }
  }
  if (!data.inviteeName || data.inviteeName.trim().length === 0) {
    errors.push('inviteeName is required.');
  }
  if (!data.inviteeEmail || data.inviteeEmail.trim().length === 0) {
    errors.push('inviteeEmail is required.');
  } else if (!EMAIL_REGEX.test(data.inviteeEmail)) {
    errors.push('inviteeEmail must be a valid email address.');
  }

  return errors;
}

// ─── Service Functions ──────────────────────────────────────────────

export async function createBooking(data: CreateBookingInput) {
  // Validate input
  const errors = validateCreateInput(data);
  if (errors.length > 0) {
    throw { status: 400, message: 'Validation failed.', errors };
  }

  // Check event type exists
  const eventType = await prisma.eventType.findUnique({
    where: { id: data.eventTypeId },
  });
  if (!eventType) {
    throw { status: 404, message: 'Event type not found.' };
  }

  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  // Derive date from startTime (midnight UTC of that day)
  const dateStr = data.startTime.split('T')[0];
  const date = new Date(dateStr + 'T00:00:00.000Z');

  // Double-booking check: any SCHEDULED booking that overlaps with this time range
  const overlapping = await prisma.booking.findFirst({
    where: {
      status: 'SCHEDULED',
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });
  if (overlapping) {
    throw { status: 409, message: 'This time slot is already booked.' };
  }

  // Create the booking
  return prisma.booking.create({
    data: {
      eventTypeId: data.eventTypeId,
      date,
      startTime,
      endTime,
      inviteeName: data.inviteeName.trim(),
      inviteeEmail: data.inviteeEmail.trim(),
    },
    include: {
      eventType: true,
    },
  });
}

export async function getUpcomingBookings() {
  const now = new Date();

  return prisma.booking.findMany({
    where: {
      startTime: { gte: now },
      status: 'SCHEDULED',
    },
    include: {
      eventType: true,
    },
    orderBy: { startTime: 'asc' },
  });
}

export async function getPastBookings() {
  const now = new Date();

  return prisma.booking.findMany({
    where: {
      startTime: { lt: now },
    },
    include: {
      eventType: true,
    },
    orderBy: { startTime: 'desc' },
  });
}

export async function cancelBooking(id: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw { status: 404, message: 'Booking not found.' };
  }
  if (booking.status === 'CANCELLED') {
    throw { status: 400, message: 'Booking is already cancelled.' };
  }

  return prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      eventType: true,
    },
  });
}

export async function rescheduleBooking(
  id: string,
  newStartTime: string,
  newEndTime: string
) {
  // 1. Validate the new times
  if (!newStartTime || isNaN(Date.parse(newStartTime))) {
    throw { status: 400, message: 'newStartTime must be a valid ISO date string.' };
  }
  if (!newEndTime || isNaN(Date.parse(newEndTime))) {
    throw { status: 400, message: 'newEndTime must be a valid ISO date string.' };
  }
  const start = new Date(newStartTime);
  const end = new Date(newEndTime);
  if (start >= end) {
    throw { status: 400, message: 'newStartTime must be before newEndTime.' };
  }

  // 2. Booking must exist and be SCHEDULED
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw { status: 404, message: 'Booking not found.' };
  }
  if (booking.status === 'CANCELLED') {
    throw { status: 400, message: 'Cannot reschedule a cancelled booking.' };
  }

  // 3. Double-booking check (exclude the current booking itself)
  const overlapping = await prisma.booking.findFirst({
    where: {
      id: { not: id },
      status: 'SCHEDULED',
      startTime: { lt: end },
      endTime: { gt: start },
    },
  });
  if (overlapping) {
    throw { status: 409, message: 'This time slot is already booked.' };
  }

  // 4. Derive new date from newStartTime
  const dateStr = newStartTime.split('T')[0];
  const date = new Date(dateStr + 'T00:00:00.000Z');

  // 5. Update the booking
  return prisma.booking.update({
    where: { id },
    data: {
      date,
      startTime: start,
      endTime: end,
    },
    include: {
      eventType: true,
    },
  });
}
