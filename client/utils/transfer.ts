import { VersionedMessage, VersionedTransaction } from '@solana/web3.js';
import axios from 'axios';
import base58 from 'bs58';

import type { GasilonTransaction } from './construct';
import { constructTransaction } from './construct';

export async function transfer(props: GasilonTransaction) {
	console.log('transfer');
	const transaction = await constructTransaction(props);
	console.log(transaction, '<--');

	const txV0 = new VersionedTransaction(
		VersionedMessage.deserialize(transaction.serializeMessage()),
	);

	txV0.sign([props.sender]);

	const txStr = base58.encode(txV0.serialize());

	try {
		const result = await axios.post('/solana/transfer', {
			transaction: txStr,
		});

		return result.data;
	} catch (error) {
		console.log('Transfer failed', error.response.data);
	}
}
