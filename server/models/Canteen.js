import mongoose from 'mongoose';

const canteenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: false,
      default: 'https://placehold.co/600x400/FF7043/white?text=Canteen',
    },
    isOpen: {
      type: Boolean,
      required: true,
      default: true,
    },
    // UPI Virtual Payment Address (VPA)
    upiId: {
      type: String,
      required: false,
      trim: true,
    },
  },
  { timestamps: true }
);

const Canteen = mongoose.model('Canteen', canteenSchema);
export default Canteen;