import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventTypeRoutes from './routes/eventType.routes';
import availabilityRoutes from './routes/availability.routes';
import slotRoutes from './routes/slot.routes';
import bookingRoutes from './routes/booking.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
