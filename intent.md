# Intent and Prioritization

## Objective
Prevent incorrect weekly rewards settlement and duplicate payouts while ensuring notification failures do not reverse successful payouts.

## Candidate failure problems

| Problem | User impact | Likelihood | Effort | Priority |
|---|---:|---:|---:|---:|
| Duplicate task IDs create duplicate payouts | High | Medium | Low | 1 |
| Cut-off boundary includes an out-of-window task | High | Medium | Medium | 2 |
| Notification failure reverses a successful payout | High | Medium | Medium | 3 |
| Time-zone conversion selects the wrong settlement window | High | Medium | Medium | 4 |
| Retry processes the same task twice | High | High | Medium | 5 |

## Selected problem
Duplicate processing during retries and repeated task delivery was selected because it can directly create incorrect value allocation, is plausible in distributed processing, and can be reproduced with a small local fixture.

## Uncertainty
No production incident history or live MUST data was available. The prioritization is based on potential impact and plausible failure modes, not on an assertion that these incidents occurred in MUST's product.
