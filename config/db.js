const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        // Test the connection
        await mongoose.connection.db.admin().ping();
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Log database name
        console.log(`Database Name: ${conn.connection.name}`);
        
        // List all collections
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('Available Collections:', collections.map(c => c.name));
        
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        console.error('Connection String:', process.env.MONGO_URI);
        process.exit(1);
    }
};

module.exports = connectDB;

/**
 * const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
 */