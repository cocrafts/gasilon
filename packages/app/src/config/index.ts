import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';
import base58 from 'bs58';
import * as cacheManager from 'cache-manager';

export const connection = new Connection(
	process.env.ENVIRONMENT === 'production'
		? clusterApiUrl('mainnet-beta')
		: clusterApiUrl('devnet'),
	'confirmed',
);

export const ENV_SECRET_KEYPAIR = Keypair.fromSecretKey(
	base58.decode(process.env.SOLANA_SECRET_KEY || ''),
);

export const cache = cacheManager.caching('memory', {
	max: 1000,
	ttl: 120 /*seconds*/,
});
