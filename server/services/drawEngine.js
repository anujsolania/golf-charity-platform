/**
 * Draw Engine Service
 * Supports two modes:
 *  - random: pure lottery-style random number selection
 *  - algorithm: frequency-weighted based on user score data
 */

/**
 * Random mode: pick 5 unique numbers from 1-45
 */
const randomDraw = () => {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const result = [];
  while (result.length < 5) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result.sort((a, b) => a - b);
};

/**
 * Algorithm mode: weighted by score frequency across all users
 * Numbers that appear more often in user scores have higher probability
 */
const algorithmDraw = (allScores) => {
  // Build frequency map of scores 1-45
  const freq = {};
  for (let i = 1; i <= 45; i++) freq[i] = 1; // base weight of 1

  allScores.forEach(({ score }) => {
    if (score >= 1 && score <= 45) freq[score] = (freq[score] || 1) + 3; // boost by 3 for each occurrence
  });

  // Build weighted pool
  const weightedPool = [];
  for (let num = 1; num <= 45; num++) {
    for (let w = 0; w < freq[num]; w++) weightedPool.push(num);
  }

  // Pick 5 unique numbers from weighted pool
  const selected = new Set();
  let attempts = 0;
  while (selected.size < 5 && attempts < 1000) {
    const idx = Math.floor(Math.random() * weightedPool.length);
    selected.add(weightedPool[idx]);
    attempts++;
  }

  // Fallback to random if not enough unique numbers
  if (selected.size < 5) return randomDraw();
  return Array.from(selected).sort((a, b) => a - b);
};

/**
 * Match checker: compare entry numbers against winning numbers
 */
const countMatches = (entryNumbers, winningNumbers) => {
  const winSet = new Set(winningNumbers);
  return entryNumbers.filter(n => winSet.has(n)).length;
};

/**
 * Determine tier from match count
 */
const getTier = (matchCount) => {
  if (matchCount === 5) return '5-match';
  if (matchCount === 4) return '4-match';
  if (matchCount === 3) return '3-match';
  return null;
};

module.exports = { randomDraw, algorithmDraw, countMatches, getTier };
