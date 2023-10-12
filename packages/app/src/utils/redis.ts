import { createClient } from 'redis';

export const redisClient = createClient({
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
	socket: {
		host: process.env.REDIS_HOST,
		port: 6379,
	},
});

redisClient.on('error', (e) => {
	console.log('Redis client error', e);
});

type TokenInfo = {
	quotes: Record<string, number>;
};

type ExchangeOption = {
	network: 'solana';
	from: string;
	to: string;
};

export const getExchangeRate = async ({
	network,
	from,
	to,
}: ExchangeOption) => {
	if (network !== 'solana') {
		throw Error('Unsupported network');
	}

	const tokenInfoKeys = await redisClient.mGet([
		`TokenAddress#solana#${from}`,
		`TokenAddress#${network}#${to}`,
	]);

	const [fromTokenInfo, toTokenInfo] = (await redisClient.json.mGet(
		tokenInfoKeys.map((ele) => `TokenInfo#${ele}`),
		'.',
	)) as TokenInfo[];

	if (!fromTokenInfo || !toTokenInfo) {
		console.log('Not found token info from query token price');
		throw Error('Not found token info from query token price');
	}

	return fromTokenInfo.quotes.usd / toTokenInfo.quotes.usd;
};
