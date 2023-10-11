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

## Prepare fee payer

Run the cli to check associated account for fee tokens in the config list

```
yarn run setup
```
