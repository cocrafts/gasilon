import path from 'path';

import dotenv from 'dotenv';

dotenv.config({
	path: path.resolve(__dirname, '../.env'),
});

import app, { redisClient } from '@gasilon/app';

import { getExchangeRate } from './../packages/app/src/utils';

redisClient.connect().then(async () => {
	console.log('here');
	const rate = await getExchangeRate({
		network: 'solana',
		from: 'So11111111111111111111111111111111111111112',
		to: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
	});

	console.log(rate, '<-- rate');
});

const port = process.env.port || 8080;

app.listen(port, () => {
	console.log('Gasilon server is running at port ', port);
});
