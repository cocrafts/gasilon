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

		app.stack(({ stack, app }) => {
			const domain = domainFromStage(app.stage);
			const gasilon = new Function(stack, 'gasilon', {
				handler: 'lambda/index.handler',
				copyFiles: [{ from: './config.json' }],
				environment: {
					ENVIRONMENT: process.env.ENVIRONMENT,
					SOLANA_SECRET_KEY: process.env.SOLANA_SECRET_KEY,
					REDIS_USERNAME: process.env.REDIS_USERNAME,
					REDIS_PASSWORD: process.env.REDIS_PASSWORD,
					REDIS_HOST: process.env.REDIS_HOST,
				},
			});

			const API = new Api(stack, 'api', {
				cors: {
					allowOrigins: ['*'],
				},
				routes: {
					'GET /api/gasilon': gasilon,
					'POST /api/gasilon': gasilon,
					'GET /api/gasilon/{proxy+}': gasilon,
					'POST /api/gasilon/{proxy+}': gasilon,
				},
				customDomain: domain,
			});

			stack.addOutputs({
				url: API.url,
				domain: API.customDomainUrl,
			});
		});
	},
} satisfies SSTConfig;

const apiAlias = {
	production: 'gasilon.',
	staging: 'gasilon-stg.',
	development: 'gasilon-dev.',
};

export const domainFromStage = (stage: string) => {
	const prefix = apiAlias[stage] || `gasilon-${stage}.`; 
	return `${prefix}walless.io`;
};
