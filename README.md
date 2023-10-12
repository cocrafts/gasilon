# Gasilon

## Prepare environment

Create `.env` file at project scope

```
ENVIRONMENT=<production || development>
SOLANA_SECRET_KEY=<private key>

# Use price API
REDIS_USERNAME
REDIS_PASSWORD
REDIS_HOST
```

## Deploy to production (AWS only for now, welcome PR for another platforms)
1. make sure `.env` file configured as described above
2. run `yarn setup` to check associated accounts (for fee tokens in the config list)
3. run `yarn deploy` to deploy this to your AWS account (see `sst.config.ts` for further details)
