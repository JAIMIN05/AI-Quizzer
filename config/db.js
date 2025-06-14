const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017/quizapp'; 
const dbName = 'quizapp'; // Replace with your database name

const connectToDatabase = async () => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
        return client.db(dbName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

module.exports = connectToDatabase;