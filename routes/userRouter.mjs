import { Router } from 'express';

import {
  getMe,
  getUser,
  updateMe,
  deleteMe,
  getAllUsers,
  getRoleAndCount,
  updateUser,
  deleteUser,
} from '../controller/userController.mjs';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} from '../controller/authController.mjs';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// all the route below will have to pass the middleware protect before reach to another controllers
router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

// ------ Most Secure router -------
// only trn-admin can use the route below

router.use(restrictTo('trn-admin'));

router.route('/').get(getAllUsers);
router.route('/role').get(getRoleAndCount);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
