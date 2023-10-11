import {
	ACCOUNT_SIZE,
	ASSOCIATED_TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	decodeInstruction,
	getAccount,
	getAssociatedTokenAddress,
	isTransferCheckedInstruction,
	isTransferInstruction,
} from '@solana/spl-token';
import type { Connection, Transaction } from '@solana/web3.js';
import { type Keypair } from '@solana/web3.js';

import { areInstructionsEqual } from './instructions';
import type { TokenFee } from './tokenFee';

export async function validateTransaction(
	transaction: Transaction,
	feePayer: Keypair,
) {
	if (!transaction.feePayer?.equals(feePayer.publicKey))
		throw new Error('invalid fee payer');
	if (!transaction.recentBlockhash) throw new Error('missing recent blockhash');

	// Check the signatures for length, the primary signature, and secondary signature(s)
	if (transaction.signatures.length === 0) {
		throw new Error('no signatures');
	}
}

// Check that a transaction contains a valid transfer to Octane's token account
export async function validateInstructions(
	connection: Connection,
	transaction: Transaction,
	allowedTokens: TokenFee[],
	feePayer: Keypair,
) {
	let feePaid = 0;
	let selectedFeeToken: TokenFee;
	let rentFee = 0;
	let mightCreateAccount = false;

	for (const instruction of transaction.instructions) {
		for (const key of instruction.keys) {
			if (
				(key.isWritable || key.isSigner) &&
				key.pubkey.equals(feePayer.publicKey)
			) {
				mightCreateAccount = true;
			}
		}
		console.log(instruction, '<-- instruction');

		if (mightCreateAccount) {
			if (instruction.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)) {
				console.log('create account transaction');
				const [, , ownerMeta, mintMeta] = instruction.keys;
				const associatedToken = await getAssociatedTokenAddress(
					mintMeta.pubkey,
					ownerMeta.pubkey,
				);
				const referenceInstruction = createAssociatedTokenAccountInstruction(
					feePayer.publicKey,
					associatedToken,
					ownerMeta.pubkey,
					mintMeta.pubkey,
				);
				if (!areInstructionsEqual(referenceInstruction, instruction)) {
					throw new Error('unable to match associated account instruction');
				}
				if (await connection.getAccountInfo(associatedToken, 'confirmed')) {
					throw new Error('account already exists to create');
				}

				rentFee +=
					await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE);
				mightCreateAccount = false;
			} else {
				throw new Error('can not access fee payer account');
			}
		} else {
			const decodedInstruction = decodeInstruction(instruction);
			if (
				isTransferInstruction(decodedInstruction) ||
				isTransferCheckedInstruction(decodedInstruction)
			) {
				console.log('is transfer');
				const {
					keys: { source, destination },
					data: { amount },
				} = decodedInstruction;

				const sourceAccount = await getAccount(
					connection,
					source.pubkey,
					'confirmed',
				);

				const feeToken = allowedTokens.find(
					(token) => token.mint.toString() === sourceAccount.mint.toString(),
				);

				if (feeToken && destination.pubkey.equals(feeToken.account)) {
					if (selectedFeeToken && feeToken.mint !== selectedFeeToken.mint) {
						throw Error('must use 1 type of token as fee');
					}
					feePaid += Number(amount) / 10 ** feeToken.decimals;
					selectedFeeToken = feeToken;
				}
			} else {
				throw Error('unsupported instructions');
			}
		}
	}

	console.log(rentFee, selectedFeeToken, '<-- validation result');
	return { feePaid, rentFee, feeToken: selectedFeeToken };
}
