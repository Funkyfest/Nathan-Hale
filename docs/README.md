# Data Center Design guide

A technical guide to how data centers and AI factories are designed, powered, cooled, connected and run. It is written for a curious non-specialist but carries engineering-grade numbers. It has nine parts, 33 chapters, a worked example sizing a 100 MW AI hall, and a glossary.

## Four ways in

| Where | What it is |
|---|---|
| `experience/` | **Inside the AI Factory**: a scroll-driven presentation. A live 3-D camera flies through the campus, building, hall, rack and pod as you scroll; interactive panels for the voltage ladder, cooling loop, rail network, density chart and a hall-sizing calculator; keyboard present mode; and a docked podcast player with a synced transcript that can scroll the tour for you. |
| `podcast/` | **The podcast**: a 27-minute two-host walkthrough of the whole guide, with ID3 chapter markers, plus one file per chapter and a transcript. |
| `study-pack/` | **For LM Studio** (or any local-RAG tool): the guide and transcript as one attachable file, a tutor system prompt, and ready-made quiz prompts. |
| `data-center-design.*` | **The guide itself** as a web page with rotatable 3-D figures (`.html`), a typeset print edition (`.pdf`), a Word edition (`.docx`) and the Markdown source (`.md`). |

## Figures

| Figure | Kind | Source |
|---|---|---|
| 1 Campus exterior, 2 Exploded hall cutaway, 4 Hall interior, 5 NVL72-class rack, 9 GPU pod row | 3-D renderings | `3d/scenes.js` (three.js), rendered by `3d/render.mjs` |
| 3 Power path, 6 Cooling loops, 7 Network fabric, 8 Rack density chart | schematics | `figures2d.py` |

The 3-D models are procedural: every building, rack, pipe and label is defined in code in `3d/scenes.js`. The same code drives the static renders, the rotatable figures in the guide, and the fly-through in the presentation. The presentation adds spinning fans, flowing coolant and fibre pulses, the lifting roof and the sliding tray through animation hooks the scenes expose.

## Rebuilding

```bash
cd docs

# one-time setup
apt-get install -y pandoc
pip install cairosvg weasyprint python-docx pillow kokoro-onnx soundfile imageio-ffmpeg
(cd 3d && npm install)

# 3-D figures (only after changing 3d/scenes.js)
(cd 3d && CHROMIUM=/path/to/chrome node render.mjs)

# guide editions: HTML, PDF, Word
python3 build.py

# podcast (needs the Kokoro model files, see podcast/synthesize.py)
(cd podcast && python3 synthesize.py --models /path/to/kokoro)

# presentation -> experience/dist/
(cd experience && python3 build_experience.py)
```

`experience/dist/index.html` must be served over HTTP (for example `python3 -m http.server` inside `dist/`) because it fetches the chapter audio relatively. It loads three.js from jsDelivr and fonts from Google Fonts; without a network it still renders the static posters.

`fonts/` holds Archivo, Source Serif 4, IBM Plex Sans and IBM Plex Mono (SIL Open Font License) so the PDF is typeset identically on any machine.

## Browser support for the presentation

Built on current web platform features, with fallbacks: scroll-driven animations (`animation-timeline`) for the progress bar and card reveals, `@property` for the animated title gradient, `oklch()` colour tokens with light and dark themes, container queries in the calculator, the View Transitions API for present mode, `:has()` for the transcript drawer, and the Media Session API so the podcast shows up on lock screens. WebGL is required for the live 3-D; without it the page shows the rendered posters.
