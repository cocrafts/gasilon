import { createClient } from 'redis';

const redisClient = createClient({
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
	socket: {
		host: process.env.REDIS_HOST,
		port: 6379,
	},
});

redisClient.on('error', () => {
	console.log('Redis client error');
});

export const RedisClient = async () => {
	await redisClient.connect();
	return redisClient;
};
