# Swift Language Reference (5.9+)

Comprehensive reference for Swift language features, type system, and advanced patterns used in modern iOS/macOS development.

---

## Value Types vs Reference Types

Swift distinguishes between value types (copied on assignment) and reference types (shared via reference).

### Structs (Value Type)

Structs are the preferred default type in Swift. They are stack-allocated when possible and automatically gain memberwise initializers.

```swift
struct Point {
    var x: Double
    var y: Double

    // Mutating methods required to modify self
    mutating func translate(dx: Double, dy: Double) {
        x += dx
        y += dy
    }

    // Computed property
    var magnitude: Double {
        (x * x + y * y).squareRoot()
    }
}

var a = Point(x: 1, y: 2)
var b = a          // b is an independent copy
b.x = 99
// a.x is still 1 — value semantics
```

### Classes (Reference Type)

Classes support inheritance, reference identity checks (`===`), and deinitializers.

```swift
class Vehicle {
    var speed: Double
    let identifier: String

    init(speed: Double, identifier: String) {
        self.speed = speed
        self.identifier = identifier
    }

    deinit {
        print("\(identifier) deallocated")
    }

    func accelerate(by amount: Double) {
        speed += amount
    }
}

class ElectricCar: Vehicle {
    var batteryLevel: Double = 100.0

    override func accelerate(by amount: Double) {
        super.accelerate(by: amount)
        batteryLevel -= amount * 0.1
    }
}

let car1 = ElectricCar(speed: 0, identifier: "Tesla")
let car2 = car1     // car2 points to the SAME object
car2.speed = 60
// car1.speed is also 60 — reference semantics
print(car1 === car2) // true
```

### Enums (Value Type)

Enums in Swift are powerful: they support associated values, raw values, computed properties, methods, and protocol conformance.

```swift
enum NetworkError: Error, LocalizedError {
    case timeout(seconds: Int)
    case serverError(statusCode: Int, message: String)
    case noConnection
    case decodingFailed(underlying: Error)

    var errorDescription: String? {
        switch self {
        case .timeout(let seconds):
            return "Request timed out after \(seconds)s"
        case .serverError(let code, let message):
            return "Server error \(code): \(message)"
        case .noConnection:
            return "No internet connection"
        case .decodingFailed(let error):
            return "Decoding failed: \(error.localizedDescription)"
        }
    }
}

// Enum with raw values
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
}

// Recursive enums
indirect enum ArithmeticExpression {
    case number(Int)
    case addition(ArithmeticExpression, ArithmeticExpression)
    case multiplication(ArithmeticExpression, ArithmeticExpression)

    func evaluate() -> Int {
        switch self {
        case .number(let value):
            return value
        case .addition(let left, let right):
            return left.evaluate() + right.evaluate()
        case .multiplication(let left, let right):
            return left.evaluate() * right.evaluate()
        }
    }
}
```

### Actors (Reference Type, Concurrency-Safe)

Actors protect mutable state from data races. All access to actor properties from outside is `async`.

```swift
actor BankAccount {
    let id: UUID
    private(set) var balance: Double

    init(id: UUID, initialBalance: Double) {
        self.id = id
        self.balance = initialBalance
    }

    func deposit(_ amount: Double) {
        balance += amount
    }

    func withdraw(_ amount: Double) throws -> Double {
        guard balance >= amount else {
            throw BankError.insufficientFunds
        }
        balance -= amount
        return amount
    }

    // nonisolated — can be called synchronously, no access to mutable state
    nonisolated var description: String {
        "Account \(id)"
    }
}

// External access requires await
let account = BankAccount(id: UUID(), initialBalance: 1000)
let currentBalance = await account.balance
```

---

## Protocols and Protocol-Oriented Programming

### Basic Protocols

```swift
protocol Drawable {
    var boundingBox: CGRect { get }
    func draw(in context: CGContext)
}

protocol Resizable: Drawable {
    mutating func resize(to size: CGSize)
}
```

