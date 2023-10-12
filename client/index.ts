import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config();

import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import axios from 'axios';
import base58 from 'bs58';
import readline from 'readline-sync';

import { getFee } from './utils/getFee';
import { getInfo } from './utils/getInfo';
import { getTokens } from './utils/getTokens';

axios.defaults.baseURL = process.env.GASILON_ENDPOINT;
const privateKeyStr = process.env.PRIVATE_KEY as string;

const connection = new Connection(
	process.env.ENVIRONMENT === 'production'
		? clusterApiUrl('mainnet-beta')
		: clusterApiUrl('devnet'),
);

async function main() {
	console.log('Gasilon client CLI');
	console.log('Commands:');
	console.log('\tgasilon [transfer|get-fee]');

	const gasilonIdx = process.argv.findIndex((ele) => ele === 'gasilon');
	if (gasilonIdx != -1) {
		console.log('\nGasilon client');
		if (process.argv.length <= gasilonIdx + 1) {
			console.log('invalid arguments, require actions [transfer|get-fee]');
			process.exit(-1);
		}

		const action = process.argv[gasilonIdx + 1];
		if (!['transfer', 'get-fee'].includes(action)) {
			console.log('invalid arguments, require actions [transfer|get-fee]');
			process.exit(-1);
		}

		const senderKeypair = Keypair.fromSecretKey(base58.decode(privateKeyStr));

		if (action == 'transfer') {
			console.log('transfer');
		} else if (action == 'get-fee') {
			const tokens = (await getTokens(connection, senderKeypair.publicKey))
				.value;

			const tokenInfos = await getInfo(
				tokens.map((ele) => ele.account.data.parsed.info.mint),
			);

			tokens.map((token, index) => {
				const amount = Number(
					token.account.data.parsed.info.tokenAmount.amount,
				);
				const decimals = token.account.data.parsed.info.tokenAmount.decimals;
				console.log(
					`Index: ${index} - Name: ${tokenInfos[index]} - Mint: ${
						token.account.data.parsed.info.mint
					} - Amount: ${amount / 10 ** decimals}`,
				);
			});

			const tokenIdx = readline.questionInt('Choose token to send (index): ');
			const sendToken = tokens[tokenIdx];
			const total = Number(
				sendToken.account.data.parsed.info.tokenAmount.amount,
			);
			const decimals = sendToken.account.data.parsed.info.tokenAmount.decimals;
			const totalAmount = total / 10 ** decimals;
			let amount = 0;
			while (!amount) {
				try {
					amount = readline.questionFloat(
						`Input amount (max: ${totalAmount}): `,
					);
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

			const feeTokens = (await axios.get('/')).data?.transfer.tokens;
			const availableMints = tokens.map((t) => t.account.data.parsed.info.mint);
			const availableFeeTokens = feeTokens.filter((ele) =>
				availableMints.includes(ele.mint),
			);

			if (availableFeeTokens.length === 0) {
				console.log('Not found any supported tokens to pay fee');
				process.exit(1);
			}

			availableFeeTokens.map((token, index) => {
				console.log(
					`Index: ${index} - Name: ${availableFeeTokens[index].name} - Mint: ${availableFeeTokens[index].name}`,
				);
			});
			const feeTokenIndex = readline.questionInt(
				'Choose token to use as gas fee (index): ',
			);

			console.log('Get fee...');

			const fee = getFee(
				senderKeypair,
				new PublicKey(receiverStr),
				new PublicKey(availableFeeTokens[feeTokenIndex].mint),
				new PublicKey(sendToken),
				amount,
			);

			console.log(fee);
		}
	}
}

main();
