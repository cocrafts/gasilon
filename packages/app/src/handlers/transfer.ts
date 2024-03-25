import { signGasilonTransaction } from '@gasilon/solana';
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js';
import base58 from 'bs58';
import type { Request, Response } from 'express';

import config from '../../../../config.json';
import {
	cache,
	connection,
	getAllowedTokens,
	SOLANA_SECRET_KEYPAIR,
} from '../utils';

export const handleTransfer = async (req: Request, res: Response) => {
	const serialized = req.body?.transaction;
	if (typeof serialized !== 'string') {
		res
			.status(400)
			.json({ status: 'error', message: 'request should contain transaction' });
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
		const { signature } = await signGasilonTransaction({
			connection,
			transaction,
			feePayer: SOLANA_SECRET_KEYPAIR,
			allowedTokens: await getAllowedTokens(),
			cache: await cache,
		});

		if ((config as any).returnSignature !== undefined) {
			res.status(200).json({ status: 'ok', signature });
			return;
		}

		transaction.addSignature(
			SOLANA_SECRET_KEYPAIR.publicKey,
			Buffer.from(base58.decode(signature)),
		);

		await sendAndConfirmRawTransaction(connection, transaction.serialize());

		res.status(200).json({ status: 'ok', signature });
	} catch (error) {
		console.log('transfer error', error);
		let message = '';
		if (error instanceof Error) {
			message = error.message || String(error);
		}
		res.status(400).json({ status: 'error', message });
	}
};
