# Create ML Components

## Context

Load this when a task names **Create ML Components** or one of the API topics below.

Apple categories: App Services.

[Apple documentation](https://developer.apple.com/documentation/createmlcomponents) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Create more customizable machine learning models in your app.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Create ML Components`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 16.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 11.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Image components

- [Augmenting images to expand your training data](https://developer.apple.com/documentation/createmlcomponents/augmenting-images-to-expand-your-training-data)
- [Creating a multi-label image classifier](https://developer.apple.com/documentation/createmlcomponents/creating-a-multi-label-image-classifier)
- [ImageReader](https://developer.apple.com/documentation/createmlcomponents/imagereader)
- [ImageFeatureExtractor](https://developer.apple.com/documentation/createmlcomponents/imagefeatureextractor)
- [ImageCropper](https://developer.apple.com/documentation/createmlcomponents/imagecropper)
- [ImageScaler](https://developer.apple.com/documentation/createmlcomponents/imagescaler)
- [ImageFeaturePrint](https://developer.apple.com/documentation/createmlcomponents/imagefeatureprint)
- [ImageBlur](https://developer.apple.com/documentation/createmlcomponents/imageblur)
- [ImageColorTransformer](https://developer.apple.com/documentation/createmlcomponents/imagecolortransformer)
- [ImageExposureAdjuster](https://developer.apple.com/documentation/createmlcomponents/imageexposureadjuster)
- [ImageFlipper](https://developer.apple.com/documentation/createmlcomponents/imageflipper)
- [ImageRotator](https://developer.apple.com/documentation/createmlcomponents/imagerotator)
- [RandomImageNoiseGenerator](https://developer.apple.com/documentation/createmlcomponents/randomimagenoisegenerator)
- [MLModelImageFeatureExtractor](https://developer.apple.com/documentation/createmlcomponents/mlmodelimagefeatureextractor)

### Pose components

- [Counting human body action repetitions in a live video feed](https://developer.apple.com/documentation/createmlcomponents/counting-human-body-action-repetitions-in-a-live-video-feed)
- [Pose](https://developer.apple.com/documentation/createmlcomponents/pose)
- [JointKey](https://developer.apple.com/documentation/createmlcomponents/jointkey)
- [JointPoint](https://developer.apple.com/documentation/createmlcomponents/jointpoint)
- [PoseSelector](https://developer.apple.com/documentation/createmlcomponents/poseselector)
- [PoseSelectionStrategy](https://developer.apple.com/documentation/createmlcomponents/poseselectionstrategy)
- [JointsSelector](https://developer.apple.com/documentation/createmlcomponents/jointsselector)
- [HumanBodyPoseExtractor](https://developer.apple.com/documentation/createmlcomponents/humanbodyposeextractor)
- [HumanHandPoseExtractor](https://developer.apple.com/documentation/createmlcomponents/humanhandposeextractor)
- [HumanBodyActionCounter](https://developer.apple.com/documentation/createmlcomponents/humanbodyactioncounter)
- [HumanBodyActionPeriodPredictor](https://developer.apple.com/documentation/createmlcomponents/humanbodyactionperiodpredictor)

### Audio components

- [AudioReader](https://developer.apple.com/documentation/createmlcomponents/audioreader)
- [AudioFeaturePrint](https://developer.apple.com/documentation/createmlcomponents/audiofeatureprint)
- [AudioConvertingTransformer](https://developer.apple.com/documentation/createmlcomponents/audioconvertingtransformer)

### Time-based components

- [Creating a time-series classifier](https://developer.apple.com/documentation/createmlcomponents/creating-a-time-series-classifier)
- [Creating a time-series forecaster](https://developer.apple.com/documentation/createmlcomponents/creating-a-time-series-forecaster)
- [DateFeatures](https://developer.apple.com/documentation/createmlcomponents/datefeatures)
- [DateFeatureExtractor](https://developer.apple.com/documentation/createmlcomponents/datefeatureextractor)
- [LinearTimeSeriesForecaster](https://developer.apple.com/documentation/createmlcomponents/lineartimeseriesforecaster)
- [LinearTimeSeriesForecasterConfiguration](https://developer.apple.com/documentation/createmlcomponents/lineartimeseriesforecasterconfiguration)
- [TimeSeriesForecasterBatches](https://developer.apple.com/documentation/createmlcomponents/timeseriesforecasterbatches)
- [TimeSeriesForecasterAnnotatedWindows](https://developer.apple.com/documentation/createmlcomponents/timeseriesforecasterannotatedwindows)
- [TemporalFeature](https://developer.apple.com/documentation/createmlcomponents/temporalfeature)
- [TemporalSequence](https://developer.apple.com/documentation/createmlcomponents/temporalsequence)
- [TemporalSegmentIdentifier](https://developer.apple.com/documentation/createmlcomponents/temporalsegmentidentifier)
- [SlidingWindows](https://developer.apple.com/documentation/createmlcomponents/slidingwindows)
- [SlidingWindowTransformer](https://developer.apple.com/documentation/createmlcomponents/slidingwindowtransformer)
- [Downsampler](https://developer.apple.com/documentation/createmlcomponents/downsampler)
- [VideoReader](https://developer.apple.com/documentation/createmlcomponents/videoreader)
- [TemporalFileSegment](https://developer.apple.com/documentation/createmlcomponents/temporalfilesegment)
- [AnyTemporalIterator](https://developer.apple.com/documentation/createmlcomponents/anytemporaliterator)
- [AnyTemporalSequence](https://developer.apple.com/documentation/createmlcomponents/anytemporalsequence)
- [PreprocessedFeatureSequence](https://developer.apple.com/documentation/createmlcomponents/preprocessedfeaturesequence)

### Object detection components

- [DetectedObject](https://developer.apple.com/documentation/createmlcomponents/detectedobject)
- [ObjectDetectionAnnotation](https://developer.apple.com/documentation/createmlcomponents/objectdetectionannotation)
- [ObjectDetectionMetrics](https://developer.apple.com/documentation/createmlcomponents/objectdetectionmetrics)

### Tabular components

- [TabularTransformer](https://developer.apple.com/documentation/createmlcomponents/tabulartransformer)
- [TabularEstimator](https://developer.apple.com/documentation/createmlcomponents/tabularestimator)
- [SupervisedTabularEstimator](https://developer.apple.com/documentation/createmlcomponents/supervisedtabularestimator)
- [ColumnSelector](https://developer.apple.com/documentation/createmlcomponents/columnselector)
- [ColumnSelectorTransformer](https://developer.apple.com/documentation/createmlcomponents/columnselectortransformer)
- [ColumnSelection](https://developer.apple.com/documentation/createmlcomponents/columnselection)
- [ColumnConcatenator](https://developer.apple.com/documentation/createmlcomponents/columnconcatenator)
- [PreprocessingSupervisedTabularEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingsupervisedtabularestimator)
- [PreprocessingTabularEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingtabularestimator)
- [PreprocessingUpdatableSupervisedTabularEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingupdatablesupervisedtabularestimator)
- [PreprocessingUpdatableTabularEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingupdatabletabularestimator)

### Protocols

- [Transformer](https://developer.apple.com/documentation/createmlcomponents/transformer)
- [TemporalTransformer](https://developer.apple.com/documentation/createmlcomponents/temporaltransformer)
- [RandomTransformer](https://developer.apple.com/documentation/createmlcomponents/randomtransformer)
- [Estimator](https://developer.apple.com/documentation/createmlcomponents/estimator)
- [TemporalEstimator](https://developer.apple.com/documentation/createmlcomponents/temporalestimator) — deprecated
- [SupervisedEstimator](https://developer.apple.com/documentation/createmlcomponents/supervisedestimator)
- [SupervisedTemporalEstimator](https://developer.apple.com/documentation/createmlcomponents/supervisedtemporalestimator) — deprecated
- [UpdatableEstimator](https://developer.apple.com/documentation/createmlcomponents/updatableestimator)
- [UpdatableSupervisedEstimator](https://developer.apple.com/documentation/createmlcomponents/updatablesupervisedestimator)
- [UpdatableSupervisedTemporalEstimator](https://developer.apple.com/documentation/createmlcomponents/updatablesupervisedtemporalestimator) — deprecated
- [UpdatableSupervisedTabularEstimator](https://developer.apple.com/documentation/createmlcomponents/updatablesupervisedtabularestimator)
- [UpdatableTemporalEstimator](https://developer.apple.com/documentation/createmlcomponents/updatabletemporalestimator) — deprecated
- [UpdatableTabularEstimator](https://developer.apple.com/documentation/createmlcomponents/updatabletabularestimator)

### Core ML adaptors

- [MLModelTransformerAdaptor](https://developer.apple.com/documentation/createmlcomponents/mlmodeltransformeradaptor)
- [MLModelClassifierAdaptor](https://developer.apple.com/documentation/createmlcomponents/mlmodelclassifieradaptor)
- [MLModelRegressorAdaptor](https://developer.apple.com/documentation/createmlcomponents/mlmodelregressoradaptor)
- [ModelMetadata](https://developer.apple.com/documentation/createmlcomponents/modelmetadata)

### Annotations

- [AnnotatedFiles](https://developer.apple.com/documentation/createmlcomponents/annotatedfiles)
- [AnnotatedBatch](https://developer.apple.com/documentation/createmlcomponents/annotatedbatch)
- [AnnotatedFeature](https://developer.apple.com/documentation/createmlcomponents/annotatedfeature)
- [AnnotatedFeatureProvider](https://developer.apple.com/documentation/createmlcomponents/annotatedfeatureprovider)
- [AnnotatedPrediction](https://developer.apple.com/documentation/createmlcomponents/annotatedprediction)
- [DataFrameTemporalAnnotationParameters](https://developer.apple.com/documentation/createmlcomponents/dataframetemporalannotationparameters)

### Augmentations

- [ApplyEachRandomly](https://developer.apple.com/documentation/createmlcomponents/applyeachrandomly)
- [ApplyRandomly](https://developer.apple.com/documentation/createmlcomponents/applyrandomly)
- [AugmentationBuilder](https://developer.apple.com/documentation/createmlcomponents/augmentationbuilder)
- [AugmentationSequence](https://developer.apple.com/documentation/createmlcomponents/augmentationsequence)
- [Augmenter](https://developer.apple.com/documentation/createmlcomponents/augmenter)
- [ChooseRandomly](https://developer.apple.com/documentation/createmlcomponents/chooserandomly)
- [RandomImageCropper](https://developer.apple.com/documentation/createmlcomponents/randomimagecropper)
- [ShuffleRandomly](https://developer.apple.com/documentation/createmlcomponents/shufflerandomly)
- [UniformRandomFloatingPointParameter](https://developer.apple.com/documentation/createmlcomponents/uniformrandomfloatingpointparameter)
- [UniformRandomIntegerParameter](https://developer.apple.com/documentation/createmlcomponents/uniformrandomintegerparameter)
- [UpsampledAugmentationSequence](https://developer.apple.com/documentation/createmlcomponents/upsampledaugmentationsequence)

### Event handling

- [Event](https://developer.apple.com/documentation/createmlcomponents/event)
- [EventHandler](https://developer.apple.com/documentation/createmlcomponents/eventhandler)
- [MetricsKey](https://developer.apple.com/documentation/createmlcomponents/metricskey)

### Scalers

- [StandardScaler](https://developer.apple.com/documentation/createmlcomponents/standardscaler)
- [MaxAbsScaler](https://developer.apple.com/documentation/createmlcomponents/maxabsscaler)
- [MinMaxScaler](https://developer.apple.com/documentation/createmlcomponents/minmaxscaler)
- [NormalizationScaler](https://developer.apple.com/documentation/createmlcomponents/normalizationscaler)
- [RobustScaler](https://developer.apple.com/documentation/createmlcomponents/robustscaler)

### Preprocessors

- [LinearTransformer](https://developer.apple.com/documentation/createmlcomponents/lineartransformer)
- [ImputeTransformer](https://developer.apple.com/documentation/createmlcomponents/imputetransformer)
- [OneHotEncoder](https://developer.apple.com/documentation/createmlcomponents/onehotencoder)
- [OrdinalEncoder](https://developer.apple.com/documentation/createmlcomponents/ordinalencoder)
- [NumericImputer](https://developer.apple.com/documentation/createmlcomponents/numericimputer)
- [Reshaper](https://developer.apple.com/documentation/createmlcomponents/reshaper)
- [CategoricalImputer](https://developer.apple.com/documentation/createmlcomponents/categoricalimputer)
- [OptionalUnwrapper](https://developer.apple.com/documentation/createmlcomponents/optionalunwrapper)

### Regressors

- [Regressor](https://developer.apple.com/documentation/createmlcomponents/regressor)
- [LinearRegressor](https://developer.apple.com/documentation/createmlcomponents/linearregressor)
- [LinearRegressorModel](https://developer.apple.com/documentation/createmlcomponents/linearregressormodel)
- [MultivariateLinearRegressor](https://developer.apple.com/documentation/createmlcomponents/multivariatelinearregressor)
- [MultivariateLinearRegressorConfiguration](https://developer.apple.com/documentation/createmlcomponents/multivariatelinearregressorconfiguration)
- [MultivariateLinearRegressor.Model](https://developer.apple.com/documentation/createmlcomponents/multivariatelinearregressor/model)
- [FullyConnectedNetworkRegressor](https://developer.apple.com/documentation/createmlcomponents/fullyconnectednetworkregressor)
- [FullyConnectedNetworkRegressorModel](https://developer.apple.com/documentation/createmlcomponents/fullyconnectednetworkregressormodel)
- [BoostedTreeRegressor](https://developer.apple.com/documentation/createmlcomponents/boostedtreeregressor)
- [TreeRegressorModel](https://developer.apple.com/documentation/createmlcomponents/treeregressormodel)
- [OptimizationStrategy](https://developer.apple.com/documentation/createmlcomponents/optimizationstrategy)

### Serializers

- [EstimatorDecoder](https://developer.apple.com/documentation/createmlcomponents/estimatordecoder)
- [EstimatorEncoder](https://developer.apple.com/documentation/createmlcomponents/estimatorencoder)

### Classifiers

- [Classifier](https://developer.apple.com/documentation/createmlcomponents/classifier)
- [LogisticRegressionClassifier](https://developer.apple.com/documentation/createmlcomponents/logisticregressionclassifier)
- [LogisticRegressionClassifierModel](https://developer.apple.com/documentation/createmlcomponents/logisticregressionclassifiermodel)
- [BoostedTreeClassifier](https://developer.apple.com/documentation/createmlcomponents/boostedtreeclassifier)
- [BoostedTreeConfiguration](https://developer.apple.com/documentation/createmlcomponents/boostedtreeconfiguration)
- [FullyConnectedNetworkClassifier](https://developer.apple.com/documentation/createmlcomponents/fullyconnectednetworkclassifier)
- [FullyConnectedNetworkClassifierModel](https://developer.apple.com/documentation/createmlcomponents/fullyconnectednetworkclassifiermodel)
- [FullyConnectedNetworkMultiLabelClassifier](https://developer.apple.com/documentation/createmlcomponents/fullyconnectednetworkmultilabelclassifier)
- [FullyConnectedNetworkMultiLabelClassifierModel](https://developer.apple.com/documentation/createmlcomponents/fullyconnectednetworkmultilabelclassifiermodel)
- [FullyConnectedNetworkConfiguration](https://developer.apple.com/documentation/createmlcomponents/fullyconnectednetworkconfiguration)
- [TreeClassifierModel](https://developer.apple.com/documentation/createmlcomponents/treeclassifiermodel)
- [TimeSeriesClassifier](https://developer.apple.com/documentation/createmlcomponents/timeseriesclassifier)
- [TimeSeriesClassifierConfiguration](https://developer.apple.com/documentation/createmlcomponents/timeseriesclassifierconfiguration)

### Metrics

- [Classification](https://developer.apple.com/documentation/createmlcomponents/classification)
- [ClassificationDistribution](https://developer.apple.com/documentation/createmlcomponents/classificationdistribution)
- [ClassificationMetrics](https://developer.apple.com/documentation/createmlcomponents/classificationmetrics)
- [MultiLabelClassificationMetrics](https://developer.apple.com/documentation/createmlcomponents/multilabelclassificationmetrics)
- [rootMeanSquaredError(_:)](https://developer.apple.com/documentation/createmlcomponents/rootmeansquarederror(_:))
- [rootMeanSquaredError(_:_:)](https://developer.apple.com/documentation/createmlcomponents/rootmeansquarederror(_:_:))
- [maximumAbsoluteError(_:)](https://developer.apple.com/documentation/createmlcomponents/maximumabsoluteerror(_:))
- [maximumAbsoluteError(_:_:)](https://developer.apple.com/documentation/createmlcomponents/maximumabsoluteerror(_:_:))
- [meanAbsoluteError(_:)](https://developer.apple.com/documentation/createmlcomponents/meanabsoluteerror(_:))
- [meanAbsoluteError(_:_:)](https://developer.apple.com/documentation/createmlcomponents/meanabsoluteerror(_:_:))
- [meanAbsolutePercentageError(_:)](https://developer.apple.com/documentation/createmlcomponents/meanabsolutepercentageerror(_:))
- [meanSquaredError(_:)](https://developer.apple.com/documentation/createmlcomponents/meansquarederror(_:))
- [meanSquaredError(_:_:)](https://developer.apple.com/documentation/createmlcomponents/meansquarederror(_:_:))

### Transformer adaptors

- [TransformerToEstimatorAdaptor](https://developer.apple.com/documentation/createmlcomponents/transformertoestimatoradaptor)
- [TransformerToTemporalAdaptor](https://developer.apple.com/documentation/createmlcomponents/transformertotemporaladaptor) — deprecated
- [TransformerToUpdatableEstimatorAdaptor](https://developer.apple.com/documentation/createmlcomponents/transformertoupdatableestimatoradaptor)

### Updatable adaptors

- [UpdatableEstimatorToTemporalAdaptor](https://developer.apple.com/documentation/createmlcomponents/updatableestimatortotemporaladaptor) — deprecated
- [UpdatableEstimatorToSupervisedAdaptor](https://developer.apple.com/documentation/createmlcomponents/updatableestimatortosupervisedadaptor)
- [UpdatableSupervisedEstimatorToTemporalAdaptor](https://developer.apple.com/documentation/createmlcomponents/updatablesupervisedestimatortotemporaladaptor) — deprecated
- [UpdatableTemporalEstimatorToSupervisedAdaptor](https://developer.apple.com/documentation/createmlcomponents/updatabletemporalestimatortosupervisedadaptor) — deprecated

### Estimator adaptors

- [EstimatorToSupervisedAdaptor](https://developer.apple.com/documentation/createmlcomponents/estimatortosupervisedadaptor)
- [EstimatorToTemporalAdaptor](https://developer.apple.com/documentation/createmlcomponents/estimatortotemporaladaptor) — deprecated
- [SupervisedEstimatorToTemporalAdaptor](https://developer.apple.com/documentation/createmlcomponents/supervisedestimatortotemporaladaptor) — deprecated

### Tabular adaptors

- [TabularEstimatorToSupervisedAdaptor](https://developer.apple.com/documentation/createmlcomponents/tabularestimatortosupervisedadaptor)
- [TabularTransformerToEstimatorAdaptor](https://developer.apple.com/documentation/createmlcomponents/tabulartransformertoestimatoradaptor)
- [TabularTransformerToUpdatableEstimatorAdaptor](https://developer.apple.com/documentation/createmlcomponents/tabulartransformertoupdatableestimatoradaptor)
- [UpdatableTabularEstimatorToSupervisedAdaptor](https://developer.apple.com/documentation/createmlcomponents/updatabletabularestimatortosupervisedadaptor)

### Temporal adaptors

- [TemporalAdaptor](https://developer.apple.com/documentation/createmlcomponents/temporaladaptor)
- [TemporalTransformerToEstimatorAdaptor](https://developer.apple.com/documentation/createmlcomponents/temporaltransformertoestimatoradaptor) — deprecated
- [TemporalEstimatorToSupervisedAdaptor](https://developer.apple.com/documentation/createmlcomponents/temporalestimatortosupervisedadaptor) — deprecated
- [TemporalTransformerToUpdatableEstimatorAdaptor](https://developer.apple.com/documentation/createmlcomponents/temporaltransformertoupdatableestimatoradaptor) — deprecated

### Composition with preprocessing

- [PreprocessingEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingestimator)
- [PreprocessingTemporalEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingtemporalestimator) — deprecated
- [PreprocessingSupervisedEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingsupervisedestimator)
- [PreprocessingSupervisedTemporalEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingsupervisedtemporalestimator) — deprecated
- [PreprocessingUpdatableEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingupdatableestimator)
- [PreprocessingUpdatableTemporalEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingupdatabletemporalestimator) — deprecated
- [PreprocessingUpdatableSupervisedEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingupdatablesupervisedestimator)
- [PreprocessingUpdatableSupervisedTemporalEstimator](https://developer.apple.com/documentation/createmlcomponents/preprocessingupdatablesupervisedtemporalestimator) — deprecated

### Composition

- [ComposedTransformer](https://developer.apple.com/documentation/createmlcomponents/composedtransformer)
- [ComposedTemporalTransformer](https://developer.apple.com/documentation/createmlcomponents/composedtemporaltransformer)
- [ComposedTabularTransformer](https://developer.apple.com/documentation/createmlcomponents/composedtabulartransformer)

### Errors

- [AudioPreprocessingError](https://developer.apple.com/documentation/createmlcomponents/audiopreprocessingerror)
- [AudioReaderError](https://developer.apple.com/documentation/createmlcomponents/audioreadererror)
- [CompatibilityError](https://developer.apple.com/documentation/createmlcomponents/compatibilityerror)
- [ConcatenationError](https://developer.apple.com/documentation/createmlcomponents/concatenationerror)
- [DatasetError](https://developer.apple.com/documentation/createmlcomponents/dataseterror)
- [EstimatorEncodingError](https://developer.apple.com/documentation/createmlcomponents/estimatorencodingerror)
- [ModelCompatibilityError](https://developer.apple.com/documentation/createmlcomponents/modelcompatibilityerror)
- [ModelUpdateError](https://developer.apple.com/documentation/createmlcomponents/modelupdateerror)
- [OptimizationError](https://developer.apple.com/documentation/createmlcomponents/optimizationerror)
- [PipelineDataError](https://developer.apple.com/documentation/createmlcomponents/pipelinedataerror)
- [SerializationError](https://developer.apple.com/documentation/createmlcomponents/serializationerror)
- [TabularPipelineDataError](https://developer.apple.com/documentation/createmlcomponents/tabularpipelinedataerror)
- [VideoReaderError](https://developer.apple.com/documentation/createmlcomponents/videoreadererror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
