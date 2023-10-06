import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';

import { handleGetConfig, handleTransfer } from './handlers';

export const app = express();
app.use(cors());

app.use(express.json());

app.get('/api/gasilon', handleGetConfig);
app.post('/api/gasilon', handleGetConfig);
app.get('/api/gasilon/solana/transfer', handleTransfer);
app.post('/api/gasilon/solana/transfer', handleTransfer);

app.use('*', (req, res) => {
	res.json({
		message: 'not found this path',
	});
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err.stack);
	res.status(500).json('Something broke!');
});

export default app;
