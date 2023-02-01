import { Router } from 'express';
import BonamiController from './BonamiController.js';

const router = new Router();

router.post('/user/signup', BonamiController.SignUpUser);
router.get('/user/:id', BonamiController.getUserData);

export default router;
