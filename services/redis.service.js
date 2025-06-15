const Redis = require('ioredis');

// Redis Cloud connection configuration
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => {
    console.log('Connected to Redis Cloud successfully');
});

redisClient.on('error', (err) => {
    console.error('Redis Cloud Connection Error:', err);
});

const CACHE_TTL = 300; // 5 minutes in seconds

module.exports = {
    getCachedHistory: async (cacheKey) => {
        try {
            const cached = await redisClient.get(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Redis Cache Get Error:', error);
            return null; // Fallback to DB if cache fails
        }
    },
    
    setCachedHistory: async (cacheKey, data) => {
        try {
            await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
        } catch (error) {
            console.error('Redis Cache Set Error:', error);
            // Continue execution even if caching fails
        }
    }
};