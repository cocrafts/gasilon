import { AptosClient, FaucetClient, TokenClient } from 'aptos';

import { configs } from '../utils/constant';

export const client = new AptosClient(configs.NODE_URL);
export const tokenClient = new TokenClient(client);
export const faucetClient = new FaucetClient(
	configs.NODE_URL,
	configs.FAUCET_URL,
);
