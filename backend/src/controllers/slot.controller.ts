import { Request, Response } from 'express';
import * as slotService from '../services/slot.service';

export async function getSlots(req: Request, res: Response) {
  try {
    const eventTypeId = req.query.eventTypeId as string;
    const date = req.query.date as string;

    if (!eventTypeId || !date) {
      res.status(400).json({ message: 'Both eventTypeId and date query parameters are required.' });
      return;
    }

    const slots = await slotService.getAvailableSlots(eventTypeId, date);
    res.status(200).json(slots);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}
