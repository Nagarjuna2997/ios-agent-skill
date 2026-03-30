# NaturalLanguage Framework -- Complete Guide for Text Processing and NLP

## Overview

The NaturalLanguage framework provides on-device natural language processing for tokenization, language identification, named entity recognition, part-of-speech tagging, sentiment analysis, lemmatization, and text embeddings. All processing runs locally with no network dependency. Every code example below compiles and follows production best practices.

---

## 1. Tokenization -- NLTokenizer

Split text into words, sentences, or paragraphs with locale-aware boundary detection.

```swift
import NaturalLanguage

func tokenize(_ text: String, unit: NLTokenUnit) -> [String] {
    let tokenizer = NLTokenizer(unit: unit)
    tokenizer.string = text

    var tokens: [String] = []
    tokenizer.enumerateTokens(in: text.startIndex..<text.endIndex) { range, _ in
        tokens.append(String(text[range]))
        return true  // continue enumeration
    }
    return tokens
}

// Usage
let sentence = "The quick brown fox jumps over the lazy dog. It was a sunny day."

let words = tokenize(sentence, unit: .word)
// ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "It", "was", "a", "sunny", "day"]

let sentences = tokenize(sentence, unit: .sentence)
// ["The quick brown fox jumps over the lazy dog. ", "It was a sunny day."]

let paragraphs = tokenize("First paragraph.\n\nSecond paragraph.", unit: .paragraph)
// ["First paragraph.\n\n", "Second paragraph."]
```

### Tokenizing with Language Hint

```swift
import NaturalLanguage

func tokenizeWithLanguage(_ text: String, language: NLLanguage) -> [String] {
    let tokenizer = NLTokenizer(unit: .word)
    tokenizer.string = text
    tokenizer.setLanguage(language)

    var tokens: [String] = []
    tokenizer.enumerateTokens(in: text.startIndex..<text.endIndex) { range, attributes in
        let token = String(text[range])
        tokens.append(token)
        return true
    }
    return tokens
}

// Japanese text tokenization
let japaneseTokens = tokenizeWithLanguage("東京は日本の首都です", language: .japanese)
// Properly segments into Japanese word boundaries

// Chinese text tokenization
let chineseTokens = tokenizeWithLanguage("北京是中国的首都", language: .simplifiedChinese)
```

---

## 2. Part-of-Speech Tagging -- NLTagger

Identify the grammatical role of each word: noun, verb, adjective, etc.

```swift
import NaturalLanguage

struct TaggedWord {
    let word: String
    let tag: NLTag?
    let tagName: String
}

func tagPartsOfSpeech(_ text: String) -> [TaggedWord] {
    let tagger = NLTagger(tagSchemes: [.lexicalClass])
    tagger.string = text

    var results: [TaggedWord] = []

    tagger.enumerateTags(
        in: text.startIndex..<text.endIndex,
        unit: .word,
        scheme: .lexicalClass,
        options: [.omitWhitespace, .omitPunctuation]
    ) { tag, range in
        let word = String(text[range])
        let tagName: String = switch tag {
        case .noun:              "Noun"
        case .verb:              "Verb"
        case .adjective:         "Adjective"
        case .adverb:            "Adverb"
        case .pronoun:           "Pronoun"
        case .determiner:        "Determiner"
        case .particle:          "Particle"
        case .preposition:       "Preposition"
        case .conjunction:       "Conjunction"
        case .interjection:      "Interjection"
        case .number:            "Number"
        default:                 tag?.rawValue ?? "Unknown"
        }
        results.append(TaggedWord(word: word, tag: tag, tagName: tagName))
        return true
    }

    return results
}

// Usage
let tagged = tagPartsOfSpeech("The quick brown fox jumps over the lazy dog")
for item in tagged {
    print("\(item.word): \(item.tagName)")
}
// The: Determiner
// quick: Adjective
// brown: Adjective
// fox: Noun
// jumps: Verb
// over: Preposition
// the: Determiner
// lazy: Adjective
// dog: Noun
```

---

## 3. Named Entity Recognition

Identify people, places, organizations, and other named entities.

```swift
import NaturalLanguage

struct NamedEntity {
    let text: String
    let type: String
}

func extractNamedEntities(_ text: String) -> [NamedEntity] {
    let tagger = NLTagger(tagSchemes: [.nameType])
    tagger.string = text

    var entities: [NamedEntity] = []

    tagger.enumerateTags(
        in: text.startIndex..<text.endIndex,
        unit: .word,
        scheme: .nameType,
        options: [.omitWhitespace, .omitPunctuation, .joinNames]
    ) { tag, range in
        guard let tag else { return true }

        let entityText = String(text[range])
        let entityType: String = switch tag {
        case .personalName:       "Person"
        case .placeName:          "Place"
        case .organizationName:   "Organization"
        default:                  tag.rawValue
        }

        entities.append(NamedEntity(text: entityText, type: entityType))
        return true
    }

    return entities
}

// Usage
let entities = extractNamedEntities("Tim Cook announced the new iPhone at Apple Park in Cupertino.")
// [("Tim Cook", "Person"), ("iPhone", "Organization"), ("Apple Park", "Organization"), ("Cupertino", "Place")]
```

