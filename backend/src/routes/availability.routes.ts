import { Router } from 'express';
import * as availabilityController from '../controllers/availability.controller';

const router = Router();

router.get('/',       availabilityController.getAll);
router.get('/:id',    availabilityController.getById);
router.post('/',      availabilityController.create);
router.put('/:id',    availabilityController.update);
router.delete('/:id', availabilityController.remove);

export default router;
