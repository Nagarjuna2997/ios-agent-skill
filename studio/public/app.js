const $ = (id) => document.getElementById(id),
  token = document.querySelector('meta[name="studio-token"]').content;
let attachedReference = null;
let selected = null,
  current = null,
  lastImage = "",
  imageURL = null,
  polling = false;
async function api(url, body) {
  const r = await fetch("/api/" + url, {
    method: body ? "POST" : "GET",
    headers: {
      "X-Studio-Token": token,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const d = await r.json();
  if (!r.ok) throw Error(d.error);
  return d;
}
function error(e) {
  $("error").hidden = false;
  $("error").textContent = e.message;
}
function el(tag, text, cls) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (cls) node.className = cls;
  return node;
}
async function list() {
  const projects = await api("projects");
  $("projects").replaceChildren(
    ...projects
      .filter(
        (p) =>
          ($("show-archived").checked || !p.archived) &&
          JSON.stringify([p.name, p.brief, p.messages])
            .toLowerCase()
            .includes($("project-search").value.toLowerCase()),
      )
      .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
      .map((p) => {
        const b = el(
          "button",
          (p.pinned ? "★ " : "") + p.name,
          p.id === selected ? "active" : "",
        );
        b.setAttribute("aria-current", p.id === selected ? "true" : "false");
        b.onclick = () => load(p.id).catch(error);
        return b;
      }),
  );
}
async function load(id) {
  selected = id;
  attachedReference = null;
  $("send-attachment").checked = false;
  $("attachment-status").textContent = "No reference attached.";
  current = null;
  $("notice").hidden = true;
  $("capture").hidden = true;
  $("placeholder").hidden = false;
  lastImage = "";
  $("welcome").hidden = true;
  $("workspace").hidden = false;
  $("reveal").hidden = false;
  $("xcode").hidden = false;
  $("export").hidden = false;
  await refresh();
  await list();
}
async function refresh() {
  if (!selected) return;
  const id = selected;
  const p = await api("projects/" + id);
  if (id !== selected) return;
  if (current?.id === p.id && current.updated === p.updated) {
    if ($("activity").open) await refreshLog(id);
    return;
  }
  const switched = current?.id !== p.id;
  current = p;
  if (switched) {
    $("release-config").value = "";
    $("release-approval").value = "";
    $("release-image").hidden = true;
    $("release-image-select").replaceChildren();
    $("release-output").textContent = "No release operation performed.";
    $("artifact-select").replaceChildren();
    $("artifact-image").hidden = true;
    $("artifact-info").textContent = "Load captures for this project.";
    $("source-text").textContent = "Select a source file. Read only.";
    $("revision-diff").textContent = "Select a revision.";
    $("source-file").replaceChildren();
    $("revision-select").replaceChildren();
    $("project-scheme").replaceChildren(
      ...(p.importInfo?.schemes || []).map((name) => {
        const o = el("option", name);
        o.value = name;
        return o;
      }),
    );
    $("project-scheme").value = p.scheme || "";
    $("import-info").textContent = p.importInfo
      ? JSON.stringify(p.importInfo, null, 2)
      : "";
  }

  if (!$("project-settings").open) {
    $("project-name").value = p.name;
    $("project-provider").value = p.provider;
  }
  $("backend-panel").hidden = p.backend !== "local";
  $("live-start").disabled =
    p.busy ||
    !p.evidence ||
    !["custom", "agent", "imported"].includes(p.template);
  $("title").textContent = p.name;
  $("state").textContent = p.status;
  $("messages").replaceChildren(
    el("div", p.brief, "message user"),
    ...p.messages.map((m) => el("div", m.text, "message " + m.role)),
  );
  $("plan").hidden = !p.plan;
  if (p.plan) {
    $("plan").replaceChildren(
      el(
        "summary",
        "Your app, mapped out · " + p.plan.criteria.length + " checks",
      ),
    );
    for (const [title, items] of [
      ["Screens", p.plan.screens],
      ["Acceptance criteria", p.plan.criteria],
    ]) {
      const ul = el("ul", "");
      ul.append(...items.map((x) => el("li", x)));
      $("plan").append(el("h3", title), ul);
    }
    if (
      ["agent", "imported"].includes(p.template) &&
      p.agentPlan?.designDirections
    ) {
      const label = el("label", "Design direction");
      label.htmlFor = "design-direction";
      const select = el("select", "");
      select.id = "design-direction";
      for (const direction of p.agentPlan.designDirections) {
        const option = el(
          "option",
          direction.name + " — " + direction.rationale,
        );
        option.value = direction.id;
        option.selected = direction.id === p.agentPlan.selectedDesign;
        select.append(option);
      }
      select.disabled = p.busy || !!p.agentPlan.selectedDesign;
      $("plan").append(label, select);
    }
    if (p.plan.journeys) {
      $("plan").append(el("h3", "Automated journeys · fixed before coding"));
      for (const j of p.plan.journeys) {
        const d = el("details", "");
        d.append(el("summary", j.name));
        const steps = el("ol", "");
        steps.append(
          ...j.steps.map((s) =>
            el(
              "li",
              s.action +
                (s.target ? " · " + s.target : "") +
                (s.value ? " → " + s.value : ""),
            ),
          ),
        );
        d.append(steps);
        $("plan").append(d);
      }
      if (p.plan.manualCriteria.length)
        $("plan").append(
          el(
            "p",
            "Manual review: " +
              p.plan.manualCriteria.map((i) => p.plan.criteria[i]).join(" · "),
          ),
        );
    }
  }
  $("error").hidden = !p.error;
  if (p.error) $("error").textContent = p.error;
  $("restore").hidden = !p.lastRevision;
  $("restore").disabled = p.busy;
  $("export").disabled = p.busy;
  $("plan-button").disabled = p.busy || (p.template === "custom" && !!p.plan);
  $("verify").textContent = ["agent", "custom", "imported"].includes(p.template)
    ? "Run app checks"
    : "Check starter";
  $("scope-note").textContent =
    p.template === "imported"
      ? "Imported workspace copy. Existing source and tests are preserved; selected-scheme tests and a launch screenshot do not establish full visual fidelity. Live interaction uses a separate trusted UI-test driver."
      : p.template === "agent"
        ? "Shared CLI workflow: build, tests, screenshots and design review. Evidence details are in RUN_REPORT.md."
        : p.template === "custom"
          ? "App-specific UI journeys are frozen before code generation. Manual criteria and behavior outside those journeys need review."
          : "Reading-list acceptance suite. Additional plan criteria need separate review.";
  $("build").disabled = p.busy || !p.plan;
  $("verify").disabled = p.busy || (p.template === "custom" && !p.plan);
  $("refine").querySelector("button").disabled =
    $("message-mode").value === "refine" && !p.plan;
  $("stop").hidden = !p.busy;
  $("events").replaceChildren(
    ...p.events
      .slice(-10)
      .map((e) =>
        el("div", new Date(e.time).toLocaleTimeString() + " · " + e.text),
      ),
  );
  const options = ["agent", "imported"].includes(p.template)
    ? Object.keys(p.evidence?.screens ?? {}).map((k) => [k, k])
    : p.template === "custom"
      ? (p.plan?.journeys ?? []).map((j) => [j.screen, j.name])
      : [
          ["library", "Library"],
          ["empty", "Empty state"],
          ["add", "Add book"],
          ["detail", "Book details"],
          ["search-empty", "No results"],
          ["error", "Error state"],
        ];
  const oldScreen = $("screen").value;
  $("screen").replaceChildren(
    ...options.map(([value, label]) => {
      const o = el("option", label);
      o.value = value;
      return o;
    }),
  );
  if (options.some(([v]) => v === oldScreen)) $("screen").value = oldScreen;
  $("screen").disabled = !p.evidence;
  if (p.evidence) {
    $("evidence").textContent =
      "Verified " +
      new Date(p.evidence.date).toLocaleString() +
      ". " +
      p.evidence.scope;
    if (!liveActive) await screenshot();
  } else {
    $("capture").hidden = true;
    $("placeholder").hidden = false;
    $("evidence").textContent = p.busy
      ? "Working on your Mac. The preview appears after checks pass."
      : "No current build evidence. Run checks to generate a preview.";
    lastImage = "";
  }
  if ($("activity").open) await refreshLog(id);
}
async function refreshLog(id) {
  const data = await api(`projects/${id}/log`);
  if (selected === id) $("logs").textContent = data.text;
}
async function screenshot() {
  const projectID = selected,
    screenName = $("screen").value,
    date = current.evidence.date;
  const matches = () =>
    selected === projectID &&
    $("screen").value === screenName &&
    current?.evidence?.date === date;
  const key = projectID + date + screenName;
  if (lastImage === key) return;
  $("capture").hidden = true;
  $("placeholder").hidden = false;
  const r = await fetch(
    `/api/projects/${selected}/screen?name=${$("screen").value}`,
    { headers: { "X-Studio-Token": token } },
  );
  if (!matches()) return;
  if (!r.ok) {
    $("capture").hidden = true;
    $("placeholder").hidden = false;
    throw Error((await r.json()).error);
  }
  const blob = await r.blob();
  if (!matches()) return;
  if (imageURL) URL.revokeObjectURL(imageURL);
  imageURL = URL.createObjectURL(blob);
  $("capture").src = imageURL;
  $("capture").alt =
    $("screen").selectedOptions[0].text + " — simulator capture";
  $("capture").hidden = false;
  $("placeholder").hidden = true;
  lastImage = key;
}
async function action(kind, message) {
  try {
    const queued = await api("tasks", {
      project: selected,
      kind,
      message: message || "",
      preset: ["plan", "build", "verify"].includes(kind)
        ? "builder"
        : $("preset").value,
      requestId: crypto.randomUUID(),
      attachments:
        $("send-attachment").checked && attachedReference
          ? [attachedReference]
          : [],
    });
    watchTask(queued.id, selected).catch(error);
    await renderTasks();
    await refresh();
  } catch (e) {
    error(e);
  }
}
$("create").onsubmit = async (e) => {
  e.preventDefault();
  const b = e.submitter;
  b.disabled = true;
  try {
    const p = await api("projects", {
      name: $("name").value,
      brief: $("brief").value,
      provider: $("provider").value,
      template: $("template").value,
      backend: $("backend").value,
    });
    await load(p.id);
  } catch (e) {
    alert(e.message);
  } finally {
    b.disabled = false;
  }
};
$("new").onclick = () => {
  selected = null;
  current = null;
  $("notice").hidden = true;
  $("workspace").hidden = true;
  $("welcome").hidden = false;
  $("reveal").hidden = true;
  $("xcode").hidden = true;
  $("export").hidden = true;
  $("title").textContent = "A little idea. A real app.";
  list().catch(error);
};
$("demo").onclick = () => {
  $("template").value = "reading-list";
  $("backend").value = "none";
  $("name").value = "Chapter One";
  $("brief").value =
    "A calm reading-list app. Save books with a title and author, search my library, mark books finished, and keep everything on device. Make empty states welcoming and errors understandable. Use a warm, minimal SwiftUI design.";
  $("name").focus();
};
$("plan-button").onclick = () => action("plan");
$("build").onclick = () => action("build", $("design-direction")?.value);
$("verify").onclick = () => action("verify");
$("stop").onclick = async () => {
  try {
    await api(`projects/${selected}/cancel`, {});
  } catch (e) {
    error(e);
  }
};
$("refine").onsubmit = (e) => {
  e.preventDefault();
  action($("message-mode").value, $("change").value);
};
$("screen").onchange = () => {
  if (current?.evidence) screenshot().catch(error);
};
for (const name of ["reveal", "xcode"])
  $(name).onclick = () => api(`projects/${selected}/${name}`, {}).catch(error);
// Appearance: same behavior as the website toggle (system default, saved preference).
const systemDark = matchMedia("(prefers-color-scheme: dark)");
let appearance = null;
try {
  appearance = localStorage.getItem("studio-theme");
} catch {}
function renderAppearance() {
  const dark =
    appearance === "dark" || (appearance !== "light" && systemDark.matches);
  document.documentElement.dataset.appearance = dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#101113" : "#f5f5f7");
  const t = $("theme");
  t.setAttribute("aria-pressed", String(dark));
  t.setAttribute(
    "aria-label",
    dark ? "Use light appearance" : "Use dark appearance",
  );
  t.querySelector("span[aria-hidden]").textContent = dark ? "☀" : "☾";
  t.querySelector(".appearance-label").textContent = dark
    ? "Light mode"
    : "Dark mode";
}
$("theme").onclick = () => {
  appearance =
    document.documentElement.dataset.appearance === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("studio-theme", appearance);
  } catch {}
  renderAppearance();
};
systemDark.addEventListener("change", () => {
  if (!appearance) renderAppearance();
});
renderAppearance();
list().catch((e) => {
  $("health").textContent = e.message;
});
api("health")
  .then((h) => {
    $("health").textContent = [
      h.codex
        ? "Codex · " + (h.authentication?.codex || "authentication unknown")
        : "Codex unavailable",
      h.client
        ? "Claude · " + (h.authentication?.claude || "authentication unknown")
        : "Claude Code unavailable",
      h.xcode?.replace(/\n/g, " · ") || "Xcode unavailable",
      h.xcodegen || "XcodeGen missing: install XcodeGen for shared-agent app generation",
      h.simulator
        ? "iOS Simulator available"
        : "Install an iOS Simulator runtime in Xcode",
    ].join("   /   ");
  })
  .catch((e) => {
    $("health").textContent = e.message;
  });
setInterval(async () => {
  if (!selected || polling) return;
  polling = true;
  try {
    await refresh();
  } catch (e) {
    error(e);
  } finally {
    polling = false;
  }
}, 2000);

$("restore").onclick = async () => {
  try {
    await api(`projects/${selected}/restore`, {});
    await refresh();
  } catch (e) {
    error(e);
  }
};
$("export").onclick = async () => {
  const id = selected;
  try {
    const result = await api(`projects/${id}/export`, {});
    if (selected !== id) return;
    $("notice").hidden = false;
    $("notice").textContent =
      `Saved ${result.filename} in your workspace’s exports folder. Choose Project files to find it.`;
  } catch (e) {
    error(e);
  }
};

$("habit-demo").onclick = () => {
  $("template").value = "custom";
  $("name").value = "Pocket Habits";
  $("brief").value =
    "Build a calm offline habit tracker. Add a habit with a name, see all habits, mark a habit completed today and undo completion. A Progress tab shows completed versus total habits. Persist habits and completion across launches. Use native SwiftUI tabs, a sage accent, accessible controls and friendly empty states. No accounts or network.";
  $("name").focus();
};

let liveWasRunning = false,
  liveActive = false,
  livePolling = false,
  liveFrame = 0,
  liveProject = null,
  pointerStart = null;
$("template").onchange = () => {
  $("backend").disabled = $("template").value !== "custom";
  if ($("backend").disabled) $("backend").value = "none";
};
$("live-start").onclick = async () => {
  try {
    await api(`projects/${selected}/live-start`, {});
    liveProject = selected;
    liveFrame = 0;
    await pollLive();
  } catch (e) {
    error(e);
  }
};
$("live-stop").onclick = async () => {
  try {
    await api(`projects/${liveProject}/live-stop`, {});
    await pollLive();
  } catch (e) {
    error(e);
  }
};
async function liveCommand(command) {
  try {
    await api(`projects/${selected}/live-input`, command);
  } catch (e) {
    error(e);
  }
}
$("live-input").onsubmit = (e) => {
  e.preventDefault();
  liveCommand({ action: "type", text: $("live-text").value });
  $("live-text").value = "";
};
$("live-return").onclick = () => liveCommand({ action: "type", text: "\n" });
$("live-relaunch").onclick = () => liveCommand({ action: "relaunch" });
$("capture").onpointerdown = (e) => {
  if (!liveActive) return;
  const r = e.currentTarget.getBoundingClientRect();
  pointerStart = {
    x: (e.clientX - r.left) / r.width,
    y: (e.clientY - r.top) / r.height,
  };
  e.currentTarget.setPointerCapture(e.pointerId);
  e.preventDefault();
};
$("capture").onpointerup = (e) => {
  if (!liveActive || !pointerStart) return;
  const r = e.currentTarget.getBoundingClientRect();
  const endX = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
    endY = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
  const start = pointerStart;
  pointerStart = null;
  liveCommand(
    Math.hypot(start.x - endX, start.y - endY) > 0.035
      ? { action: "swipe", ...start, endX, endY }
      : { action: "tap", ...start },
  );
};
async function pollLive() {
  if (livePolling) return;
  livePolling = true;
  try {
    const s = await api("live"),
      was = liveActive;
    liveProject = s.project ?? null;
    liveActive = s.project === selected && s.state === "ready";
    const running = ["starting", "ready", "stopping"].includes(s.state);
    $("live-stop").hidden = !running;
    $("live-start").disabled =
      running ||
      !current?.evidence ||
      !["custom", "agent", "imported"].includes(current?.template);
    $("live-status").textContent = running
      ? `${s.state} · ${s.device ?? "simulator"} · input ${s.completed ?? 0}/${s.queued ?? 0}${s.inputError ? " · " + s.inputError : ""}`
      : s.error || "Captures are saved test evidence.";
    $("live-input").hidden = !liveActive;
    $("capture").classList.toggle("interactive", liveActive);
    $("screen").disabled = running || !current?.evidence;
    if (running) $("refine").querySelector("button").disabled = true;
    for (const id of ["build", "verify", "plan-button", "restore", "export"])
      if (running) $(id).disabled = true;
    if (liveActive) {
      $("evidence").textContent =
        "LIVE · Tap or drag the simulator image. This is interactive development, not acceptance evidence.";
      if (s.frame !== liveFrame) {
        const project = selected;
        const response = await fetch("/api/live/frame", {
          headers: { "X-Studio-Token": token },
        });
        if (response.ok) {
          const blob = await response.blob();
          if (project === selected && liveActive) {
            if (imageURL) URL.revokeObjectURL(imageURL);
            imageURL = URL.createObjectURL(blob);
            $("capture").src = imageURL;
            $("capture").alt = "Live interactive simulator";
            $("capture").hidden = false;
            $("placeholder").hidden = true;
            liveFrame = s.frame;
            lastImage = "";
          }
        }
      }
    } else if (liveWasRunning && !running) {
      current = null;
      await refresh();
    }
    liveWasRunning = running;
  } catch (e) {
    $("live-status").textContent = e.message;
  } finally {
    livePolling = false;
  }
}
setInterval(pollLive, 1200);
$("backend-refresh").onclick = async () => {
  try {
    const data = await api(`projects/${selected}/backend`);
    $("backend-records").textContent = JSON.stringify(data.records, null, 2);
  } catch (e) {
    error(e);
  }
};

$("project-search").oninput = () => list().catch(error);
$("show-archived").onchange = () => list().catch(error);
$("preset").onchange = () => {
  $("message-mode").value = {
    reviewer: "review",
    release: "readiness",
    builder: "refine",
    designer: "refine",
    debugger: "ask",
  }[$("preset").value];
  $("message-mode").dispatchEvent(new Event("change"));
};
for (const [id, variable] of [
  ["sidebar-width", "--sidebar-width"],
  ["inspector-width", "--inspector-width"],
])
  $(id).oninput = () =>
    document.documentElement.style.setProperty(variable, $(id).value + "px");
async function settings(changes) {
  if (!selected) return;
  await api(`projects/${selected}/settings`, changes);
  current = null;
  await refresh();
  await list();
}
$("save-project").onclick = () =>
  settings({
    name: $("project-name").value,
    provider: $("project-provider").value,
    ...(current?.template === "imported"
      ? { scheme: $("project-scheme").value }
      : {}),
    simulator: $("project-simulator").value,
  }).catch(error);
$("pin-project").onclick = () =>
  settings({ pinned: !current?.pinned }).catch(error);
$("archive-project").onclick = () =>
  settings({ archived: !current?.archived }).catch(error);
$("delete-project").onclick = async () => {
  if (!current) return;
  const confirmation = prompt(
    "Type the project name to move this workspace into recoverable local trash: " +
      current.name,
  );
  if (confirmation === null) return;
  try {
    await api(`projects/${selected}/delete`, { confirmation });
    $("new").click();
  } catch (e) {
    error(e);
  }
};
$("clear-tasks").onclick = async () => {
  if (
    confirm(
      "Clear completed task event history? Source and evidence will remain.",
    )
  ) {
    try {
      await api("tasks/clear", {});
      await renderTasks();
    } catch (e) {
      error(e);
    }
  }
};
let taskPolling = false;
async function renderTasks() {
  if (taskPolling) return;
  taskPolling = true;
  try {
    const tasks = await api("tasks");
    $("task-queue").replaceChildren(
      ...tasks
        .slice(-30)
        .reverse()
        .map((t) => {
          const box = el("article", null, "task-card");
          box.append(el("strong", t.kind + " · " + t.status));
          const elapsed = t.started
            ? Math.round(
                ((t.finished ? Date.parse(t.finished) : Date.now()) -
                  Date.parse(t.started)) /
                  1000,
              )
            : 0;
          box.append(
            el("p", elapsed ? elapsed + "s · " + t.provider : t.provider),
          );
          const details = el("details");
          details.append(el("summary", "Activity"));
          for (const event of t.events.slice(-10))
            details.append(
              el(
                "p",
                event.type +
                  ": " +
                  (event.data.text ||
                    event.data.message ||
                    event.data.error ||
                    ""),
              ),
            );
          box.append(details);
          for (const [operation, label] of t.status === "awaiting_approval"
            ? [
                ["approve", "Approve source changes"],
                ["cancel", "Cancel"],
              ]
            : ["queued", "running"].includes(t.status)
              ? [["cancel", "Stop"]]
              : ["failed", "cancelled", "interrupted"].includes(t.status) ? [["retry", "Retry with fresh approval"]] : []) {
            const b = el("button", label, "btn");
            b.onclick = async () => {
              try {
                await api(`tasks/${t.id}/${operation}`, {});
                await renderTasks();
              } catch (e) {
                error(e);
              }
            };
            box.append(b);
          }
          return box;
        }),
    );
  } finally {
    taskPolling = false;
  }
}
setInterval(
  () =>
    renderTasks().catch((e) => {
      $("task-queue").textContent = "Disconnected: " + e.message;
    }),
  1500,
);
renderTasks().catch(error);
$("refresh-source").onclick = async () => {
  try {
    const id = selected;
    if (!id) return;
    const data = await api(`projects/${id}/source`);
    if (id !== selected) return;
    $("source-file").replaceChildren(
      el("option", "Choose file…"),
      ...data.files.map((f) => {
        const o = el("option", f.path);
        o.value = f.path;
        return o;
      }),
    );
  } catch (e) {
    error(e);
  }
};
$("source-file").onchange = async () => {
  try {
    const id = selected;
    const data = await api(
      `projects/${id}/source?path=${encodeURIComponent($("source-file").value)}`,
    );
    if (id === selected) $("source-text").textContent = data.text;
  } catch (e) {
    error(e);
  }
};
$("refresh-revisions").onclick = async () => {
  try {
    const rows = await api(`projects/${selected}/revisions`);
    $("revision-select").replaceChildren(
      el("option", "Choose revision…"),
      ...rows.map((r) => {
        const o = el("option", new Date(Number(r.id)).toLocaleString());
        o.value = r.id;
        return o;
      }),
    );
  } catch (e) {
    error(e);
  }
};
$("revision-select").onchange = async () => {
  try {
    const id = selected,
      data = await api(
        `projects/${id}/revisions/${$("revision-select").value}`,
      );
    if (id === selected)
      $("revision-diff").textContent =
        data.changes
          .map(
            (f) =>
              `FILE ${f.path}\nBEFORE\n${f.before ?? "(new file)"}\nAFTER\n${f.after ?? "(deleted)"}`,
          )
          .join("\n\n") || "No source differences.";
  } catch (e) {
    error(e);
  }
};
$("attachment").onchange = async () => {
  try {
    const f = $("attachment").files[0];
    if (!f || !selected) return;
    if (f.size > 8000000) throw Error("Maximum attachment size is 8 MB");
    const data = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result.split(",")[1]);
      r.onerror = reject;
      r.readAsDataURL(f);
    });
    const saved = await api(`projects/${selected}/attachment`, {
      name: f.name,
      type: f.type || "text/plain",
      data,
    });
    attachedReference = saved.id;
    $("attachment-status").textContent =
      f.name + " saved locally. Not sent to provider.";
  } catch (e) {
    error(e);
  }
};

