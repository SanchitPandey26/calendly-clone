import prisma from '../config/prisma';

// ─── Types ──────────────────────────────────────────────────────────

interface CreateEventTypeInput {
  name: string;
  slug: string;
  duration: number;
}

interface UpdateEventTypeInput {
  name?: string;
  slug?: string;
  duration?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────

function validateCreateInput(data: CreateEventTypeInput) {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required.');
  }
  if (!data.slug || data.slug.trim().length === 0) {
    errors.push('Slug is required.');
  }
  if (data.duration === undefined || data.duration === null) {
    errors.push('Duration is required.');
  } else if (!Number.isInteger(data.duration) || data.duration <= 0) {
    errors.push('Duration must be a positive integer (in minutes).');
  }

  return errors;
}

function validateUpdateInput(data: UpdateEventTypeInput) {
  const errors: string[] = [];

  if (data.name !== undefined && data.name.trim().length === 0) {
    errors.push('Name cannot be empty.');
  }
  if (data.slug !== undefined && data.slug.trim().length === 0) {
    errors.push('Slug cannot be empty.');
  }
  if (data.duration !== undefined) {
    if (!Number.isInteger(data.duration) || data.duration <= 0) {
      errors.push('Duration must be a positive integer (in minutes).');
    }
  }

  return errors;
}

// ─── Service Functions ──────────────────────────────────────────────

export async function getAllEventTypes() {
  return prisma.eventType.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEventTypeById(id: string) {
  return prisma.eventType.findUnique({ where: { id } });
}

export async function getEventTypeBySlug(slug: string) {
  return prisma.eventType.findUnique({ where: { slug } });
}

export async function createEventType(data: CreateEventTypeInput) {
  // Validate input
  const errors = validateCreateInput(data);
  if (errors.length > 0) {
    throw { status: 400, message: 'Validation failed.', errors };
  }

  // Check slug uniqueness
  const existing = await prisma.eventType.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    throw { status: 409, message: `Slug "${data.slug}" is already in use.` };
  }

  return prisma.eventType.create({
    data: {
      name: data.name.trim(),
      slug: data.slug.trim(),
      duration: data.duration,
    },
  });
}

export async function updateEventType(id: string, data: UpdateEventTypeInput) {
  // Check if event type exists
  const eventType = await prisma.eventType.findUnique({ where: { id } });
  if (!eventType) {
    throw { status: 404, message: 'Event type not found.' };
  }

  // Validate input
  const errors = validateUpdateInput(data);
  if (errors.length > 0) {
    throw { status: 400, message: 'Validation failed.', errors };
  }

  // If slug is being changed, check uniqueness
  if (data.slug && data.slug !== eventType.slug) {
    const existing = await prisma.eventType.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw { status: 409, message: `Slug "${data.slug}" is already in use.` };
    }
  }

  return prisma.eventType.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.slug !== undefined && { slug: data.slug.trim() }),
      ...(data.duration !== undefined && { duration: data.duration }),
    },
  });
}

export async function deleteEventType(id: string) {
  // Check if event type exists
  const eventType = await prisma.eventType.findUnique({ where: { id } });
  if (!eventType) {
    throw { status: 404, message: 'Event type not found.' };
  }

  return prisma.eventType.delete({ where: { id } });
}