---

## 4. Lemmatization

Reduce words to their base (dictionary) form.

```swift
import NaturalLanguage

func lemmatize(_ text: String) -> [(word: String, lemma: String)] {
    let tagger = NLTagger(tagSchemes: [.lemma])
    tagger.string = text

    var results: [(word: String, lemma: String)] = []

    tagger.enumerateTags(
        in: text.startIndex..<text.endIndex,
        unit: .word,
        scheme: .lemma,
        options: [.omitWhitespace, .omitPunctuation]
    ) { tag, range in
        let word = String(text[range])
        let lemma = tag?.rawValue ?? word
        results.append((word: word, lemma: lemma))
        return true
    }

    return results
}

// Usage
let lemmas = lemmatize("The dogs were running quickly through the forests")
// [("dogs", "dog"), ("were", "be"), ("running", "run"), ("quickly", "quickly"), ("forests", "forest")]
```

---

## 5. Language Identification -- NLLanguageRecognizer

Detect the language of a text string or rank probable languages.

```swift
import NaturalLanguage

func identifyLanguage(_ text: String) -> NLLanguage? {
    let recognizer = NLLanguageRecognizer()
    recognizer.processString(text)
    return recognizer.dominantLanguage
}

func rankLanguages(_ text: String, maxResults: Int = 5) -> [(NLLanguage, Double)] {
    let recognizer = NLLanguageRecognizer()
    recognizer.processString(text)

    let hypotheses = recognizer.languageHypotheses(withMaximum: maxResults)
    return hypotheses
        .sorted { $0.value > $1.value }
        .map { ($0.key, $0.value) }
}

// Constrain to expected languages for better accuracy
func identifyLanguageConstrained(_ text: String, candidates: [NLLanguage]) -> NLLanguage? {
    let recognizer = NLLanguageRecognizer()
    recognizer.languageConstraints = candidates
    recognizer.processString(text)
    return recognizer.dominantLanguage
}

// Usage
let language = identifyLanguage("Bonjour, comment allez-vous?")
// .french

let ranked = rankLanguages("Das ist ein Test")
// [(.german, 0.98), (.dutch, 0.01), ...]

let constrained = identifyLanguageConstrained(
    "Ciao, come stai?",
    candidates: [.italian, .spanish, .french]
)
// .italian
```

---

## 6. Sentiment Analysis

Determine the emotional tone of text using the built-in sentiment tagger.

```swift
import NaturalLanguage

/// Returns a sentiment score between -1.0 (negative) and 1.0 (positive)
func analyzeSentiment(_ text: String) -> Double {
    let tagger = NLTagger(tagSchemes: [.sentimentScore])
    tagger.string = text

    let (sentimentTag, _) = tagger.tag(
        at: text.startIndex,
        unit: .paragraph,
        scheme: .sentimentScore
    )

    return Double(sentimentTag?.rawValue ?? "0") ?? 0.0
}

enum Sentiment: String {
    case positive, negative, neutral
}

func classifySentiment(_ text: String) -> Sentiment {
    let score = analyzeSentiment(text)
    if score > 0.1 { return .positive }
    if score < -0.1 { return .negative }
    return .neutral
}

// Usage
let score1 = analyzeSentiment("I absolutely love this product! It's amazing!")
// ~0.8 (positive)

let score2 = analyzeSentiment("This is terrible. Worst experience ever.")
// ~-0.7 (negative)

let score3 = analyzeSentiment("The meeting is at 3pm in the conference room.")
// ~0.0 (neutral)

let sentiment = classifySentiment("Great job on the presentation!")
// .positive
```

### Sentence-Level Sentiment Analysis

```swift
import NaturalLanguage

struct SentenceSentiment {
    let sentence: String
    let score: Double
    let label: Sentiment
}

func analyzeSentimentBySentence(_ text: String) -> [SentenceSentiment] {
    // First, split into sentences
    let sentenceTokenizer = NLTokenizer(unit: .sentence)
    sentenceTokenizer.string = text

    var results: [SentenceSentiment] = []

    sentenceTokenizer.enumerateTokens(in: text.startIndex..<text.endIndex) { range, _ in
        let sentence = String(text[range]).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !sentence.isEmpty else { return true }

        let score = analyzeSentiment(sentence)
        let label: Sentiment
        if score > 0.1 { label = .positive }
        else if score < -0.1 { label = .negative }
        else { label = .neutral }

        results.append(SentenceSentiment(sentence: sentence, score: score, label: label))
        return true
    }

    return results
}
```

