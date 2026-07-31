import { Finding, SourceFile, eachLine, isSupportFile } from "./types.js";

const SECURITY_DOC = "checklists/security.md";
const CRYPTO_DOC = "docs/frameworks/cryptokit.md";
const AUTH_DOC = "docs/frameworks/local-authentication.md";

/** Names that look like secrets when assigned a string literal. */
const SECRET_NAME =
  /\b(api[_-]?key|apikey|secret|password|passwd|token|access[_-]?token|refresh[_-]?token|client[_-]?secret|private[_-]?key|auth[_-]?token|bearer)\b/i;

/**
 * Placeholders people legitimately commit. Flagging these trains readers to
 * ignore the rule, which is worse than not having it.
 */
const PLACEHOLDER =
  /^(|<[^>]*>|your[_-]?\w*|xxx+|todo|tbd|changeme|placeholder|example|dummy|test|fake|sample|\{\{.*\}\}|\$\{.*\}|nil|null)$/i;

export function analyzeSecurity(file: SourceFile): Finding[] {
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
    doc = SECURITY_DOC,
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

  eachLine(file, (line, number) => {
    // Hardcoded credential. Anything in the binary is extractable in minutes.
    const assignment = /\b(?:let|var)\s+(\w+)\s*(?::\s*String\s*)?=\s*"([^"]*)"/.exec(line);
    if (assignment) {
      const [, name, value] = assignment;
      if (SECRET_NAME.test(name) && !PLACEHOLDER.test(value.trim()) && value.length >= 8) {
        push(
          number,
          line,
          "hardcoded-secret",
          "blocker",
          `\`${name}\` is a string literal in source.`,
          "Anything compiled into the app is extractable — `strings` on the binary takes seconds, and the value is in every copy ever shipped. Rotating it means shipping an update, and App Review does not remove it from installed builds.",
          "Move it server-side. If the client genuinely must hold a credential, fetch it at runtime after authentication and store it in the Keychain — never in the bundle, `Info.plist`, or source.",
        );
      }
    }

    // UserDefaults is a plist in the container: unencrypted, and in backups.
    if (
      /UserDefaults\.\w+\.set\s*\(/.test(line) &&
      SECRET_NAME.test(line)
    ) {
      push(
        number,
        line,
        "secret-in-userdefaults",
        "blocker",
        "Credential written to UserDefaults.",
        "UserDefaults is an unencrypted plist inside the app container. It is readable on a jailbroken device, and it is included in unencrypted iTunes/Finder backups — so the token leaves the device entirely.",
        "Use the Keychain with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`. See `docs/frameworks/local-authentication.md` for access control.",
        AUTH_DOC,
      );
    }

    // ATS disabled wholesale.
    if (/NSAllowsArbitraryLoads/.test(line)) {
      push(
        number,
        line,
        "ats-disabled",
        "blocker",
        "App Transport Security is disabled globally.",
        "Every request in the app may fall back to cleartext HTTP, so any network the user is on can read and modify traffic. App Review requires a written justification and rejects most of them.",
        "Remove the key. If one legacy host genuinely needs it, scope the exception with `NSExceptionDomains` for that host only.",
      );
    }

    // http:// endpoints.
    if (/"http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(line)) {
      push(
        number,
        line,
        "cleartext-http",
        "serious",
        "Cleartext HTTP endpoint.",
        "Traffic is readable and modifiable by anyone on the path. ATS blocks it at runtime unless an exception was added, so this either fails in production or an exception is hiding elsewhere.",
        "Use `https://`.",
      );
    }

    // Disabled TLS validation.
    if (
      /\.useCredential\s*,\s*URLCredential\(trust:/.test(line) ||
      /completionHandler\(\s*\.useCredential\s*,\s*URLCredential\(trust:/.test(line)
    ) {
      push(
        number,
        line,
        "tls-validation-bypassed",
        "blocker",
        "Server trust accepted without evaluation.",
        "Accepting the challenge's trust object unconditionally disables certificate validation, so any proxy can impersonate the server. Added for a dev proxy, this always ships.",
        "Evaluate with `SecTrustEvaluateWithError` before accepting. If you need pinning, pin the public key and keep a backup pin.",
        CRYPTO_DOC,
      );
    }

    // Weak hashes for anything security-relevant.
    if (/\b(Insecure\.)?(MD5|SHA1)\b/.test(line)) {
      push(
        number,
        line,
        "weak-hash",
        "serious",
        "MD5 or SHA-1 used.",
        "Both are collision-broken. CryptoKit files them under `Insecure` for a reason. Fine for a cache key, unsafe for signatures, integrity checks, or password derivation.",
        "Use `SHA256`. For passwords use a KDF (PBKDF2, scrypt, Argon2) — a plain hash of any speed is the wrong primitive.",
        CRYPTO_DOC,
      );
    }

    // Keychain items that sync or survive device migration.
    if (/kSecAttrAccessibleAlways/.test(line)) {
      push(
        number,
        line,
        "keychain-always-accessible",
        "blocker",
        "Keychain item readable while the device is locked.",
        "`kSecAttrAccessibleAlways` is deprecated and defeats the point of the Keychain — the item is available to any process even before first unlock.",
        "Use `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` for credentials.",
        AUTH_DOC,
      );
    }

    if (/kSecAttrAccessibleWhenUnlocked\b(?!ThisDeviceOnly)/.test(line)) {
      push(
        number,
        line,
        "keychain-migrates-to-new-device",
        "minor",
        "Keychain item without `ThisDeviceOnly` migrates through backups.",
        "A device-bound credential that restores onto a different device is no longer device-bound, which breaks any server-side assumption built on it.",
        "Use `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` unless the item is meant to travel.",
        AUTH_DOC,
      );
    }

    // Randomness that is not cryptographic.
    if (
      /\b(arc4random|Int\.random|Double\.random|UUID\(\))/.test(line) &&
      /\b(nonce|salt|iv|token|secret|key)\b/i.test(line)
    ) {
      push(
        number,
        line,
        "non-cryptographic-randomness",
        "serious",
        "Security value generated from a non-cryptographic source.",
        "`Int.random` and `UUID()` are not designed to be unpredictable to an attacker. A guessable nonce or salt defeats the protocol that depends on it.",
        "Use `SecRandomCopyBytes` or `SymmetricKey(size:)` from CryptoKit.",
        CRYPTO_DOC,
      );
    }

    // Secrets in logs.
    if (
      /\b(print|NSLog|debugPrint)\s*\(/.test(line) &&
      SECRET_NAME.test(line)
    ) {
      push(
        number,
        line,
        "secret-logged",
        "serious",
        "Credential written to the log.",
        "Device logs are readable via Console and are collected in sysdiagnose bundles, so the value leaves the app's sandbox. `print` is not stripped in release builds.",
        "Remove it. Use OSLog with `privacy: .private` for anything that must be logged at all.",
        "docs/frameworks/oslog.md",
      );
    }

    // WebView JS bridges that trust page content.
    if (/\.evaluateJavaScript\s*\(\s*"[^"]*\\\(/.test(line)) {
      push(
        number,
        line,
        "javascript-string-interpolation",
        "serious",
        "String interpolation into evaluated JavaScript.",
        "Any value containing a quote or a script fragment escapes the expression and runs in the page's context — script injection through your own app.",
        "Pass values through `WKScriptMessage` / `callAsyncJavaScript(_:arguments:)` rather than building source text.",
      );
    }
  });

  return findings;
}
