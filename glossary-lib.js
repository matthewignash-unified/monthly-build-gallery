// Shared glossary data source and entry rendering, used by glossary.html and
// current.html. Load before the page's own script; pages define track().

// Published-CSV URL of the glossary sheet. Columns:
// term, definition, example, category, month_introduced, image_url, demo_id
const GLOSSARY_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQINulIfxYQ5CB5MGjReIED8hexMv63S7GS2EYd1IsNa2LHxaEOYpZWIatZJ_rQQtNPakH5HQt7BC8V/pub?gid=932020898&single=true&output=csv";

// Pre-filled "Suggest a term" Google Form link. In the Form: Send → <> →
// Get pre-filled link, type {term} into the term question, copy the link,
// and paste it here (it keeps {term} where the answer goes). While empty,
// every "Suggest a term" link stays hidden.
const SUGGEST_TERM_URL = "";

// ── Demo registry ────────────────────────────────────────────────────────────
// To add a demo: add one entry here with build(stage) — which appends the
// live demo's DOM to `stage` — and `code`, the clean teachable snippet shown
// under "View the code". Then put the entry's key in the sheet's demo_id
// column for the matching term.
const DEMOS = {
  "accordion": {
    build(stage) {
      [["What is an accordion?", "A stack of sections that open one click at a time — the browser's <details> element does all the work."],
       ["When would I use one?", "Any time a page has more content than fits comfortably on screen: FAQs, weekly plans, station instructions."]]
      .forEach(([heading, text]) => {
        const item = el("details", "demo-acc");
        item.appendChild(el("summary", "", heading));
        item.appendChild(el("p", "", text));
        stage.appendChild(item);
      });
    },
    code: `<!-- Accordion: the browser does the work with <details>.
     Click the heading (or press Enter on it) to open and close. -->
<details>
  <summary>What is photosynthesis?</summary>
  <p>Plants use light energy to turn carbon dioxide and water into sugar.</p>
</details>

<details>
  <summary>Where does it happen?</summary>
  <p>In the chloroplasts, mostly inside leaf cells.</p>
</details>

<style>
  details { border: 1px solid #57BB8A; border-radius: 8px; margin-bottom: 6px; }
  summary { padding: 8px 12px; font-weight: bold; cursor: pointer; }
  details p { margin: 0; padding: 0 12px 10px; }
</style>`
  },

  "tabs": {
    build(stage) {
      const content = {
        "Instructions": "Read the passage on page 12, then answer the two questions in your journal.",
        "Timer": "10:00 — the class timer would count down here."
      };
      const bar = el("div", "demo-tabbar");
      bar.setAttribute("role", "tablist");
      const panel = el("div", "demo-tabpanel");
      panel.setAttribute("role", "tabpanel");
      Object.entries(content).forEach(([label, text], i) => {
        const tab = el("button", "demo-tab", label);
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", String(i === 0));
        tab.addEventListener("click", () => {
          bar.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", "false"));
          tab.setAttribute("aria-selected", "true");
          panel.textContent = text;
        });
        bar.appendChild(tab);
      });
      panel.textContent = content["Instructions"];
      stage.append(bar, panel);
    },
    code: `<!-- Tabs: two buttons swap what one shared area shows. -->
<div>
  <button onclick="show('instructions')">Instructions</button>
  <button onclick="show('timer')">Timer</button>
</div>
<div id="instructions">Read the passage, then answer the questions.</div>
<div id="timer" hidden>10:00 — timer goes here.</div>

<script>
  // Hide both panels, then show the one that was asked for.
  function show(id) {
    document.getElementById('instructions').hidden = true;
    document.getElementById('timer').hidden = true;
    document.getElementById(id).hidden = false;
  }
<\/script>`
  },

  "modal": {
    build(stage) {
      const dialog = el("dialog", "demo-dialog");
      dialog.appendChild(el("p", "", "This overlay sits on top of the page until you close it."));
      const close = el("button", "btn btn-small", "Close");
      close.addEventListener("click", () => dialog.close());
      dialog.appendChild(close);
      const open = el("button", "btn btn-small", "Open the overlay");
      open.addEventListener("click", () => dialog.showModal());
      stage.append(open, dialog);
    },
    code: `<!-- Modal: a button opens an overlay; Close (or Escape) dismisses it. -->
<button onclick="document.getElementById('box').showModal()">
  Open the overlay
</button>

<dialog id="box">
  <p>This overlay sits on top of the page until you close it.</p>
  <button onclick="document.getElementById('box').close()">Close</button>
</dialog>

<style>
  dialog { border: none; border-radius: 12px; padding: 18px; }
  dialog::backdrop { background: rgba(0, 0, 0, 0.5); }
</style>`
  },

  "dual-display": {
    build(stage) {
      const NAMES = ["Ava", "Liam", "Noor", "Mateo", "Yuki", "Zara", "Owen", "Priya"];
      const panes = el("div", "dd-panes");
      const teacher = el("div", "dd-pane");
      teacher.appendChild(el("div", "dd-label", "Teacher controls"));
      const pick = el("button", "btn btn-small", "Pick a name");
      teacher.appendChild(pick);
      const display = el("div", "dd-pane dd-display");
      display.appendChild(el("div", "dd-label", "Class display"));
      const name = el("div", "dd-name", "—");
      display.appendChild(name);
      pick.addEventListener("click", () => {
        name.textContent = NAMES[Math.floor(Math.random() * NAMES.length)];
      });
      panes.append(teacher, display);
      stage.appendChild(panes);
    },
    code: `<!-- Dual display: teacher controls on the left,
     big class-facing display on the right. -->
<div style="display: flex; gap: 10px;">
  <div>
    <h3>Teacher controls</h3>
    <button onclick="pick()">Pick a name</button>
  </div>
  <div style="flex: 1; text-align: center;">
    <h3>Class display</h3>
    <div id="name" style="font-size: 3em; font-weight: bold;">—</div>
  </div>
</div>

<script>
  // Sample names only — swap in your class list.
  const names = ["Ava", "Liam", "Noor", "Mateo", "Yuki", "Zara"];
  function pick() {
    const chosen = names[Math.floor(Math.random() * names.length)];
    document.getElementById('name').textContent = chosen;
  }
<\/script>`
  }
};

