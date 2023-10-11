import type { Keypair } from '@solana/web3.js';
import {
	type Connection,
	LAMPORTS_PER_SOL,
	type Transaction,
} from '@solana/web3.js';
import base58 from 'bs58';
import type { Cache } from 'cache-manager';

import type { TokenFee } from '../core';
import { sha256, simulateRawTransaction } from '../core';
import { validateInstructions } from '../core/validation';

type SignGasilonFunction = (props: {
	connection: Connection;
	transaction: Transaction;
	feePayer: Keypair;
	allowedTokens: TokenFee[];
	cache: Cache;
}) => Promise<{
	signature: string;
}>;

export const signGasilonTransaction: SignGasilonFunction = async ({
	connection,
	feePayer,
	allowedTokens,
	cache,
	transaction,
}) => {
	const cacheKey = `transaction/${base58.encode(
		sha256(transaction.serializeMessage()),
	)}`;

	if (await cache.get(cacheKey)) throw Error('duplicate transaction');
	await cache.set(cacheKey, true);

	const { feePaid, feeToken, rentFee } = await validateInstructions(
		connection,
		transaction,
		allowedTokens,
		feePayer,
	);

	const estimatedFee = await transaction.getEstimatedFee(connection);
	const totalFee = estimatedFee + rentFee + 0.001 * LAMPORTS_PER_SOL;
	const fee = await feeToken.getAmountTokenFee(totalFee);

	if (feePaid < fee * 0.9) throw new Error('invalid amount to pay fee');

	transaction.partialSign(feePayer);

	await simulateRawTransaction(connection, transaction.serialize());

	return { signature: base58.encode(transaction.signature) };
};
