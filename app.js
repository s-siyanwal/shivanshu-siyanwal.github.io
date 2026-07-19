/* Renders the portfolio from data/content.json.
   You only ever edit content.json — never this file. */

const $ = (id) => document.getElementById(id);
const el = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

let DATA = null;

async function load() {
  try {
    const res = await fetch("data/content.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    DATA = await res.json();
  } catch (err) {
    $("main").innerHTML =
      '<div class="wrap" style="padding:3rem 0;color:#a33">Could not load content. If you opened this file directly, run a local server (browsers block fetch on <code>file://</code>). See README.</div>';
    console.error(err);
    return;
  }
  render(DATA);
}

function render(data) {
  const p = data.profile || {};
  const links = p.links || {};

  document.title = `${p.name} — ${p.title}`;
  $("bar-name").textContent = p.name;
  if (links.cv_pdf) { $("bar-cv").href = links.cv_pdf; $("bar-cv").target = "_blank"; $("bar-cv").rel = "noopener"; }
  else { $("bar-cv").style.display = "none"; }

  // Hero
  $("hero-title").textContent = p.title;
  $("hero-name").textContent = p.name;
  $("hero-tagline").textContent = p.tagline || "";
  $("hero-summary").textContent = p.summary || "";
  if (p.availability) $("hero-avail").textContent = p.availability; else $("hero-avail").style.display = "none";

  const cta = [];
  if (links.cv_pdf) cta.push(`<a class="btn btn--primary" href="${esc(links.cv_pdf)}" target="_blank" rel="noopener">Download CV (PDF)</a>`);
  if (p.email) cta.push(`<a class="btn" href="mailto:${esc(p.email)}">Email me</a>`);
  const gh = (p.profiles || []).find((x) => x.id === "github");
  if (gh) cta.push(`<a class="btn" href="${esc(gh.url)}" target="_blank" rel="noopener">GitHub</a>`);
  $("hero-cta").innerHTML = cta.join("");

  // At-a-glance metrics
  $("glance").innerHTML = (data.metrics || []).map((m) => `
    <div class="stat">
      <div class="stat-value">${esc(m.value)}</div>
      <div class="stat-label">${esc(m.label)}</div>
      ${m.note ? `<div class="stat-note">${esc(m.note)}</div>` : ""}
    </div>`).join("");

  // Profiles
  $("profiles").innerHTML = (p.profiles || []).filter((x) => x.primary).map((x) => `
    <a class="profile-link" href="${esc(x.url)}"${x.id === "email" ? "" : ' target="_blank" rel="noopener"'}>
      <span class="profile-label">${esc(x.label)}</span>
      <span class="profile-handle">${esc(x.handle)}</span>
    </a>`).join("");

  // Experience (expand in place)
  $("work-list").innerHTML = (data.experience || []).map((e, i) => xpItem(e, i)).join("");

  // Research training (compact, in About)
  $("research-list").innerHTML = (data.research || []).map((e, i) => xpItem(e, "r" + i)).join("");

  // Projects (cards + filter + dialog)
  renderProjects(data.projects || []);

  // Publications
  const pubs = data.publications || [];
  $("pub-note").textContent = `${pubs.length} entries across journals, conferences, and posters.`;
  $("publications-list").innerHTML = pubs.map(pubItem).join("");

  // Skills
  $("skills-list").innerHTML = (data.skills || []).map((s) => `
    <div class="row">
      <dt>${esc(s.category)}</dt>
      <dd>${(s.items || []).map((it) => `<span class="chip">${esc(it)}</span>`).join("")}</dd>
    </div>`).join("");

  // Education
  $("education-list").innerHTML = (data.education || []).map((ed) => `
    <div class="mini">
      <p class="mini-degree">${esc(ed.degree)}</p>
      <p class="mini-school">${esc(ed.school)}</p>
      <p class="mini-meta">${esc(ed.period)}${ed.location ? " · " + esc(ed.location) : ""}</p>
      ${ed.note ? `<p class="mini-note">${esc(ed.note)}</p>` : ""}
    </div>`).join("");

  // Awards
  $("awards-list").innerHTML = (data.awards || []).map((a) => `
    <li>${esc(a.title)}${a.year ? ` <span class="yr">${esc(a.year)}</span>` : ""}</li>`).join("");

  // Footer
  $("footer-name").textContent = p.name;
  $("footer-loc").textContent = p.location || "";
  $("footer-links").innerHTML = (p.profiles || []).filter((x) => x.primary).map((x) =>
    `<a href="${esc(x.url)}"${x.id === "email" ? "" : ' target="_blank" rel="noopener"'}>${esc(x.label)}</a>`).join("");

  wireDialog();
}

/* ---------- Experience item (native <details> = accessible disclosure) ---------- */
function xpItem(e, i) {
  const role = e.role || e.degree || "";
  const org = e.org || e.school || "";
  const points = (e.points || []).map((pt) => `<li>${esc(pt)}</li>`).join("");
  const tags = (e.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  return `
  <details class="xp" id="xp-${i}">
    <summary class="xp-summary">
      <h3 class="xp-role">${esc(role)}${e.current ? '<span class="xp-current">Current</span>' : ""}</h3>
      <span class="xp-period">${esc(e.period || "")}</span>
      <p class="xp-org">${esc(org)}${e.location ? ` <span class="loc">· ${esc(e.location)}</span>` : ""}</p>
      ${e.summary ? `<p class="xp-teaser">${esc(e.summary)}</p>` : ""}
      ${tags ? `<div class="xp-tags">${tags}</div>` : ""}
      <span class="xp-toggle"><span class="chev">▸</span> Details</span>
    </summary>
    <div class="xp-detail">${points ? `<ul>${points}</ul>` : ""}</div>
  </details>`;
}

/* ---------- Publications ---------- */
function pubItem(pub) {
  const linkDoi = pub.doi ? `<a href="https://doi.org/${esc(pub.doi)}" target="_blank" rel="noopener">DOI</a>` : "";
  return `
  <li class="pub">
    <div class="pub-row">
      <span class="pub-year">${esc(pub.year || "")}</span>
      <div class="pub-main">
        <div class="pub-title">${esc(pub.title)}</div>
        <div class="pub-meta">
          <span class="pub-venue">${esc(pub.venue)}</span>
          ${pub.authors ? `<span>${esc(pub.authors)}</span>` : ""}
          ${pub.status ? `<span class="pub-status">${esc(pub.status)}</span>` : ""}
        </div>
        ${linkDoi ? `<div class="pub-links">${linkDoi}</div>` : ""}
      </div>
      <span class="pub-type">${esc(pub.type || "")}</span>
    </div>
  </li>`;
}

/* ---------- Projects: cards, filter, modal ---------- */
function renderProjects(projects) {
  const audLabel = { academic: "Research", industry: "Engineering", both: "Research + Engineering" };
  $("projects-list").innerHTML = projects.map((pr, idx) => {
    const metrics = (pr.metrics || []).slice(0, 3).map((m) =>
      `<div class="card-metric"><div class="m-val">${esc(m.value)}</div><div class="m-lab">${esc(m.label)}</div></div>`).join("");
    const tags = (pr.tags || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
    return `
    <button class="card" data-idx="${idx}" data-aud="${esc(pr.audience || "both")}" aria-haspopup="dialog">
      <span class="card-aud">${esc(audLabel[pr.audience] || "Project")}</span>
      <h3>${esc(pr.name)}</h3>
      <p class="card-blurb">${esc(pr.blurb || "")}</p>
      ${metrics ? `<div class="card-metrics">${metrics}</div>` : ""}
      <div class="card-foot">
        <div class="card-tags">${tags}</div>
        <span class="card-more">View →</span>
      </div>
    </button>`;
  }).join("");

  // Filter
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      document.querySelectorAll(".filter-btn").forEach((b) => {
        const on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on);
      });
      document.querySelectorAll(".card").forEach((c) => {
        const aud = c.dataset.aud;
        const show = f === "all" || aud === f || aud === "both";
        c.classList.toggle("is-hidden", !show);
      });
    });
  });

  // Open dialog on card click
  document.querySelectorAll(".card").forEach((c) => {
    c.addEventListener("click", () => openDetail(projects[+c.dataset.idx], c));
  });
}

