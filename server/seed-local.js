import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
// Import models from local server folder so they resolve to the same mongoose instance
import User from './models/User.js';
import Canteen from './models/Canteen.js';
import MenuItem from './models/MenuItem.js';
import Order from './models/Order.js';
import OrderItem from './models/OrderItem.js';

// Load env vars from server/.env (we run this from project root)
dotenv.config({ path: './server/.env' });

// Helper to generate AI Image URLs
const getAIImage = (query, type = 'food') => {
  const prompt = type === 'canteen'
    ? `modern university canteen cafeteria ${query} interior professional photography bright`
    : `delicious ${query} food close up professional photography`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=400&nologo=true`;
};

// Quick sanity check for MONGO_URI
if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in server/.env — please set it before running this script.');
  process.exit(1);
}

// Set buffer timeout
mongoose.set('bufferTimeoutMS', 30000);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// We rely on User model's pre-save hook to hash plaintext passwords.
// Do NOT pre-hash here — creating with a pre-hashed password would double-hash.

const seedData = async () => {
  try {
    await connectDB();

    console.log('Mongoose readyState:', mongoose.connection.readyState);
    console.log('Registered mongoose models:', Object.keys(mongoose.models));

    // Clear existing data
    await OrderItem.deleteMany();
    await Order.deleteMany();
    await MenuItem.deleteMany();
    await User.deleteMany();
    await Canteen.deleteMany();

    console.log('Cleared existing data...');

    // --- Create Canteens ---
    const canteen1 = await Canteen.create({
      name: 'Central Perk',
      location: 'Student Hub, Ground Floor',
      upiId: 'centralperk@okbank',
      imageUrl: 'https://placehold.co/600x400/FF7043/white?text=Central+Perk',
    });

    const canteen2 = await Canteen.create({
      name: 'The Nook',
      location: 'Library Basement',
      upiId: 'thenook@okbank',
      imageUrl: 'https://placehold.co/600x400/4A64F0/white?text=The+Nook',
    });

    const canteen3 = await Canteen.create({
      name: 'Byte Bites',
      location: 'Engineering Block, 3rd Floor',
      upiId: 'bytebites@okbank',
      imageUrl: 'https://placehold.co/600x400/34D399/white?text=Byte+Bites',
    });

    console.log('Canteens created...');

    // --- Create Users (Admin, Managers, Students) ---
    // Provide plaintext passwords; the User model will hash them via pre-save middleware.
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campuseats.com',
      password: 'admin123',
      role: 'admin',
    });

    const manager1 = await User.create({
      name: 'Manager One',
      email: 'manager1@campuseats.com',
      password: 'manager123',
      role: 'manager',
      canteen: canteen1._id,
    });

    const manager2 = await User.create({
      name: 'Manager Two',
      email: 'manager2@campuseats.com',
      password: 'manager123',
      role: 'manager',
      canteen: canteen2._id,
    });

    const manager3 = await User.create({
      name: 'Manager Three',
      email: 'manager3@campuseats.com',
      password: 'manager123',
      role: 'manager',
      canteen: canteen3._id,
    });

    const student1 = await User.create({
      name: 'Alice Smith',
      email: 'alice@student.com',
      password: 'student123',
      role: 'student',
    });
    const student2 = await User.create({
      name: 'Bob Johnson',
      email: 'bob@student.com',
      password: 'student123',
      role: 'student',
    });

    console.log('Users created...');

    // --- Create Menu Items ---
    const item2_1 = await MenuItem.create({
      canteen: canteen2._id,
      name: 'Samosa',
      description: 'Spicy potato pastry.',
      price: 1.0,
      type: 'veg',
      imageUrl: getAIImage('Samosa'),
    });

    await MenuItem.create({
      canteen: canteen1._id,
      name: 'Espresso',
      description: 'Strong, hot coffee.',
      price: 1.5,
      type: 'veg',
      imageUrl: getAIImage('Espresso'),
    });

    await MenuItem.create({
      canteen: canteen1._id,
      name: 'Croissant',
      description: 'Flaky butter croissant.',
      price: 2.0,
      type: 'veg',
      imageUrl: getAIImage('Croissant'),
    });

    await MenuItem.create({
      canteen: canteen1._id,
      name: 'Muffin',
      description: 'Blueberry Muffin',
      price: 2.5,
      type: 'veg',
      imageUrl: getAIImage('Blueberry Muffin'),
    });

    await MenuItem.create({
      canteen: canteen2._id,
      name: 'Chai',
      description: 'Hot masala tea.',
      price: 1.0,
      type: 'veg',
      imageUrl: getAIImage('Chai'),
    });

    const item2_3 = await MenuItem.create({
      canteen: canteen2._id,
      name: 'Vada Pav',
      description: 'Classic Mumbai street food.',
      price: 2.0,
      type: 'veg',
      imageUrl: getAIImage('Vada Pav'),
    });

    await MenuItem.create({
      canteen: canteen3._id,
      name: 'Club Sandwich',
      description: 'Triple-decker sandwich.',
      price: 4.0,
      type: 'non-veg',
      imageUrl: getAIImage('Club Sandwich'),
    });
    await MenuItem.create({
      canteen: canteen3._id,
      name: 'Energy Drink',
      description: 'Keeps you coding.',
      price: 3.0,
      type: 'veg',
      imageUrl: getAIImage('Energy Drink'),
    });
    await MenuItem.create({
      canteen: canteen3._id,
      name: 'Pizza Slice',
      description: 'Cheese pizza.',
      price: 2.5,
      type: 'veg',
      imageUrl: getAIImage('Cheese Pizza Slice'),
    });

    // --- Additional non-veg and egg items ---
    await MenuItem.create({
      canteen: canteen1._id,
      name: 'Chicken Croissant',
      description: 'Flaky croissant with chicken filling.',
      price: 3.5,
      type: 'non-veg',
      imageUrl: getAIImage('Chicken Croissant'),
    });

    await MenuItem.create({
      canteen: canteen1._id,
      name: 'Egg Omelette',
      description: 'Two-egg omelette with herbs.',
      price: 2.5,
      type: 'egg',
      imageUrl: getAIImage('Egg Omelette'),
    });

    await MenuItem.create({
      canteen: canteen2._id,
      name: 'Chicken Biryani',
      description: 'Spiced chicken with fragrant rice.',
      price: 5.0,
      type: 'non-veg',
      imageUrl: getAIImage('Chicken Biryani'),
    });

    await MenuItem.create({
      canteen: canteen2._id,
      name: 'Egg Roll',
      description: 'Rolled flatbread with omelette.',
      price: 2.5,
      type: 'egg',
      imageUrl: getAIImage('Egg Roll'),
    });

    await MenuItem.create({
      canteen: canteen3._id,
      name: 'Grilled Chicken',
      description: 'Marinated grilled chicken.',
      price: 6.0,
      type: 'non-veg',
      imageUrl: getAIImage('Grilled Chicken'),
    });

    await MenuItem.create({
      canteen: canteen3._id,
      name: 'Egg Fried Rice',
      description: 'Fried rice with scrambled egg.',
      price: 3.0,
      type: 'egg',
      imageUrl: getAIImage('Egg Fried Rice'),
    });

    console.log('Menu items created...');

    // --- Create a Sample Order ---
    const order1 = await Order.create({
      student: student1._id,
      canteen: canteen2._id,
      totalAmount: 3.0,
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      orderStatus: 'pending',
    });

    await OrderItem.create({
      order: order1._id,
      menuItem: item2_1._id,
      quantity: 1,
      price: item2_1.price,
      name: item2_1.name,
    });

    await OrderItem.create({
      order: order1._id,
      menuItem: item2_3._id,
      quantity: 1,
      price: item2_3.price,
      name: item2_3.name,
    });

    console.log('Sample order created...');

    console.log('\n--- Seed Data Success! ---');
    console.log('\nSample User Credentials:');
    console.log('--------------------------');
    console.log('Admin:');
    console.log('  Email: admin@campuseats.com');
    console.log('  Pass:  admin123');
    console.log('\nManagers:');
    console.log('  Email: manager1@campuseats.com (Manages Central Perk)');
    console.log('  Email: manager2@campuseats.com (Manages The Nook)');
    console.log('  Email: manager3@campuseats.com (Manages Byte Bites)');
    console.log('  Pass:  manager123');
    console.log('\nStudents:');
    console.log('  Email: alice@student.com');
    console.log('  Email: bob@student.com');
    console.log('  Pass:  student123');
    console.log('--------------------------');

    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error}`);
    process.exit(1);
  }
};

seedData();
