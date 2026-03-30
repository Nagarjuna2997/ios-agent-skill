# The Composable Architecture (TCA)

## Core Concepts

TCA structures apps around five core primitives:

- **State**: A struct describing all data a feature needs to render its UI
- **Action**: An enum of all events that can occur (user taps, API responses, timer ticks)
- **Reducer**: A function that evolves state given an action and returns effects
- **Store**: The runtime that drives a feature by processing actions and storing state
- **Effect**: A publisher/async value representing side effects (API calls, timers, etc.)

```
User taps button
        │
        ▼
   ┌─────────┐       ┌──────────┐       ┌────────┐
   │  Action  │──────▶│ Reducer  │──────▶│ State  │
   └─────────┘       └──────────┘       └────────┘
                          │                   │
                          ▼                   ▼
                     ┌──────────┐        ┌────────┐
                     │  Effect  │        │  View  │
                     └──────────┘        └────────┘
                          │
                          ▼
                   API response → new Action
```

## Add TCA via SPM

```
https://github.com/pointfreeco/swift-composable-architecture
```

## @Reducer Macro (Modern TCA 1.0+)

```swift
import ComposableArchitecture

@Reducer
struct CounterFeature {
    @ObservableState
    struct State: Equatable {
        var count = 0
        var isLoading = false
        var fact: String?
    }

    enum Action {
        case incrementButtonTapped
        case decrementButtonTapped
        case factButtonTapped
        case factResponse(String)
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .incrementButtonTapped:
                state.count += 1
                state.fact = nil
                return .none

            case .decrementButtonTapped:
                state.count -= 1
                state.fact = nil
                return .none

            case .factButtonTapped:
                state.isLoading = true
                state.fact = nil
                return .run { [count = state.count] send in
                    let (data, _) = try await URLSession.shared.data(
                        from: URL(string: "http://numbersapi.com/\(count)")!
                    )
                    let fact = String(data: data, encoding: .utf8) ?? "No fact"
                    await send(.factResponse(fact))
                }

            case let .factResponse(fact):
                state.isLoading = false
                state.fact = fact
                return .none
            }
        }
    }
}
```

## View with Modern Observation (TCA 1.7+)

```swift
import ComposableArchitecture
import SwiftUI

struct CounterView: View {
    let store: StoreOf<CounterFeature>

    var body: some View {
        VStack(spacing: 16) {
            Text("\(store.count)")
                .font(.system(size: 64, weight: .bold, design: .rounded))

            HStack(spacing: 24) {
                Button("-") { store.send(.decrementButtonTapped) }
                    .font(.title)

                Button("+") { store.send(.incrementButtonTapped) }
                    .font(.title)
            }

            Button("Get Fact") { store.send(.factButtonTapped) }
                .disabled(store.isLoading)

            if store.isLoading {
                ProgressView()
            }

            if let fact = store.fact {
                Text(fact)
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .padding()
            }
        }
        .padding()
    }
}

// App entry point
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            CounterView(
                store: Store(initialState: CounterFeature.State()) {
                    CounterFeature()
                }
            )
        }
    }
}
```

## Store Scoping and Child Features

```swift
@Reducer
struct TodoItem {
    @ObservableState
    struct State: Equatable, Identifiable {
        let id: UUID
        var title: String
        var isComplete = false
    }

    enum Action {
        case toggleCompleted
        case titleChanged(String)
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .toggleCompleted:
                state.isComplete.toggle()
                return .none
            case let .titleChanged(title):
                state.title = title
                return .none
            }
        }
    }
}

@Reducer
struct TodoList {
    @ObservableState
    struct State: Equatable {
        var todos: IdentifiedArrayOf<TodoItem.State> = []
        var newTodoTitle = ""
    }

    enum Action {
        case todos(IdentifiedActionOf<TodoItem>)
        case addTodoButtonTapped
        case newTodoTitleChanged(String)
        case clearCompletedTapped
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .todos:
                return .none

            case .addTodoButtonTapped:
                guard !state.newTodoTitle.isEmpty else { return .none }
                state.todos.append(
                    TodoItem.State(id: UUID(), title: state.newTodoTitle)
                )
                state.newTodoTitle = ""
                return .none

            case let .newTodoTitleChanged(title):
                state.newTodoTitle = title
                return .none

            case .clearCompletedTapped:
                state.todos.removeAll { $0.isComplete }
                return .none
            }
        }
        .forEach(\.todos, action: \.todos) {
            TodoItem()
        }
    }
}

struct TodoListView: View {
    let store: StoreOf<TodoList>

    var body: some View {
        NavigationStack {
            List {
                HStack {
                    TextField("New todo", text: Binding(
                        get: { store.newTodoTitle },
                        set: { store.send(.newTodoTitleChanged($0)) }
                    ))
                    Button("Add") { store.send(.addTodoButtonTapped) }
                        .disabled(store.newTodoTitle.isEmpty)
                }

                ForEach(store.scope(state: \.todos, action: \.todos)) { todoStore in
                    TodoRowView(store: todoStore)
                }
            }
            .navigationTitle("Todos")
            .toolbar {
                Button("Clear Done") { store.send(.clearCompletedTapped) }
            }
        }
    }
}

struct TodoRowView: View {
    let store: StoreOf<TodoItem>

    var body: some View {
        HStack {
            Button {
                store.send(.toggleCompleted)
            } label: {
                Image(systemName: store.isComplete ? "checkmark.circle.fill" : "circle")
            }
            .buttonStyle(.plain)

            Text(store.title)
                .strikethrough(store.isComplete)
                .foregroundStyle(store.isComplete ? .secondary : .primary)
        }
    }
}
```

