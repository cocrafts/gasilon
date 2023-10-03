import { app } from '@gasilon/app';
import serverlessExpress from '@vendia/serverless-express';

console.log(process.env.ENVIRONMENT, "<-- reload, env")

export const handler = serverlessExpress({ app });
