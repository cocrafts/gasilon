import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

function main() {
	let pkeyStr: string;
	const mints: string[] = [];
	for (let i = 0; i < process.argv.length; i++) {
		if (process.argv[i].includes('genATA')) {
			if (process.argv.length <= i + 2) {
				console.log('invalid arguments, require [public key] [mints]');
				process.exit(-1);
			}

			pkeyStr = process.argv[i + 1];
			for (let j = i + 2; j < process.argv.length; j++) {
				mints.push(process.argv[j]);
			}

			break;
		}
	}

	console.log(pkeyStr);
	const publicKey = new PublicKey(pkeyStr);
	const mintPublicKeys = mints.map((ele) => new PublicKey(ele));

	console.log('Owner public key', publicKey.toString());
	mintPublicKeys.forEach(async (mint) => {
		console.log(
			`\t- Mint: ${mint.toString()}\n\t- Ata: ${await getAssociatedTokenAddress(
				mint,
				publicKey,
			)}\n`,
		);
	});
}

main();
