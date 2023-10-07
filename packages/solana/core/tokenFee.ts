import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

type ExchangeFunction = (from: string, to: string) => Promise<number>;
let getExchangeRate: ExchangeFunction;

export const setExchangeFunction = (func: ExchangeFunction) => {
	getExchangeRate = func;
};

type SerializableTokenFee = {
	mint: string;
	account: string;
	decimals: number;
};

export class TokenFee {
	public mint: PublicKey;
	public account: PublicKey;
	public decimals: number;

	constructor(mint: PublicKey, account: PublicKey, decimals: number) {
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

		return solPrice * (solAmount + 0.001);
	}

	toSerializable(): SerializableTokenFee {
		return {
			mint: this.mint.toBase58(),
			account: this.account.toBase58(),
			decimals: this.decimals,
		};
	}

	static fromSerializable(serializableToken: SerializableTokenFee): TokenFee {
		return new TokenFee(
			new PublicKey(serializableToken.mint),
			new PublicKey(serializableToken.account),
			serializableToken.decimals,
		);
	}
}
