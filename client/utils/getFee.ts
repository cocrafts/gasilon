import {
	createAssociatedTokenAccountInstruction,
	createTransferInstruction,
	getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import type { Connection, Keypair } from '@solana/web3.js';
import {
	PublicKey,
	Transaction,
	VersionedMessage,
	VersionedTransaction,
} from '@solana/web3.js';
import axios from 'axios';
import base58 from 'bs58';

export async function getFee(
	connection: Connection,
	sender: Keypair,
	receiver: PublicKey,
	feeToken: PublicKey,
	sendToken: PublicKey,
	amount: number,
) {
	const bh = await connection.getLatestBlockhash();
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

	const octaneConfig = (await axios.get('/')).data;
	const feePayer = new PublicKey(octaneConfig.feePayer);
	const feePayerGasATA = getAssociatedTokenAddressSync(feeToken, feePayer);

	// Fee instruction
	// the first instruction must send some supported token as gas fee for feePayer
	transaction.add(
		createTransferInstruction(
			senderFeeATA,
			feePayerGasATA,
			sender.publicKey,
			1,
		),
	);

	// Main instructions
	const senderATA = getAssociatedTokenAddressSync(sendToken, sender.publicKey);
	const receiverATA = getAssociatedTokenAddressSync(sendToken, receiver);

	const receiverATAccount = connection.getAccountInfo(receiverATA, 'confirmed');
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

		console.log('get fee success', result.data);
	} catch (error) {
		console.log('get fee failed', error.response.data);
	}
}