// ── Data loading ─────────────────────────────────────────────────────────────
function parseCsv(text) {
  const rows = [[]];
  let field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c !== '"') field += c;
      else if (text[i + 1] === '"') { field += '"'; i++; }
      else inQuotes = false;
    }
    else if (c === '"') inQuotes = true;
    else if (c === ",") { rows[rows.length - 1].push(field); field = ""; }
    else if (c === "\n") { rows[rows.length - 1].push(field); field = ""; rows.push([]); }
    else if (c !== "\r") field += c;
  }
  rows[rows.length - 1].push(field);
  if (rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") rows.pop();
  return rows;
}

function rowsToObjects(rows) {
  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map(cells =>
    Object.fromEntries(headers.map((h, i) => [h, (cells[i] || "").trim()]))
  );
}

function normalizeTerm(raw) {
  const t = {};
  for (const key of ["term", "definition", "example", "category", "month_introduced",
                     "image_url", "demo_id"]) {
    t[key] = String(raw[key] || "").trim();
  }
  return t;
}

async function loadGlossaryTerms() {
  const response = await fetch(GLOSSARY_SHEET_URL);
  if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);
  const terms = rowsToObjects(parseCsv(await response.text()))
    .map(normalizeTerm)
    .filter(t => t.term && t.definition);
  return terms.sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: "base" }));
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") ? url.href : null;
  } catch { return null; }
}

// Bare filenames resolve to this repo's images/glossary/ folder; Google Drive
// share links become thumbnail URLs (same rewrite as the archive); everything
// else passes through untouched.
function imageSrc(value) {
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) {
    return /^[\w][\w.-]*$/.test(value) ? `images/glossary/${value}` : null;
  }
  const url = safeUrl(value);
  if (!url) return null;
  const drive = url.match(/^https:\/\/drive\.google\.com\/(?:file\/d\/([\w-]+)|open\?id=([\w-]+))/);
  return drive ? `https://drive.google.com/thumbnail?id=${drive[1] || drive[2]}&sz=w1000` : url;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function suggestTermLink(term, label) {
  if (!SUGGEST_TERM_URL) return null;
  const link = el("a", "suggest-term", label);
  link.href = SUGGEST_TERM_URL.replace("{term}", encodeURIComponent(term));
  link.target = "_blank";
  link.rel = "noopener";
  link.addEventListener("click", () => track("term_suggested_click"));
  return link;
}

// ── Entry rendering ──────────────────────────────────────────────────────────
function demoNode(id, demo) {
  const box = el("div", "demo");
  const stage = el("div", "demo-stage");
  stage.appendChild(el("div", "demo-try", "Try it"));
  demo.build(stage);
  stage.addEventListener("click", () => track("demo_used", { demo_id: id }),
    { once: true, capture: true });
  box.appendChild(stage);
  box.appendChild(codeBox(id, demo.code));
  return box;
}

function codeBox(id, code) {
  const details = el("details", "code-box");
  details.appendChild(el("summary", "", "View the code"));
  const bar = el("div", "code-bar");
  const copy = el("button", "btn btn-small", "Copy");
  copy.addEventListener("click", () => {
    navigator.clipboard.writeText(code);
    track("code_copied", { demo_id: id });
    copy.textContent = "Copied!";
    setTimeout(() => { copy.textContent = "Copy"; }, 1500);
  });
  bar.appendChild(copy);
  const pre = el("pre");
  const codeEl = el("code");
  codeEl.textContent = code;
  pre.appendChild(codeEl);
  details.append(bar, pre);
  return details;
}

