import { app } from '@gasilon/app';
import serverlessExpress from '@vendia/serverless-express';

export const handler = serverlessExpress({ app });
