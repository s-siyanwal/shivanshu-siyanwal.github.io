# Shivanshu Siyanwal — Portfolio (v2)

A static, single-page research + engineering portfolio. Public, free on GitHub Pages,
zero backend. **All content lives in `data/content.json`** — you never edit HTML/CSS/JS
to add a paper, job, or project.

## What changed from v1 (and why)

| Problem in v1 | Fix in v2 |
|---|---|
| Read like a CV dump; only GitHub/LinkedIn | First-class **Google Scholar, ORCID, ResearchGate, GitHub, LinkedIn, Email** shown on the first screen; extensible `profiles` array |
| Bland, huge whitespace, endless scroll | **Two-column hero** puts identity + metrics + links in one viewport; experience **collapses** to scannable rows; projects are a **3-up card grid**; publications are a **dense list**. Detail is one click away, not always on screen |
| Didn't serve both audiences | Hero speaks to both; an **availability line** names both tracks; a **Research / Engineering filter** on projects; each project tagged by audience; metrics (speedups, accuracy, qubits) sit next to research depth |
| Mobile nav vanished | **Sticky top bar** stays on mobile with horizontally-scrolling section links + CV |

Accessibility: native `<details>` disclosure (keyboard-operable), a real `<dialog>`
for project detail (focus moves in, Escape/ backdrop closes, focus returns), correct
heading order, visible focus rings, reduced-motion respected, AA contrast.

## File structure

```
index.html          Page structure (rarely edited)
style.css           Academic-paper styling, denser layout
app.js              Renders content.json (never edit for content changes)
data/content.json   ★ ALL YOUR CONTENT
assets/…            CV PDF (and any images you add)
.nojekyll           Tells GitHub Pages to serve files as-is
```

---

## Updating content

Edit `data/content.json` on GitHub (pencil icon → edit → **Commit**). Live site
updates in ~1 min. Validate first at https://jsonlint.com — a broken comma is the
only thing that can break the page.

### Add a project
Copy a block inside `"projects"`:
```json
{
  "id": "unique-slug",
  "name": "Project title",
  "blurb": "One line shown on the card.",
  "abstract": "Full paragraph shown in the popup.",
  "metrics": [ { "value": "6.7×", "label": "vs GPU" } ],
  "tags": ["Qiskit", "FPGA"],
  "audience": "industry",          // "academic" | "industry" | "both"
  "links": [ { "label": "Code", "url": "https://github.com/…" } ],
  "featured": true
}
```
`audience` controls the Research/Engineering filter. Empty `url` values render a
"coming soon" note instead of a dead link.

### Add a publication
```json
{ "venue": "Journal / Conf", "year": "2026", "title": "…",
  "type": "Journal article", "status": "published",
  "authors": "S. Siyanwal et al.", "doi": "10.xxxx/xxxxx", "abstract": "" }
```
Add a real `doi` and a **DOI** link appears automatically.

### Add a job / research role
Copy a block in `"experience"` (or `"research"`): `org`, `role`, `location`,
`period`, `summary` (the teaser shown collapsed), `points` (bullets shown expanded),
`tags`, and `current: true` for your present role.

### Swap the CV PDF
Drop the new file in `assets/` — keep the name `Shivanshu_Siyanwal_CV.pdf`, or
rename and update `profile.links.cv_pdf`.

---

## ★ Fields you still need to fill in

Search `content.json` for `REPLACE_ME` and the empty `""` fields:

1. **Google Scholar** — `profiles[scholar].url`: your `…citations?user=XXXX` link.
2. **ORCID** — `profiles[orcid].url` and `handle`: your `0000-…` iD.
3. **ResearchGate** — `profiles[researchgate].url`: your profile URL.
4. **Project links** — each project's `links[].url`: real repo / paper URLs.
5. **Publication DOIs** — `publications[].doi` where a paper has one.
6. **Verify handles** — GitHub/LinkedIn URLs are best-guesses from your CV; confirm them.

Everything else was migrated from your CV and is ready.

---

## Deploy (one-time, ~10 min)

1. Create a **public** repo named `shivanshu-siyanwal.github.io`.
2. Upload everything in this folder (files, not the folder) → **Commit**.
3. **Settings → Pages → Deploy from branch → `main` / root → Save.**
4. Live at `https://shivanshu-siyanwal.github.io` in ~1 min.

### Preview locally
```bash
cd portfolio && python3 -m http.server 8000   # → http://localhost:8000
```
(Opening `index.html` directly won't work — browsers block `fetch` on `file://`.)

### Change colors / fonts
All tokens are CSS variables at the top of `style.css` (`:root`). `--accent` is the
verdigris; swap the Google Fonts `<link>` in `index.html` to change typefaces.
