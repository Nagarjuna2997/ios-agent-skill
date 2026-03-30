# Combine Framework

## Publishers

```swift
import Combine

// Just — emits a single value then completes
let justPublisher = Just(42)
    .sink { value in print(value) } // 42

// Future — wraps an async operation into a single-value publisher
func fetchUser(id: Int) -> Future<User, Error> {
    Future { promise in
        APIClient.shared.getUser(id: id) { result in
            switch result {
            case .success(let user):
                promise(.success(user))
            case .failure(let error):
                promise(.failure(error))
            }
        }
    }
}

// PassthroughSubject — manually send values, no initial value
let eventBus = PassthroughSubject<AppEvent, Never>()
eventBus.send(.userLoggedIn)
eventBus.send(.cartUpdated(itemCount: 3))
eventBus.send(completion: .finished)

// CurrentValueSubject — like PassthroughSubject but holds current value
let isLoading = CurrentValueSubject<Bool, Never>(false)
print(isLoading.value) // false
isLoading.send(true)
print(isLoading.value) // true

// Published property wrapper
class ViewModel: ObservableObject {
    @Published var searchText = ""
    @Published var results: [SearchResult] = []
    @Published var isLoading = false
}
```

## Subscribers

```swift
let publisher = [1, 2, 3, 4, 5].publisher

// sink — handle values and completion
let cancellable = publisher
    .sink(
        receiveCompletion: { completion in
            switch completion {
            case .finished:
                print("Done")
            case .failure(let error):
                print("Error: \(error)")
            }
        },
        receiveValue: { value in
            print(value)
        }
    )

// assign — bind directly to a property (reference types only)
class Display: ObservableObject {
    @Published var text: String = ""
}

let display = Display()
let assignCancellable = Just("Hello")
    .assign(to: \.text, on: display)

// assign(to:) for @Published — no retain cycle risk
class CounterViewModel: ObservableObject {
    @Published var count: Int = 0
    private var cancellables = Set<AnyCancellable>()

    init() {
        Timer.publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .scan(0) { count, _ in count + 1 }
            .assign(to: &$count) // No cancellable needed
    }
}
```

## Operators

### Transforming

```swift
let numbers = [1, 2, 3, 4, 5].publisher
var cancellables = Set<AnyCancellable>()

// map — transform each value
numbers
    .map { $0 * 2 }
    .sink { print($0) } // 2, 4, 6, 8, 10
    .store(in: &cancellables)

// flatMap — flatten inner publishers
func fetchDetails(for id: Int) -> AnyPublisher<String, Never> {
    Just("Details for \(id)")
        .delay(for: .seconds(1), scheduler: RunLoop.main)
        .eraseToAnyPublisher()
}

[1, 2, 3].publisher
    .flatMap(maxPublishers: .max(2)) { id in
        fetchDetails(for: id)
    }
    .sink { print($0) }
    .store(in: &cancellables)

// compactMap — discard nil values
["1", "two", "3", "four"].publisher
    .compactMap { Int($0) }
    .sink { print($0) } // 1, 3
    .store(in: &cancellables)

// scan — accumulate values
numbers
    .scan(0, +)
    .sink { print($0) } // 1, 3, 6, 10, 15
    .store(in: &cancellables)
```

### Filtering

```swift
// filter
numbers
    .filter { $0.isMultiple(of: 2) }
    .sink { print($0) } // 2, 4
    .store(in: &cancellables)

// removeDuplicates
[1, 1, 2, 2, 3, 1].publisher
    .removeDuplicates()
    .sink { print($0) } // 1, 2, 3, 1
    .store(in: &cancellables)

// first, last
numbers.first().sink { print($0) } // 1
numbers.last().sink { print($0) }  // 5

// debounce — wait for pause in values (great for search)
$searchText
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .removeDuplicates()
    .sink { query in performSearch(query) }
    .store(in: &cancellables)

// throttle — emit at most once per interval
$scrollOffset
    .throttle(for: .milliseconds(100), scheduler: RunLoop.main, latest: true)
    .sink { offset in updateParallax(offset) }
    .store(in: &cancellables)
```

### Combining