$("import-project").onclick = async () => {
  try {
    const p = await api("import-project", { provider: $("provider").value });
    await load(p.id);
  } catch (e) {
    error(e);
  }
};
$("refresh-simulators").onclick = async () => {
  try {
    const rows = await api("universal/simulators");
    $("project-simulator").replaceChildren(
      el("option", "Choose simulator…"),
      ...rows.map((d) => {
        const o = el("option", d.name + " · " + d.runtime);
        o.value = d.udid;
        return o;
      }),
    );
    $("project-simulator").options[0].value = "";
    $("project-simulator").value = current?.simulator || "";
  } catch (e) {
    error(e);
  }
};
let capabilityRows = [];
function renderCapabilities() {
  const q = $("capability-search").value.toLowerCase();
  $("capability-list").replaceChildren(
    ...capabilityRows
      .filter((c) =>
        JSON.stringify([c.name, c.description, c.category])
          .toLowerCase()
          .includes(q),
      )
      .map((c) => {
        const row = el("details");
        row.append(
          el("summary", c.name),
          el("p", c.description),
          el("p", "Verification: " + c.status + ". " + (c.statusNote || "")),
          el("p", JSON.stringify(c.credentials || c.configuration || [])),
        );
        const b = el("button", "Request this capability", "btn");
        b.onclick = () => {
          if (!selected) {
            $("brief").value += " Add " + c.name;
            $("brief").focus();
          } else {
            $("change").value =
              "Add " +
              c.name +
              " (" +
              c.id +
              "). Explain prerequisites and unverified behavior first.";
            $("message-mode").value = "refine";
            $("change").focus();
          }
        };
        row.append(b);
        return row;
      }),
  );
}
api("capabilities")
  .then((rows) => {
    capabilityRows = rows;
    renderCapabilities();
  })
  .catch(error);