---

## 7. Text Embeddings -- NLEmbedding

Compute vector representations of words and sentences for semantic similarity.

### Word Embeddings

```swift
import NaturalLanguage

func wordSimilarity(_ word1: String, _ word2: String, language: NLLanguage = .english) -> Double? {
    guard let embedding = NLEmbedding.wordEmbedding(for: language) else { return nil }

    // Distance is between 0 (identical) and 2 (opposite)
    let distance = embedding.distance(between: word1, and: word2)

    // Convert to similarity (1.0 = identical, 0.0 = unrelated)
    return 1.0 - (distance / 2.0)
}

func findNearestWords(to word: String, maxResults: Int = 10, language: NLLanguage = .english) -> [(String, Double)] {
    guard let embedding = NLEmbedding.wordEmbedding(for: language) else { return [] }

    var results: [(String, Double)] = []
    embedding.enumerateNeighbors(for: word, maximumCount: maxResults) { neighbor, distance in
        let similarity = 1.0 - (distance / 2.0)
        results.append((neighbor, similarity))
        return true
    }
    return results
}

func wordVector(_ word: String, language: NLLanguage = .english) -> [Double]? {
    guard let embedding = NLEmbedding.wordEmbedding(for: language) else { return nil }
    return embedding.vector(for: word)
}

// Usage
let similarity = wordSimilarity("king", "queen")
// ~0.85 (very similar)

let neighbors = findNearestWords(to: "swift", maxResults: 5)
// [("fast", 0.82), ("quick", 0.78), ("rapid", 0.75), ...]
```

### Sentence Embeddings

```swift
import NaturalLanguage

@available(iOS 15.0, *)
func sentenceSimilarity(_ sentence1: String, _ sentence2: String, language: NLLanguage = .english) -> Double? {
    guard let embedding = NLEmbedding.sentenceEmbedding(for: language) else { return nil }
    let distance = embedding.distance(between: sentence1, and: sentence2)
    return 1.0 - (distance / 2.0)
}

@available(iOS 15.0, *)
func findSimilarSentences(to query: String, in candidates: [String], language: NLLanguage = .english) -> [(String, Double)] {
    guard let embedding = NLEmbedding.sentenceEmbedding(for: language) else { return [] }

    return candidates.compactMap { candidate in
        let distance = embedding.distance(between: query, and: candidate)
        let similarity = 1.0 - (distance / 2.0)
        return (candidate, similarity)
    }
    .sorted { $0.1 > $1.1 }
}

// Usage
let sim = sentenceSimilarity(
    "How is the weather today?",
    "What's the forecast for today?"
)
// ~0.85 (semantically similar)

let results = findSimilarSentences(
    to: "I need help with my account",
    in: [
        "How do I reset my password?",
        "Where is the nearest restaurant?",
        "I want to change my profile settings",
        "What time does the store close?"
    ]
)
// Ranked by semantic similarity to the query
```

---

## 8. Custom NLModel with Create ML

Train a custom text classifier and use it with NLTagger.

```swift
import NaturalLanguage
import CoreML

// Loading and using a custom NLModel (trained with Create ML)
func loadCustomModel() throws -> NLModel {
    let modelURL = Bundle.main.url(forResource: "CustomTextClassifier", withExtension: "mlmodelc")!
    return try NLModel(contentsOf: modelURL)
}

// Standalone prediction
func classifyText(_ text: String, model: NLModel) -> String? {
    return model.predictedLabel(for: text)
}

// Prediction with confidence scores
func classifyTextWithConfidence(_ text: String, model: NLModel) -> [(String, Double)] {
    let hypotheses = model.predictedLabelHypotheses(for: text, maximumCount: 5)
    return hypotheses
        .sorted { $0.value > $1.value }
        .map { ($0.key, $0.value) }
}

// Using a custom model with NLTagger for per-token classification
func tagWithCustomModel(_ text: String, model: NLModel) -> [(String, String?)] {
    let tagger = NLTagger(tagSchemes: [.nameType])
    tagger.string = text
    tagger.setModels([model], forTagScheme: .nameType)

    var results: [(String, String?)] = []

    tagger.enumerateTags(
        in: text.startIndex..<text.endIndex,
        unit: .word,
        scheme: .nameType,
        options: [.omitWhitespace, .omitPunctuation]
    ) { tag, range in
        let word = String(text[range])
        results.append((word, tag?.rawValue))
        return true
    }

    return results
}
```

---

## 9. Complete Text Analysis Pipeline

A full SwiftUI view combining multiple NaturalLanguage features.

