import {
	createTransferInstruction,
	getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {
	clusterApiUrl,
	Connection,
	Keypair,
	PublicKey,
	Transaction,
	VersionedMessage,
	VersionedTransaction,
} from '@solana/web3.js';
import axios from 'axios';
import base58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Config these resources:
 * - octane url
 * - a wallet keypair (available in wallet)
 * - connection with correct endpoint
 * */
axios.defaults.baseURL = process.env.GASILON_ENDPOINT;
const privateKeyStr = process.env.PRIVATE_KEY as string;
const connection = new Connection(clusterApiUrl('devnet'));

console.log(process.env.GASILON_ENDPOINT, '<-- api endpoint');

async function main() {
	// Prepare user's keypair - available in wallet
	const keypair = Keypair.fromSecretKey(base58.decode(privateKeyStr));
	console.log(keypair.publicKey.toString(), '<-- public key of user');
	const ata = getAssociatedTokenAddressSync(
		new PublicKey('7aeyZfAc5nVxycY4XEfXvTZ4tsEcqPs8p3gJhEmreXoz'),
		keypair.publicKey,
	);

	// Prepare generic transaction with no instructions
	const bh = await connection.getLatestBlockhash();
	const blockhash = bh.blockhash;
	const lastValidBlockHeight = bh.lastValidBlockHeight;
	const transaction = new Transaction({
		blockhash,
		lastValidBlockHeight,
	});

	/**
	 * Call API to get data uses for initialize transaction
	 * - get fee payer public key
	 * - The tokens are supported as gas fee must be sent, but it currently does not support
	 *      - Use 7aeyZfAc5nVxycY4XEfXvTZ4tsEcqPs8p3gJhEmreXoz
	 * */
	const octaneConfig = (await axios.get('/')).data;

	const feePayer = new PublicKey(octaneConfig.feePayer);
	const feePayerGasAta = getAssociatedTokenAddressSync(
		new PublicKey('7aeyZfAc5nVxycY4XEfXvTZ4tsEcqPs8p3gJhEmreXoz'),
		feePayer,
	);

	// the first instruction must send some supported token as gas fee for feePayer
	transaction.add(
		createTransferInstruction(
			ata,
			feePayerGasAta,
			keypair.publicKey,
			0.01 * 10 ** 9, // hard code required 0.01 Token as gas fee (decimals is 9)
		),
	);

	const receiver = new PublicKey(
		'EiPNEETabLepjopeJQWtqM154FSwCosHk6nt9zDEhCtk',
	);

	const USDCDev = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
	const receiverUSDCAta = getAssociatedTokenAddressSync(USDCDev, receiver);
	const sourceUSDCAta = getAssociatedTokenAddressSync(
		USDCDev,
		keypair.publicKey,
	);

	// Any instructions following
	transaction.add(
		createTransferInstruction(
			sourceUSDCAta,
			receiverUSDCAta,
			keypair.publicKey,
			1 * 10 ** 6,
		),
	);

	// Config fee payer
	transaction.feePayer = feePayer;

	// Convert legacy transaction to v0 transaction (lower transaction fee)
	const txV0 = new VersionedTransaction(
		VersionedMessage.deserialize(transaction.serializeMessage()),
	);

	// Sign transaction by user's keypair
	txV0.sign([keypair]);

	// Serialize transaction to send to Octane
	const txStr = base58.encode(txV0.serialize());
	console.log(txStr, '<-- transaction');

	try {
		// Call API
		const result = await axios.post('/solana/transfer', {
			transaction: txStr,
		});
		console.log(result.data, '<-- success');
	} catch (error) {
		// console.log(error.request.body, '<-- request');
		console.log(error.response, '<-- fail');
	}
}

main();