$("capability-search").oninput = renderCapabilities;

let streamController = null;
async function watchTask(id, project) {
  streamController?.abort();
  streamController = new AbortController();
  const signal = streamController.signal;
  let after = 0;
  $("stream-response").textContent = "Waiting for execution…";
  for (let retry = 0; retry < 3 && !signal.aborted; retry++) {
    try {
      const response = await fetch(`/api/tasks/${id}/stream?after=${after}`, {
        headers: { "X-Studio-Token": token },
        signal,
      });
      if (!response.ok) throw Error("Task stream disconnected");
      const reader = response.body.getReader(),
        decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) return;
        buffer += decoder.decode(value, { stream: true });
        let pos;
        while ((pos = buffer.indexOf("\n")) >= 0) {
          const event = JSON.parse(buffer.slice(0, pos));
          buffer = buffer.slice(pos + 1);
          after = event.sequence;
          if (project !== selected) continue;
          if (event.type === "assistant_delta")
            $("stream-response").textContent = (
              $("stream-response").textContent + event.data.text
            ).slice(-64000);
          if (event.type === "assistant_message")
            $("stream-response").textContent = event.data.text;
        }
      }
    } catch (e) {
      if (signal.aborted) return;
      if (retry === 2) throw e;
      await new Promise((r) => setTimeout(r, 500 * (retry + 1)));
    }
  }
}

