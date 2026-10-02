import XCTest
import Foundation

@MainActor
final class AcceptanceTests: XCTestCase {
    func testLivePreview() async throws {
        continueAfterFailure = false
        guard let endpoint = ProcessInfo.processInfo.environment["STUDIO_PREVIEW_URL"],
              let base = URL(string: endpoint),
              let token = ProcessInfo.processInfo.environment["STUDIO_PREVIEW_TOKEN"] else {
            XCTFail("Live preview configuration missing")
            return
        }
        let app = XCUIApplication()
        for key in ["STUDIO_BACKEND_URL", "STUDIO_BACKEND_TOKEN", "STUDIO_BACKEND_NAMESPACE"] {
            app.launchEnvironment[key] = ProcessInfo.processInfo.environment[key]
        }
        app.launch()
        let deadline = Date().addingTimeInterval(1200)
        var lastFrame = Date.distantPast
        var completed = 0
        var inputError = ""
        func request(_ route: String, data: Data? = nil) async throws -> Data {
            var request = URLRequest(url: base.appendingPathComponent(route))
            request.timeoutInterval = 15
            request.setValue(token, forHTTPHeaderField: "X-Preview-Token")
            request.setValue(inputError, forHTTPHeaderField: "X-Input-Error")
            request.setValue(String(completed), forHTTPHeaderField: "X-Command-Completed")
            if let data { request.httpMethod = "POST"; request.httpBody = data; request.setValue("image/png", forHTTPHeaderField: "Content-Type") }
            let (body, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200 else { throw URLError(.badServerResponse) }
            return body
        }
        while Date() < deadline {
            let payload = try await request("command")
            let command = try JSONDecoder().decode(Command.self, from: payload)
            if command.action == "stop" { break }
            if command.action != "wait" { inputError = "" }
            switch command.action {
            case "tap":
                app.coordinate(withNormalizedOffset: CGVector(dx: command.x!, dy: command.y!)).tap()
            case "swipe":
                let start = app.coordinate(withNormalizedOffset: CGVector(dx: command.x!, dy: command.y!))
                let end = app.coordinate(withNormalizedOffset: CGVector(dx: command.endX!, dy: command.endY!))
                start.press(forDuration: 0.05, thenDragTo: end)
            case "type":
                if app.keyboards.firstMatch.exists { app.typeText(command.text!) }
                else { inputError = "Tap a text field in the simulator before sending text." }
            case "relaunch": app.terminate(); app.launch()
            default: break
            }
            if let id = command.id { completed = id }
            if command.action != "wait" || Date().timeIntervalSince(lastFrame) > 1 {
                _ = try await request("frame", data: app.screenshot().pngRepresentation)
                lastFrame = Date()
            }
            try await Task.sleep(for: .milliseconds(250))
        }
        app.terminate()
    }
}
private struct Command: Decodable {
    let action: String
    let id: Int?
    let x: Double?
    let y: Double?
    let endX: Double?
    let endY: Double?
    let text: String?
}
