# Borrowed state in a local React component

This offline fixture passes an entry-owned string state and its setter to a
locally imported component. The child controls the same native binding and offers
literal clear/reset actions; the parent displays that value. No imported code is
executed, dependencies installed, network used or component-local state inferred.

```sh
node mcp-server/dist/unified.js app-ir inspect-react benchmarks/universal/react-input-components/App.tsx WalkingProfile > /tmp/walking-profile-ir.json
node mcp-server/dist/unified.js app-ir generate /tmp/walking-profile-ir.json /tmp/new-walking-profile
```

Props may contain direct state/setter references or the pre-existing bounded
literal values. Computed callbacks and shadowed setter receivers are rejected.
Source ranges refer to the original component files. Portable tests compare
composed and inline equivalent SwiftUI and enforce scope/type boundaries.
Native execution and visual fidelity for this multi-file fixture are unverified;
the separate reset-input benchmark is not proof of this fixture's runtime result.
