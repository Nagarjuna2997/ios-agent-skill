# Tabular Data

## Context

Load this when a task names **Tabular Data** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/tabulardata) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Import, organize, and prepare a table of data to train a machine learning model.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `TabularData`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.0 | — | No |
| iPadOS | 15.0 | — | No |
| Mac Catalyst | 15.0 | — | No |
| macOS | 12.0 | — | No |
| tvOS | 15.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 8.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Data Tables

- [DataFrame](https://developer.apple.com/documentation/tabulardata/dataframe)
- [DataFrameProtocol](https://developer.apple.com/documentation/tabulardata/dataframeprotocol)

### Typed Columns

- [Column](https://developer.apple.com/documentation/tabulardata/column)
- [ColumnSlice](https://developer.apple.com/documentation/tabulardata/columnslice)
- [FilledColumn](https://developer.apple.com/documentation/tabulardata/filledcolumn)
- [DiscontiguousColumnSlice](https://developer.apple.com/documentation/tabulardata/discontiguouscolumnslice)
- [ColumnProtocol](https://developer.apple.com/documentation/tabulardata/columnprotocol)
- [OptionalColumnProtocol](https://developer.apple.com/documentation/tabulardata/optionalcolumnprotocol)

### Type-Erased Columns

- [AnyColumn](https://developer.apple.com/documentation/tabulardata/anycolumn)
- [AnyColumnSlice](https://developer.apple.com/documentation/tabulardata/anycolumnslice)
- [AnyColumnProtocol](https://developer.apple.com/documentation/tabulardata/anycolumnprotocol)
- [AnyColumnPrototype](https://developer.apple.com/documentation/tabulardata/anycolumnprototype)

### Statistical Summaries

- [NumericSummary](https://developer.apple.com/documentation/tabulardata/numericsummary)
- [CategoricalSummary](https://developer.apple.com/documentation/tabulardata/categoricalsummary)
- [AnyCategoricalSummary](https://developer.apple.com/documentation/tabulardata/anycategoricalsummary)

### Errors

- [JSONReadingError](https://developer.apple.com/documentation/tabulardata/jsonreadingerror)
- [CSVReadingError](https://developer.apple.com/documentation/tabulardata/csvreadingerror)
- [CSVWritingError](https://developer.apple.com/documentation/tabulardata/csvwritingerror)
- [ColumnDecodingError](https://developer.apple.com/documentation/tabulardata/columndecodingerror)
- [ColumnEncodingError](https://developer.apple.com/documentation/tabulardata/columnencodingerror)
- [SFrameReadingError](https://developer.apple.com/documentation/tabulardata/sframereadingerror)

### Supporting Types

- [Order](https://developer.apple.com/documentation/tabulardata/order)
- [ColumnID](https://developer.apple.com/documentation/tabulardata/columnid)
- [FormattingOptions](https://developer.apple.com/documentation/tabulardata/formattingoptions)

### Structures

- [JSONWritingOptions](https://developer.apple.com/documentation/tabulardata/jsonwritingoptions)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
