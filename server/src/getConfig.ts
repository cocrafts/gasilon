import type { Request, Response } from 'express';

import config from '../config.json';

import { ENV_SECRET_KEYPAIR } from './config';

export const handleGetConfig = async (req: Request, res: Response) => {
	res.send({
		feePayer: ENV_SECRET_KEYPAIR.publicKey.toBase58(),
		...config,
	});
};
