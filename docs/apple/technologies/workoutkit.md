# WorkoutKit

## Context

Load this when a task names **WorkoutKit** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/workoutkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create, preview, and sync workout compositions to the Workout app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `WorkoutKit`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 17.0 | — | No |
| iPadOS | 17.0 | — | No |
| Mac Catalyst | 17.0 | — | No |
| watchOS | 10.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Customizing workouts with WorkoutKit](https://developer.apple.com/documentation/workoutkit/customizing-workouts-with-workoutkit)

### Common workouts

- [SingleGoalWorkout](https://developer.apple.com/documentation/workoutkit/singlegoalworkout)
- [PacerWorkout](https://developer.apple.com/documentation/workoutkit/pacerworkout)
- [SwimBikeRunWorkout](https://developer.apple.com/documentation/workoutkit/swimbikerunworkout)

### Custom interval workouts

- [CustomWorkout](https://developer.apple.com/documentation/workoutkit/customworkout)
- [WorkoutStep](https://developer.apple.com/documentation/workoutkit/workoutstep)
- [IntervalBlock](https://developer.apple.com/documentation/workoutkit/intervalblock)
- [IntervalStep](https://developer.apple.com/documentation/workoutkit/intervalstep)
- [WorkoutGoal](https://developer.apple.com/documentation/workoutkit/workoutgoal)
- [WorkoutAlert](https://developer.apple.com/documentation/workoutkit/workoutalert)

### Workout plans and schedules

- [WorkoutPlan](https://developer.apple.com/documentation/workoutkit/workoutplan)
- [ScheduledWorkoutPlan](https://developer.apple.com/documentation/workoutkit/scheduledworkoutplan)
- [WorkoutScheduler](https://developer.apple.com/documentation/workoutkit/workoutscheduler)

### Errors

- [StateError](https://developer.apple.com/documentation/workoutkit/stateerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
