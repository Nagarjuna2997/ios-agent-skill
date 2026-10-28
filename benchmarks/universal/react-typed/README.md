# Typed static React components

The importer erases local interfaces, type aliases and explicit `import type` declarations. Inline `import {type T}` is rejected because it can preserve module
evaluation under verbatimModuleSyntax. It does not resolve type packages, execute modules,
or perform TypeScript type checking. Runtime values still undergo the bounded
React expression/prop validation. Ordinary imports, enums, namespaces, ambient
classes and arbitrary behavior remain unsupported. Mixed value/type import lists
remain unsupported. Original source hashes and byte provenance are retained.

```sh
node mcp-server/dist/unified.js app-ir inspect-react benchmarks/universal/react-typed/App.tsx TypedCard > /tmp/typed-card.json
node mcp-server/dist/unified.js app-ir generate /tmp/typed-card.json /tmp/typed-card-project
```

Portable tests compare typed and untyped equivalents for identical Swift output,
check original-module evidence, and ensure type-only dependencies are never opened.
This is a syntax extension, not general TypeScript/React support or a fidelity claim.

Existing controlled fields also accept matching `useState<string>` or
`useState<boolean>` primitive annotations and erased event parameter/return type
annotations. Initial values and setter expression shapes still determine runtime
behavior. Generic/async handlers, other hook type arguments and mismatched
primitive initializers are rejected. No external types are resolved.
