import { TokenFee } from '@gasilon/solana';

import config from '../../../../config.json';

import { connection, SOLANA_SECRET_KEYPAIR } from './setup';

let allowedTokens: TokenFee[];

export const getAllowedTokens = async () => {
	if (!allowedTokens) {
		const tokenFeePromises = config.transfer.tokens
			.filter((token) => {
				if (
					process.env.ENVIRONMENT === 'production' &&
					(token.mint === '7aeyZfAc5nVxycY4XEfXvTZ4tsEcqPs8p3gJhEmreXoz' ||
						token.mint === 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')
				) {
					return false;
				} else {
					return true;
				}
			})
			.map((token) =>
				TokenFee.createTokenFee(
					connection,
					token.mint,
					SOLANA_SECRET_KEYPAIR.publicKey.toString(),
					token.decimals,
				),
			);
		allowedTokens = await Promise.all(tokenFeePromises);
	}

	return allowedTokens;
};
