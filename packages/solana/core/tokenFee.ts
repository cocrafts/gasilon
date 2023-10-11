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
		mintAddress: string,
		ownerAddress: string,
		decimals: number,
	) {
		let mint: PublicKey, owner: PublicKey;
		try {
			mint = new PublicKey(mintAddress);
			owner = new PublicKey(ownerAddress);
		} catch {
			throw Error(
				`invalid api config for this mint ${mintAddress}, owner ${ownerAddress}`,
			);
		}

		const ownerATAddress = getAssociatedTokenAddressSync(mint, owner);
		const ownerATAccount = await connection.getAccountInfo(ownerATAddress);
		if (ownerATAccount.data.length === 0) {
			throw Error(
				`invalid api config, fee payer does not have account for this mint ${mintAddress}`,
			);
		}

		return new TokenFee(mint, ownerATAddress, decimals);
	}
}
