// Every captured size must be non-interfering; unavailable evidence fails closed.
export function allProbeCapturesInvariant(row){
 return ['large','xxxl'].every(size=>row[size]?.probeComparison?.meanAbsoluteChannelError===0);
}
