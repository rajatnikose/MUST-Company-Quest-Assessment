# Final Directive

## Objective

Build and verify a local, synthetic settlement reference flow that prevents duplicate payouts during retries and repeated settlement runs, while preserving payout success when notification delivery fails.

## Scope

### Included

- Weekly settlement-window calculation.
- Monday 00:00 UTC inclusive through the following Monday 00:00 UTC exclusive.
- UTC and timezone-offset normalization.
- Ten test credits per qualifying task.
- Duplicate task IDs in one input batch.
- Same-run retries and later-run replay.
- Successful payout followed by notification failure.
- Automated regression checks and release-readiness assessment.

### Excluded

- Live financial systems, real money, real customer data, production credentials, and external messaging providers.
- Durable database transactions, distributed locks, concurrency testing, process-restart recovery, and production deployment.
- Any claim that this fixture is production-ready.

## Business Rules

1. The fixture calculates a Monday-to-Monday UTC settlement window for the settlement run.
2. The lower boundary is inclusive.
3. The upper boundary is exclusive.
4. Each qualifying task earns 10 test credits.
5. A task ID may be paid at most once across the settlement runs represented by the shared store.
6. Duplicate input, same-run retries, and later-run replay must not create a second payout.
7. Notification is attempted only after payout success.
8. Notification failure must not reverse a successful payout.

## Completion Criteria

- At least eight business-rule test cases are documented and executable.
- The faulty duplicate-payout behavior is reproduced with an observable assertion.
- The corrected implementation blocks duplicate payouts in the same run and in later runs.
- Boundary, timezone, duplicate-input, retry, notification-failure, empty-input, and weekly-window cases are covered.
- The defect report, test cases, release-readiness checklist, and results handoff are available in the repository.
- The test command and artifact links are accessible to a reviewer.

## Results and Handoff Appendix

### Repository

GitHub repository:

https://github.com/rajatnikose/MUST-Company-Quest-Assessment

Branch: `main`

### Artifacts

- `settlement.js`: faulty and corrected local reference implementations.
- `settlement.test.js`: executable business-rule and regression checks.
- `test-cases.md`: documented test cases and expected outcomes.
- `defect-report.md`: defect reproduction, evidence, root cause, severity rationale, and proposed fix.
- `release-readiness-checklist.md`: evidence-based release gate checklist.
- `results-handoff.md`: execution summary, limitations, and handoff instructions.
- `intent.md`: problem selection, alternatives, prioritization, value, and non-goals.
- `directive.md`: earlier directive version retained for traceability.

### Reproduction and Verification

From the repository root, with Node.js 18 or later installed, run:

```bash
node settlement.test.js
