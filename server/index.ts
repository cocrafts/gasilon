import { core, signWithTokenFee } from '@gasilon/solana';
import {
	clusterApiUrl,
	Connection,
	Keypair,
	sendAndConfirmRawTransaction,
	Transaction,
} from '@solana/web3.js';
import base58 from 'bs58';
import * as cacheManager from 'cache-manager';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import express from 'express';

dotenv.config();

import config from './config.json';

const app = express();
app.use(express.json());

const port = 8080;

const connection = new Connection(
	process.env.ENVIRONMENT === 'production'
		? clusterApiUrl('mainnet-beta')
		: clusterApiUrl('devnet'),
	'confirmed',
);

const ENV_SECRET_KEYPAIR = Keypair.fromSecretKey(
	base58.decode(process.env.SOLANA_SECRET_KEY || ''),
);

export const cache = cacheManager.caching('memory', {
	max: 1000,
	ttl: 120 /*seconds*/,
});

app.get('/api/gasilon', (req: Request, res: Response) => {
	res.send({
		feePayer: ENV_SECRET_KEYPAIR.publicKey.toBase58(),
		...config,
	});
});

app.get('/api/gasilon/solana/transfer', async (req: Request, res: Response) => {
	// Deserialize a base58 wire-encoded transaction from the request
	const serialized = req.body?.transaction;
	console.log(req, '<-- req');
	console.log(serialized, '<-- transaction body');
	if (typeof serialized !== 'string') {
		res
			.status(400)
			.send({ status: 'error', message: 'request should contain transaction' });
		return;
	}

	let transaction: Transaction;
	try {
		transaction = Transaction.from(base58.decode(serialized));
	} catch (e) {
		res
			.status(400)
			.send({ status: 'error', message: "can't decode transaction" });
		return;
	}

	try {
		const { signature } = await signWithTokenFee(
			connection,
			transaction,
			ENV_SECRET_KEYPAIR,
			config.maxSignatures,
			config.lamportsPerSignature,
			config.endpoints.transfer.tokens.map((token) =>
				core.TokenFee.fromSerializable(token),
			),
			await cache,
		);

		if ((config as any).returnSignature !== undefined) {
			res.status(200).send({ status: 'ok', signature });
			return;
		}

		transaction.addSignature(
			ENV_SECRET_KEYPAIR.publicKey,
			Buffer.from(base58.decode(signature)),
		);

		await sendAndConfirmRawTransaction(connection, transaction.serialize(), {
			commitment: 'confirmed',
		});

		// Respond with the confirmed transaction signature
		res.status(200).send({ status: 'ok', signature });
	} catch (error) {
		let message = '';
		if (error instanceof Error) {
			message = error.message;
		}
		res.status(400).send({ status: 'error', message });
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});
