import express from 'express';
import {
  getAllCanteens,
  getCanteenById,
  getCanteenMenu,
  createOrder,
  getOrderById,
  getOrderHistory,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/canteens', getAllCanteens);
router.get('/canteens/:id', getCanteenById);
router.get('/canteens/:id/menu', getCanteenMenu);

// Protected student routes
router.use(protect);
router.use(authorize('student'));

router.post('/orders', createOrder);
router.get('/orders', getOrderHistory);
router.get('/orders/:id', getOrderById);

export default router;