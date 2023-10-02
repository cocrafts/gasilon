import dotenv from 'dotenv';
import express from 'express';

import { handleGetConfig } from './src/getConfig';
import { handleTransfer } from './src/transfer';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/api/gasilon', handleGetConfig);

app.get('/api/gasilon/solana/transfer', handleTransfer);

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});
