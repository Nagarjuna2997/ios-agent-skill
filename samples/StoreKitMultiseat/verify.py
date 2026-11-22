"""Compile the example at the paywall's deployment target using the selected Xcode."""
import argparse
import platform
from pathlib import Path
import re
import subprocess
import tempfile


def verify(require_multiseat):
    sdk = subprocess.check_output(["xcrun", "--sdk", "iphonesimulator", "--show-sdk-path"], text=True).strip()
    version = subprocess.check_output(["xcrun", "--sdk", "iphonesimulator", "--show-sdk-version"], text=True).strip()
    major, minor = (int(n) for n in re.match(r'^(\d+)\.(\d+)', version).groups())
    source = Path(__file__).with_name("GroupSubscription.swift")
    paywall = source.resolve().parents[2] / "capabilities/storekit2-paywall/template/Store.swift"
    triple = f"{platform.machine()}-apple-ios17.0-simulator"
    with tempfile.TemporaryDirectory() as tmp:
        compile_args = ["xcrun", "swiftc", "-swift-version", "6", "-typecheck", "-sdk", sdk,
                        "-target", triple, "-module-cache-path", tmp, str(source), str(paywall)]
        subprocess.run(compile_args, check=True)
        print(f"PASS single-seat paywall and legacy branch (SDK {version}, target {triple})", flush=True)
        if (major, minor) < (27, 3):
            print("SKIPPED multiseat compilation: select Xcode 27.3 beta 2 or later.")
            return int(require_multiseat)
        subprocess.run(compile_args + ["-D", "IOS_AGENT_STOREKIT_MULTISEAT"], check=True)
        print(f"PASS multiseat compilation (SDK {version}, target {triple})")
        return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--require-multiseat", action="store_true", help="Fail if the beta branch cannot be tested")
    raise SystemExit(verify(parser.parse_args().require_multiseat))