let lastFocused = null;
function openDetail(pr, trigger) {
  lastFocused = trigger || document.activeElement;
  const audLabel = { academic: "Research", industry: "Engineering", both: "Research + Engineering" };
  const metrics = (pr.metrics || []).map((m) =>
    `<div class="detail-metric"><div class="m-val">${esc(m.value)}</div><div class="m-lab">${esc(m.label)}</div></div>`).join("");
  const tags = (pr.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  const linkList = (pr.links || []).filter((l) => l.url).map((l) =>
    `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("");
  const linkNote = (pr.links || []).some((l) => l.url) ? "" :
    `<p class="mini-note" style="margin:0">Links coming soon — add repo/paper URLs in <code>content.json</code>.</p>`;

  $("detail-body").innerHTML = `
    <span class="detail-aud">${esc(audLabel[pr.audience] || "Project")}</span>
    <h3 id="detail-title">${esc(pr.name)}</h3>
    <p class="detail-abstract">${esc(pr.abstract || pr.blurb || "")}</p>
    ${metrics ? `<div class="detail-metrics">${metrics}</div>` : ""}
    ${tags ? `<div class="detail-tags">${tags}</div>` : ""}
    <div class="detail-links">${linkList || linkNote}</div>`;

  const dlg = $("detail");
  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open", "");
  $("detail-close").focus();
}

function wireDialog() {
  const dlg = $("detail");
  const close = () => {
    if (typeof dlg.close === "function" && dlg.open) dlg.close();
    else dlg.removeAttribute("open");
    if (lastFocused) lastFocused.focus();
  };
  $("detail-close").addEventListener("click", close);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); }); // backdrop click
  dlg.addEventListener("cancel", () => { if (lastFocused) lastFocused.focus(); }); // Esc
}

load();
