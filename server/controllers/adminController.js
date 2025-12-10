import asyncHandler from 'express-async-handler';
import Canteen from '../models/Canteen.js';
import User from '../models/User.js';
import Order from '../models/Order.js'; // Import Order model

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  // Run queries in parallel
  const [canteenCount, studentCount, orderCount, revenueResult] =
    await Promise.all([
      Canteen.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
    ]);

  // Extract total revenue, handling case where there are no completed orders
  const totalRevenue =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  res.json({
    canteenCount,
    studentCount,
    orderCount,
    totalRevenue,
  });
});


// @desc    Create a new canteen
// @route   POST /api/admin/canteens
// @access  Private/Admin
const createCanteen = asyncHandler(async (req, res) => {
  const { name, location, upiId, imageUrl } = req.body;

  const canteenExists = await Canteen.findOne({ name });
  if (canteenExists) {
    res.status(400);
    throw new Error('Canteen with this name already exists');
  }

  const canteen = await Canteen.create({
    name,
    location,
    upiId,
    imageUrl,
  });

  res.status(201).json(canteen);
});

// @desc    Create a new manager user
// @route   POST /api/admin/users/manager
// @access  Private/Admin
const createManager = asyncHandler(async (req, res) => {
  const { name, email, password, canteenId } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const canteen = await Canteen.findById(canteenId);
  if (!canteen) {
    res.status(404);
    throw new Error('Canteen not found');
  }

  const manager = await User.create({
    name,
    email,
    password,
    role: 'manager',
    canteen: canteenId,
  });

  if (manager) {
    res.status(201).json({
      _id: manager._id,
      name: manager.name,
      email: manager.email,
      role: manager.role,
      canteen: manager.canteen,
    });
  } else {
    res.status(400);
    throw new Error('Invalid manager data');
  }
});

export { getAdminStats, createCanteen, createManager };