import { Request, Response } from 'express';
import * as availabilityService from '../services/availability.service';

export async function getAll(req: Request, res: Response) {
  try {
    const records = await availabilityService.getAllAvailability();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const record = await availabilityService.getAvailabilityById(id);

    if (!record) {
      res.status(404).json({ message: 'Availability record not found.' });
      return;
    }

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { dayOfWeek, startTime, endTime, timezone } = req.body;
    const record = await availabilityService.createAvailability({ dayOfWeek, startTime, endTime, timezone });
    res.status(201).json(record);
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
    const { dayOfWeek, startTime, endTime, timezone } = req.body;
    const record = await availabilityService.updateAvailability(id, { dayOfWeek, startTime, endTime, timezone });
    res.status(200).json(record);
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
    await availabilityService.deleteAvailability(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message, errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function updateTimezone(req: Request, res: Response) {
  try {
    const { timezone } = req.body;
    await availabilityService.updateTimezoneForAll(timezone);
    res.status(200).json({ message: 'Timezone updated successfully for all slots.' });
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message, errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}
