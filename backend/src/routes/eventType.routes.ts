import { Router } from 'express';
import * as eventTypeController from '../controllers/eventType.controller';

const router = Router();

router.get('/',           eventTypeController.getAll);
router.get('/:id',        eventTypeController.getById);
router.get('/slug/:slug', eventTypeController.getBySlug);
router.post('/',          eventTypeController.create);
router.put('/:id',        eventTypeController.update);
router.delete('/:id',     eventTypeController.remove);

export default router;
