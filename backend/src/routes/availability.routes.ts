import { Router } from 'express';
import * as availabilityController from '../controllers/availability.controller';

const router = Router();

router.get('/',       availabilityController.getAll);
router.post('/',      availabilityController.create);
router.put('/timezone', availabilityController.updateTimezone);
router.get('/:id',    availabilityController.getById);
router.put('/:id',    availabilityController.update);
router.delete('/:id', availabilityController.remove);

export default router;