### Associated Types

Associated types make protocols generic. The conforming type chooses the concrete type.

```swift
protocol Repository {
    associatedtype Entity: Identifiable
    associatedtype Failure: Error

    func fetch(id: Entity.ID) async throws -> Entity
    func fetchAll() async throws -> [Entity]
    func save(_ entity: Entity) async throws
    func delete(id: Entity.ID) async throws
}

struct UserRepository: Repository {
    typealias Entity = User       // Compiler can often infer this
    typealias Failure = APIError

    func fetch(id: User.ID) async throws -> User { /* ... */ }
    func fetchAll() async throws -> [User] { /* ... */ }
    func save(_ entity: User) async throws { /* ... */ }
    func delete(id: User.ID) async throws { /* ... */ }
}
```

### Primary Associated Types (Swift 5.7+)

Primary associated types allow lightweight constrained existentials.

```swift
protocol Collection<Element>: Sequence {
    associatedtype Element
    associatedtype Index: Comparable
    // ...
}

// Use primary associated type for constraints
func processItems(_ items: some Collection<String>) {
    for item in items {
        print(item.uppercased())
    }
}

// Existential with primary associated type
func storeCollection(_ items: any Collection<Int>) {
    // items is type-erased but element type is known
}
```

### some vs any (Opaque and Existential Types)

```swift
// `some` — opaque type: caller doesn't see the concrete type, but it is fixed
func makeShape() -> some Shape {
    Circle() // Always returns the same concrete type
}

// `any` — existential type: can hold any conforming type, with runtime overhead
func processShapes(_ shapes: [any Shape]) {
    for shape in shapes {
        print(shape.area)
    }
}

// Use `some` for parameters when you want generic behavior without writing <T>
func draw(_ shape: some Shape) {
    // shape is a fixed concrete type — no boxing overhead
}

// Use `any` when you need heterogeneous collections
var shapes: [any Shape] = [Circle(), Rectangle(), Triangle()]
```

---

## Generics

### Basic Constraints and Where Clauses

```swift
func findIndex<T: Equatable>(of value: T, in array: [T]) -> Int? {
    for (index, element) in array.enumerated() {
        if element == value {
            return index
        }
    }
    return nil
}

// Multiple constraints with where clause
func merge<C1: Collection, C2: Collection>(
    _ first: C1,
    _ second: C2
) -> [C1.Element] where C1.Element == C2.Element, C1.Element: Comparable {
    (Array(first) + Array(second)).sorted()
}
```

### Parameter Packs (Swift 5.9+)

Parameter packs enable variadic generics, allowing functions and types to accept an arbitrary number of type parameters.

```swift
// each T is a type pack — it represents zero or more types
func allEqual<each T: Equatable>(_ value: repeat each T, to other: repeat each T) -> Bool {
    // repeat applies an expression to each element in the pack
    func check<V: Equatable>(_ a: V, _ b: V) -> Bool { a == b }

    // Fold over the pack
    var result = true
    repeat result = result && check(each value, each other)
    return result
}

// Tuple-like generic storage
struct Pair<each T> {
    var values: (repeat each T)

    init(_ values: repeat each T) {
        self.values = (repeat each values)
    }
}

let pair = Pair(1, "hello", true) // Pair<Int, String, Bool>
```

### Opaque Return Types

```swift
protocol Animal {
    var name: String { get }
    func speak() -> String
}

struct Dog: Animal {
    var name: String
    func speak() -> String { "Woof!" }
}

// The compiler knows the concrete type, but the caller only sees Animal
func makePet() -> some Animal {
    Dog(name: "Rex")
}

// Opaque type in property
var defaultAnimal: some Animal {
    Dog(name: "Buddy")
}
```

---

## Property Wrappers

Property wrappers encapsulate storage and access patterns for properties.

### Built-in SwiftUI Property Wrappers

