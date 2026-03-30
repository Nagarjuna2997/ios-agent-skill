# Swift Standard Library Reference

Comprehensive reference for the Swift standard library covering collections, strings, codable, error handling, functional programming, and time APIs.

---

## Collection Types

### Array

Arrays are ordered, random-access collections.

```swift
// Creation
var numbers: [Int] = [1, 2, 3, 4, 5]
let zeros = Array(repeating: 0, count: 10)
let range = Array(1...100)

// Common operations
numbers.append(6)
numbers.insert(0, at: 0)
numbers.remove(at: 2)
numbers.removeAll { $0 < 3 }

// Safe subscript pattern
extension Collection {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
let value = numbers[safe: 99] // nil instead of crash

// Searching
let firstEven = numbers.first { $0.isMultiple(of: 2) }
let index = numbers.firstIndex(of: 42)
let containsNeg = numbers.contains { $0 < 0 }

// Sorting
let sorted = numbers.sorted()
let descending = numbers.sorted(by: >)
numbers.sort { $0 < $1 } // In-place sort

struct User: Comparable {
    let name: String
    let age: Int
    static func < (lhs: User, rhs: User) -> Bool { lhs.age < rhs.age }
}
let users = [User(name: "Alice", age: 30), User(name: "Bob", age: 25)]
let byName = users.sorted(using: KeyPathComparator(\.name))

// Slicing — returns ArraySlice, not Array
let firstThree = numbers.prefix(3)
let lastTwo = numbers.suffix(2)
let middle = numbers[2..<5]
// Convert back to Array if needed
let middleArray = Array(middle)

// Chunking (Swift 5.7+)
let chunks = numbers.chunks(ofCount: 3) // [[1,2,3], [4,5,6], ...]
```

### Dictionary

Dictionaries are unordered collections of key-value pairs.

```swift
// Creation
var scores: [String: Int] = ["Alice": 95, "Bob": 87]

// Access with default
let aliceScore = scores["Alice", default: 0]

// Merging
let newScores = ["Charlie": 92, "Alice": 98]
scores.merge(newScores) { current, new in max(current, new) }

// Grouping
let words = ["apple", "avocado", "banana", "blueberry", "cherry"]
let grouped = Dictionary(grouping: words) { $0.first! }
// ["a": ["apple", "avocado"], "b": ["banana", "blueberry"], "c": ["cherry"]]

// Transforming
let uppercased = scores.mapValues { $0 * 2 }
let filtered = scores.filter { $0.value > 90 }

// Creating from sequence of pairs
let pairs = [("a", 1), ("b", 2), ("c", 3)]
let dict = Dictionary(uniqueKeysWithValues: pairs)

// Handling duplicate keys
let items = [("a", 1), ("a", 2), ("b", 3)]
let combined = Dictionary(items, uniquingKeysWith: +) // ["a": 3, "b": 3]

// compactMapValues
let raw: [String: String] = ["age": "30", "name": "Alice", "score": "invalid"]
let ints: [String: Int] = raw.compactMapValues { Int($0) }
// ["age": 30]
```

### Set

Sets are unordered collections of unique elements.

```swift
var tags: Set<String> = ["swift", "ios", "concurrency"]

// Set operations
let backendTags: Set = ["swift", "vapor", "linux"]
let commonTags = tags.intersection(backendTags)      // {"swift"}
let allTags = tags.union(backendTags)                 // {"swift","ios","concurrency","vapor","linux"}
let iosOnly = tags.subtracting(backendTags)           // {"ios","concurrency"}
let exclusive = tags.symmetricDifference(backendTags) // {"ios","concurrency","vapor","linux"}

// Membership
tags.contains("swift")   // true
tags.isSubset(of: allTags) // true
tags.isDisjoint(with: ["python", "rust"]) // true

// Insert returns a tuple indicating if the element was new
let (inserted, memberAfterInsert) = tags.insert("swift")
// inserted: false, memberAfterInsert: "swift"
```

---

## String and Character

### Unicode-Correct String Handling

