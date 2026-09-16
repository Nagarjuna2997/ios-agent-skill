# Compute Graph

## Context

Load this when a task names **Compute Graph** or one of the API topics below.

Apple categories: Graphics and Games.

[Apple documentation](https://developer.apple.com/documentation/computegraph) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Build and run custom particle effects and compute simulations for RealityKit using a programmable node graph.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Compute Graph`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 27.0 | — | No |
| iPadOS | 27.0 | — | No |
| Mac Catalyst | 27.0 | — | No |
| macOS | 27.0 | — | No |
| tvOS | 27.0 | — | No |
| visionOS | 27.0 | — | No |
| Reality Composer Pro | 3.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Simulation objects

- [ComputeGraphSimulation](https://developer.apple.com/documentation/computegraph/computegraphsimulation)

### Built-in nodes

- [element](https://developer.apple.com/documentation/computegraph/element)
- [emitter](https://developer.apple.com/documentation/computegraph/emitter)
- [force](https://developer.apple.com/documentation/computegraph/force)
- [initialize](https://developer.apple.com/documentation/computegraph/initialize)
- [output](https://developer.apple.com/documentation/computegraph/output)
- [module](https://developer.apple.com/documentation/computegraph/module)
- [graph](https://developer.apple.com/documentation/computegraph/graph)
- [group](https://developer.apple.com/documentation/computegraph/group)
- [texture](https://developer.apple.com/documentation/computegraph/texture)
- [random](https://developer.apple.com/documentation/computegraph/random)
- [matrix4x4f](https://developer.apple.com/documentation/computegraph/matrix4x4f)
- [matrix4x4h](https://developer.apple.com/documentation/computegraph/matrix4x4h)

### Node parameters and connections

- [PortReference](https://developer.apple.com/documentation/computegraph/portreference)
- [BinaryOperation](https://developer.apple.com/documentation/computegraph/binaryoperation)
- [UnaryOperation](https://developer.apple.com/documentation/computegraph/unaryoperation)
- [StandardLibraryFunction](https://developer.apple.com/documentation/computegraph/standardlibraryfunction)

### Elements and particles

- [ElementGrouping](https://developer.apple.com/documentation/computegraph/elementgrouping)
- [ElementSpawnParameters](https://developer.apple.com/documentation/computegraph/elementspawnparameters)
- [Sorting](https://developer.apple.com/documentation/computegraph/sorting)

### Graph resources

- [AddressSpace](https://developer.apple.com/documentation/computegraph/addressspace)

### Geometry and simulation inputs

- [CoordinateSpace](https://developer.apple.com/documentation/computegraph/coordinatespace)
- [StripOrientation](https://developer.apple.com/documentation/computegraph/striporientation)
- [Viewpoint](https://developer.apple.com/documentation/computegraph/viewpoint-swift.struct)
- [MouseParams](https://developer.apple.com/documentation/computegraph/mouseparams)

### Structures

- [ComputeNodeGraph](https://developer.apple.com/documentation/computegraph/computenodegraph)

### Functions

- [element_integrate](https://developer.apple.com/documentation/computegraph/element_integrate)
- [filteredLinesFromNeighbors](https://developer.apple.com/documentation/computegraph/filteredlinesfromneighbors)
- [gridDebugCells](https://developer.apple.com/documentation/computegraph/griddebugcells)
- [gridFromPoints](https://developer.apple.com/documentation/computegraph/gridfrompoints)
- [linesFromNeighbors](https://developer.apple.com/documentation/computegraph/linesfromneighbors)
- [orient_to_velocity](https://developer.apple.com/documentation/computegraph/orient_to_velocity)
- [spawn_demo](https://developer.apple.com/documentation/computegraph/spawn_demo)
- [texture_sample](https://developer.apple.com/documentation/computegraph/texture_sample)
- [texture_sample1d](https://developer.apple.com/documentation/computegraph/texture_sample1d)
- [viewpoint](https://developer.apple.com/documentation/computegraph/viewpoint-swift.func)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
