import { Router } from 'express';
import * as controller from '../controllers/contributions.ts';

const router = Router();

router.get('/', controller.handleGetAllContributions);

export default router;