```swift
let greeting = "Hello, World!"
let emoji = "Hello 🌍"
let flag = "🇺🇸"  // Two Unicode scalars

// String is a collection of Character
greeting.count          // 13
emoji.count             // 7 (emoji counts as 1 Character)
flag.unicodeScalars.count // 2 (regional indicator symbols)

// Indexing — String.Index, NOT Int
let start = greeting.startIndex
let fifth = greeting.index(start, offsetBy: 4)
let char = greeting[fifth] // "o"

// Substrings — share storage with the original string
let sub = greeting[greeting.startIndex..<fifth] // "Hell"
let word = greeting.prefix(5)                    // "Hello" (Substring)
let owned = String(word)                         // Convert to independent String

// String building
var builder = ""
builder.append("Hello")
builder.append(contentsOf: " World")
builder += "!"

// Multi-line strings
let json = """
    {
        "name": "Alice",
        "age": 30
    }
    """

// String interpolation with custom types
struct Temperature: CustomStringConvertible {
    let celsius: Double
    var description: String { "\(celsius)C" }
}
let temp = Temperature(celsius: 22.5)
print("Current temp: \(temp)") // "Current temp: 22.5C"
```

### String Processing and Manipulation

```swift
// Splitting
let csv = "apple,banana,cherry"
let fruits = csv.split(separator: ",")           // [Substring]
let fruitStrings = csv.split(separator: ",").map(String.init)

// Searching
let sentence = "The quick brown fox jumps over the lazy dog"
sentence.contains("fox")                     // true
sentence.hasPrefix("The")                    // true
sentence.hasSuffix("dog")                    // true
sentence.range(of: "brown")                  // Optional Range

// Replacing
let cleaned = sentence.replacing("fox", with: "cat")
let noSpaces = sentence.replacingOccurrences(of: " ", with: "-")

// Case operations
"hello".uppercased()          // "HELLO"
"HELLO".lowercased()          // "hello"
"hello world".capitalized     // "Hello World"

// Trimming
let padded = "  hello  "
let trimmed = padded.trimmingCharacters(in: .whitespaces) // "hello"

// Character classification
let ch: Character = "A"
ch.isLetter      // true
ch.isNumber      // false
ch.isUppercase   // true
ch.isWhitespace  // false
ch.isASCII       // true
```

---

## Codable

### Basic Encoding/Decoding

```swift
struct User: Codable {
    let id: Int
    let name: String
    let email: String
    let createdAt: Date
}

// Encoding to JSON
let user = User(id: 1, name: "Alice", email: "alice@example.com", createdAt: Date())
let encoder = JSONEncoder()
encoder.dateEncodingStrategy = .iso8601
encoder.keyEncodingStrategy = .convertToSnakeCase
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]

let jsonData = try encoder.encode(user)
let jsonString = String(data: jsonData, encoding: .utf8)!

// Decoding from JSON
let decoder = JSONDecoder()
decoder.dateDecodingStrategy = .iso8601
decoder.keyDecodingStrategy = .convertFromSnakeCase

let decoded = try decoder.decode(User.self, from: jsonData)
```

### Custom Coding Keys

```swift
struct APIUser: Codable {
    let id: Int
    let fullName: String
    let emailAddress: String
    let avatarURL: URL

    enum CodingKeys: String, CodingKey {
        case id
        case fullName = "full_name"
        case emailAddress = "email"
        case avatarURL = "avatar_url"
    }
}
```

### Custom Encoding/Decoding Logic

```swift
struct Event: Codable {
    let name: String
    let date: Date
    let attendees: [String]
    let metadata: [String: AnyCodableValue]

    enum CodingKeys: String, CodingKey {
        case name, date, attendees, metadata
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        name = try container.decode(String.self, forKey: .name)
        attendees = try container.decodeIfPresent([String].self, forKey: .attendees) ?? []

        // Custom date parsing — try multiple formats
        let dateString = try container.decode(String.self, forKey: .date)
        if let date = ISO8601DateFormatter().date(from: dateString) {
            self.date = date
        } else if let date = Self.fallbackFormatter.date(from: dateString) {
            self.date = date
        } else {
            throw DecodingError.dataCorruptedError(
                forKey: .date, in: container,
                debugDescription: "Cannot parse date: \(dateString)"
            )
        }

        metadata = try container.decodeIfPresent([String: AnyCodableValue].self, forKey: .metadata) ?? [:]
    }

    private static let fallbackFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()
}
```

