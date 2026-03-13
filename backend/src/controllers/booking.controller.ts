import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';

export async function create(req: Request, res: Response) {
  try {
    const { eventTypeId, startTime, endTime, inviteeName, inviteeEmail } = req.body;
    const booking = await bookingService.createBooking({
      eventTypeId, startTime, endTime, inviteeName, inviteeEmail,
    });
    res.status(201).json(booking);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message, errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function getUpcoming(req: Request, res: Response) {
  try {
    const bookings = await bookingService.getUpcomingBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function getPast(req: Request, res: Response) {
  try {
    const bookings = await bookingService.getPastBookings();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function cancel(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const booking = await bookingService.cancelBooking(id);
    res.status(200).json(booking);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message, errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function reschedule(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { newStartTime, newEndTime } = req.body;
    const booking = await bookingService.rescheduleBooking(id, newStartTime, newEndTime);
    res.status(200).json(booking);
  } catch (error: any) {
    if (error.status) {
      res.status(error.status).json({ message: error.message, errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Internal server error.' });
  }
}
