import express, { json } from 'express';

import { requestSponsorSignature } from './api/routes';

export const configure = async () => {
	const app = express();

	app.use(json());

	app.get('/', (_, res) => {
		res.send('Hello World');
	});

	app.get('/request-sponsor-signature', requestSponsorSignature);

	return app;
};
