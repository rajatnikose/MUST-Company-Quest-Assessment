# Release Readiness Checklist

## Verified in the local fixture
- [x] Settlement window is documented.
- [x] Lower boundary is included and upper boundary is excluded.
- [x] UTC/time-zone conversion behavior is tested.
- [x] Duplicate task IDs are blocked within one batch.
- [x] Same-run retries do not create duplicate payouts.
- [x] Later-run replay of the same task ID does not create a second payout in the shared store.
- [x] Payout records use a task-ID uniqueness key in the local fixture.
- [x] Notification failure does not reverse a successful payout.
- [x] Faulty and corrected behaviors are demonstrated by the executable script.
- [x] Empty input and out-of-window input are tested.
- [x] Weekly settlement-window calculation is tested.

## Not proven by the local fixture
- [ ] Durable persistence across process restart.
- [ ] Atomic uniqueness under concurrent workers.
- [ ] Distributed lock or queue behavior.
- [ ] External notification-provider delivery and retry behavior.
- [ ] Performance and load behavior.
- [ ] Production release-owner approval.

## Release decision
**Local fixture decision: PASS for the documented reference checks.**

**Production decision: NOT READY based on this fixture alone.** Durable storage, atomicity, concurrency, observability, and operational approval remain outside scope.