### Nested Containers

```swift
struct Coordinate: Codable {
    let latitude: Double
    let longitude: Double

    // JSON: { "location": { "lat": 37.7, "lng": -122.4 } }
    enum CodingKeys: String, CodingKey {
        case location
    }

    enum LocationKeys: String, CodingKey {
        case latitude = "lat"
        case longitude = "lng"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let location = try container.nestedContainer(keyedBy: LocationKeys.self, forKey: .location)
        latitude = try location.decode(Double.self, forKey: .latitude)
        longitude = try location.decode(Double.self, forKey: .longitude)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        var location = container.nestedContainer(keyedBy: LocationKeys.self, forKey: .location)
        try location.encode(latitude, forKey: .latitude)
        try location.encode(longitude, forKey: .longitude)
    }
}
```

---

## Result Type and Error Handling

### Result Type

```swift
enum ValidationError: Error {
    case tooShort(minimum: Int)
    case tooLong(maximum: Int)
    case invalidCharacters
}

func validate(username: String) -> Result<String, ValidationError> {
    guard username.count >= 3 else {
        return .failure(.tooShort(minimum: 3))
    }
    guard username.count <= 20 else {
        return .failure(.tooLong(maximum: 20))
    }
    guard username.allSatisfy({ $0.isLetter || $0.isNumber }) else {
        return .failure(.invalidCharacters)
    }
    return .success(username)
}

// Using Result
let result = validate(username: "alice123")

switch result {
case .success(let name):
    print("Valid: \(name)")
case .failure(let error):
    print("Invalid: \(error)")
}

// Result transformation
let uppercased = result.map { $0.uppercased() }
let length = result.flatMap { name -> Result<Int, ValidationError> in
    .success(name.count)
}

// Convert Result to throwing
let name = try result.get()
```

### Error Handling Patterns

```swift
// do/catch with pattern matching
do {
    let data = try await fetchData()
} catch let error as URLError where error.code == .notConnectedToInternet {
    showOfflineMessage()
} catch let error as DecodingError {
    logDecodingError(error)
} catch {
    showGenericError(error)
}

// Typed throws (Swift 5.9+)
func parse(data: Data) throws(ParseError) -> Document {
    guard let string = String(data: data, encoding: .utf8) else {
        throw .invalidEncoding
    }
    return try parseString(string)
}

// rethrows — function throws only if its closure throws
func retry<T>(times: Int, task: () throws -> T) rethrows -> T {
    for attempt in 1..<times {
        do {
            return try task()
        } catch {
            print("Attempt \(attempt) failed")
        }
    }
    return try task() // Last attempt throws to caller
}

// try? for optional conversion
let data = try? JSONEncoder().encode(user) // Data?

// try! when failure is a programmer error
let url = URL(string: "https://apple.com")! // Known-good URL
```

---

## Core Protocol Conformances

### Comparable

```swift
struct Version: Comparable {
    let major: Int
    let minor: Int
    let patch: Int

    static func < (lhs: Version, rhs: Version) -> Bool {
        (lhs.major, lhs.minor, lhs.patch) < (rhs.major, rhs.minor, rhs.patch)
    }
}

let versions = [Version(major: 2, minor: 0, patch: 1), Version(major: 1, minor: 5, patch: 0)]
let sorted = versions.sorted() // 1.5.0, 2.0.1
let latest = versions.max()     // 2.0.1
```

### Hashable

```swift
struct Coordinate: Hashable {
    let x: Int
    let y: Int

    // Auto-synthesized for structs with all Hashable properties
    // Custom implementation when needed:
    func hash(into hasher: inout Hasher) {
        hasher.combine(x)
        hasher.combine(y)
    }
}

// Use as Dictionary key or Set element
var visited: Set<Coordinate> = []
visited.insert(Coordinate(x: 0, y: 0))

var labels: [Coordinate: String] = [:]
labels[Coordinate(x: 1, y: 2)] = "Start"
```

### Identifiable

```swift
struct TodoItem: Identifiable {
    let id: UUID  // Satisfies Identifiable requirement
    var title: String
    var isCompleted: Bool
}

// Identifiable enables ForEach without explicit id parameter
struct TodoListView: View {
    let items: [TodoItem]

    var body: some View {
        List {
            ForEach(items) { item in  // No need for `id: \.id`
                Text(item.title)
            }
        }
    }
}
```

