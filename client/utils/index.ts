import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Connection, PublicKey } from '@solana/web3.js';

import { RedisClient } from './redis';

export const getInfo = async (mints: string[]) => {
	const client = await RedisClient();
	return await client.mGet(mints.map((mint) => `TokenAddress#solana#${mint}`));
};

export const getTokens = async (connection: Connection, owner: PublicKey) => {
	return await connection.getParsedTokenAccountsByOwner(owner, {
		programId: TOKEN_PROGRAM_ID,
	});
};

export * from './getFee';
export * from './redis';
export * from './transfer';
