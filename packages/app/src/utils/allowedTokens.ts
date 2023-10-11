import { TokenFee } from '@gasilon/solana';

import config from '../../../../config.json';

import { connection, SOLANA_SECRET_KEYPAIR } from './setup';

let allowedTokens: TokenFee[];

export const getAllowedTokens = async () => {
	if (!allowedTokens) {
		const tokenFeePromises = config.transfer.tokens.map((token) =>
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
