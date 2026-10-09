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
      const b = el("button", p.name, p.id === selected ? "active" : "");
      b.setAttribute("aria-current", p.id === selected ? "true" : "false");
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
    if ($("activity").open) await refreshLog(id);
    return;
  }
  current = p;
  $("backend-panel").hidden = p.backend !== "local";
  $("live-start").disabled = p.busy || !p.evidence || p.template !== "custom";
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
    if (p.template === "agent" && p.agentPlan?.designDirections) {
      const label = el("label", "Design direction"); label.htmlFor = "design-direction";
      const select = el("select", ""); select.id = "design-direction";
      for (const direction of p.agentPlan.designDirections) {
        const option = el("option", direction.name + " — " + direction.rationale); option.value = direction.id;
        option.selected = direction.id === p.agentPlan.selectedDesign; select.append(option);
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
  $("verify").textContent =
    ["agent", "custom"].includes(p.template) ? "Run app checks" : "Check starter";
  $("scope-note").textContent =
    p.template === "agent" ? "Shared CLI workflow: build, tests, screenshots and design review. Evidence details are in RUN_REPORT.md." : p.template === "custom"
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
    p.template === "agent" ? Object.keys(p.evidence?.screens ?? {}).map(k => [k,k]) : p.template === "custom"
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
  action("refine", $("change").value);
};
$("screen").onchange = () => {
  if (current?.evidence) screenshot().catch(error);
};
for (const name of ["reveal", "xcode"])
  $(name).onclick = () => api(`projects/${selected}/${name}`, {}).catch(error);
// Appearance: same behavior as the website toggle (system default, saved preference).
const systemDark = matchMedia("(prefers-color-scheme: dark)");
let appearance = null;
try { appearance = localStorage.getItem("studio-theme"); } catch {}
function renderAppearance() {
  const dark = appearance === "dark" || (appearance !== "light" && systemDark.matches);
  document.documentElement.dataset.appearance = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#101113" : "#f5f5f7");
  const t = $("theme");
  t.setAttribute("aria-pressed", String(dark));
  t.setAttribute("aria-label", dark ? "Use light appearance" : "Use dark appearance");
  t.querySelector("span[aria-hidden]").textContent = dark ? "☀" : "☾";
  t.querySelector(".appearance-label").textContent = dark ? "Light mode" : "Dark mode";
}
$("theme").onclick = () => {
  appearance = document.documentElement.dataset.appearance === "dark" ? "light" : "dark";
  try { localStorage.setItem("studio-theme", appearance); } catch {}
  renderAppearance();
};
systemDark.addEventListener("change", () => { if (!appearance) renderAppearance(); });
renderAppearance();
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

let liveWasRunning=false,liveActive=false,livePolling=false,liveFrame=0,liveProject=null,pointerStart=null;
$("template").onchange=()=>{ $("backend").disabled=$("template").value!=="custom";if($("backend").disabled)$("backend").value="none"; };
$("live-start").onclick=async()=>{try{await api(`projects/${selected}/live-start`,{});liveProject=selected;liveFrame=0;await pollLive();}catch(e){error(e);}};
$("live-stop").onclick=async()=>{try{await api(`projects/${liveProject}/live-stop`,{});await pollLive();}catch(e){error(e);}};
async function liveCommand(command){try{await api(`projects/${selected}/live-input`,command);}catch(e){error(e);}}
$("live-input").onsubmit=e=>{e.preventDefault();liveCommand({action:"type",text:$("live-text").value});$("live-text").value="";};
$("live-return").onclick=()=>liveCommand({action:"type",text:"\n"});
$("live-relaunch").onclick=()=>liveCommand({action:"relaunch"});
$("capture").onpointerdown=e=>{if(!liveActive)return;const r=e.currentTarget.getBoundingClientRect();pointerStart={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();};
$("capture").onpointerup=e=>{if(!liveActive||!pointerStart)return;const r=e.currentTarget.getBoundingClientRect();const endX=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),endY=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));const start=pointerStart;pointerStart=null;liveCommand(Math.hypot(start.x-endX,start.y-endY)>0.035?{action:"swipe",...start,endX,endY}:{action:"tap",...start});};
async function pollLive(){
 if(livePolling)return;livePolling=true;
 try{
 const s=await api("live"),was=liveActive;
 liveProject=s.project??null;liveActive=s.project===selected&&s.state==="ready";
 const running=["starting","ready","stopping"].includes(s.state);
 $("live-stop").hidden=!running;$("live-start").disabled=running||!current?.evidence||current?.template!=="custom";
 $("live-status").textContent=running?`${s.state} · ${s.device??"simulator"} · input ${s.completed??0}/${s.queued??0}${s.inputError?" · "+s.inputError:""}`:(s.error||"Captures are saved test evidence.");
 $("live-input").hidden=!liveActive;$("capture").classList.toggle("interactive",liveActive);$("screen").disabled=running||!current?.evidence;
 if(running)$("refine").querySelector("button").disabled=true;
 for(const id of ["build","verify","plan-button","restore","export"])if(running)$(id).disabled=true;
 if(liveActive){$("evidence").textContent="LIVE · Tap or drag the simulator image. This is interactive development, not acceptance evidence.";
 if(s.frame!==liveFrame){const project=selected;const response=await fetch("/api/live/frame",{headers:{"X-Studio-Token":token}});if(response.ok){const blob=await response.blob();if(project===selected&&liveActive){if(imageURL)URL.revokeObjectURL(imageURL);imageURL=URL.createObjectURL(blob);$("capture").src=imageURL;$("capture").alt="Live interactive simulator";$("capture").hidden=false;$("placeholder").hidden=true;liveFrame=s.frame;lastImage="";}}}}
 else if(liveWasRunning&&!running){current=null;await refresh();}
 liveWasRunning=running;
 }catch(e){$("live-status").textContent=e.message;}finally{livePolling=false;}
}
setInterval(pollLive,1200);
$("backend-refresh").onclick=async()=>{try{const data=await api(`projects/${selected}/backend`);$("backend-records").textContent=JSON.stringify(data.records,null,2);}catch(e){error(e);}};
