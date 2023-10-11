import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import type { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

type ExchangeFunction = (from: string, to: string) => Promise<number>;
let getExchangeRate: ExchangeFunction;

export const setExchangeFunction = (func: ExchangeFunction) => {
	getExchangeRate = func;
};

export class TokenFee {
	public mint: PublicKey;
	public account: PublicKey;
	public decimals: number;

	private constructor(mint: PublicKey, account: PublicKey, decimals: number) {
		this.mint = mint;
		this.account = account;
		this.decimals = decimals;
	}

	async getAmountTokenFee(lamports: number): Promise<number> {
		if (!getExchangeRate) {
			throw Error('must to implement exchange function');
		}

		const solAmount = lamports / LAMPORTS_PER_SOL;
		const solPrice = await getExchangeRate(
			'So11111111111111111111111111111111111111112',
			this.mint.toString(),
		);

		return solPrice * solAmount;
	}

	static async createTokenFee(
		connection: Connection,
		mint: string,
		owner: string,
	) {
		let mintPubKey: PublicKey, ownerPubKey: PublicKey;
		try {
			mintPubKey = new PublicKey(mint);
			ownerPubKey = new PublicKey(owner);
		} catch {
			throw Error(`invalid api config for this mint ${mint}, owner ${owner}`);
		}

		const ownerATAddress = getAssociatedTokenAddressSync(
			mintPubKey,
			ownerPubKey,
		);

		console.log(ownerATAddress);

		return new TokenFee(mintPubKey, ownerPubKey, 0);
	}
}
