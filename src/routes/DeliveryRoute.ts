import express from 'express';
import { authenticate } from '../middlewares';
import { DeliveryLogin, DeliverySignUp, EditDeliveryProfile, GetDeliveryProfile, UpdateDeliveryUserStatus } from '../controllers';

const router = express.Router();

/* ------------------- Signup / Create Delivery Chap --------------------- */
router.post('/signup', DeliverySignUp);
/* ------------------- Login Delivery Chap --------------------- */
router.post('/login', DeliveryLogin);
/* ------------------- Delivery User Authentication --------------------- */
router.use(authenticate);
/* ------------------- Change Service Status --------------------- */
router.put('/change-status', UpdateDeliveryUserStatus);
/* ------------------- Delivery User Profile --------------------- */
router.get('/profile', GetDeliveryProfile);
router.patch('/profile', EditDeliveryProfile);

export { router as DeliveryRoute };
