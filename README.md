# Paveron

Parametric insurance capsules with reserved payout capacity.

Paveron is a GenLayer coverage pool for small, verifiable risks that should not need a slow manual adjuster. Capital providers fund a reserve, users buy time-boxed coverage capsules, and incident evidence is resolved by validator consensus into payout lanes.

## Why it is different

Paveron tilts toward insurance instead of attestations:

`RESERVE -> COVER -> INCIDENT -> FULL_PAYOUT | PARTIAL_PAYOUT | DENIED | INCONCLUSIVE`

Each cover reserves payout capacity when it opens. The frontend reads pool state from the contract: reserve balance, available capacity, active covers, incidents, payout status, source hashes, and event evidence hashes.

## Contract

- `contracts/Paveron.py` stores covers, incidents, reserve accounting, evidence snapshots, and payout decisions.
- `fund_reserve` deposits pool capital.
- `open_cover` validates a parametric trigger, snapshots the public source, runs underwriting consensus, and reserves payout capacity.
- `file_incident` snapshots event evidence and moves an active cover into incident review.
- `resolve_incident` asks validators to choose `FULL_PAYOUT`, `PARTIAL_PAYOUT`, `NOT_COVERED`, or `INCONCLUSIVE`.
- Payout caps are reserved up front so the UI can show real available capacity instead of implied promises.

## Frontend

Next.js app with:

- soothing futuristic pool dashboard
- reserve top-up and cover opening flow
- coverage atlas
- cover detail and trigger capsule view
- incident filing and transaction lifecycle tracking
- empty fallback ledger with no invented live covers

Set `NEXT_PUBLIC_PAVERON_CONTRACT` in `.env.local` after deploying, or run:

```bash
python scripts/deploy-paveron.py
```

Current StudioNet contract: `0x5e411855907E019d83D7413e99b8F32aEB875623`

## Local checks

```bash
npm run verify:schema
npm test
npm run lint
npm run build
python -m pytest tests/direct -q
python -m pytest tests/integration/test_paveron_deploy.py -q -s
```
