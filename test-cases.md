# Test Cases and Expected Results

| ID | Scenario | Expected outcome |
|---|---|---|
| TC-01 | One qualifying task inside window | One payout of 10 credits |
| TC-02 | Task exactly at lower boundary | Included |
| TC-03 | Task exactly at upper boundary | Excluded |
| TC-04 | Task represented in a non-UTC timezone | Converted to UTC before window evaluation |
| TC-05 | Duplicate task ID in same batch | Counted once; one payout |
| TC-06 | Same task delivered again on retry | Idempotent; no second payout |
| TC-07 | Two different qualifying task IDs | Two payouts totaling 20 credits |
| TC-08 | Notification fails after payout succeeds | Payout remains successful; notification failure recorded |
| TC-09 | Non-qualifying task outside window | No payout |
| TC-10 | Empty input batch | No payout and no error |

## Assumptions
- Task timestamps are normalized to ISO 8601 and evaluated in UTC.
- A payout record is identified by task ID plus settlement run ID.
- Notification delivery is an independent post-payout action.
- The local fixture uses in-memory records and no external services.
