"""Portable checks for XCTest receipt classification."""
from copy import deepcopy
import unittest

from run import CASES, expected_result


def evidence(mutated):
    count = len(CASES)
    device = {"deviceId": "fixture-device", "platform": "iOS Simulator"}
    totals = {"passedTests": 0 if mutated else count, "failedTests": count if mutated else 0,
              "expectedFailures": 0, "skippedTests": 0}
    status = "Failed" if mutated else "Passed"
    summary = {**totals, "totalTestCount": count, "result": status,
               "devicesAndConfigurations": [{**totals, "device": dict(device)}], "testFailures": []}
    rows = []
    for name, (module, message) in CASES.items():
        target = "RuntimeUITests" if module == "swiftdata" else "RuntimeTests"
        rows.append((target + "/" + name, status))
        if mutated:
            summary["testFailures"].append({"testIdentifierString": name.removesuffix("()"),
                                            "targetName": target, "failureText": "XCTAssertTrue failed - " + message})
    return [summary, rows, [device], device["deviceId"], mutated, 65 if mutated else 0]


class ExpectedResultTests(unittest.TestCase):
    def test_reference_and_both_named_mutations(self):
        for mutated in (False, True):
            self.assertTrue(expected_result(*evidence(mutated)))

    def test_misattributed_or_additional_failure(self):
        base = evidence(True)
        for key, value in (("testIdentifierString", "Other/test()"), ("failureText", "runner crashed"),
                           ("targetName", "OtherTests")):
            args = deepcopy(base)
            args[0]["testFailures"][0][key] = value
            self.assertFalse(expected_result(*args), key)
        args = deepcopy(base)
        args[0]["testFailures"].append({"failureText": "runner crashed"})
        self.assertFalse(expected_result(*args))
        args = deepcopy(base)
        args[0]["testFailures"][1] = args[0]["testFailures"][0]
        self.assertFalse(expected_result(*args))

    def test_skips_counts_and_case_identity(self):
        for key, value in (("skippedTests", 1), ("failedTests", 3), ("passedTests", 1),
                           ("totalTestCount", 3), ("expectedFailures", 1), ("result", "Passed")):
            args = evidence(True)
            args[0][key] = value
            self.assertFalse(expected_result(*args), key)
        base = evidence(True)
        for replacement in ([], [base[1][0]], [("Wrong/test()", "Failed")]):
            args = deepcopy(base)
            args[1][1:] = replacement
            self.assertFalse(expected_result(*args))
        args = evidence(False)
        args[0]["testFailures"].append({"failureText": "unexpected"})
        self.assertFalse(expected_result(*args))

    def test_matching_device_tree_summary_and_exit(self):
        args = evidence(True)
        args[0]["devicesAndConfigurations"][0]["device"]["deviceId"] = "different"
        self.assertFalse(expected_result(*args))
        args = evidence(False)
        args[2].append(dict(args[2][0]))
        self.assertFalse(expected_result(*args))
        args = evidence(True)
        args[2][0]["platform"] = "macOS"
        self.assertFalse(expected_result(*args))
        args = evidence(True)
        args[5] = 1
        self.assertFalse(expected_result(*args))


if __name__ == "__main__":
    unittest.main()
