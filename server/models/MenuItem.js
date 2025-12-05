import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Canteen',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ['veg', 'non-veg', 'egg'],
      default: 'veg',
    },
    // -----------------
    imageUrl: {
      type: String,
      required: false,
      default: 'https://placehold.co/300x200/4A64F0/white?text=Food',
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;