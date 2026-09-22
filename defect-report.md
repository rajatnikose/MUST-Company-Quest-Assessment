# Defect Report

## Title
Duplicate task delivery or replay creates duplicate payout credits.

## Severity
High: duplicate payout value can be awarded to a user and requires operational correction.

## Preconditions
A qualifying task is processed more than once, either as duplicate input in one batch, a retry in the same settlement run, or a replay in a later settlement run.

## Reproduction A: duplicate input
1. Create qualifying task `TASK-100`.
2. Submit the same task twice to the faulty implementation.
3. Execute the settlement run.
4. Inspect the payout records.

### Expected
`TASK-100` is counted once and generates exactly one payout of 10 test credits.

### Actual faulty behavior
The faulty implementation processes both input rows and creates two payouts totaling 20 test credits.

## Reproduction B: later-run replay
1. Create a shared payout store.
2. Process `TASK-100` in `RUN-REGRESSION-A` using the corrected implementation.
3. Process the same `TASK-100` in `RUN-REGRESSION-B` using the same store.
4. Inspect the returned payouts and stored payout count.

### Expected corrected behavior
The first run creates one payout. The later replay creates zero additional payouts, and the store contains one payout for `TASK-100`.

### Faulty behavior being prevented
The faulty implementation has no uniqueness check and can create another payout when the same task is replayed.

## Root cause
The faulty implementation does not enforce task-level uniqueness before creating a payout. The corrected local fixture uses a shared in-memory set keyed by task ID.

## Proposed fix
Use a durable, atomic uniqueness mechanism in production, such as a database unique constraint or equivalent idempotency service. Record the payout decision atomically before acknowledging processing. The local fixture models the business rule but does not prove production concurrency safety.

## Evidence
The local test script demonstrates the faulty duplicate result and verifies that the corrected implementation blocks both same-run retry and later-run replay. No live system, real money, or confidential data is used.

## Release gate
Block release if any duplicate-input, same-run retry, later-run replay, boundary, or notification-failure test fails. Production release additionally requires durable atomic storage and concurrency testing.
