# Final Directive

## Objective
Build and verify a local settlement reference flow that:
1. Processes tasks in a defined weekly window.
2. Counts each task ID once globally across repeated runs.
3. Pays 10 test credits per qualifying task.
4. Is safe under duplicate input and retry.
5. Sends notification only after successful payout.
6. Does not reverse a payout if notification delivery fails.

## Scope
Included: weekly window calculation, exclusive upper boundary, UTC/time-zone conversion assumptions, duplicate IDs, same-run retries, later-run replay, payout success, notification failure, and release readiness.

Excluded: live financial systems, blockchain settlement, real customer data, production credentials, external messaging providers, durable database transactions, distributed locking, concurrency testing, and real money.

## Business rules
- Settlement runs Tuesday at 09:00 UTC; the fixture calculates the preceding Monday-to-Monday UTC window.
- The window is Monday 00:00 UTC through the following Monday 00:00 UTC.
- The upper boundary is excluded.
- Each qualifying task earns 10 test credits.
- A task ID is globally unique for payout purposes: it may be paid at most once across all settlement runs represented by the shared store.
- A replay in the same run or a later run must not create a second payout.
- Notification is attempted only after payout success.
- Notification failure must not reverse a successful payout.

## Completion criteria
- At least eight test cases documented and executed.
- Faulty behavior reproduced with observable evidence.
- Corrected reference implementation passes same-run and later-run replay checks.
- Defect report includes evidence, severity, root cause, proposed fix, and retry reproduction.
- Release-readiness checklist accurately reflects verified items and remaining gaps.
- Results/handoff appendix is included below.

## Results and handoff appendix

### Artifacts
- `src/settlement.js`: faulty and corrected local reference implementations.
- `test/settlement.test.js`: executable business-rule and regression checks.
- `test-cases.md`: documented test cases and expected outcomes.
- `defect-report.md`: defect, reproduction, evidence, root cause, and proposed fix.
- `release-readiness-checklist.md`: evidence-based release gate checklist.
- `results-handoff.md`: execution summary, limitations, and handoff instructions.

### Reproduction and verification
Run from the project root:

```bash
node test/settlement.test.js
```

The run must show:
- The faulty implementation generating two payouts for the same task.
- The corrected implementation generating one payout on the first run and zero on a same-run retry and later-run replay.
- Boundary, timezone, notification-failure, empty-input, and weekly-window checks passing.

### AI contribution and corrections
AI assistance was used to draft and revise test scenarios, implementation suggestions, and documentation. The candidate reviewed the logic, changed the idempotency rule to global task-level uniqueness, added a later-run replay test, and executed the local test script. The implementation remains a local in-memory fixture and has not been represented as production-ready.

### Limitations
The store is in memory and is lost on process restart. The fixture does not prove atomicity under concurrent workers. Production adoption would require a durable, atomic uniqueness mechanism, transaction semantics, observability, and concurrency/failure-recovery testing.
