import { RedisClient } from './redis';

export const getInfo = async (mints: string[]) => {
	const client = await RedisClient();
	return await client.mGet(mints.map((mint) => `TokenAddress#solana#${mint}`));
};
