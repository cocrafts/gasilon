import express from 'express';

import { handleGetConfig, handleTransfer } from './handlers';

export const app = express();

app.use(express.json());

app.get('/api/gasilon', handleGetConfig)
app.get('/api/gasilon/solana/transfer', handleTransfer)

app.use("*", (req, res) => {
    res.send({
        "message": "not found this path"
    })
})

export default app;
