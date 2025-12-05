import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order',
  },
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'MenuItem',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  // Price at the time of order
  price: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
export default OrderItem;