```swift
struct CounterView: View {
    @State private var count = 0           // Local mutable state
    @Binding var isPresented: Bool          // Two-way binding to parent state
    @Environment(\.colorScheme) var scheme  // Read from environment
    @StateObject var viewModel = VM()       // Owns an ObservableObject
    @ObservedObject var externalVM: VM      // Observes external ObservableObject
    @AppStorage("username") var name = ""   // Persisted to UserDefaults

    var body: some View {
        Text("\(count)")
    }
}
```

### Custom Property Wrappers

```swift
@propertyWrapper
struct Clamped<Value: Comparable> {
    private var value: Value
    let range: ClosedRange<Value>

    var wrappedValue: Value {
        get { value }
        set { value = min(max(newValue, range.lowerBound), range.upperBound) }
    }

    /// projectedValue provides access via $property syntax
    var projectedValue: ClosedRange<Value> {
        range
    }

    init(wrappedValue: Value, _ range: ClosedRange<Value>) {
        self.range = range
        self.value = min(max(wrappedValue, range.lowerBound), range.upperBound)
    }
}

struct Player {
    @Clamped(0...100) var health: Int = 100
    @Clamped(0...999) var score: Int = 0
}

var player = Player()
player.health = 150   // Clamped to 100
print(player.$health) // 0...100 (the projected range)
```

### Property Wrapper with Projected Value (Combine-Style)

```swift
@propertyWrapper
struct Published<Value> {
    private var value: Value
    private let subject = PassthroughSubject<Value, Never>()

    var wrappedValue: Value {
        get { value }
        set {
            value = newValue
            subject.send(newValue)
        }
    }

    var projectedValue: AnyPublisher<Value, Never> {
        subject.eraseToAnyPublisher()
    }

    init(wrappedValue: Value) {
        self.value = wrappedValue
    }
}
```

---

## Result Builders

Result builders enable DSL-like syntax. SwiftUI's `@ViewBuilder` is the most prominent example.

### Understanding @ViewBuilder

```swift
// @ViewBuilder allows writing multiple views in a closure
struct CardView<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading) {
            Text(title).font(.headline)
            content()
        }
        .padding()
        .background(.regularMaterial)
        .cornerRadius(12)
    }
}

// Usage — each line is a separate view composed by the builder
CardView(title: "Profile") {
    Text("Name: Jane")
    Text("Role: Engineer")
    if showDetails {
        Text("Department: iOS")
    }
}
```

### Custom Result Builder

```swift
@resultBuilder
struct HTMLBuilder {
    static func buildBlock(_ components: String...) -> String {
        components.joined(separator: "\n")
    }

    static func buildOptional(_ component: String?) -> String {
        component ?? ""
    }

    static func buildEither(first component: String) -> String {
        component
    }

    static func buildEither(second component: String) -> String {
        component
    }

    static func buildArray(_ components: [String]) -> String {
        components.joined(separator: "\n")
    }
}

func html(@HTMLBuilder content: () -> String) -> String {
    "<html>\n\(content())\n</html>"
}

let page = html {
    "<head><title>Hello</title></head>"
    "<body>"
    for item in ["Apple", "Banana"] {
        "<li>\(item)</li>"
    }
    "</body>"
}
```

---

## Macros (Swift 5.9+)

Macros generate code at compile time and are expanded by the compiler.

### Freestanding Macros (#)

```swift
// #Preview — generates preview provider code
#Preview("Login Screen") {
    LoginView()
        .environment(AuthManager())
}

#Preview("Dark Mode", traits: .portrait) {
    LoginView()
        .preferredColorScheme(.dark)
}

// #warning and #error — compile-time diagnostics
#warning("TODO: implement caching layer")

// #stringify — example from standard library proposals
let (result, code) = #stringify(2 + 3) // (5, "2 + 3")
```

### Attached Macros (@)

