// iOS standard body size is 17 pt at Large and 23 pt at XXXL.
export const textScales = {large: 1, xxxl: 23 / 17};
const sizes = Object.keys(textScales);

function hasTypography(measurement) {
  const typography = measurement?.typography;
  return ['passed', 'failed'].includes(typography?.status) &&
    Number.isInteger(typography.mismatches) && typography.mismatches >= 0 &&
    Array.isArray(typography.regions) && typography.regions.length > 0;
}

export function selectMeasuredText(ir, measurements) {
  const scores = new Map();
  for (const size of sizes) {
    const measurement = measurements[size];
    if (!hasTypography(measurement)) return [];
    for (const region of measurement.typography.regions) {
      const node = ir.nodes.find(node => node.id === region.id);
      if (region.mismatches > 0 && node?.kind === 'text' && node.style.fontSize) {
        scores.set(node.id, (scores.get(node.id) ?? 0) + region.mismatches);
      }
    }
  }
  const ranked = [...scores].sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
  return ranked.slice(0, 3).map(([id]) => id);
}

function comparable(a, b) {
  return hasTypography(a) && hasTypography(b) && !!a.referenceHash &&
    a.referenceHash === b.referenceHash && a.pins && b.pins && JSON.stringify(a.pins) === JSON.stringify(b.pins) &&
    [a, b].every(m => [m.meanError, m.changedFraction].every(n => Number.isFinite(n) && n >= 0 && n <= 1));
}

// Summarize both pixel comparisons. The complete visual gate separately checks
// functional, accessibility, clipping, incumbent and approval evidence per size.
export function compareSizeRepairs(before, after, policy) {
  const reasons = [];
  let rejected = false;
  for (const size of sizes) {
    const baseline = before[size];
    const candidate = after[size];
    if (!comparable(baseline, candidate)) {
      reasons.push(size + ' measurements or matching reference conditions are unavailable');
      continue;
    }
    if (candidate.typography.mismatches > policy.maxLineBreakMismatches ||
        candidate.typography.mismatches > baseline.typography.mismatches ||
        candidate.meanError > baseline.meanError || candidate.changedFraction > baseline.changedFraction) {
      rejected = true;
      reasons.push(size + ' wrapping exceeds tolerance or a measured result regressed');
    } else if (candidate.meanError > policy.maxMeanError || candidate.changedFraction > policy.maxChangedFraction ||
        baseline.meanError - candidate.meanError < policy.minimumImprovement) {
      reasons.push(size + ' did not meet the required pixel thresholds and minimum improvement');
    }
  }
  if (rejected) return {outcome: 'rejected', reasons};
  return {outcome: reasons.length ? 'requires-review' : 'passed', reasons};
}

export function combineSizeDecisions(large, xxxl, pixels) {
  const reasons = [
    ...large.reasons.map(reason => 'Large: ' + reason),
    ...xxxl.reasons.map(reason => 'XXXL: ' + reason),
    ...pixels.reasons
  ];
  const outcomes = [large.outcome, xxxl.outcome, pixels.outcome];
  if (outcomes.includes('rejected')) return {outcome: 'rejected', reasons};
  if (large.outcome === 'accepted' && xxxl.outcome === 'accepted' && pixels.outcome === 'passed') {
    return {outcome: 'accepted', reasons};
  }
  return {outcome: 'requires-review', reasons};
}
