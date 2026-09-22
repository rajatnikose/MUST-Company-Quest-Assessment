const CREDITS_PER_TASK = 10;
const DEFAULT_SETTLEMENT_WINDOW = Object.freeze({
  start: '2026-09-07T00:00:00Z',
  end: '2026-09-14T00:00:00Z'
});

function toTimestamp(value) {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function inWindow(timestamp, window = DEFAULT_SETTLEMENT_WINDOW) {
  const taskTime = toTimestamp(timestamp);
  const start = toTimestamp(window.start);
  const end = toTimestamp(window.end);

  if (taskTime === null || start === null || end === null) return false;
  return taskTime >= start && taskTime < end;
}

/**
 * Calculates the Monday 00:00 UTC through the following Monday 00:00 UTC
 * window immediately preceding the settlement run date. The upper boundary
 * is exclusive. The caller should validate that the run is the expected
 * Tuesday 09:00 UTC operational schedule.
 */
function getSettlementWindow(settlementRunAt) {
  const runTime = new Date(settlementRunAt);
  if (Number.isNaN(runTime.getTime())) {
    throw new Error('settlementRunAt must be a valid ISO-8601 timestamp');
  }

  const runDate = new Date(Date.UTC(
    runTime.getUTCFullYear(),
    runTime.getUTCMonth(),
    runTime.getUTCDate()
  ));

  const dayOfWeek = runDate.getUTCDay();
  const daysSincePreviousMonday = dayOfWeek === 1 ? 7 : (dayOfWeek + 6) % 7;

  const start = new Date(runDate);
  start.setUTCDate(start.getUTCDate() - daysSincePreviousMonday);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  return { start: start.toISOString(), end: end.toISOString() };
}

function createPayoutStore() {
  return {
    // Global task-level uniqueness: a task ID can be paid only once across runs.
    paidTaskIds: new Set(),
    payouts: new Map()
  };
}

function payoutKey(taskId) {
  return String(taskId);
}

function settleFaulty(tasks, window = DEFAULT_SETTLEMENT_WINDOW) {
  const payouts = [];

  for (const task of tasks) {
    if (inWindow(task.timestamp, window)) {
      payouts.push({
        taskId: task.id,
        settlementRunId: 'UNTRACKED',
        credits: CREDITS_PER_TASK
      });
    }
  }

  return payouts;
}

/**
 * Corrected local reference implementation.
 *
 * Business rule: each task ID is paid at most once globally, even if the task
 * is replayed in the same run or a later run. The same store must be reused
 * across calls. This is an in-memory fixture, not durable production storage.
 */
function settleCorrected(
  tasks,
  settlementRunId,
  store,
  window = DEFAULT_SETTLEMENT_WINDOW
) {
  if (!settlementRunId || typeof settlementRunId !== 'string') {
    throw new Error('settlementRunId is required');
  }

  if (!store || !(store.paidTaskIds instanceof Set) || !(store.payouts instanceof Map)) {
    throw new Error('A valid payout store is required');
  }

  const payouts = [];

  for (const task of tasks) {
    if (!task || !task.id || !inWindow(task.timestamp, window)) continue;

    const key = payoutKey(task.id);
    if (store.paidTaskIds.has(key)) continue;

    const payout = {
      taskId: task.id,
      settlementRunId,
      credits: CREDITS_PER_TASK
    };

    // The in-memory write models the uniqueness decision. A production system
    // must use an atomic durable insert/unique constraint to avoid races.
    store.paidTaskIds.add(key);
    store.payouts.set(key, payout);
    payouts.push(payout);
  }

  return payouts;
}

function processNotificationFailure(payouts, notificationSender) {
  return payouts.map((payout) => {
    const notified = Boolean(notificationSender(payout));
    return {
      ...payout,
      notificationStatus: notified ? 'sent' : 'failed',
      payoutStatus: 'successful'
    };
  });
}

module.exports = {
  CREDITS_PER_TASK,
  DEFAULT_SETTLEMENT_WINDOW,
  inWindow,
  getSettlementWindow,
  createPayoutStore,
  payoutKey,
  settleFaulty,
  settleCorrected,
  processNotificationFailure
};
