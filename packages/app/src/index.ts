import { setExchangeFunction } from '@gasilon/solana';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';

import { handleGetConfig, handleGetFee, handleTransfer } from './handlers';
import { getExchangeRate } from './utils';

setExchangeFunction(async (from, to) => {
	if (
		process.env.ENVIRONMENT !== 'production' &&
		from === 'So11111111111111111111111111111111111111112' &&
		(to === '7aeyZfAc5nVxycY4XEfXvTZ4tsEcqPs8p3gJhEmreXoz' ||
			'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')
	) {
		to = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
	}

	const rate = await getExchangeRate({ network: 'solana', from, to });
	console.log(`Exchange rate from ${from} to ${to}: ${rate}`);

	return rate;
});

export const app = express();

app.use(cors());

app.use(express.json());

app.get('/', handleGetConfig);
app.post('/', handleGetConfig);

app.get('/solana/getFee', handleGetFee);
app.post('/solana/getFee', handleGetFee);

app.get('/solana/transfer', handleTransfer);
app.post('/solana/transfer', handleTransfer);

app.use('*', (req, res) => {
	res.json({
		message: 'not found this path',
	});
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error('Non-catch error', err);
	res.status(500).json('Something broke!');
});

export default app;
export * from './utils';