## Dependencies via @Dependency

```swift
import ComposableArchitecture

// Define a dependency
struct NumberFactClient {
    var fetch: @Sendable (Int) async throws -> String
}

extension NumberFactClient: DependencyKey {
    static let liveValue = NumberFactClient { number in
        let (data, _) = try await URLSession.shared.data(
            from: URL(string: "http://numbersapi.com/\(number)")!
        )
        return String(data: data, encoding: .utf8) ?? "No fact available"
    }

    static let testValue = NumberFactClient { number in
        "\(number) is a test fact."
    }

    static let previewValue = NumberFactClient { number in
        "\(number) is a great number!"
    }
}

extension DependencyValues {
    var numberFact: NumberFactClient {
        get { self[NumberFactClient.self] }
        set { self[NumberFactClient.self] = newValue }
    }
}

// Use in a reducer
@Reducer
struct FactFeature {
    @ObservableState
    struct State: Equatable {
        var count = 0
        var fact: String?
    }

    enum Action {
        case factButtonTapped
        case factResponse(String)
    }

    @Dependency(\.numberFact) var numberFact

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .factButtonTapped:
                return .run { [count = state.count] send in
                    let fact = try await numberFact.fetch(count)
                    await send(.factResponse(fact))
                }
            case let .factResponse(fact):
                state.fact = fact
                return .none
            }
        }
    }
}
```

## Navigation in TCA

### Tree-Based Navigation (Sheets, Alerts, Popovers)

```swift
@Reducer
struct ParentFeature {
    @ObservableState
    struct State: Equatable {
        @Presents var detail: DetailFeature.State?
        @Presents var alert: AlertState<Action.Alert>?
    }

    enum Action {
        case showDetailTapped
        case detail(PresentationAction<DetailFeature.Action>)
        case alert(PresentationAction<Action.Alert>)

        @CasePathable
        enum Alert {
            case confirmDelete
        }
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .showDetailTapped:
                state.detail = DetailFeature.State(itemId: "123")
                return .none
            case .detail:
                return .none
            case .alert(.presented(.confirmDelete)):
                // Handle deletion
                return .none
            case .alert:
                return .none
            }
        }
        .ifLet(\.$detail, action: \.detail) {
            DetailFeature()
        }
        .ifLet(\.$alert, action: \.alert)
    }
}
```

### Stack-Based Navigation

```swift
@Reducer
struct AppFeature {
    @ObservableState
    struct State: Equatable {
        var path = StackState<Path.State>()
    }

    enum Action {
        case path(StackActionOf<Path>)
        case goToDetailTapped
    }

    @Reducer
    enum Path {
        case detail(DetailFeature)
        case settings(SettingsFeature)
    }

    var body: some ReducerOf<Self> {
        Reduce { state, action in
            switch action {
            case .goToDetailTapped:
                state.path.append(.detail(DetailFeature.State(itemId: "123")))
                return .none
            case .path:
                return .none
            }
        }
        .forEach(\.path, action: \.path)
    }
}

struct AppView: View {
    let store: StoreOf<AppFeature>

    var body: some View {
        NavigationStack(path: $store.scope(state: \.path, action: \.path)) {
            Button("Go to Detail") { store.send(.goToDetailTapped) }
        } destination: { store in
            switch store.case {
            case let .detail(store):
                DetailView(store: store)
            case let .settings(store):
                SettingsView(store: store)
            }
        }
    }
}
```

## Testing with TestStore

```swift
import ComposableArchitecture
import Testing

@Test
func testCounter() async {
    let store = TestStore(initialState: CounterFeature.State()) {
        CounterFeature()
    }

    await store.send(.incrementButtonTapped) {
        $0.count = 1
    }
    await store.send(.incrementButtonTapped) {
        $0.count = 2
    }
    await store.send(.decrementButtonTapped) {
        $0.count = 1
    }
}

@Test
func testFactLoading() async {
    let store = TestStore(initialState: FactFeature.State(count: 42)) {
        FactFeature()
    } withDependencies: {
        $0.numberFact.fetch = { "\($0) is the answer." }
    }

    await store.send(.factButtonTapped)
    await store.receive(\.factResponse) {
        $0.fact = "42 is the answer."
    }
}

@Test
func testTodoList() async {
    let store = TestStore(initialState: TodoList.State()) {
        TodoList()
    }

    await store.send(.newTodoTitleChanged("Buy milk")) {
        $0.newTodoTitle = "Buy milk"
    }
    await store.send(.addTodoButtonTapped) {
        $0.newTodoTitle = ""
        $0.todos = [TodoItem.State(id: $0.todos.first!.id, title: "Buy milk")]
    }
}
```

## When to Use TCA vs MVVM

| Criteria | TCA | MVVM |
|----------|-----|------|
| Team size | Large teams, strict conventions | Small-medium teams |
| Testing | Exhaustive, deterministic testing built-in | Manual test setup required |
| Complexity | Higher learning curve | Lower barrier to entry |
| Side effects | Managed, testable, cancellable | Ad-hoc async/await |
| Navigation | Structured, state-driven | More flexible, less testable |
| Dependencies | Built-in DI system | Manual or third-party DI |
| State sharing | Explicit scoping, no ambiguity | Shared `@Observable` objects |
| Performance | Equatable diffing, scoped observation | `@Observable` handles this well |
| Best for | Complex apps needing reliability | Standard CRUD apps |
