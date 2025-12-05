import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Canteen',
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['upi', 'cash', 'razorpay'],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    // The main status updated by the manager
    orderStatus: {
      type: String,
      required: true,
      enum: [
        'pending',
        'accepted',
        'preparing',
        'ready',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    // To track status changes
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Add 'pending' to history when created
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({ status: 'pending', timestamp: new Date() });
    // For cash orders, set payment as 'completed'
    if (this.paymentMethod === 'cash' || this.paymentMethod === 'razorpay') {
      this.paymentStatus = 'completed';
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
