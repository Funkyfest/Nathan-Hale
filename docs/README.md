# Data Center Design guide

A technical guide to how data centers and AI factories are designed, powered, cooled, connected and run. It is written for a curious non-specialist but carries engineering-grade numbers. It has nine parts, 33 chapters, a worked example sizing a 100 MW AI hall, and a glossary.

## Editions

| File | What it is |
|---|---|
| `data-center-design.html` | Web edition. Open in a browser; every 3-D figure can be rotated (needs internet for fonts and three.js). |
| `data-center-design.pdf` | Typeset print edition, US Letter, about 40 pages. |
| `data-center-design.docx` | Word edition with a table of contents. |
| `data-center-design.md` | The single source all editions are built from. |
| `artifact.html` | The web edition as a page fragment, for publishing as a claude.ai artifact. |

## Figures

| Figure | Kind | Source |
|---|---|---|
| 1 Campus exterior, 2 Exploded hall cutaway, 4 Hall interior, 5 NVL72-class rack, 9 GPU pod row | 3-D renderings | `3d/scenes.js` (three.js), rendered by `3d/render.mjs` |
| 3 Power path, 6 Cooling loops, 7 Network fabric, 8 Rack density chart | schematics | `figures2d.py` |

The 3-D models are procedural: every building, rack, pipe and label is defined in code in `3d/scenes.js`. The same code drives the static renders and the interactive viewer in the web edition.

## Rebuilding

```bash
cd docs

# one-time setup
apt-get install -y pandoc
pip install cairosvg weasyprint python-docx pillow
(cd 3d && npm install)

# re-render the 3-D figures (only needed after changing 3d/scenes.js)
(cd 3d && CHROMIUM=/path/to/chrome node render.mjs)

# build the HTML, PDF and Word editions
python3 build.py
```

`fonts/` holds Archivo, Source Serif 4, IBM Plex Sans and IBM Plex Mono (SIL Open Font License) so the PDF is typeset identically on any machine.