```swift
let pub1 = PassthroughSubject<Int, Never>()
let pub2 = PassthroughSubject<String, Never>()

// merge — interleave values from publishers of same type
let pubA = PassthroughSubject<Int, Never>()
let pubB = PassthroughSubject<Int, Never>()

pubA.merge(with: pubB)
    .sink { print($0) }
    .store(in: &cancellables)

pubA.send(1) // 1
pubB.send(2) // 2
pubA.send(3) // 3

// combineLatest — emit tuple when any publisher emits
pub1.combineLatest(pub2)
    .sink { intVal, strVal in
        print("\(intVal), \(strVal)")
    }
    .store(in: &cancellables)

pub1.send(1)       // No output (pub2 hasn't emitted)
pub2.send("a")     // "1, a"
pub1.send(2)       // "2, a"
pub2.send("b")     // "2, b"

// zip — pair values one-to-one
pub1.zip(pub2)
    .sink { intVal, strVal in
        print("\(intVal), \(strVal)")
    }
    .store(in: &cancellables)

pub1.send(1)       // Waiting for pub2
pub2.send("x")     // "1, x"
pub1.send(2)       // Waiting for pub2
pub1.send(3)       // Still waiting
pub2.send("y")     // "2, y"
```

## Error Handling

```swift
enum APIError: Error {
    case networkError, decodingError, unauthorized
}

let apiPublisher = URLSession.shared.dataTaskPublisher(for: url)

// tryMap — transform with possible error
apiPublisher
    .tryMap { data, response in
        guard let http = response as? HTTPURLResponse else {
            throw APIError.networkError
        }
        guard http.statusCode == 200 else {
            throw http.statusCode == 401 ? APIError.unauthorized : APIError.networkError
        }
        return data
    }
    .decode(type: User.self, decoder: JSONDecoder())
    .catch { error -> Just<User> in
        print("Error: \(error)")
        return Just(User.placeholder)
    }
    .sink { user in print(user) }
    .store(in: &cancellables)

// retry — automatically retry on failure
URLSession.shared.dataTaskPublisher(for: url)
    .retry(3)
    .map(\.data)
    .decode(type: [Article].self, decoder: JSONDecoder())
    .replaceError(with: [])
    .receive(on: DispatchQueue.main)
    .sink { articles in self.articles = articles }
    .store(in: &cancellables)
```

## Scheduling

```swift
// receive(on:) — deliver downstream values on a specific scheduler
URLSession.shared.dataTaskPublisher(for: url)
    .map(\.data)
    .decode(type: User.self, decoder: JSONDecoder())
    .receive(on: DispatchQueue.main) // UI updates on main thread
    .sink(
        receiveCompletion: { _ in },
        receiveValue: { user in self.user = user }
    )
    .store(in: &cancellables)

// subscribe(on:) — perform subscription work on a specific scheduler
heavyPublisher
    .subscribe(on: DispatchQueue.global(qos: .background))
    .receive(on: DispatchQueue.main)
    .sink { result in updateUI(result) }
    .store(in: &cancellables)

// delay — add a time delay
Just("Hello")
    .delay(for: .seconds(2), scheduler: RunLoop.main)
    .sink { print($0) } // Prints after 2 seconds
    .store(in: &cancellables)
```

## AnyCancellable and Memory Management

```swift
class SearchViewModel: ObservableObject {
    @Published var query = ""
    @Published var results: [SearchResult] = []

    // Store all subscriptions — auto-cancelled on deinit
    private var cancellables = Set<AnyCancellable>()

    init() {
        // Pipeline: debounce search input, fetch results
        $query
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .filter { !$0.isEmpty }
            .flatMap { query in
                self.search(query: query)
                    .catch { _ in Just([]) }
            }
            .receive(on: DispatchQueue.main)
            .assign(to: &$results) // assign(to:) manages its own lifetime
    }

    private func search(query: String) -> AnyPublisher<[SearchResult], Error> {
        let url = URL(string: "https://api.example.com/search?q=\(query)")!
        return URLSession.shared.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: [SearchResult].self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
    }
}
```

## Integration with System Frameworks

```swift
// URLSession dataTaskPublisher
URLSession.shared.dataTaskPublisher(for: url)
    .map(\.data)
    .decode(type: Response.self, decoder: JSONDecoder())
    .eraseToAnyPublisher()

// NotificationCenter publisher
NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)
    .sink { _ in refreshData() }
    .store(in: &cancellables)

NotificationCenter.default.publisher(for: UIResponder.keyboardWillShowNotification)
    .compactMap { $0.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect }
    .sink { frame in adjustForKeyboard(frame) }
    .store(in: &cancellables)

// KVO publisher
player.publisher(for: \.rate)
    .sink { rate in
        isPlaying = rate > 0
    }
    .store(in: &cancellables)

// Timer publisher
Timer.publish(every: 60, on: .main, in: .common)
    .autoconnect()
    .sink { _ in checkForUpdates() }
    .store(in: &cancellables)
```
