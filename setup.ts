import {
	ACCOUNT_SIZE,
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {
	clusterApiUrl,
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	sendAndConfirmTransaction,
	Transaction,
} from '@solana/web3.js';
import base58 from 'bs58';
import dotenv from 'dotenv';
import readline from 'readline-sync';

import config from './config.json';

dotenv.config();

async function main() {
	if (process.env.ENVIRONMENT === 'production') {
		console.log('Use mainnet beta');
	} else {
		console.log('Use devnet');
	}

	const connection = new Connection(
		process.env.ENVIRONMENT === 'production'
			? clusterApiUrl('mainnet-beta')
			: clusterApiUrl('devnet'),
		'confirmed',
	);

	const SOLANA_SECRET_KEY = process.env.SOLANA_SECRET_KEY;
	const keypair = Keypair.fromSecretKey(base58.decode(SOLANA_SECRET_KEY));

	const tokens = config.transfer.tokens.filter((token) => {
		const sampleMints = [
			'7aeyZfAc5nVxycY4XEfXvTZ4tsEcqPs8p3gJhEmreXoz',
			'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
		];
		if (process.env.ENVIRONMENT === 'production') {
			return !sampleMints.includes(token.mint);
		} else {
			return sampleMints.includes(token.mint);
		}
	});

	for (let i = 0; i < tokens.length; i++) {
		console.log(
			`\nCheck account for owner ${keypair.publicKey.toString()} with token: \n\tName: ${
				tokens[i].name
			}\n\tMint: ${tokens[i].mint}`,
		);

		const mint = new PublicKey(tokens[i].mint);
		const atAddress = getAssociatedTokenAddressSync(mint, keypair.publicKey);
		const atAccount = await connection.getAccountInfo(atAddress, 'confirmed');

		if (!atAccount) {
			console.log('\t-> Not found associated account');
			const answer = readline
				.question(
					`Do you want to create associated account for this token, fee: ${
						(await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE)) /
						LAMPORTS_PER_SOL
					} SOL - (y/n)? `,
				)
				.trim()
				.toLowerCase();

			if (answer == 'y') {
				console.log('-> Create account...');
				try {
					const transaction = new Transaction().add(
						createAssociatedTokenAccountInstruction(
							keypair.publicKey,
							atAddress,
							keypair.publicKey,
							mint,
						),
					);
					const result = await sendAndConfirmTransaction(
						connection,
						transaction,
						[keypair],
						{
							commitment: 'confirmed',
						},
					);
					console.log('-> Create successfully', result);
				} catch (e) {
					console.log('-> Create failed', e.message);
				}
			}
		}
	}
}

main();
