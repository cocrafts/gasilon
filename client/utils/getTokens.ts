import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Connection, PublicKey } from '@solana/web3.js';

export const getTokens = async (connection: Connection, owner: PublicKey) => {
	return await connection.getParsedTokenAccountsByOwner(owner, {
		programId: TOKEN_PROGRAM_ID,
	});
};
