# Conditional React views — generation fixture

Status: source/IR/generator checks only. Native execution, accessibility audit,
Dynamic Type screenshots and fidelity comparisons have not been run for this
fixture. It is not a completed native benchmark and contributes no passing scores.

This synthetic, offline screen exercises a ternary branch with reusable children,
a negated conditional hint, independent boolean state and existing button actions.
The entry state remains owned by RootView when conditional content is removed.

```sh
npm run build --prefix mcp-server
node --test mcp-server/test/react-conditional.test.js
node mcp-server/dist/unified.js app-ir inspect-react benchmarks/universal/react-conditional/App.tsx ConditionalTrip > /tmp/conditional-trip.json
node mcp-server/dist/unified.js app-ir generate /tmp/conditional-trip.json /tmp/new-conditional-trip
```

Pending native acceptance: Create plan must remove the empty branch and insert the
plan; Toggle packed must change text; Remove/Create must retain the entry's packed
state; relaunch must reset it. Inactive controls must be absent from the
accessibility tree. Repeat at Large and XXXL, capture each state, and run Apple's
accessibility audit before claiming verified runtime support.
