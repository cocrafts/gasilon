import { TokenFee } from '@gasilon/solana';
import { signGasilonTransaction } from '@gasilon/solana/actionsV2';
import { sendAndConfirmRawTransaction, Transaction } from '@solana/web3.js';
import base58 from 'bs58';
import type { Request, Response } from 'express';

import config from '../../../../config.json';
import { cache, connection, ENV_SECRET_KEYPAIR } from '../utils';

export const handleTransferGasilon = async (req: Request, res: Response) => {
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
			feePayer: ENV_SECRET_KEYPAIR,
			allowedTokens: config.endpoints.transfer.tokens.map((token) =>
				TokenFee.fromSerializable(token),
			),
			cache: await cache,
		});

		if ((config as any).returnSignature !== undefined) {
			res.status(200).json({ status: 'ok', signature });
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
		res.status(200).json({ status: 'ok', signature });
	} catch (error) {
		console.log(error);
		let message = '';
		if (error instanceof Error) {
			message = error.message;
		}
		res.status(400).json({ status: 'error', message });
	}
};
