import type { Express } from 'express';

export const configure = async (express: FunctionConstructor) => {
	const app = express() as Express;

	app.get('/', (_, res) => {
		res.send('Hello World!!');
	});

	return app;
};
