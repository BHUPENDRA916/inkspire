import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import MenuItem from '../models/MenuItem.js';
import Canteen from '../models/Canteen.js';
// Removed: import { io } from '../server.js';

// Helper to generate AI image URLs for food items
const getAIImage = (query) => {
  const prompt = `delicious ${query} food close up professional photography`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=400&nologo=true`;
};


// --- NEW Stats Function ---

// @desc    Get manager's dashboard stats
// @route   GET /api/manager/stats
// @access  Private/Manager
const getManagerStats = asyncHandler(async (req, res) => {
  const canteenId = req.user.canteen;
  if (!canteenId) {
    res.status(400);
    throw new Error('Manager is not associated with a canteen');
  }

  // Run queries in parallel, scoped to the manager's canteen
  const [orderCount, revenueResult] = await Promise.all([
    Order.countDocuments({ canteen: canteenId }),
    Order.aggregate([
      {
        $match: {
          canteen: new mongoose.Types.ObjectId(canteenId),
          orderStatus: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]),
  ]);

  const totalRevenue =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  res.json({
    orderCount,
    totalRevenue,
  });
});

// --- Order Management ---

// @desc    Get all orders for the manager's canteen
// @route   GET /api/manager/orders
// @access  Private/Manager
const getManagerOrders = asyncHandler(async (req, res) => {
  const canteenId = req.user.canteen;
  if (!canteenId) {
    res.status(400);
    throw new Error('Manager is not associated with a canteen');
  }

  const orders = await Order.find({ canteen: canteenId })
    .populate('student', 'name')
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc    Get single order by ID
// @route   GET /api/manager/orders/:id
// @access  Private/Manager
const getManagerOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'student',
    'name email'
  );

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Ensure manager can only access orders for their canteen
  if (order.canteen.toString() !== req.user.canteen.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  const orderItems = await OrderItem.find({ order: order._id });

  res.json({ ...order.toObject(), items: orderItems });
});

// @desc    Update order status
// @route   PATCH /api/manager/orders/:id/status
// @access  Private/Manager
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    'accepted',
    'preparing',
    'ready',
    'completed',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check manager's canteen
  if (order.canteen.toString() !== req.user.canteen.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  order.orderStatus = status;
  order.statusHistory.push({ status: status, timestamp: new Date() });

  // If order is 'completed', mark payment as 'completed'
  if (status === 'completed') {
    order.paymentStatus = 'completed';
  }

  const updatedOrder = await order.save();

  // Removed Socket.io emits
  // Client (student and manager) will poll for updates.

  res.json(updatedOrder);
});

// --- Menu Management ---
// (No changes in the following methods)

// @desc    Get all menu items for manager's canteen
// @route   GET /api/manager/menu
// @access  Private/Manager
const getManagerMenu = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find({ canteen: req.user.canteen });
  res.json(menuItems);
});

// @desc    Create a new menu item
// @route   POST /api/manager/menu
// @access  Private/Manager
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, imageUrl, isAvailable } = req.body;

  const menuItem = new MenuItem({
    canteen: req.user.canteen,
    name,
    description,
    price,
    // If the client didn't provide an image URL (or provided an empty string),
    // auto-generate one using the AI image service so the UI shows an AI image.
    imageUrl: imageUrl === undefined || imageUrl === '' ? getAIImage(name) : imageUrl,
    isAvailable,
  });

  const createdMenuItem = await menuItem.save();
  res.status(201).json(createdMenuItem);
});

// @desc    Update a menu item
// @route   PUT /api/manager/menu/:id
// @access  Private/Manager
const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, imageUrl, isAvailable } = req.body;

  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Check canteen
  if (menuItem.canteen.toString() !== req.user.canteen.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this item');
  }

  menuItem.name = name || menuItem.name;
  menuItem.description = description || menuItem.description;
  menuItem.price = price || menuItem.price;
  // If client sends `imageUrl` explicitly:
  // - non-empty string -> use it
  // - empty string -> auto-generate a new AI image for the (new) name
  // If `imageUrl` is not provided, keep existing value.
  if (imageUrl !== undefined) {
    menuItem.imageUrl = imageUrl === '' ? getAIImage(menuItem.name) : imageUrl;
  }
  menuItem.isAvailable =
    isAvailable === undefined ? menuItem.isAvailable : isAvailable;

  const updatedMenuItem = await menuItem.save();
  res.json(updatedMenuItem);
});

// @desc    Delete a menu item
// @route   DELETE /api/manager/menu/:id
// @access  Private/Manager
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  // Check canteen
  if (menuItem.canteen.toString() !== req.user.canteen.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this item');
  }

  await menuItem.deleteOne();
  res.json({ message: 'Menu item removed' });
});

// --- Canteen Settings ---

// @desc    Get manager's canteen details
// @route   GET /api/manager/canteen
// @access  Private/Manager
const getManagerCanteen = asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.user.canteen);
  if (!canteen) {
    res.status(404);
    throw new Error('Canteen not found');
  }
  res.json(canteen);
});

// @desc    Update manager's canteen (UPI ID, isOpen)
// @route   PUT /api/manager/canteen
// @access  Private/Manager
const updateManagerCanteen = asyncHandler(async (req, res) => {
  const { upiId, isOpen } = req.body;
  const canteen = await Canteen.findById(req.user.canteen);

  if (!canteen) {
    res.status(404);
    throw new Error('Canteen not found');
  }

  canteen.upiId = upiId === undefined ? canteen.upiId : upiId;
  canteen.isOpen = isOpen === undefined ? canteen.isOpen : isOpen;

  const updatedCanteen = await canteen.save();
  res.json(updatedCanteen);
});

export {
  getManagerOrders,
  getManagerOrderById,
  getManagerStats,
  updateOrderStatus,
  getManagerMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getManagerCanteen,
  updateManagerCanteen,
};