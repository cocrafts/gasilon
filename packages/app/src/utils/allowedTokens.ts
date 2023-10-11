import { TokenFee } from '@gasilon/solana';

import config from '../../../../config.json';

import { connection } from '.';

let allowedTokens: TokenFee[];

export const getAllowedTokens = async () => {
	if (!allowedTokens) {
		const tokenFeePromises = config.endpoints.transfer.tokens.map((token) =>
			TokenFee.createTokenFee(connection, token.mint, ''),
		);
		allowedTokens = await Promise.all(tokenFeePromises);
	}

	return allowedTokens;
};
