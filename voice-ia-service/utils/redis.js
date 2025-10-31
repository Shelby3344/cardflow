const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => console.error('Redis Error:', err));
    
    await redisClient.connect();
  }
  return redisClient;
};

const getCache = async (key) => {
  try {
    const client = await connectRedis();
    return await client.get(key);
  } catch (error) {
    console.error('Erro ao buscar cache:', error);
    return null;
  }
};

const setCache = async (key, value, ttl = 86400) => {
  try {
    const client = await connectRedis();
    await client.setEx(key, ttl, value);
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
};

module.exports = { connectRedis, getCache, setCache };
