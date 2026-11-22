import { z } from 'zod';

const identifier = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
const target = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const step = z.discriminatedUnion('action', [
  z.object({ action: z.literal('tap'), target }).strict(),
  z.object({ action: z.literal('expectVisible'), target }).strict(),
  z.object({ action: z.literal('scrollTo'), target, scrollView: target }).strict(),
  z.object({ action: z.literal('relaunch') }).strict(),
]);
export const JourneySchema = z.object({
  id: identifier, startScreen: identifier, steps: z.array(step).min(2).max(12),
}).strict().superRefine((journey, ctx) => {
  if (journey.steps.at(-1)?.action !== 'expectVisible') ctx.addIssue({ code: 'custom', message: 'Finish a journey by asserting an observable outcome' });
  if (!journey.steps.some(s => s.action === 'tap' || s.action === 'scrollTo')) ctx.addIssue({ code: 'custom', message: 'A journey needs a user interaction' });
});
export type Journey = z.infer<typeof JourneySchema>;
export function journeyStepName(journey: Journey, index: number): string {
  return `journey-${journey.id}-${String(index + 1).padStart(2, '0')}-${journey.steps[index]!.action}`;
}

/** Input identifiers are bounded by JourneySchema; model-supplied Swift is never interpolated. */
export function journeyTests(input: Journey[]): string {
  const methods = input.map(raw => {
    const journey = JourneySchema.parse(raw);
    const steps = journey.steps.map((step, index) => {
      const name = journeyStepName(journey, index);
      switch (step.action) {
        case 'relaunch': return `        app.terminate()
        app.launch()
        check(app.state == .runningForeground, "${name}", app)`;
        case 'tap': return `        let button${index} = element("${step.target}", app)
        XCTAssertTrue(waitVisible(button${index}, app), "Cannot tap ${step.target}")
        button${index}.tap()
        check(app.state == .runningForeground, "${name}", app)`;
        case 'expectVisible': return `        check(waitVisible(element("${step.target}", app), app), "${name}", app)`;
        case 'scrollTo': return `        let scroll${index} = unique("${step.scrollView}", app.scrollViews)
        let target${index} = element("${step.target}", app)
        XCTAssertTrue(scroll${index}.waitForExistence(timeout: 10))
        let wasOffscreen${index} = !visible(target${index}, app)
        for _ in 0..<8 {
            if visible(target${index}, app) { break }
            scroll${index}.swipeUp()
        }
        check(wasOffscreen${index} && waitVisible(target${index}, app), "${name}", app)`;
      }
    }).join('\n');
    return `    func test_${journey.id.replaceAll('-', '_')}() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launchArguments = ["-ios-agent-sample-data", "YES", "-ios-agent-screen", "${journey.startScreen}", "-ios-agent-journey", UUID().uuidString]
        app.launch()
${steps}
    }`;
  });
  return `import XCTest

@MainActor final class PlannedJourneyTests: XCTestCase {
    private func element(_ id: String, _ app: XCUIApplication) -> XCUIElement {
        unique(id, app.descendants(matching: .any))
    }

    private func unique(_ id: String, _ query: XCUIElementQuery) -> XCUIElement {
        // .element requires a unique match; a similarly named label is insufficient.
        query.matching(NSPredicate(format: "identifier == %@", id)).element
    }

    private func visible(_ element: XCUIElement, _ app: XCUIApplication) -> Bool {
        guard element.exists, element.isHittable else { return false }
        let overlap = element.frame.intersection(app.frame)
        return !overlap.isNull && overlap.width >= 1 && overlap.height >= 1
    }

    private func waitVisible(_ element: XCUIElement, _ app: XCUIApplication) -> Bool {
        guard element.waitForExistence(timeout: 10) else { return false }
        let deadline = Date().addingTimeInterval(5)
        while !visible(element, app), Date() < deadline {
            RunLoop.current.run(until: Date().addingTimeInterval(0.1))
        }
        return visible(element, app)
    }

    private func check(_ condition: Bool, _ name: String, _ app: XCUIApplication, file: StaticString = #filePath, line: UInt = #line) {
        let image = XCTAttachment(data: app.screenshot().pngRepresentation, uniformTypeIdentifier: "public.png")
        image.name = name
        image.lifetime = .keepAlways
        add(image)
        XCTAssertTrue(condition, name, file: file, line: line)
    }

${methods.join('\n\n')}
}
`;
}
