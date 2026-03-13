import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

router.post('/',            bookingController.create);
router.get('/upcoming',     bookingController.getUpcoming);
router.get('/past',         bookingController.getPast);
router.patch('/:id/cancel',      bookingController.cancel);
router.patch('/:id/reschedule',  bookingController.reschedule);

export default router;
