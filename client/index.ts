import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config();

import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import base58 from 'bs58';
import readline from 'readline-sync';

import type { GasilonTransaction } from './utils/construct';
import { getFee, getInfo, getTokens, transfer } from './utils';

axios.defaults.baseURL = process.env.GASILON_ENDPOINT;
const privateKeyStr = process.env.PRIVATE_KEY as string;

const connection = new Connection(
	process.env.ENVIRONMENT === 'production'
		? clusterApiUrl('mainnet-beta')
		: clusterApiUrl('devnet'),
	'confirmed',
);

if (process.env.ENVIRONMENT === 'production') {
	console.log('Running at production mode');
} else {
	console.log('Running at development mode');
}

async function main() {
	console.log('Gasilon client CLI');
	console.log('Commands:');
	console.log('\tgasilon [transfer|get-fee]');

	const gasilonIdx = process.argv.findIndex((ele) => ele === 'gasilon');
	if (gasilonIdx != -1) {
		console.log('\nGasilon client');
		if (process.argv.length <= gasilonIdx + 1) {
			console.log('invalid arguments, require actions [transfer|get-fee]');
			return;
		}

		const action = process.argv[gasilonIdx + 1];
		if (!['transfer', 'get-fee'].includes(action)) {
			console.log('invalid arguments, require actions [transfer|get-fee]');
			return;
		}

		const senderKeypair = Keypair.fromSecretKey(base58.decode(privateKeyStr));

		console.log('\n----------------------\nInit Transaction:');

		const tokens = (await getTokens(connection, senderKeypair.publicKey)).value;
		if (tokens.length === 0) {
			console.log('Not found any token for this account');
			return;
		}
		const tokenInfos = await getInfo(
			tokens.map((ele) => ele.account.data.parsed.info.mint),
		);

		tokens.map((token, index) => {
			const amount = Number(token.account.data.parsed.info.tokenAmount.amount);
			const decimals = token.account.data.parsed.info.tokenAmount.decimals;
			console.log(
				`Index: ${index} - Name: ${tokenInfos[index] || 'Unknown'} - Mint: ${
					token.account.data.parsed.info.mint
				} - Amount: ${amount / 10 ** decimals}`,
			);
		});

		const tokenIdx = readline.questionInt('Choose token to send (index): ');
		const sendToken = tokens[tokenIdx];
		const total = Number(sendToken.account.data.parsed.info.tokenAmount.amount);
		const decimals = sendToken.account.data.parsed.info.tokenAmount.decimals;
		const totalAmount = total;
		let amount = 0;
		while (!amount) {
			try {
				amount =
					readline.questionFloat(
						`Input amount (max: ${totalAmount / 10 ** decimals}): `,
					) *
					10 ** decimals;
				if (amount > totalAmount) {
					console.log("Don't enough amount!");
					amount = 0;
				}
			} catch (_) {
				continue;
			}
		}

		let receiverStr = '';
		while (!receiverStr) {
			receiverStr = readline.question('Receiver Address: ');
			try {
				new PublicKey(receiverStr);
			} catch (_) {
				console.log('Invalid address, retry!');
			}
		}

		const gasilonConfig = (await axios.get('/')).data;
		const feeTokens = gasilonConfig?.transfer.tokens;
		const availableMints = tokens.map((t) => t.account.data.parsed.info.mint);
		const availableFeeTokens = feeTokens.filter((ele) =>
			availableMints.includes(ele.mint),
		);

		if (availableFeeTokens.length === 0) {
			console.log('Not found any supported tokens to pay fee');
			return;
		}

		console.log('\n----------------------\nToken Fee:');
		availableFeeTokens.map((token, index) => {
			console.log(
				`Index: ${index} - Name: ${token.name} - Mint: ${token.name}`,
			);
		});
		const feeTokenIndex = readline.questionInt(
			'Choose token to use as gas fee (index): ',
		);

		const feeToken = availableFeeTokens[feeTokenIndex];
		const gasilonTransaction: Omit<GasilonTransaction, 'feeAmount'> = {
			connection,
			sender: senderKeypair,
			receiver: new PublicKey(receiverStr),
			sendToken: new PublicKey(sendToken.account.data.parsed.info.mint),
			amount,
			feeToken: new PublicKey(feeToken.mint),
			feePayer: new PublicKey(gasilonConfig?.feePayer),
		};

		console.log('\n----------------------\nAction:', action);
		const fee = await getFee(gasilonTransaction);
		if (!fee) return;

		if (action == 'transfer') {
			const accept = readline
				.question(
					`Fee: ${fee.totalByFeeToken} ${feeToken.name} -> continue to transfer (y/N)? `,
				)
				.toLowerCase();
			if (accept === 'y') {
				console.log('Transfer...');
				const result = await transfer({
					...gasilonTransaction,
					feeAmount: Math.floor(fee?.totalByFeeToken * 10 ** feeToken.decimals),
				});

				if (result) console.log(result);
			}
		} else if (action == 'get-fee') {
			console.log(fee);
		}
	}
}

main()
	.catch((e) => {
		console.log('Error: ', e);
	})
	.finally(() => {
		console.log('Done');
		process.exit(0);
	});
