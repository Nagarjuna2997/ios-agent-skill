#!/usr/bin/env bash
# For a disposable GitHub-hosted Linux runner. No paid provider or GitHub token.
set -euo pipefail

model='qwen2.5-coder:0.5b-instruct'
model_sha=4ff64a7f502a08b7616edb8ca0a79eb1853fc363d842b7df4b46915d11a3fb09
ollama='ollama/ollama@sha256:2c9595c555fd70a28363489ac03bd5bf9e7c5bdf2890373c3a830ffd7252ce6d'
image="$(PYTHONPATH=benchmarks/v2 python3 -c 'import paired_worker; print(paired_worker.IMAGE)')"
out="${RUNNER_TEMP:?Use a disposable Linux CI runner}/paired-model"
prefix="ios-benchmark-${GITHUB_RUN_ID:?}-${GITHUB_RUN_ATTEMPT:?}"
volume="$prefix-weights"
preload="$prefix-preload"
server="$prefix-model"

cleanup() {
  docker rm -f "$preload" "$server" >/dev/null 2>&1 || true
  docker volume rm "$volume" >/dev/null 2>&1 || true
}
trap cleanup EXIT
wait_ready() {
  local container="$1"
  for attempt in {1..25}; do
    if docker exec "$container" ollama list >/dev/null 2>&1; then return 0; fi
    sleep 1
  done
  return 1
}

docker pull "$image"
docker pull "$ollama"
docker volume create "$volume" >/dev/null
# Internet is available only while downloading public model weights.
docker run -d --name "$preload" -v "$volume:/root/.ollama" -e OLLAMA_NO_CLOUD=1 "$ollama" >/dev/null
wait_ready "$preload"
docker exec "$preload" ollama pull "$model"
docker rm -f "$preload" >/dev/null

docker run -d --network=none --name "$server" --cpus=4 --memory=5g \
  -v "$volume:/root/.ollama" -e OLLAMA_NO_CLOUD=1 -e OLLAMA_HOST=127.0.0.1:11434 \
  "$ollama" >/dev/null
wait_ready "$server"
pid="$(docker inspect -f '{{.State.Pid}}' "$server")"
# Enter only the model's network namespace; the observer remains an unprivileged
# runner with Docker access. Candidate containers get their own private namespaces.
sudo nsenter --target "$pid" --net runuser -u "$(id -un)" -- \
  python3 benchmarks/v2/paired.py --mode ollama --model "$model" --model-digest "$model_sha" \
  --trials 1 --condition both --output "$out"

python3 - "$out/summary.json" <<'PY'
import json, sys
report = json.load(open(sys.argv[1]))
assert report['purpose'] == 'model-comparison' and len(report['pairs']) == 6
for pair in report['pairs']:
    for arm in ('baseline','optimized'):
        metrics = pair[arm + '_metrics']
        assert metrics['input_tokens'] is not None and metrics['output_tokens'] is not None
print('Six real-model pairs completed. Quality and token results are recorded independently.')
PY
