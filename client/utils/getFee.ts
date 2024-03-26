import {
	ComputeBudgetProgram,
	VersionedMessage,
	VersionedTransaction,
} from '@solana/web3.js';
import axios from 'axios';
import base58 from 'bs58';

import type { GasilonTransaction } from './construct';
import { constructTransaction } from './construct';

export async function getFee(
	tx: Omit<GasilonTransaction, 'feeAmount'>,
	useSetComputeUnit?: boolean,
) {
	const transaction = await constructTransaction({
		...tx,
		feeAmount: 1,
	});

	if (useSetComputeUnit) {
		transaction.instructions.unshift(
			ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 20000 }),
		);
	}

	const txV0 = new VersionedTransaction(
		VersionedMessage.deserialize(transaction.serializeMessage()),
	);

	const txStr = base58.encode(txV0.serialize());
	console.log('transaction', txStr.substring(0, 100));

	try {
		console.log('Sending to get fee...');
		const result = await axios.post('/solana/getFee', {
			transaction: txStr,
		});

		return result.data;
	} catch (error) {
		console.log('get fee failed', error.response.data);
	}
}
