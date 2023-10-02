import express from 'express';

import { handleGetConfig, handleTransfer } from './handlers';

export const app = express();

app.use(express.json());

app.get('/api/gasilon', handleGetConfig);

app.get('/api/gasilon/solana/transfer', handleTransfer);

export default app;
