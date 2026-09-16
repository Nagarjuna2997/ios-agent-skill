import Testing
@testable import AppleRecipes

@MainActor
private final class Backend: ReadingAssistantBackend {
    var isAvailable = true
    var calls = 0
    var cancelBeforeReturning = false
    var failure: (any Error)?
    func respond(to query: String) async throws -> String {
        calls += 1
        if let failure { throw failure }
        if cancelBeforeReturning { withUnsafeCurrentTask { $0?.cancel() } }
        return "Found a saved Swift book"
    }
}
private enum ExpectedError: Error { case failed }

@Test @MainActor func unavailableModelUsesLocalSearch() async throws {
    let catalog = ReadingCatalog(titles: ["Swift Programming", "Gardening"])
    let backend = Backend()
    backend.isAvailable = false
    let assistant = ReadingAssistant(catalog: catalog, backend: backend)
    #expect(try await assistant.answer("swift") == .localMatches(["Swift Programming"]))
    #expect(backend.calls == 0)
    #expect(try await assistant.answer("unknown") == .localMatches([]))
}
@Test @MainActor func missingBackendAndEmptyQueryHaveHonestFallback() async throws {
    let assistant = ReadingAssistant(catalog: ReadingCatalog(titles: ["Swift"]), backend: nil)
    #expect(try await assistant.answer(" ") == .localMatches([]))
}
@Test @MainActor func availableBackendReturnsModelAnswerAndSurfacesFailure() async throws {
    let backend = Backend()
    let assistant = ReadingAssistant(catalog: ReadingCatalog(titles: []), backend: backend)
    #expect(try await assistant.answer("Swift") == .model("Found a saved Swift book"))
    backend.failure = ExpectedError.failed
    await #expect(throws: ExpectedError.self) { try await assistant.answer("Swift") }
    backend.failure = CancellationError()
    await #expect(throws: CancellationError.self) { try await assistant.answer("Swift") }
}
#if canImport(FoundationModels)
@available(iOS 26.0, macOS 26.0, *)
@Test func realFoundationModelsToolSearchesInjectedData() async throws {
    let tool = FindSavedBooks(catalog: ReadingCatalog(titles: ["Swift Programming", "Gardening"]))
    #expect(try await tool.call(arguments: .init(query: "swift")) == "Swift Programming")
    #expect(try await tool.call(arguments: .init(query: "missing")) == "No matching saved books.")
}
#endif

@Test @MainActor func cancellationAfterBackendSuccessIsNotReportedAsSuccess() async {
    let backend = Backend()
    backend.cancelBeforeReturning = true
    let assistant = ReadingAssistant(catalog: ReadingCatalog(titles: []), backend: backend)
    let task = Task { try await assistant.answer("Swift") }
    await #expect(throws: CancellationError.self) { try await task.value }
}
