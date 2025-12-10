import express from 'express';
import {
  createCanteen,
  createManager,
  getAdminStats, // Import the new function
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes are protected and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

// NEW: Route to get dashboard statistics
router.get('/stats', getAdminStats);

// Existing routes for management
router.post('/canteens', createCanteen);
router.post('/users/manager', createManager);

export default router;