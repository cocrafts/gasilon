import { validateInstructions } from '@gasilon/solana';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import base58 from 'bs58';
import type { Request, Response } from 'express';

import { connection, getAllowedTokens, SOLANA_SECRET_KEYPAIR } from '../utils';

export const handleGetFee = async (req: Request, res: Response) => {
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
		const { feeToken, rentFee } = await validateInstructions(
			connection,
			transaction,
			await getAllowedTokens(),
			SOLANA_SECRET_KEYPAIR,
		);

		const gasilonFee = 0.0001 * LAMPORTS_PER_SOL;
		const signaturesFee = await transaction.getEstimatedFee(connection);
		const totalFee = signaturesFee + rentFee + gasilonFee;
		const fee = await feeToken.getAmountTokenFee(totalFee);

		res.status(200).json({
			status: 'ok',
			rentFee,
			signaturesFee,
			feeToken,
			totalByFeeToken: fee,
		});
	} catch (error) {
		let message = '';
		if (error instanceof Error) {
			message = error.message;
		}
		res.status(400).json({ status: 'error', message });
	}
};
