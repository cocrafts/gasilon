import type { SSTConfig } from 'sst';

export default {
	config() {
		return {
			name: 'gasilon',
			region: 'us-east-1',
		};
	},
	stacks() {
		// app.stack(API);
	},
} satisfies SSTConfig;
