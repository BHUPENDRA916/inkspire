import asyncHandler from 'express-async-handler';
import Canteen from '../models/Canteen.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';

// --- Canteen & Menu ---

// @desc    Get all canteens
// @route   GET /api/student/canteens
// @access  Public
const getAllCanteens = asyncHandler(async (req, res) => {
  const canteens = await Canteen.find({ isOpen: true });
  res.json(canteens);
});

// @desc    Get single canteen by ID
// @route   GET /api/student/canteens/:id
// @access  Public
const getCanteenById = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);
  if (canteen) {
    res.json(canteen);
  } else {
    res.status(404);
    throw new Error('Canteen not found');
  }
});

// @desc    Get menu for a canteen
// @route   GET /api/student/canteens/:id/menu
// @access  Public
const getCanteenMenu = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find({
    canteen: req.params.id,
    isAvailable: true,
  });
  res.json(menuItems);
});

// --- Order Management ---

// @desc    Create a new order
// @route   POST /api/student/orders
// @access  Private/Student
const createOrder = asyncHandler(async (req, res) => {
  const {
    canteenId,
    orderItems, // Expects [{ menuItemId, quantity }, ...]
    paymentMethod,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // 1. Get prices from DB
  const menuItemIds = orderItems.map((item) => item.menuItemId);
  const menuItemsFromDB = await MenuItem.find({ _id: { $in: menuItemIds } });

  let totalAmount = 0;
  const processedItems = [];

  for (const item of orderItems) {
    const dbItem = menuItemsFromDB.find(
      (i) => i._id.toString() === item.menuItemId
    );
    if (!dbItem) {
      res.status(400);
      throw new Error(`Menu item with id ${item.menuItemId} not found`);
    }
    totalAmount += dbItem.price * item.quantity;
    processedItems.push({
      menuItem: dbItem._id,
      name: dbItem.name,
      quantity: item.quantity,
      price: dbItem.price,
    });
  }

  // 2. Create the main Order
  const order = new Order({
    student: req.user._id,
    canteen: canteenId,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'upi' ? 'pending' : 'completed',
    orderStatus: 'pending',
  });
  const createdOrder = await order.save();

  // 3. Create the OrderItems
  const itemsToSave = processedItems.map((item) => ({
    ...item,
    order: createdOrder._id,
  }));
  await OrderItem.insertMany(itemsToSave);

  res.status(201).json(createdOrder);
});

// @desc    Get a user's order history
// @route   GET /api/student/orders
// @access  Private/Student
const getOrderHistory = asyncHandler(async (req, res) => {
  const orders = await Order.find({ student: req.user._id })
    .populate('canteen', 'name')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID (for status tracking)
// @route   GET /api/student/orders/:id
// @access  Private/Student
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('canteen', 'name upiId')
    .populate('student', 'name');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if the user owns this order
  if (order.student._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  const orderItems = await OrderItem.find({ order: order._id });

  res.json({ ...order.toObject(), items: orderItems });
});

export {
  getAllCanteens,
  getCanteenById,
  getCanteenMenu,
  createOrder,
  getOrderHistory,
  getOrderById,
};