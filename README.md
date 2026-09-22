# MUST Company QA Quest Submission

This project is a sanitized local demonstration of a weekly settlement service.

## Run
Requirements: Node.js 18+.

```bash
node settlement.test.js
```

The test file:
- Executes 12 business-rule test cases.
- Demonstrates the faulty implementation producing duplicate payouts.
- Demonstrates the corrected implementation blocking same-run retry and later-run replay.
- Verifies that notification failure does not reverse a successful payout.
- Verifies UTC boundaries, timezone normalization, empty input, and weekly window calculation.

The project does not connect to a live financial system.

## Idempotency model
The business rule in this fixture is **global task-level uniqueness**: a task ID can be paid at most once across settlement runs represented by the same shared store.

```javascript
const store = createPayoutStore();
settleCorrected(tasks, 'RUN-001', store); // one payout
settleCorrected(tasks, 'RUN-002', store); // no second payout for the same task ID
```

The local store is an in-memory fixture. A production implementation requires durable, atomic persistence, such as a database unique constraint or equivalent idempotency service, to protect against concurrent workers and process restarts.

## Included
- `intent.md`: prioritization rationale
- `directive.md`: objective, scope, requirements, and results/handoff appendix
- `test-cases.md`: documented test cases and expected results
- `defect-report.md`: actionable defect and root-cause report, including retry reproduction
- `release-readiness-checklist.md`: verified checks and explicitly unproven production controls
- `settlement.js`: faulty and corrected reference implementations
- `settlement.test.js`: executable business-rule and regression checks
- `results-handoff.md`: results, limitations, and handoff instructions
