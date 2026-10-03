# Paveron Contract Status

## Deployment

- Network: GenLayer StudioNet
- Contract: `0x5e411855907E019d83D7413e99b8F32aEB875623`
- Deploy transaction: `0x23525dd8ebdd2baea60a682fbd8a4dd9d22f8fbdb661077d55b3febf2420ae0e`
- Live app: https://pavereon.vercel.app
- Vercel deployment: `dpl_3ofLqdgjT18YjDhZd2U59QCcBbac`
- Note: Vercel SSO deployment protection is currently enabled for generated domains.

## Implemented

- Pool reserve funding through `fund_reserve`.
- Cover creation through `open_cover`, including source snapshotting, underwriting consensus, premium collection, and reserved payout exposure.
- Incident filing through `file_incident`, including event evidence hash/excerpt storage.
- Incident resolution through `resolve_incident`, with full payout, partial payout, denial, and inconclusive lanes.
- Empty frontend fallback ledger. Failed reads do not display fake active covers.

## Local Verification

To refresh this file after deployment, record:

- `genvm-lint check contracts\Paveron.py --json`: passed, methods=13.
- `python -m pytest tests/direct -q`: 11 passed.
- `npm test`: 6 passed.
- `npm run lint`: clean.
- `npx tsc --noEmit`: clean.
- `npm run build`: passed.
- `python -m pytest tests/integration/test_paveron_deploy.py -q -s`
