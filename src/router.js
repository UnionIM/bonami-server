import { Router } from 'express';
import BonamiController from './BonamiController.js';
import passport from 'passport';
import '../Middleware/passportMiddleware.js';
import { upload } from './s3service.js';
import isLoggedIn from '../Middleware/authMiddleware.js';

const router = new Router();

router.get(
  '/google',
  passport.authenticate('google', {
    scope: 'https://www.googleapis.com/auth/userinfo.email',
  })
);
router.post(
  '/local',
  passport.authenticate('local', {
    failureRedirect: '/login/fail',
  }),
  (req, res) => {
    res.json(req.user);
  }
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.ADMIN_PANEL_URL,
    failureRedirect: '/login/fail',
  })
);
router.get('/login/fail', (req, res) => {
  res.status(403).json({
    success: false,
    message: 'failure',
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'success' });
});

router.post('/user/signup', BonamiController.SignUpUser);
router.post('/user/login', BonamiController.login);
router.post(
  '/item/create',
  [isLoggedIn, upload.array('files', 10)],
  BonamiController.createItem
);
router.get('/user', isLoggedIn, BonamiController.getUserData);
router.get('/item/list', BonamiController.getItemList);
router.get('/category', BonamiController.getCategories);
router.post('/category/create', BonamiController.createCategory);
router.put('/user/update', isLoggedIn, BonamiController.updateUserData);
router.get('/isAuth', BonamiController.isAuth);

export default router;
