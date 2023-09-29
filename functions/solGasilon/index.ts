import { ApiHandler } from 'sst/node/api';

export const handler = ApiHandler(async (evt) => {
	return {
		statusCode: 200,
		body: evt.requestContext.time,
	};
});