api("settings")
  .then((s) => {
    $("task-timeout").value = s.taskTimeoutMinutes;
    $("repair-limit").value = s.repairLimit;
    $("capture-limit").value = s.captureLimit;
    $("default-simulator").value = s.defaultSimulator;
  })
  .catch(error);
$("save-execution").onclick = () =>
  api("settings", {
    taskTimeoutMinutes: Number($("task-timeout").value),
    repairLimit: Number($("repair-limit").value),
    captureLimit: Number($("capture-limit").value),
    defaultSimulator: $("default-simulator").value.trim(),
  })
    .then(() => {
      $("save-execution").textContent = "Limits saved";
    })
    .catch(error);

$("message-mode").onchange = () => {
  $("refine").querySelector("button").disabled =
    $("message-mode").value === "refine" && !current?.plan;
};

let artifactURL;
$("refresh-artifacts").onclick = async () => {
  const id = selected;
  try {
    const rows = await api(`projects/${id}/artifacts`);
    if (selected !== id) return;
    $("artifact-image").hidden = true;
    $("artifact-select").replaceChildren(el("option", "Choose saved capture…"));
    for (const record of rows) for (const name of Object.keys(record.evidence.screens)) {
      const option = el("option", `${record.evidence.date} · ${name} · ${record.stale === null ? "current source unavailable" : record.stale ? "stale source" : "matching source"}`);
      option.value = record.id + "/" + name;
      option.dataset.description = `${record.evidence.scope} Device: ${record.device ?? "not recorded"}. Source: ${record.evidence.sourceHash}. Task: ${record.task ?? "not recorded"}. Historical record; no additional checks implied.`;
      $("artifact-select").append(option);
    }
    $("artifact-info").textContent = rows.length ? "Choose a historical capture. Source matching alone does not prove current runtime behavior." : "No archived captures yet. New verified captures are retained automatically.";
  } catch(e) { error(e); }
};
$("artifact-select").onchange = async () => {
  const id = selected, value = $("artifact-select").value;
  if (!value.includes("/")) return;
  const [record, name] = value.split("/");
  try {
    const response = await fetch(`/api/projects/${id}/artifacts/${record}?name=${encodeURIComponent(name)}`, { headers: { "X-Studio-Token": token } });
    if (!response.ok) throw Error((await response.json()).error);
    const blob = await response.blob();
    if (selected !== id || $("artifact-select").value !== value) return;
    if (artifactURL) URL.revokeObjectURL(artifactURL);
    artifactURL = URL.createObjectURL(blob);
    $("artifact-image").src = artifactURL;
    $("artifact-image").hidden = false;
    $("artifact-info").textContent = $("artifact-select").selectedOptions[0].dataset.description;
  } catch(e) { error(e); }
};

