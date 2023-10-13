import {
	createAssociatedTokenAccountInstruction,
	createTransferInstruction,
	getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import type { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';

export type GasilonTransaction = {
	connection: Connection;
	sender: Keypair;
	receiver: PublicKey;
	sendToken: PublicKey;
	amount: number;
	feeToken: PublicKey;
	feePayer: PublicKey;
	feeAmount: number;
};

export async function constructTransaction({
	connection,
	sender,
	receiver,
	sendToken,
	amount,
	feeToken,
	feePayer,
	feeAmount,
}: GasilonTransaction) {
	const bh = await connection.getLatestBlockhash('finalized');
	const blockhash = bh.blockhash;
	const lastValidBlockHeight = bh.lastValidBlockHeight;
	const transaction = new Transaction({
		blockhash,
		lastValidBlockHeight,
	});

	const senderFeeATA = getAssociatedTokenAddressSync(
		feeToken,
		sender.publicKey,
	);
	const feePayerGasATA = getAssociatedTokenAddressSync(feeToken, feePayer);
	transaction.add(
		createTransferInstruction(
			senderFeeATA,
			feePayerGasATA,
			sender.publicKey,
			feeAmount,
		),
	);

	// Main instructions
	const senderATA = getAssociatedTokenAddressSync(sendToken, sender.publicKey);
	const receiverATA = getAssociatedTokenAddressSync(sendToken, receiver);

	const receiverATAccount = await connection.getAccountInfo(
		receiverATA,
		'confirmed',
	);

	if (!receiverATAccount) {
		transaction.add(
			createAssociatedTokenAccountInstruction(
				feePayer,
				receiverATA,
				receiver,
				sendToken,
			),
		);
	}
	transaction.add(
		createTransferInstruction(senderATA, receiverATA, sender.publicKey, amount),
	);

	transaction.feePayer = feePayer;

	return transaction;
}
