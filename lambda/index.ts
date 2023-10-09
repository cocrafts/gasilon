import { app, getExchangeRate, redisClient } from '@gasilon/app';
import serverlessExpress from '@vendia/serverless-express';

redisClient.connect().then(async () => {
	const rate = await getExchangeRate({
		network: 'solana',
		from: 'So11111111111111111111111111111111111111112',
		to: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
	});

	console.log(rate, '<-- rate');
});

export const handler = serverlessExpress({ app });
