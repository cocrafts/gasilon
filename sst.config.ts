import type { SSTConfig } from 'sst';
import { Api } from 'sst/constructs';

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
		});
		app.stack(({ stack }) => {
			const API = new Api(stack, 'api', {
				routes: {
					'GET /gasilon': 'functions/solGasilon',
					'GET /gasilon/solana': 'functions/solGasilon',
					'GET /gasilon/solana/{proxy+}': 'functions/solGasilon',
				},
			});

			stack.addOutputs({
				url: API.url,
			});
		});
	},
} satisfies SSTConfig;
