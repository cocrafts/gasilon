import type { PublicKey } from '@solana/web3.js';
import {
	clusterApiUrl,
	Connection,
	Keypair,
	sendAndConfirmTransaction,
	Transaction,
	TransactionInstruction,
} from '@solana/web3.js';
import { readFile } from 'fs-extra';

const loadKeypair = async (path: string) => {
	const secretKeyString = await readFile(path, { encoding: 'utf-8' });
	const secretKey = Uint8Array.from(JSON.parse(secretKeyString));

	return Keypair.fromSecretKey(secretKey);
};

const main = async () => {
	const connection = new Connection(clusterApiUrl('devnet'));
	const programKeypair = await loadKeypair(
		process.env.SOL_PROGRAM_KEYPAIR as string,
	);
	const senderKeypair = await loadKeypair(
		process.env.SOL_SENDER_KEYPAIR as string,
	);
	const programId: PublicKey = programKeypair.publicKey;

	// const airdropRequest = await connection.requestAirdrop(senderKeypair.publicKey, LAMPORTS_PER_SOL);
	// await connection.confirmTransaction(airdropRequest);

	console.log('Pinging program', programId.toBase58());
	const instruction = new TransactionInstruction({
		keys: [
			{ pubkey: senderKeypair.publicKey, isSigner: false, isWritable: true },
		],
		programId,
		data: Buffer.alloc(0),
	});

	const transaction = new Transaction().add(instruction);
	await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
	console.log('completed!');
};

main();
