import {
	createAssociatedTokenAccount,
	getAssociatedTokenAddress,
} from '@solana/spl-token';
import type { Connection, Keypair, PublicKey } from '@solana/web3.js';

import type { TokenFee } from '../core';

export type CreateAccount = {
	address: PublicKey;
	mint: PublicKey;
};

export type CreateAccountResult = {
	address: PublicKey;
	mint: PublicKey;
	error: Error | null;
};

export async function buildCreateAccountListFromTokenFees(
	connection: Connection,
	feePayer: PublicKey,
	tokenFees: TokenFee[],
): Promise<CreateAccount[]> {
	const createAccounts: CreateAccount[] = [];
	for (const tokenFee of tokenFees) {
		const alreadyCreated = await connection.getAccountInfo(tokenFee.account);
		if (alreadyCreated) {
			continue;
		}

		const associatedWithFeePayer = tokenFee.account.equals(
			await getAssociatedTokenAddress(tokenFee.mint, feePayer),
		);
		if (!associatedWithFeePayer) {
			continue;
		}

		createAccounts.push({ mint: tokenFee.mint, address: tokenFee.account });
	}

	return createAccounts;
}

export async function createAccounts(
	connection: Connection,
	feePayer: Keypair,
	accounts: CreateAccount[],
): Promise<CreateAccountResult[]> {
	const results: CreateAccountResult[] = [];

	for (const account of accounts) {
		let error: Error | null = null;
		try {
			await createAssociatedTokenAccount(
				connection,
				feePayer,
				account.mint,
				feePayer.publicKey,
			);
		} catch (e) {
			error = e as Error;
		}

		results.push({ ...account, error });
	}

	return results;
}
