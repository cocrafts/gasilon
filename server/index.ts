import path from 'path';

import dotenv from 'dotenv';

dotenv.config({
	path: path.resolve(__dirname, '../.env'),
});

import app from '@gasilon/app';

const port = process.env.port || 8080;

app.listen(port, () => {
	console.log('Gasilon server is running at port ', port);
});
