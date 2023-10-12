Set env
```
PRIVATE_KEY=<your wallet>
GASILON_ENDPOINT=https://gasilon.walless.io/api

# Ignore these fields if you already set it at `project scope`
## use to init solana connection
ENVIRONMENT=production
## Use price API
REDIS_USERNAME
REDIS_PASSWORD
REDIS_HOST
```
Replace the endpoint if you have your local server at `@gasilon/server`, or deploy by yourself

To get transaction fee
```
yarn get-fee
```

To test transfer by client CLI
```
yarn transfer 
```