$("delete-artifact").onclick = async () => {
  const value = $("artifact-select").value;
  if (!value.includes("/")) return;
  const id = value.split("/")[0];
  if (!confirm("Permanently delete this archived capture set? Current source and current captures will remain.")) return;
  try { await api(`projects/${selected}/artifacts/${id}`, { confirmation: id }); await $("refresh-artifacts").onclick(); }
  catch(e) { error(e); }
};

$("load-release").onclick = async () => {
  const id = selected;
  try { const draft = await api(`projects/${id}/release`); if (id === selected) $("release-config").value = JSON.stringify(draft, null, 2); } catch(e) { error(e); }
};
for (const [button, route] of [["save-release", ""], ["prepare-release", "/prepare"], ["review-release", "/files"]]) {
  $(button).onclick = async () => {
    const id = selected;
    $(button).disabled = true;
    try {
      $("release-output").textContent = "Working on local release documents…";
      const result = await api(`projects/${id}/release${route}`, route === "/files" ? undefined : JSON.parse($("release-config").value));
      if (id === selected) {
        $("release-output").textContent = JSON.stringify(result, null, 2);
        if (route === "/files") $("release-image-select").replaceChildren(el("option", "Choose prepared screenshot…"), ...result.files.filter(n => /^screenshots-[0-9]+\/(?:[a-zA-Z0-9-]+\/){0,3}[a-zA-Z0-9_.-]+\.png$/.test(n)).map(name => { const item=el("option",name);item.value=name;return item; }));
      }
    } catch(e) { if (id === selected) $("release-output").textContent = e.message; }
    finally { $(button).disabled = false; }
  };
}

