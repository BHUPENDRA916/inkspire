import mongoose from 'mongoose';

// Increase buffer timeout so operations have more time during slower networks
mongoose.set('bufferTimeoutMS', 30000);

const connectDB = async () => {
  try {
    // Provide explicit options for the MongoDB driver
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // these options are the defaults in modern mongoose but explicit helps clarity
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // increase server selection timeout
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mongoose disconnected');
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;