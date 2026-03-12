import { Request, Response } from 'express';
import * as eventTypeService from '../services/eventType.service';

export async function getAll(req: Request, res: Response) {
  try {
    const eventTypes = await eventTypeService.getAllEventTypes();
    res.status(200).json(eventTypes);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const eventType = await eventTypeService.getEventTypeById(id);

    if (!eventType) {
      res.status(404).json({ message: 'Event type not found.' });
      return;
    }

    res.status(200).json(eventType);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function getBySlug(req: Request, res: Response) {
  try {
    const slug = req.params.slug as string;
    const eventType = await eventTypeService.getEventTypeBySlug(slug);

    if (!eventType) {
      res.status(404).json({ message: 'Event type not found.' });
      return;
    }

    res.status(200).json(eventType);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, slug, duration } = req.body;
    const eventType = await eventTypeService.createEventType({ name, slug, duration });
    res.status(201).json(eventType);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message, errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { name, slug, duration } = req.body;
    const eventType = await eventTypeService.updateEventType(id, { name, slug, duration });
    res.status(200).json(eventType);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message, errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await eventTypeService.deleteEventType(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message, errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}

