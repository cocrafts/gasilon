import type { AptosAccount } from 'aptos';

import { client } from './internal';

export const getBalance = async (account: AptosAccount) => {
	const resources = await client.getAccountResources(account.address().hex());
	const aptosCoin = '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>';
	const accountResource = resources.find((i) => i.type === aptosCoin);

	return BigInt((accountResource!.data as any).coin.value);
};
