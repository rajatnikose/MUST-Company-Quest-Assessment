const assert = require('node:assert/strict');
const {
  DEFAULT_SETTLEMENT_WINDOW,
  inWindow,
  getSettlementWindow,
  createPayoutStore,
  settleFaulty,
  settleCorrected,
  processNotificationFailure
} = require('./settlement');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
}
const baseTask = (id, timestamp) => ({ id, timestamp });

console.log('--- Boundary and business-rule tests ---');

test('TC-01: one qualifying task receives 10 credits', () => {
  const payouts = settleCorrected(
    [baseTask('TASK-001', '2026-09-10T12:00:00Z')],
    'RUN-001',
    createPayoutStore()
  );
  assert.deepEqual(payouts, [{ taskId: 'TASK-001', settlementRunId: 'RUN-001', credits: 10 }]);
});

test('TC-02: lower boundary is included', () => assert.equal(inWindow(DEFAULT_SETTLEMENT_WINDOW.start), true));
test('TC-03: upper boundary is excluded', () => assert.equal(inWindow(DEFAULT_SETTLEMENT_WINDOW.end), false));

test('TC-04: non-UTC timestamp is normalized before evaluation', () => {
  assert.equal(inWindow('2026-09-06T20:00:00-04:00'), true);
  assert.equal(inWindow('2026-09-14T01:00:00+05:30'), true);
});

test('TC-05: duplicate task ID in one batch is paid once', () => {
  const store = createPayoutStore();
  const payouts = settleCorrected([
    baseTask('TASK-005', '2026-09-08T10:00:00Z'),
    baseTask('TASK-005', '2026-09-08T11:00:00Z')
  ], 'RUN-005', store);
  assert.equal(payouts.length, 1);
});

test('TC-06: retry in the same run creates no second payout', () => {
  const store = createPayoutStore();
  assert.equal(settleCorrected([baseTask('TASK-006', '2026-09-09T10:00:00Z')], 'RUN-006', store).length, 1);
  assert.equal(settleCorrected([baseTask('TASK-006', '2026-09-09T10:00:00Z')], 'RUN-006', store).length, 0);
  assert.equal(store.payouts.size, 1);
});

test('TC-07: same task ID is not paid again in a later settlement run', () => {
  const store = createPayoutStore();
  assert.equal(settleCorrected([baseTask('TASK-007', '2026-09-10T10:00:00Z')], 'RUN-007-A', store).length, 1);
  assert.equal(settleCorrected([baseTask('TASK-007', '2026-09-10T10:00:00Z')], 'RUN-007-B', store).length, 0);
  assert.equal(store.payouts.get('TASK-007').settlementRunId, 'RUN-007-A');
});

test('TC-08: two different qualifying task IDs produce 20 credits', () => {
  const payouts = settleCorrected([
    baseTask('TASK-008-A', '2026-09-10T10:00:00Z'),
    baseTask('TASK-008-B', '2026-09-10T11:00:00Z')
  ], 'RUN-008', createPayoutStore());
  assert.equal(payouts.length, 2);
  assert.equal(payouts.reduce((sum, payout) => sum + payout.credits, 0), 20);
});

test('TC-09: notification failure does not reverse successful payout', () => {
  const payouts = settleCorrected([baseTask('TASK-009', '2026-09-11T10:00:00Z')], 'RUN-009', createPayoutStore());
  const results = processNotificationFailure(payouts, () => false);
  assert.equal(results[0].payoutStatus, 'successful');
  assert.equal(results[0].notificationStatus, 'failed');
});

test('TC-10: task outside the window receives no payout', () => {
  assert.deepEqual(settleCorrected([baseTask('TASK-010', '2026-09-14T00:00:00Z')], 'RUN-010', createPayoutStore()), []);
});

test('TC-11: empty input returns no payout', () => {
  assert.deepEqual(settleCorrected([], 'RUN-011', createPayoutStore()), []);
});

test('TC-12: weekly settlement window for a Tuesday run is Monday-to-Monday UTC', () => {
  assert.deepEqual(getSettlementWindow('2026-09-15T09:00:00Z'), {
    start: '2026-09-14T00:00:00.000Z',
    end: '2026-09-21T00:00:00.000Z'
  });
});

console.log('--- Faulty implementation demonstration ---');
const faulty = settleFaulty([
  baseTask('TASK-100', '2026-09-08T10:00:00Z'),
  baseTask('TASK-100', '2026-09-08T10:00:00Z')
]);
assert.equal(faulty.length, 2);
console.log('EXPECTED FAULT: faulty implementation creates two payouts for TASK-100');

console.log('--- Corrected retry regression demonstration ---');
const correctedStore = createPayoutStore();
assert.equal(settleCorrected([baseTask('TASK-100', '2026-09-08T10:00:00Z')], 'RUN-REGRESSION-A', correctedStore).length, 1);
assert.equal(settleCorrected([baseTask('TASK-100', '2026-09-08T10:00:00Z')], 'RUN-REGRESSION-B', correctedStore).length, 0);
assert.equal(correctedStore.payouts.size, 1);
console.log('PASS: corrected implementation blocks the repeated payout across runs');
console.log(`\nPASS: ${passed} automated business-rule tests plus regression demonstration`);
