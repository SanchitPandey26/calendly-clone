import { Router } from 'express';
import * as slotController from '../controllers/slot.controller';

const router = Router();

router.get('/', slotController.getSlots);

export default router;
