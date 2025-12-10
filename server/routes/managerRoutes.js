import express from 'express';
import {
  getManagerOrders,
  getManagerOrderById,
  updateOrderStatus,
  getManagerMenu,
  getManagerStats,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getManagerCanteen,
  updateManagerCanteen,
} from '../controllers/managerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All manager routes are protected and require 'manager' role
router.use(protect);
router.use(authorize('manager'));

// Order Management
router.get('/stats', getManagerStats);

router.get('/orders', getManagerOrders);
router.get('/orders/:id', getManagerOrderById);
router.patch('/orders/:id/status', updateOrderStatus);

// Menu Management
router.route('/menu').get(getManagerMenu).post(createMenuItem);
router
  .route('/menu/:id')
  .put(updateMenuItem)
  .delete(deleteMenuItem);

// Canteen Settings
router.route('/canteen').get(getManagerCanteen).put(updateManagerCanteen);

export default router;