```swift
// @Observable (Swift 5.9+) — replaces ObservableObject/Published pattern
@Observable
class UserStore {
    var users: [User] = []        // Automatically observed
    var isLoading = false          // Automatically observed
    var selectedUser: User? = nil  // Automatically observed

    // The macro generates observation tracking code at compile time
    // No need for @Published or ObservableObject conformance
}

// Usage in SwiftUI — no @ObservedObject needed
struct UserListView: View {
    var store: UserStore  // Plain property, observation is automatic

    var body: some View {
        List(store.users) { user in
            Text(user.name)
        }
    }
}

// @Model (SwiftData) — generates persistence code
@Model
class Recipe {
    var title: String
    var ingredients: [String]
    var cookingTime: TimeInterval
    @Relationship(deleteRule: .cascade) var steps: [Step]

    init(title: String, ingredients: [String], cookingTime: TimeInterval) {
        self.title = title
        self.ingredients = ingredients
        self.cookingTime = cookingTime
    }
}

// @Entry — for EnvironmentValues, FocusValues, etc.
extension EnvironmentValues {
    @Entry var accentStyle: AccentStyle = .default
}
```

---

## Pattern Matching

Swift's pattern matching is deeply integrated into `switch`, `if`, `guard`, and `for` statements.

### Switch Exhaustiveness and Value Binding

```swift
enum APIResponse {
    case success(data: Data, statusCode: Int)
    case failure(error: Error, retryAfter: TimeInterval?)
    case cached(data: Data, age: TimeInterval)
}

func handle(_ response: APIResponse) {
    switch response {
    case .success(let data, let code) where code == 200:
        processData(data)
    case .success(_, let code) where (201...299).contains(code):
        print("Success with code \(code)")
    case .failure(let error, let retry?) where retry < 60:
        scheduleRetry(after: retry, for: error)
    case .failure(let error, _):
        showError(error)
    case .cached(let data, let age) where age < 300:
        processData(data)
    case .cached:
        refreshData()
    }
}
```

### if case and guard case

```swift
let value: Result<User, Error> = .success(User(name: "Alice"))

// if case — pattern match in an if statement
if case .success(let user) = value {
    print("Got user: \(user.name)")
}

// guard case — early exit if pattern doesn't match
func processResult(_ result: Result<[Item], Error>) {
    guard case .success(let items) = result, !items.isEmpty else {
        print("No items or error")
        return
    }
    display(items)
}

// for case — filter and destructure in a loop
let responses: [APIResponse] = fetchAll()
for case .success(let data, 200) in responses {
    processData(data) // Only 200 successes
}
```

### Custom Pattern Matching (~= Operator)

```swift
// The ~= operator powers pattern matching in switch/case
struct HTTPStatusRange {
    let range: ClosedRange<Int>

    static func ~= (pattern: HTTPStatusRange, value: Int) -> Bool {
        pattern.range.contains(value)
    }
}

let success = HTTPStatusRange(range: 200...299)
let clientError = HTTPStatusRange(range: 400...499)
let serverError = HTTPStatusRange(range: 500...599)

let statusCode = 404
switch statusCode {
case success:     print("OK")
case clientError: print("Client error")
case serverError: print("Server error")
default:          print("Unknown")
}
```

---

## Access Control

Swift has six access levels, ordered from most to least restrictive:

| Level | Scope |
|---|---|
| `private` | Enclosing declaration only (plus extensions in same file) |
| `fileprivate` | Entire source file |
| `internal` | Entire module (default) |
| `package` | Entire package (Swift 5.9+) |
| `public` | Any importing module (cannot subclass/override) |
| `open` | Any importing module (can subclass and override) |

```swift
// package access — visible within the same Swift package
package struct NetworkConfiguration {
    package var baseURL: URL
    package var timeout: TimeInterval

    // internal init — only accessible within this module
    init(baseURL: URL, timeout: TimeInterval = 30) {
        self.baseURL = baseURL
        self.timeout = timeout
    }
}

// open vs public
open class BaseTheme {
    open func primaryColor() -> Color { .blue }   // Can override in other modules
    public func spacing() -> CGFloat { 16 }        // Cannot override in other modules
}

// private(set) — readable externally, writable only internally
public struct Score {
    public private(set) var value: Int = 0

    public mutating func increment() {
        value += 1
    }
}
```

