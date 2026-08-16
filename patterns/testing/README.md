# Testing Patterns

| Pattern | Use | Rule |
|---|---|---|
| test double | unit-test business logic | no live network |
| fixture dataset | migration/evaluation coverage | checked into test resources |
| UI test launch flag | deterministic app state | ignored in release builds |
| screenshot state | visual review | stable device/locale/content size |
| performance signpost | release regression | measured in Release |

Prefer small deterministic tests and promote only critical user flows to UI automation.
