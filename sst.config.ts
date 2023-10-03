import type { SSTConfig } from 'sst';
import { Api, Function } from 'sst/constructs';

export default {
	config() {
		return {
			name: 'gasilon',
			region: 'ap-south-1',
		};
	},
	stacks(app) {
		app.setDefaultFunctionProps({
			runtime: 'nodejs18.x',
			nodejs: { format: 'cjs' },
		});

		app.stack(({ stack }) => {
			const gasilon = new Function(stack, 'gasilon', {
				handler: 'lambda/index.handler',
				copyFiles: [{ from: './config.json' }],
				environment: {
					ENVIRONMENT: process.env.ENVIRONMENT,
					SOLANA_SECRET_KEY: process.env.SOLANA_SECRET_KEY,
				},
			});

			const API = new Api(stack, 'api', {
				cors: {
					allowOrigins: ['*'],
					allowHeaders: ['Content-Type'],
					allowMethods: ['GET', 'POST'],
				},
				routes: {
					'GET /api/gasilon': gasilon,
					'GET /api/gasilon/{proxy+}': gasilon,
				},
			});

			stack.addOutputs({
				url: API.url,
			});
		});
	},
} satisfies SSTConfig;