---

## Key Paths

Key paths are type-safe references to properties that can be stored, passed, and applied later.

```swift
struct User {
    var name: String
    var email: String
    var age: Int
}

// Key path expressions
let namePath: KeyPath<User, String> = \.name
let agePath: WritableKeyPath<User, Int> = \.age

var user = User(name: "Alice", email: "alice@example.com", age: 30)
print(user[keyPath: namePath])  // "Alice"
user[keyPath: agePath] = 31    // WritableKeyPath allows mutation

// Key paths as closures — can be used anywhere (T) -> Value is expected
let names = [user].map(\.name)        // ["Alice"]
let sorted = users.sorted(by: \.age)  // Uses key path in sort
let emails = users.filter(\.email.isEmpty.negated) // Chain key paths

// Key paths with higher-order functions
func extract<T, V>(_ keyPath: KeyPath<T, V>) -> (T) -> V {
    { $0[keyPath: keyPath] }
}

let getName = extract(\User.name)
print(getName(user)) // "Alice"

// Key paths in SwiftUI
struct UserRow: View {
    let user: User

    var body: some View {
        LabeledContent("Name", value: user.name)
    }
}

// ForEach with key path for id
ForEach(users, id: \.email) { user in
    UserRow(user: user)
}
```

---

## Extensions and Conditional Conformance

### Extensions

Extensions add new functionality to existing types without subclassing.

```swift
extension String {
    var isValidEmail: Bool {
        let pattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/
        return self.wholeMatch(of: pattern) != nil
    }

    func truncated(to length: Int, trailing: String = "...") -> String {
        if count <= length { return self }
        return String(prefix(length)) + trailing
    }
}

// Extension with generic constraints
extension Array where Element: Numeric {
    var sum: Element {
        reduce(0, +)
    }

    var average: Double where Element: BinaryInteger {
        guard !isEmpty else { return 0 }
        return Double(sum) / Double(count)
    }
}

print([1, 2, 3, 4].sum)      // 10
print([1, 2, 3, 4].average)  // 2.5
```

### Conditional Conformance

A generic type conforms to a protocol only when its type parameters meet specific constraints.

```swift
// Array is Equatable only when its elements are Equatable
extension Array: Equatable where Element: Equatable {}

// Custom example
struct Container<Value> {
    let value: Value
}

extension Container: Equatable where Value: Equatable {
    static func == (lhs: Container, rhs: Container) -> Bool {
        lhs.value == rhs.value
    }
}

extension Container: Hashable where Value: Hashable {
    func hash(into hasher: inout Hasher) {
        hasher.combine(value)
    }
}

extension Container: Codable where Value: Codable {
    // Automatically synthesized when Value is Codable
}

extension Container: Sendable where Value: Sendable {}

// Conditional conformance in protocol extensions
extension Collection where Element: CustomStringConvertible {
    var commaSeparated: String {
        map(\.description).joined(separator: ", ")
    }
}

print([1, 2, 3].commaSeparated)       // "1, 2, 3"
print(["a", "b", "c"].commaSeparated)  // "a, b, c"
```

---

## Summary: When to Use What

| Feature | Use When |
|---|---|
| `struct` | Default choice for data types; value semantics needed |
| `class` | Inheritance, reference identity, or Objective-C interop needed |
| `enum` | Modeling a closed set of states or variants |
| `actor` | Protecting mutable state from concurrent access |
| `some T` | Fixed concrete type, maximum performance, function returns |
| `any T` | Heterogeneous collections, dynamic dispatch needed |
| Property wrapper | Reusable storage/access pattern across multiple properties |
| Result builder | DSL-like syntax for composing values declaratively |
| Macro | Compile-time code generation, boilerplate elimination |
