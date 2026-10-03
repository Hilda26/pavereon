# Paveron -- Submission Notes

Paveron is a parametric insurance pool. Capital is deposited into a reserve, policyholders open externally observable coverage capsules, and public incident evidence is resolved by GenLayer validators into payout lanes.

## Core differentiation

1. **Insurance-native accounting.** Covers reserve payout capacity up front, so the pool exposes both total reserve and available capacity.
2. **Parametric triggers.** Coverage is based on precise, time-boxed public signals rather than subjective adjustment.
3. **Evidence snapshots.** Underwriting sources and incident evidence are fetched, hashed, and stored before state changes.
4. **Payout lanes.** Validator consensus can return full payout, partial payout, denial, or inconclusive refund behavior.
5. **Soothing futuristic UI.** The app uses calm dark glass, aqua/sage accents, and operational cards focused on pool capacity and coverage state.

## Contract surface

```text
fund_reserve()
open_cover(...)
file_incident(...)
resolve_incident(...)
expire_cover(...)
retire_cover(...)
get_pool()
available_capacity()
get_cover(...)
get_incident(...)
list_covers(...)
list_incidents(...)
get_wallet_roles(...)
```

## Verification To Run Before Submit

```text
npm run verify:schema
python -m pytest tests/direct -q
npm test
npm run lint
npx tsc --noEmit
npm run build
python -m pytest tests/integration/test_paveron_deploy.py -q -s
```

## Deployment

- StudioNet contract address: `0x5e411855907E019d83D7413e99b8F32aEB875623`
- StudioNet deploy transaction: `0x23525dd8ebdd2baea60a682fbd8a4dd9d22f8fbdb661077d55b3febf2420ae0e`
- Vercel live URL
