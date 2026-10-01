const $ = (id) => document.getElementById(id),
  token = document.querySelector('meta[name="studio-token"]').content;
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
    ...projects.map((p) => {
      const b = el("button", "▧  " + p.name, p.id === selected ? "active" : "");
      b.onclick = () => load(p.id).catch(error);
      return b;
    }),
  );
}
async function load(id) {
  selected = id;
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
    if (document.querySelector(".preview details").open) await refreshLog(id);
    return;
  }
  current = p;
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
  $("verify").textContent =
    p.template === "custom" ? "Run app checks" : "Check starter";
  $("scope-note").textContent =
    p.template === "custom"
      ? "App-specific UI journeys are frozen before code generation. Manual criteria and behavior outside those journeys need review."
      : "Reading-list acceptance suite. Additional plan criteria need separate review.";
  $("build").disabled = p.busy || !p.plan;
  $("verify").disabled = p.busy || (p.template === "custom" && !p.plan);
  $("refine").querySelector("button").disabled = p.busy || !p.plan;
  $("stop").hidden = !p.busy;
  $("events").replaceChildren(
    ...p.events
      .slice(-10)
      .map((e) =>
        el("div", new Date(e.time).toLocaleTimeString() + " · " + e.text),
      ),
  );
  const options =
    p.template === "custom"
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
    await screenshot();
  } else {
    $("capture").hidden = true;
    $("placeholder").hidden = false;
    $("evidence").textContent = p.busy
      ? "Working on your Mac. The preview appears after checks pass."
      : "No current build evidence. Run checks to generate a preview.";
    lastImage = "";
  }
  if (document.querySelector(".preview details").open) await refreshLog(id);
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
    await api(`projects/${selected}/action`, { kind, message });
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
  $("name").value = "Chapter One";
  $("brief").value =
    "A calm reading-list app. Save books with a title and author, search my library, mark books finished, and keep everything on device. Make empty states welcoming and errors understandable. Use a warm, minimal SwiftUI design.";
  $("name").focus();
};
$("plan-button").onclick = () => action("plan");
$("build").onclick = () => action("build");
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
  action("refine", $("change").value);
};
$("screen").onchange = () => {
  if (current?.evidence) screenshot().catch(error);
};
for (const name of ["reveal", "xcode"])
  $(name).onclick = () => api(`projects/${selected}/${name}`, {}).catch(error);
$("theme").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "studio-theme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
};
if (
  localStorage.getItem("studio-theme") === "dark" ||
  (!localStorage.getItem("studio-theme") &&
    matchMedia("(prefers-color-scheme: dark)").matches)
)
  document.body.classList.add("dark");
list().catch((e) => {
  $("health").textContent = e.message;
});
api("health")
  .then((h) => {
    $("health").textContent = [
      h.codex ? "Codex installed" : "Codex unavailable",
      h.client ? "Claude Code installed" : "Claude Code unavailable",
      h.xcode?.replace(/\n/g, " · ") || "Xcode unavailable",
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