---

## Sequence and Collection Protocol Hierarchy

The protocol hierarchy from most abstract to most capable:

```
Sequence
  -> Collection (indexable, multi-pass)
    -> BidirectionalCollection (backward traversal)
      -> RandomAccessCollection (O(1) index distance)
        -> MutableCollection (subscript set)
          -> RangeReplaceableCollection (insert/remove)
```

```swift
// Conforming to Sequence
struct Countdown: Sequence, IteratorProtocol {
    var count: Int

    mutating func next() -> Int? {
        guard count > 0 else { return nil }
        defer { count -= 1 }
        return count
    }
}

for i in Countdown(count: 5) {
    print(i) // 5, 4, 3, 2, 1
}

// Extending Collection
extension Collection where Element: Numeric {
    var sum: Element { reduce(0, +) }
}

extension RandomAccessCollection {
    var middle: Element? {
        guard !isEmpty else { return nil }
        let midIndex = index(startIndex, offsetBy: count / 2)
        return self[midIndex]
    }
}
```

---

## Lazy Sequences and Functional Programming

### Lazy Evaluation

Lazy sequences defer computation until elements are actually accessed, avoiding intermediate array allocations.

```swift
let numbers = Array(1...1_000_000)

// Eager — creates two intermediate arrays
let eagerResult = numbers
    .filter { $0.isMultiple(of: 3) }
    .map { $0 * $0 }
    .prefix(5)

// Lazy — processes elements on demand, no intermediate arrays
let lazyResult = numbers.lazy
    .filter { $0.isMultiple(of: 3) }
    .map { $0 * $0 }
    .prefix(5)

let array = Array(lazyResult) // [9, 36, 81, 144, 225]
```

### Higher-Order Functions

```swift
let items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// map — transform each element
let doubled = items.map { $0 * 2 }                    // [2,4,6,8,10,12,14,16,18,20]

// filter — keep elements matching predicate
let evens = items.filter { $0.isMultiple(of: 2) }     // [2,4,6,8,10]

// reduce — accumulate into single value
let sum = items.reduce(0, +)                            // 55
let product = items.reduce(1, *)                        // 3628800

// reduce(into:) — more efficient for collections
let frequency = "mississippi".reduce(into: [:]) { counts, char in
    counts[char, default: 0] += 1
}
// ["m": 1, "i": 4, "s": 4, "p": 2]

// flatMap — transform and flatten
let nested = [[1, 2], [3, 4], [5]]
let flat = nested.flatMap { $0 }                        // [1, 2, 3, 4, 5]

// compactMap — transform and remove nils
let strings = ["1", "two", "3", "four", "5"]
let ints = strings.compactMap { Int($0) }               // [1, 3, 5]

// Chaining operations
struct Order {
    let items: [OrderItem]
    let status: Status
    enum Status { case pending, shipped, delivered }
}

let totalPendingValue = orders
    .filter { $0.status == .pending }
    .flatMap { $0.items }
    .reduce(0.0) { $0 + $1.price * Double($1.quantity) }

// zip — combine two sequences element-wise
let names = ["Alice", "Bob", "Charlie"]
let scores = [95, 87, 92]
let leaderboard = zip(names, scores).map { "\($0): \($1)" }
// ["Alice: 95", "Bob: 87", "Charlie: 92"]

// enumerated — pair elements with their index
for (index, name) in names.enumerated() {
    print("\(index + 1). \(name)")
}
```

---

## Regular Expressions

### Regex Literals (Swift 5.7+)

```swift
// Regex literal syntax
let emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
let input = "Contact us at support@example.com or sales@example.com"

// First match
if let match = input.firstMatch(of: emailPattern) {
    print(match.output) // "support@example.com"
}

// All matches
let emails = input.matches(of: emailPattern).map { String($0.output) }
// ["support@example.com", "sales@example.com"]

// Named captures
let datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/
if let match = "2025-03-30".firstMatch(of: datePattern) {
    print(match.year)  // "2025"
    print(match.month) // "03"
    print(match.day)   // "30"
}

// Replacing
let redacted = input.replacing(emailPattern, with: "[REDACTED]")

// Splitting
let parts = "one::two:::three".split(separator: /:{2,}/)
// ["one", "two", "three"]
```

