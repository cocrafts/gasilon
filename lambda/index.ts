import { app, redisClient } from '@gasilon/app';
import serverlessExpress from '@vendia/serverless-express';

redisClient.connect().then(async () => {
	console.log('Redis connected');
});

export const handler = serverlessExpress({ app });
