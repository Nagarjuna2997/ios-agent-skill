# Create ML

## Context

Load this when a task names **Create ML** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/createml) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Create machine learning models for use in your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Create ML`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 15.0 | — | No |
| iPadOS | 15.0 | — | No |
| Mac Catalyst | 15.0 | — | No |
| macOS | 10.14 | — | No |
| tvOS | 16.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Image models

- [Creating an Image Classifier Model](https://developer.apple.com/documentation/createml/creating-an-image-classifier-model)
- [MLImageClassifier](https://developer.apple.com/documentation/createml/mlimageclassifier)
- [MLObjectDetector](https://developer.apple.com/documentation/createml/mlobjectdetector)
- [MLHandPoseClassifier](https://developer.apple.com/documentation/createml/mlhandposeclassifier)

### Video models

- [Creating an Action Classifier Model](https://developer.apple.com/documentation/createml/creating-an-action-classifier-model)
- [Detecting human actions in a live video feed](https://developer.apple.com/documentation/createml/detecting-human-actions-in-a-live-video-feed)
- [MLActionClassifier](https://developer.apple.com/documentation/createml/mlactionclassifier)
- [MLHandActionClassifier](https://developer.apple.com/documentation/createml/mlhandactionclassifier)
- [MLStyleTransfer](https://developer.apple.com/documentation/createml/mlstyletransfer)

### Text models

- [Creating a text classifier model](https://developer.apple.com/documentation/createml/creating-a-text-classifier-model)
- [Creating a word tagger model](https://developer.apple.com/documentation/createml/creating-a-word-tagger-model)
- [MLTextClassifier](https://developer.apple.com/documentation/createml/mltextclassifier)
- [MLWordTagger](https://developer.apple.com/documentation/createml/mlwordtagger)
- [MLGazetteer](https://developer.apple.com/documentation/createml/mlgazetteer)
- [MLWordEmbedding](https://developer.apple.com/documentation/createml/mlwordembedding)

### Sound models

- [MLSoundClassifier](https://developer.apple.com/documentation/createml/mlsoundclassifier)

### Motion models

- [MLActivityClassifier](https://developer.apple.com/documentation/createml/mlactivityclassifier)

### Tabular models

- [Creating a model from tabular data](https://developer.apple.com/documentation/createml/creating-a-model-from-tabular-data)
- [MLClassifier](https://developer.apple.com/documentation/createml/mlclassifier)
- [MLRegressor](https://developer.apple.com/documentation/createml/mlregressor)
- [MLRecommender](https://developer.apple.com/documentation/createml/mlrecommender)

### Tabular data

- [MLDataTable](https://developer.apple.com/documentation/createml/mldatatable)
- [MLDataValue](https://developer.apple.com/documentation/createml/mldatavalue)
- [Data visualizations](https://developer.apple.com/documentation/createml/data-visualizations)

### Model accuracy

- [Improving Your Model’s Accuracy](https://developer.apple.com/documentation/createml/improving-your-model-s-accuracy)
- [MLClassifierMetrics](https://developer.apple.com/documentation/createml/mlclassifiermetrics)
- [MLRegressorMetrics](https://developer.apple.com/documentation/createml/mlregressormetrics)
- [MLWordTaggerMetrics](https://developer.apple.com/documentation/createml/mlwordtaggermetrics)
- [MLRecommenderMetrics](https://developer.apple.com/documentation/createml/mlrecommendermetrics)
- [MLObjectDetectorMetrics](https://developer.apple.com/documentation/createml/mlobjectdetectormetrics)

### Model training Control

- [MLJob](https://developer.apple.com/documentation/createml/mljob)
- [MLTrainingSession](https://developer.apple.com/documentation/createml/mltrainingsession)
- [MLTrainingSessionParameters](https://developer.apple.com/documentation/createml/mltrainingsessionparameters)
- [MLCheckpoint](https://developer.apple.com/documentation/createml/mlcheckpoint)

### Supporting types

- [MLCreateError](https://developer.apple.com/documentation/createml/mlcreateerror)
- [MLModelMetadata](https://developer.apple.com/documentation/createml/mlmodelmetadata)
- [MLSplitStrategy](https://developer.apple.com/documentation/createml/mlsplitstrategy)

### Articles

- [Data visualizations](https://developer.apple.com/documentation/createml/create-ml-utilties)
- [Detecting human actions in a live video feed](https://developer.apple.com/documentation/createml/detecting-human-actions-in-a-live-video-feed)
- [Gathering Training Videos for an Action Classifier](https://developer.apple.com/documentation/createml/recording-or-choosing-training-videos)

### Functions

- [show(_:)](https://developer.apple.com/documentation/createml/show(_:)) — deprecated
- [show(_:_:)](https://developer.apple.com/documentation/createml/show(_:_:)) — deprecated

### Enumerations

- [MLBoundingBoxAnchor](https://developer.apple.com/documentation/createml/mlboundingboxanchor)
- [MLBoundingBoxCoordinatesOrigin](https://developer.apple.com/documentation/createml/mlboundingboxcoordinatesorigin)
- [MLBoundingBoxUnits](https://developer.apple.com/documentation/createml/mlboundingboxunits)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
