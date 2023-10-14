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
					'GET /': gasilon,
					'POST /': gasilon,
					'GET /{proxy+}': gasilon,
					'POST /{proxy+}': gasilon,
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
	production: 'api.',
	staging: 'api-stg.',
	development: 'api-dev.',
};

export const domainFromStage = (stage: string) => {
	const prefix = apiAlias[stage] || `api-${stage}.`;
	return `${prefix}gasilon.com`;
};
