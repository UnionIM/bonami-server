import { Router } from 'express';
import BonamiController from './BonamiController.js';
import passport from 'passport';
import '../Middleware/passportGoogle.js';
import '../Middleware/passportLocal.js';
import { upload } from './s3service.js';
import { isLoggedIn, isAdminLoggedIn } from '../Middleware/authMiddleware.js';

const router = new Router();

router.get('/google', (req, res, next) => {
  const returnTo = req.headers.referer;
  const state = returnTo
    ? Buffer.from(JSON.stringify({ returnTo })).toString('base64')
    : undefined;
  const authenticator = passport.authenticate('google', {
    scope: 'https://www.googleapis.com/auth/userinfo.email',
    state,
  });
  authenticator(req, res, next);
});
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
    failureRedirect: '/login/fail',
  }),
  (req, res) => {
    const { state } = req.query;
    const { returnTo } = JSON.parse(Buffer.from(state, 'base64').toString());
    res.redirect(returnTo);
  }
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

router.get('/user', isLoggedIn, BonamiController.getUserData);
router.get('/isAuth', BonamiController.isAuth);
router.post('/user/signup', BonamiController.SignUpUser);
router.post('/user/login', BonamiController.login);
router.put('/user/update', isLoggedIn, BonamiController.updateUserData);

router.get('/item/list', BonamiController.getItemList);
router.get('/item', BonamiController.getItemById);
router.post(
  '/item/create',
  [isAdminLoggedIn, upload.array('files', 10)],
  BonamiController.createItem
);
router.put('/item/edit', isAdminLoggedIn, BonamiController.updateItem);
router.delete('/item/delete', isAdminLoggedIn, BonamiController.deleteItem);
router.post('/item/review/create', isLoggedIn, BonamiController.createReview);
router.delete('/item/review/delete', isLoggedIn, BonamiController.deleteReview);
router.delete(
  '/item/img/delete',
  isAdminLoggedIn,
  BonamiController.deleteItemImages
);
router.put(
  '/item/img/upload',
  [isAdminLoggedIn, upload.array('files', 10)],
  BonamiController.updateItemImages
);

router.get('/category', BonamiController.getCategories);
router.post(
  '/category/create',
  isAdminLoggedIn,
  BonamiController.createCategory
);
router.delete(
  '/category/delete-empty',
  isAdminLoggedIn,
  BonamiController.deleteCategoriesWithoutItems
);

router.post('/order/create', BonamiController.createOrder);
router.get('/order/list', BonamiController.getOrderList);
router.get('/order', BonamiController.getOrderById);
router.put(
  '/order/status',
  isAdminLoggedIn,
  BonamiController.updateOrderStatus
);

router.get('/statistics', isAdminLoggedIn, BonamiController.getHomePageData);
router.get(
  '/statistics/recalculate',
  isAdminLoggedIn,
  BonamiController.recalculateOrderStatistic
);
router.get(
  '/statistics/graph',
  isAdminLoggedIn,
  BonamiController.getOrderGraphData
);

export default router;
