import Razorpay from 'razorpay';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

// Initialize Razorpay
let razorpay;

const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys are missing in environment variables');
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR' } = req.body;

  if (!amount) {
    res.status(400);
    throw new Error('Please provide an amount');
  }

  const options = {
    amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
    currency,
  };

  try {
    const instance = getRazorpayInstance();
    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500);
    throw new Error(error.message || 'Razorpay order creation failed');
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { order_id, payment_id, signature } = req.body;

  if (!order_id || !payment_id || !signature) {
    res.status(400);
    throw new Error('Missing payment details');
  }

  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(order_id + '|' + payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature === signature) {
    res.json({ success: true, message: 'Payment has been verified' });
  } else {
    res.status(400);
    throw new Error('Payment verification failed');
  }
});

export { createPaymentOrder, verifyPayment };
