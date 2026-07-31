import { Finding, SourceFile, eachLine, isSupportFile } from "./types.js";

const CONCURRENCY_DOC = "docs/swift/swift-concurrency.md";
const MVVM_DOC = "patterns/mvvm.md";

/**
 * Retain cycles and lifetime defects.
 *
 * Deliberately conservative. A closure capturing `self` is not a leak — most
 * are fine, because most closures are consumed immediately. A leak needs the
 * closure to be *stored* by something the object itself owns. So these rules
 * fire on the specific storing APIs (Timer, NotificationCenter, Combine sinks,
 * delegate assignment) rather than on `self.` inside any closure, which would
 * bury the real findings under hundreds of false ones.
 */
export function analyzeMemory(file: SourceFile): Finding[] {
  const findings: Finding[] = [];
  if (isSupportFile(file.path)) return findings;

  const push = (
    line: number,
    excerpt: string,
    rule: string,
    severity: Finding["severity"],
    message: string,
    consequence: string,
    fix: string,
    doc = CONCURRENCY_DOC,
  ) =>
    findings.push({
      file: file.path,
      line,
      severity,
      rule,
      message,
      consequence,
      fix,
      doc,
      excerpt: excerpt.trim(),
    });

  const lines = file.content.split("\n");

  /** Does the closure opening on this line declare a capture list within a few lines? */
  const capturesWeakly = (index: number): boolean => {
    const window = lines.slice(index, index + 3).join(" ");
    return /\[\s*(weak|unowned)\s+self/.test(window);
  };

  eachLine(file, (line, number) => {
    const index = number - 1;

    // Timer.scheduledTimer retains its block until invalidate(). A view model
    // that owns the timer and is captured strongly by it never deallocates.
    if (
      /Timer\.scheduledTimer\s*\(/.test(line) &&
      /repeats:\s*true/.test(lines.slice(index, index + 4).join(" ")) &&
      !capturesWeakly(index)
    ) {
      push(
        number,
        line,
        "timer-retain-cycle",
        "serious",
        "Repeating Timer captures self strongly.",
        "The run loop retains the timer, the timer retains the block, and the block retains self. The object never deallocates — the cycle is self -> Timer -> closure -> self.",
        "Capture `[weak self]`, and call `invalidate()` when the owner goes away. A repeating timer is never released by ARC alone.",
      );
    }

    // NotificationCenter block observers must be removed AND captured weakly.
    if (
      /NotificationCenter\.\w+\.addObserver\s*\(\s*forName/.test(line) &&
      !capturesWeakly(index)
    ) {
      push(
        number,
        line,
        "notification-observer-retain",
        "serious",
        "Block-based notification observer captures self strongly.",
        "NotificationCenter holds the block for the lifetime of the returned token. Without a weak capture the observer keeps the object alive forever, and the handler keeps firing after the screen is gone.",
        "Capture `[weak self]` and store the returned token so it can be removed. In new code prefer `NotificationCenter.notifications(named:)` with a structured `for await`, which ends with the task.",
      );
    }

    // Combine sinks are stored in cancellables owned by the same object.
    if (/\.sink\s*(\(|\{)/.test(line) && !capturesWeakly(index)) {
      const window = lines.slice(index, index + 6).join(" ");
      if (/\bself\./.test(window)) {
        push(
          number,
          line,
          "sink-retain-cycle",
          "serious",
          "Combine sink captures self strongly.",
          "The subscription is stored in a `cancellables` set owned by self, so self -> AnyCancellable -> closure -> self is a cycle that survives the view.",
          "Capture `[weak self]` in the sink closure.",
        );
      }
    }

    // `unowned` on anything that can outlive its referent is a crash, not a leak.
    if (/\[\s*unowned\s+self\s*\]/.test(line)) {
      push(
        number,
        line,
        "unowned-self",
        "serious",
        "`unowned self` crashes if the closure outlives the object.",
        "Unlike `weak`, `unowned` does not nil out. Any escaping closure that runs after deallocation — a completion handler, a timer, a delayed task — traps instead of no-oping.",
        "Use `[weak self]` and `guard let self else { return }`. Reserve `unowned` for closures provably shorter-lived than self.",
      );
    }

    // A strong delegate is the classic parent/child cycle.
    if (/\bvar\s+delegate\s*:/.test(line) && !/\bweak\b/.test(line)) {
      // AnyObject-constrained protocols only; a struct delegate cannot cycle.
      push(
        number,
        line,
        "strong-delegate",
        "serious",
        "Delegate property is not `weak`.",
        "The delegate is almost always the owner, so owner -> child -> delegate -> owner is a cycle and neither side is ever freed.",
        "Declare it `weak var delegate: (any SomeDelegate)?` and constrain the protocol to `AnyObject`.",
      );
    }

    // Escaping closure stored on the type, capturing self.
    if (
      /\bvar\s+\w+\s*:\s*\(\s*.*\)\s*->\s*\w+\s*=\s*\{/.test(line) &&
      !capturesWeakly(index) &&
      /\bself\./.test(lines.slice(index, index + 4).join(" "))
    ) {
      push(
        number,
        line,
        "stored-closure-captures-self",
        "serious",
        "Stored closure property captures self strongly.",
        "The object owns the closure and the closure owns the object. Nothing releases either.",
        "Capture `[weak self]`, or restructure so the closure takes what it needs as a parameter.",
      );
    }

    // Task { } stored on a type, capturing self, with no cancellation.
    if (/\bTask\s*\{/.test(line) && !capturesWeakly(index)) {
      const window = lines.slice(index, index + 8).join(" ");
      if (/while\s+true|for\s+await/.test(window) && /\bself\./.test(window)) {
        push(
          number,
          line,
          "long-lived-task-captures-self",
          "serious",
          "Long-running Task captures self strongly.",
          "An unstructured Task holds its captures until it finishes. A `for await` loop over an endless sequence never finishes, so the object is never released and keeps reacting after its screen is gone.",
          "Store the Task and cancel it on teardown, or move the loop into `.task {}` on the view so SwiftUI cancels it. Capture `[weak self]` if it must be unstructured.",
          MVVM_DOC,
        );
      }
    }
  });

  return findings;
}
