"""Run isolated module scenarios against real templates and a broken copy."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import uuid

HERE = Path(__file__).resolve().parent
CAPS = HERE.parents[1] / "capabilities"
CASES = {
    "PersistenceJourney/testSavedRecordSurvivesProcessRelaunch()": ("swiftdata", "Saved record missing after relaunch"),
    "PaywallJourney/testLocalPurchaseRestoreAndRefund()": ("storekit2-paywall", "Purchase must grant premium"),
}
SOURCES = {
    "App/PersistenceController.swift": CAPS / "swiftdata/template/PersistenceController.swift",
    "App/Store.swift": CAPS / "storekit2-paywall/template/Store.swift",
    "Tests/Products.storekit": CAPS / "storekit2-paywall/template/Products.storekit",
}

def read(*args):
    return subprocess.check_output(args, text=True, timeout=120).strip()

def digest(data):
    return hashlib.sha256(data).hexdigest()

def test_cases(nodes):
    for node in nodes:
        if node.get("nodeType") == "Test Case":
            yield node["nodeIdentifier"], node["result"]
        yield from test_cases(node.get("children", []))


def case_name(identifier):
    # xcresulttool versions may omit parentheses or include a target prefix.
    return "/".join(identifier.removesuffix("()").split("/")[-2:]) + "()"


def expected_result(summary, entries, devices, destination, mutated, exit_code):
    rows = {case_name(key): value for key, value in entries}
    if len(entries) != len(CASES) or set(rows) != set(CASES):
        return False
    configs = summary.get("devicesAndConfigurations", [])
    if len(devices) != 1 or len(configs) != 1:
        return False
    for device in (devices[0], configs[0].get("device", {})):
        if device.get("deviceId") != destination or device.get("platform") != "iOS Simulator":
            return False
    count = len(CASES)
    totals = {"passedTests": 0 if mutated else count, "failedTests": count if mutated else 0,
              "skippedTests": 0, "expectedFailures": 0}
    if summary.get("totalTestCount") != count or any(
        record.get(key) != value for record in (summary, configs[0]) for key, value in totals.items()
    ):
        return False
    result = "Failed" if mutated else "Passed"
    if summary.get("result") != result or any(value != result for value in rows.values()):
        return False
    failures = summary.get("testFailures")
    if not isinstance(failures, list):
        return False
    if not mutated:
        return exit_code == 0 and not failures
    if exit_code != 65 or len(failures) != count:
        return False
    seen = set()
    for failure in failures:
        name = case_name(failure.get("testIdentifierString", ""))
        if name not in CASES or name in seen:
            return False
        target = "RuntimeUITests" if CASES[name][0] == "swiftdata" else "RuntimeTests"
        if failure.get("targetName") != target:
            return False
        if failure.get("failureText", "").strip() != "XCTAssertTrue failed - " + CASES[name][1]:
            return False
        seen.add(name)
    return True


def run(out, device, mutation):
    variant = "mutation" if mutation else "actual"
    folder = out / variant
    folder.mkdir()
    bundle = "dev.iosagent.fixture.r" + uuid.uuid4().hex
    for name in ("App","Tests","UITests"):
        shutil.copytree(HERE / name, folder / name)
    spec = (HERE / "project.yml").read_text().replace("BUNDLE_PLACEHOLDER", bundle)
    (folder / "project.yml").write_text(spec)
    fingerprints = {}
    for path, source in SOURCES.items():
        data = source.read_bytes()
        fingerprints[str(source.relative_to(CAPS))] = digest(data)
        text = data.decode().replace("__BUNDLE_ID__", bundle)
        if mutation and path.endswith("PersistenceController.swift"):
            assert text.count("isStoredInMemoryOnly: inMemory") == 1
            text = text.replace("isStoredInMemoryOnly: inMemory", "isStoredInMemoryOnly: true")
        if mutation and path.endswith("Store.swift"):
            assert text.count("var isPremium: Bool { !entitled.isEmpty }") == 1
            text = text.replace("var isPremium: Bool { !entitled.isEmpty }", "var isPremium: Bool { false }")
        (folder / path).write_text(text)
    subprocess.run(["xcodegen", "generate"], cwd=folder, check=True)
    args = [
        "xcodebuild", "test", "-project", "CapabilityRuntime.xcodeproj",
        "-scheme", "CapabilityRuntime", "-destination", "platform=iOS Simulator,id=" + device,
        "-parallel-testing-enabled", "NO", "-resultBundlePath", "results.xcresult",
        "-derivedDataPath", "DerivedData", "CODE_SIGNING_ALLOWED=NO",
    ]
    with (folder / "build.log").open("w") as log:
        result = subprocess.run(args, cwd=folder, stdout=log, stderr=subprocess.STDOUT, timeout=900)
    path = folder / "results.xcresult"
    summary = json.loads(read("xcrun", "xcresulttool", "get", "test-results", "summary", "--path", path))
    tree = json.loads(read("xcrun", "xcresulttool", "get", "test-results", "tests", "--path", path))
    entries = list(test_cases(tree["testNodes"]))
    rows = {case_name(key): value for key, value in entries}
    passed = expected_result(summary, entries, tree["devices"], device, mutation, result.returncode)
    receipt = {
        "variant": variant, "checkPassed": passed, "commandExit": result.returncode,
        "modules": {CASES[key][0]: value for key, value in rows.items() if key in CASES},
        "templateSHA256": fingerprints, "xcode": read("xcodebuild", "-version"),
        "devices": tree["devices"], "externalProvider": "not-tested",
        "testFailures": summary.get("testFailures", []),
    }
    (folder / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(variant, receipt["modules"], "check passed:", passed, flush=True)
    if not passed:
        raise RuntimeError("The verification contract failed. See " + str(folder / "receipt.json"))
    return receipt


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--runtime", required=True)
    parser.add_argument("--device-type", required=True)
    args = parser.parse_args()
    out = args.output.resolve()
    out.mkdir()
    device = read("xcrun", "simctl", "create", "capability-runtime-" + uuid.uuid4().hex[:10],
                  args.device_type, args.runtime)
    try:
        subprocess.run(["xcrun", "simctl", "boot", device], check=True)
        subprocess.run(["xcrun", "simctl", "bootstatus", device, "-b"], check=True, timeout=300)
        for mutation in (False, True):
            run(out, device, mutation)
    finally:
        subprocess.run(["xcrun", "simctl", "delete", device], check=True)
