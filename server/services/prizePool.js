/**
 * Prize Pool Calculator
 * Distribution: 5-match 40%, 4-match 35%, 3-match 25%
 * Jackpot rolls over if no 5-match winner
 */

const FIVE_MATCH_PCT = 0.40;
const FOUR_MATCH_PCT = 0.35;
const THREE_MATCH_PCT = 0.25;

// Current prize pool contribution per subscription (mock values)
const MONTHLY_POOL_CONTRIBUTION = 5;  // $5 per monthly subscriber
const YEARLY_POOL_CONTRIBUTION = 50;  // $50 per yearly subscriber

/**
 * Calculate total pool from active subscriptions
 */
const calculateTotalPool = (subscriptions, rolledOverAmount = 0) => {
  const fromSubs = subscriptions.reduce((sum, sub) => {
    const contrib = sub.plan === 'yearly' ? YEARLY_POOL_CONTRIBUTION : MONTHLY_POOL_CONTRIBUTION;
    return sum + contrib;
  }, 0);
  return fromSubs + rolledOverAmount;
};

/**
 * Split pool into tiers and calculate per-winner payouts
 */
const splitPrizePool = (totalPool, winnerCounts, rolledOverFromPrev = 0) => {
  const { fiveMatch, fourMatch, threeMatch } = winnerCounts;

  const fiveMatchPool = totalPool * FIVE_MATCH_PCT + rolledOverFromPrev;
  const fourMatchPool = totalPool * FOUR_MATCH_PCT;
  const threeMatchPool = totalPool * THREE_MATCH_PCT;

  // Rollover if no 5-match winner
  const rolledOver = fiveMatch === 0;
  const rolloverAmount = rolledOver ? fiveMatchPool : 0;

  return {
    totalPool: parseFloat(totalPool.toFixed(2)),
    fiveMatchPool: parseFloat(fiveMatchPool.toFixed(2)),
    fourMatchPool: parseFloat(fourMatchPool.toFixed(2)),
    threeMatchPool: parseFloat(threeMatchPool.toFixed(2)),
    fiveMatchPayout: fiveMatch > 0 ? parseFloat((fiveMatchPool / fiveMatch).toFixed(2)) : 0,
    fourMatchPayout: fourMatch > 0 ? parseFloat((fourMatchPool / fourMatch).toFixed(2)) : 0,
    threeMatchPayout: threeMatch > 0 ? parseFloat((threeMatchPool / threeMatch).toFixed(2)) : 0,
    rolledOver,
    rolloverAmount: parseFloat(rolloverAmount.toFixed(2)),
    winnerCounts: { fiveMatch, fourMatch, threeMatch },
  };
};

module.exports = { calculateTotalPool, splitPrizePool, MONTHLY_POOL_CONTRIBUTION, YEARLY_POOL_CONTRIBUTION };