function glossaryEntryNode(t) {
  const entry = el("details", "entry");
  const summary = el("summary");
  summary.appendChild(el("span", "entry-term", t.term));
  if (t.category) summary.appendChild(el("span", "pill", t.category));
  entry.appendChild(summary);

  const body = el("div", "entry-body");
  body.appendChild(el("p", "definition", t.definition));
  if (t.example) {
    const example = el("div", "example");
    example.appendChild(el("strong", "", "Example: "));
    example.appendChild(document.createTextNode(t.example));
    body.appendChild(example);
  }
  const img = imageSrc(t.image_url);
  if (img) {
    const image = el("img", "term-image");
    image.alt = `${t.term} example`;
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove());
    image.src = img;
    body.appendChild(image);
  }
  if (DEMOS[t.demo_id]) body.appendChild(demoNode(t.demo_id, DEMOS[t.demo_id]));
  entry.appendChild(body);
  return entry;
}

// Component styles for entries and demos, injected so both pages stay in sync.
// Palette variables come from each page's own :root.
document.head.appendChild(Object.assign(document.createElement("style"), { textContent: `
  .entry {
    border: 1px solid var(--line); border-radius: 10px; background: var(--bg);
    margin-bottom: 10px;
  }
  .entry summary {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    padding: 10px 14px; cursor: pointer; font-weight: 600;
  }
  .entry summary::marker { color: var(--accent); }
  .entry-body { padding: 0 14px 14px; }
  .entry-body .definition { margin: 0 0 10px; }
  .pill {
    font-size: .74rem; font-weight: 400; background: var(--tint); color: var(--accent-dark);
    border-radius: 999px; padding: 2px 9px;
  }
  .example {
    background: var(--tint); border-left: 3px solid var(--accent-light);
    border-radius: 0 8px 8px 0; padding: 8px 12px; font-size: .9rem;
  }
  .term-image { max-width: 100%; border: 1px solid var(--line); border-radius: 8px; margin-top: 10px; }
  .btn-small { font-size: .78rem; padding: 4px 10px; }
  .suggest-term { font-size: .88rem; }

  .demo { margin-top: 12px; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  .demo-stage { padding: 12px 14px 14px; }
  .demo-try {
    font-size: .74rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
    color: var(--accent-dark); margin-bottom: 8px;
  }
  .demo-acc { border: 1px solid var(--accent-light); border-radius: 8px; margin-bottom: 6px; }
  .demo-acc summary { padding: 7px 10px; cursor: pointer; font-weight: 600; font-size: .9rem; }
  .demo-acc summary::marker { color: var(--accent); }
  .demo-acc p { margin: 0; padding: 0 10px 8px; font-size: .88rem; }
  .demo-tabbar { display: flex; gap: 4px; border-bottom: 1px solid var(--line); }
  .demo-tab {
    font: inherit; font-size: .88rem; font-weight: 600; cursor: pointer; padding: 6px 12px;
    background: none; border: none; border-bottom: 3px solid transparent; color: var(--muted);
  }
  .demo-tab[aria-selected="true"] { color: var(--accent-dark); border-bottom-color: var(--accent); }
  .demo-tabpanel { padding: 10px 4px 2px; font-size: .9rem; }
  .demo-dialog { border: none; border-radius: 12px; padding: 18px; max-width: 320px; }
  .demo-dialog::backdrop { background: rgba(33, 33, 33, .55); }
  .demo-dialog p { margin: 0 0 12px; }
  .dd-panes { display: flex; gap: 10px; flex-wrap: wrap; }
  .dd-pane { flex: 1 1 130px; border: 1px solid var(--line); border-radius: 8px; padding: 10px; }
  .dd-display { background: var(--tint); text-align: center; }
  .dd-label {
    font-size: .72rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 8px;
  }
  .dd-name { font-size: 1.9rem; font-weight: 700; color: var(--accent-dark); }

  .code-box { border-top: 1px solid var(--line); background: var(--tint); }
  .code-box summary { padding: 7px 14px; cursor: pointer; font-size: .82rem; font-weight: 600; color: var(--accent-dark); }
  .code-box summary::marker { color: var(--accent); }
  .code-bar { padding: 0 14px; }
  .code-box pre {
    margin: 8px 0 0; padding: 12px 14px; background: var(--bg); border-top: 1px solid var(--line);
    overflow-x: auto; font-size: .78rem; line-height: 1.45;
  }
` }));
