# Paveron Review Notes

Paveron is built as an insurance-adjacent primitive with reserve-backed coverage and validator-resolved incidents.

## What changed from the scaffold

- Added reserved-capacity parametric covers.
- Added pool funding, payout-cap reservation, and available-capacity accounting.
- Added incident resolution and payout lanes.
- Rebuilt the frontend language around covers, reserve, triggers, incidents, and payouts.
- Replaced the visual system with a calmer futuristic UI.
- Replaced tests and schema verification with Paveron-specific expectations.

## Remaining review focus

- Deploy the contract and record the StudioNet address.
- Disable Vercel SSO deployment protection or attach a public custom domain before submission.
- Run a final unauthenticated browser check against the deployed Vercel URL.