for (const action of ["archive", "upload"]) $(action + "-release").onclick = async () => {
  const id = selected;
  if (!confirm(action === "archive" ? "Sign and archive this app using the reviewed configuration? Provisioning changes occur only if enabled in that configuration." : "Upload the approved signed archive to Apple? Check any previous uncertain upload in App Store Connect first.")) return;
  try {
    const result = await api(`projects/${id}/release/${action}`, { approved: true, confirmation: $("release-approval").value });
    if (id === selected) { $("release-output").textContent = JSON.stringify(result, null, 2); $("release-approval").value = ""; }
  } catch(e) { if (id === selected) $("release-output").textContent = e.message; }
};
$("release-status").onclick = async () => {
  const id = selected;
  try { const p = await api(`projects/${id}`); if (id === selected) $("release-output").textContent = JSON.stringify(p.release ?? { status: "not-prepared" }, null, 2); }
  catch(e) { error(e); }
};

let releaseImageURL;
$("release-image-select").onchange = async () => {
  const id=selected, name=$("release-image-select").value;
  if (!name.endsWith(".png")) return;
  try {
    const response=await fetch(`/api/projects/${id}/release/image?path=${encodeURIComponent(name)}`,{headers:{"X-Studio-Token":token}});
    if(!response.ok) throw Error((await response.json()).error);
    const blob=await response.blob();
    if(id!==selected || name!==$("release-image-select").value)return;
    if(releaseImageURL)URL.revokeObjectURL(releaseImageURL);
    releaseImageURL=URL.createObjectURL(blob);$("release-image").src=releaseImageURL;$("release-image").hidden=false;
  } catch(e){error(e);}
};

$("use-project-simulator").onclick=()=>{ $("default-simulator").value=current?.simulator ?? ""; };
