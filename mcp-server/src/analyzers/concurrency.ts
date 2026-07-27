import { Finding, SourceFile, eachLine, isSupportFile } from "./types.js";

const DOC = "docs/swift/swift-concurrency.md";

/**
 * Swift 6 isolation and concurrency rules.
 *
 * These are the same rules enforced by templates/hooks/forbid-antipatterns.sh —
 * this is that engine made addressable by an agent.
 */
export function analyzeConcurrency(file: SourceFile): Finding[] {
  const findings: Finding[] = [];
  const support = isSupportFile(file.path);

  const push = (
    line: number,
    excerpt: string,
    rule: string,
    severity: Finding["severity"],
    message: string,
    consequence: string,
    fix: string,
    doc = DOC,
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

  // File-level: @Observable without @MainActor anywhere in the file.
  // Checked at file scope because the annotations may be on separate lines.
  const hasObservable = /^\s*@Observable\b/m.test(file.content);
  const hasMainActor = /@MainActor\b/.test(file.content);
  if (hasObservable && !hasMainActor && !support) {
    const line =
      file.content.split("\n").findIndex((l) => /^\s*@Observable\b/.test(l)) + 1;
    push(
      line,
      "@Observable",
      "observable-without-mainactor",
      "blocker",
      "@Observable type is not @MainActor-isolated.",
      "@Observable grants no isolation. SwiftUI reads this state during layout while any task may write it — a data race under Swift 5 mode, a compile error under Swift 6.",
      "Annotate the type: `@MainActor @Observable final class …`. Annotate the type, not individual members — per-member isolation leaves gaps.",
    );
  }

  // Non-final observable classes.
  const nonFinal = file.content
    .split("\n")
    .findIndex((l) => /^\s*(public\s+)?class\s+\w+/.test(l) && !/final/.test(l));
  if (hasObservable && nonFinal >= 0) {
    push(
      nonFinal + 1,
      file.content.split("\n")[nonFinal],
      "observable-not-final",
      "minor",
      "@Observable class is not `final`.",
      "A subclass can add unobserved stored properties, and every access costs a dynamic dispatch.",
      "Mark the class `final`.",
    );
  }

  eachLine(file, (line, number) => {
    if (/\bDispatchQueue\s*\.\s*main\s*\.\s*async\b/.test(line)) {
      push(
        number,
        line,
        "dispatchqueue-main-async",
        "serious",
        "DispatchQueue.main.async in Swift Concurrency code.",
        "Hand-rolled thread hopping bypasses the isolation the compiler can check, and defers the write by a run-loop turn.",
        "Isolate the enclosing type with @MainActor and assign directly.",
      );
    }

    if (/\bTask\s*\.\s*detached\b/.test(line)) {
      push(
        number,
        line,
        "task-detached",
        "serious",
        "Task.detached drops actor isolation, priority, and task-locals.",
        "Writes to isolated state from the detached task are cross-actor: a data race under Swift 5, a compile error under Swift 6.",
        "Use `Task { }` (which inherits the enclosing actor), a `nonisolated async` function, or an actor.",
      );
    }

    if (/\bawait\s+MainActor\s*\.\s*run\b/.test(line)) {
      push(
        number,
        line,
        "redundant-mainactor-run",
        "minor",
        "await MainActor.run inside an already-isolated type is redundant.",
        "Adds a suspension point and obscures that the type is already main-actor isolated.",
        "Assign directly if the enclosing type is @MainActor; otherwise isolate the type.",
      );
    }

    if (/@unchecked\s+Sendable/.test(line)) {
      push(
        number,
        line,
        "unchecked-sendable",
        "serious",
        "@unchecked Sendable asserts thread safety the compiler cannot verify.",
        "If there is no lock, actor, or documented single-threaded contract behind it, this is a race the type system was trying to prevent.",
        "Prefer a value type, an immutable `final class`, an `actor`, or Swift 6.4's `weak let` / `~Sendable`. If genuinely needed, add a comment naming the mechanism that protects it.",
      );
    }

    if (/\bnonisolated\(unsafe\)/.test(line)) {
      push(
        number,
        line,
        "nonisolated-unsafe",
        "minor",
        "nonisolated(unsafe) opts storage out of isolation checking.",
        "Nothing prevents concurrent access; correctness rests entirely on an unstated invariant.",
        "Add a comment naming what protects it, or move the state into an actor.",
      );
    }

    // Unstructured Task in onAppear — outlives the view.
    if (/\.onAppear\s*\{/.test(line) && /\bTask\s*\{/.test(line)) {
      push(
        number,
        line,
        "task-in-onappear",
        "serious",
        "Unstructured Task in onAppear is never cancelled.",
        "The task keeps running after the view is dismissed and can write to a model whose screen is gone.",
        "Use `.task { }` or `.task(id:) { }`, which SwiftUI cancels on disappear.",
      );
    }

    // A type named Task shadows _Concurrency.Task.
    if (/^\s*(public\s+|internal\s+)?(struct|class|enum|actor)\s+Task\b/.test(line)) {
      push(
        number,
        line,
        "type-named-task",
        "blocker",
        "A type named `Task` shadows _Concurrency.Task.",
        "`Task { … }` in the same file fails to compile with a confusing 'extra trailing closure' error.",
        "Rename it (TodoItem, WorkItem, JobRecord…).",
      );
    }
  });

  // Empty catch — swallows failures silently.
  //
  // Uses eachLine (which strips comments) rather than a raw regex over the whole
  // file: a doc comment mentioning `catch { }` as an anti-pattern is not itself
  // an anti-pattern.
  eachLine(file, (line, number) => {
    if (/catch\s*\{\s*\}/.test(line)) {
      push(
        number,
        line,
        "empty-catch",
        "serious",
        "Empty catch block discards a failure silently.",
        "The operation fails with no log, no user feedback, and no way to diagnose it in production.",
        "Surface the error, or comment why the no-op is deliberate (e.g. `catch is CancellationError`).",
        "patterns/error-handling.md",
      );
    }
  });

  return findings;
}