### RegexBuilder DSL

```swift
import RegexBuilder

// Type-safe regex building
let amountRegex = Regex {
    "$"
    Capture {
        OneOrMore(.digit)
        Optionally {
            "."
            Repeat(.digit, count: 2)
        }
    } transform: { Double($0)! }
}

if let match = "Total: $42.99".firstMatch(of: amountRegex) {
    let amount: Double = match.1 // 42.99 — already typed as Double
}

// Complex patterns with RegexBuilder
let logPattern = Regex {
    Capture { .date(.iso8601) }         // Timestamp
    One(.whitespace)
    "["
    Capture {                            // Log level
        ChoiceOf {
            "INFO"
            "WARN"
            "ERROR"
        }
    }
    "] "
    Capture { OneOrMore(.any) }          // Message
}

let logLine = "2025-03-30T10:30:00Z [ERROR] Connection timeout"
if let match = logLine.firstMatch(of: logPattern) {
    let (_, date, level, message) = match.output
}
```

---

## Clock, Duration, and Instant (Swift 5.7+)

### Duration

```swift
// Duration represents a time interval with attosecond precision
let fiveSeconds: Duration = .seconds(5)
let halfSecond: Duration = .milliseconds(500)
let tiny: Duration = .microseconds(100)
let tinier: Duration = .nanoseconds(50)

// Arithmetic
let total = fiveSeconds + halfSecond  // 5.5 seconds
let doubled = fiveSeconds * 2         // 10 seconds

// Comparison
if halfSecond < fiveSeconds {
    print("Half second is shorter")
}
```

### Clock Protocol and ContinuousClock

```swift
// ContinuousClock — ticks even when the device sleeps
let clock = ContinuousClock()

// Measuring elapsed time
let elapsed = await clock.measure {
    try? await Task.sleep(for: .seconds(2))
}
print("Elapsed: \(elapsed)") // ~2 seconds

// SuspendingClock — pauses when the device sleeps (default for Task.sleep)
let suspending = SuspendingClock()
try await suspending.sleep(for: .seconds(1))

// Task.sleep uses SuspendingClock by default
try await Task.sleep(for: .seconds(1))

// Using a specific clock
try await Task.sleep(until: .now + .seconds(5), clock: .continuous)
```

### Benchmarking with Clock

```swift
func benchmark<C: Clock>(
    clock: C = ContinuousClock(),
    operation: () async throws -> Void
) async rethrows -> C.Duration {
    let start = clock.now
    try await operation()
    return clock.now - start
}

let duration = await benchmark {
    let _ = try await fetchLargeDataset()
}
print("Fetch took: \(duration)")

// Multiple measurements
func averageDuration(
    iterations: Int = 10,
    operation: () async throws -> Void
) async rethrows -> Duration {
    let clock = ContinuousClock()
    var total: Duration = .zero

    for _ in 0..<iterations {
        let elapsed = await clock.measure {
            try? await operation()
        }
        total += elapsed
    }

    return total / iterations
}
```

---

## Summary: Quick Reference

| Category | Key Types/Functions |
|---|---|
| Arrays | `append`, `insert`, `remove`, `sort`, `filter`, `map`, `prefix`, `suffix` |
| Dictionaries | `merge`, `mapValues`, `compactMapValues`, `Dictionary(grouping:)` |
| Sets | `intersection`, `union`, `subtracting`, `symmetricDifference` |
| Strings | `split`, `contains`, `hasPrefix`, `replacing`, `trimmingCharacters` |
| Codable | `JSONEncoder`, `JSONDecoder`, `CodingKeys`, `nestedContainer` |
| Error Handling | `Result`, `do/catch`, `try?`, `try!`, `rethrows`, typed throws |
| Functional | `map`, `filter`, `reduce`, `flatMap`, `compactMap`, `lazy` |
| Regex | `/pattern/`, `RegexBuilder`, `firstMatch`, `matches`, `replacing` |
| Time | `Duration`, `ContinuousClock`, `SuspendingClock`, `clock.measure` |
