# Pipedrive Person Sync Assignment ✅

## What It Does
- Reads dynamic person data from `inputData.json`
- Maps fields via `mappings.json`
- Checks if person exists on Pipedrive by `name`
  - If exists → Updates
  - Else → Creates a new person

## How to Run

```bash
pnpm install
pnpm run build
pnpm start
```
## Create a .env file with:
```bash
PIPEDRIVE_API_KEY=your_key_here
PIPEDRIVE_COMPANY_DOMAIN=your_company_domain_here
```
```