```swift
import SwiftUI
import NaturalLanguage

@Observable
final class TextAnalysisViewModel {
    var inputText = ""
    var detectedLanguage = ""
    var sentimentScore = 0.0
    var sentimentLabel = ""
    var wordCount = 0
    var sentenceCount = 0
    var entities: [NamedEntity] = []
    var posTagged: [TaggedWord] = []

    func analyze() {
        guard !inputText.isEmpty else { return }

        // Language detection
        let recognizer = NLLanguageRecognizer()
        recognizer.processString(inputText)
        detectedLanguage = recognizer.dominantLanguage?.rawValue ?? "Unknown"

        // Sentiment
        let sentimentTagger = NLTagger(tagSchemes: [.sentimentScore])
        sentimentTagger.string = inputText
        let (tag, _) = sentimentTagger.tag(at: inputText.startIndex, unit: .paragraph, scheme: .sentimentScore)
        sentimentScore = Double(tag?.rawValue ?? "0") ?? 0.0
        if sentimentScore > 0.1 { sentimentLabel = "Positive" }
        else if sentimentScore < -0.1 { sentimentLabel = "Negative" }
        else { sentimentLabel = "Neutral" }

        // Tokenization counts
        let wordTokenizer = NLTokenizer(unit: .word)
        wordTokenizer.string = inputText
        wordCount = 0
        wordTokenizer.enumerateTokens(in: inputText.startIndex..<inputText.endIndex) { _, _ in
            wordCount += 1
            return true
        }

        let sentenceTokenizer = NLTokenizer(unit: .sentence)
        sentenceTokenizer.string = inputText
        sentenceCount = 0
        sentenceTokenizer.enumerateTokens(in: inputText.startIndex..<inputText.endIndex) { _, _ in
            sentenceCount += 1
            return true
        }

        // Named entities
        entities = extractNamedEntities(inputText)

        // POS tagging (first 20 words)
        posTagged = Array(tagPartsOfSpeech(inputText).prefix(20))
    }
}

struct TextAnalysisView: View {
    @State private var viewModel = TextAnalysisViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    TextEditor(text: $viewModel.inputText)
                        .frame(minHeight: 120)
                        .padding(8)
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))

                    Button("Analyze") {
                        viewModel.analyze()
                    }
                    .buttonStyle(.borderedProminent)
                    .frame(maxWidth: .infinity)

                    if !viewModel.detectedLanguage.isEmpty {
                        GroupBox("Overview") {
                            LabeledContent("Language", value: viewModel.detectedLanguage)
                            LabeledContent("Words", value: "\(viewModel.wordCount)")
                            LabeledContent("Sentences", value: "\(viewModel.sentenceCount)")
                        }

                        GroupBox("Sentiment") {
                            LabeledContent("Score", value: String(format: "%.2f", viewModel.sentimentScore))
                            LabeledContent("Label", value: viewModel.sentimentLabel)
                        }

                        if !viewModel.entities.isEmpty {
                            GroupBox("Named Entities") {
                                ForEach(viewModel.entities, id: \.text) { entity in
                                    LabeledContent(entity.text, value: entity.type)
                                }
                            }
                        }

                        if !viewModel.posTagged.isEmpty {
                            GroupBox("Parts of Speech") {
                                LazyVGrid(columns: [
                                    GridItem(.flexible()),
                                    GridItem(.flexible()),
                                    GridItem(.flexible())
                                ], spacing: 8) {
                                    ForEach(viewModel.posTagged, id: \.word) { item in
                                        VStack(spacing: 4) {
                                            Text(item.word)
                                                .font(.body.bold())
                                            Text(item.tagName)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        .padding(8)
                                        .background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
                                    }
                                }
                            }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Text Analysis")
        }
    }
}
```

---

## Quick Reference

| Class | Purpose |
|-------|---------|
| `NLTokenizer` | Split text into words, sentences, or paragraphs |
| `NLTagger` | Tag tokens with POS, NER, lemma, sentiment |
| `NLLanguageRecognizer` | Detect the language of a string |
| `NLEmbedding` | Word and sentence vector embeddings |
| `NLModel` | Load and use custom Create ML text models |

| Tag Scheme | Tags Produced |
|------------|---------------|
| `.lexicalClass` | Noun, Verb, Adjective, Adverb, Pronoun, Determiner, etc. |
| `.nameType` | PersonalName, PlaceName, OrganizationName |
| `.lemma` | Base/dictionary form of each word |
| `.sentimentScore` | Floating-point score from -1.0 to 1.0 |
| `.language` | Per-token language identification |

| Embedding Type | Available From | Dimensions |
|---------------|----------------|------------|
| Word embedding | iOS 13+ | ~128-300 dimensions |
| Sentence embedding | iOS 15+ | ~512 dimensions |
