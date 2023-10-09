import { TokenFee } from '@gasilon/solana';
import { validateInstructions } from '@gasilon/solana/coreV2';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import base58 from 'bs58';
import type { Request, Response } from 'express';

import config from '../../../../config.json';
import { connection, ENV_SECRET_KEYPAIR } from '../utils';

export const handleGetGasilonFee = async (req: Request, res: Response) => {
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
			config.endpoints.transfer.tokens.map((token) =>
				TokenFee.fromSerializable(token),
			),
			ENV_SECRET_KEYPAIR,
		);

		const signaturesFee = await transaction.getEstimatedFee(connection);
		const totalFee = signaturesFee + rentFee + 0.001 * LAMPORTS_PER_SOL;
		console.log(feeToken, '<--');
		const fee = await feeToken.getAmountTokenFee(totalFee);

		console.log(signaturesFee, fee, '<-- fee');

		// ignore check fee paid when get price
		// if (feePaid < fee * 0.9) throw new Error('invalid amount to pay fee');

		// Respond with the confirmed transaction signature
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
