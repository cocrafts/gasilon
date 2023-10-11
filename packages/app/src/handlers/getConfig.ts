import type { Request, Response } from 'express';

import config from '../../../../config.json';
import { SOLANA_SECRET_KEYPAIR } from '../utils';

export const handleGetConfig = async (req: Request, res: Response) => {
	res.status(200).json({
		feePayer: SOLANA_SECRET_KEYPAIR.publicKey.toBase58(),
		...config,
	});
};
