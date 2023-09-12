import type { Express } from 'express';

import { requestSponsorSignature } from './api/routes';

export const configure = async (express: FunctionConstructor) => {
	const app = express() as Express;

	app.get('/', (_, res) => {
		res.send('Hello World!!');
	});

	app.get('/request-sponsor-signature', requestSponsorSignature);

	return app;
};
