# Gasilon

1. [What is Gasilon?](#what-is-gasilon)

## What is Gasilon?

Gasilon is a gasless solution currently supports on Solana. It helps user make a transaction without SOL to pay fee by using SPL tokens which is supported by the API.

Gasilon provides an API [`api.gasilon.com`](https://api.gasilon.com) for anyone (Wallet, DApp,...) to easily integrate gasless features, making any transaction without SOL seamlessly. The source code also includes `Client CLI` as a code snippet for testing, see how it works and for playground.

## How it works



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

