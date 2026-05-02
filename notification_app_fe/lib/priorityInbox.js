/**
 * Priority Inbox Algorithm — Stage 1
 *
 * Scores notifications using:
 * - Category weight: Placement (3) > Result (2) > Event (1)
 * - Recency: normalized 0–1 based on timestamp relative to oldest/newest
 *
 * Final score = (normalizedWeight × 0.6) + (recencyScore × 0.4)
 * Returns top N notifications sorted by score descending.
 */

import { Log } from "./logger.js";

const WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const MAX_WEIGHT = 3;

/**
 * Calculates recency score (0–1) for a single notification.
 * Most recent = 1.0, oldest = 0.0
 */
function recencyScore(timestamp, minTime, maxTime) {
  const t = new Date(timestamp).getTime();
  if (maxTime === minTime) return 1.0;
  return (t - minTime) / (maxTime - minTime);
}

/**
 * getPriorityInbox — Stage 1 algorithm
 *
 * @param {Array}  notifications  - full list of notification objects
 * @param {number} topN           - how many top results to return (default 10)
 * @returns {Array} top N notifications enriched with priorityScore
 */
export function getPriorityInbox(notifications, topN = 10) {
  Log("frontend", "debug", "utils", `Running priority inbox on ${notifications.length} notifications, top ${topN}`);

  if (!notifications || notifications.length === 0) return [];

  const timestamps = notifications.map((n) => new Date(n.Timestamp).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  const scored = notifications.map((n) => {
    const weight = WEIGHTS[n.Type] ?? 1;
    const normalizedWeight = weight / MAX_WEIGHT;
    const rScore = recencyScore(n.Timestamp, minTime, maxTime);
    const priorityScore = normalizedWeight * 0.6 + rScore * 0.4;

    return { ...n, priorityScore: parseFloat(priorityScore.toFixed(4)) };
  });

  const sorted = scored.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, topN);

  Log("frontend", "info", "utils", `Priority inbox computed: returning top ${sorted.length} notifications`);

  return sorted;
}
