#!/usr/bin/env python3
"""Assemble the scroll-driven 'Inside the AI Factory' presentation.

Inputs: page.html, experience.css, experience.js (this folder), ../3d/scenes.js,
        ../podcast/timeline.json and ../podcast/chapters/*.mp3, ../figures/*.jpg (WebGL fallback posters)
Outputs in dist/:
  artifact.html   page fragment for publishing as a claude.ai artifact (audio/ published alongside)
  index.html      standalone page; serve dist/ over http (audio is fetched relatively)
  audio/*.mp3     podcast chapters
Usage: python3 build_experience.py [--three <base url of three@0.169.0>]
"""
import base64, io, json, pathlib, re, shutil, sys

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
DOCS = HERE.parent
DIST = HERE / "dist"
THREE = "https://cdn.jsdelivr.net/npm/three@0.169.0"
POSTER = {"campus": "fig01-campus", "cutaway": "fig02-cutaway", "hall": "fig04-hall", "rack": "fig05-rack", "pod": "fig09-pod"}
FONTS = ("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..100,500..900"
         "&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap")


def poster(stem, width=1400, q=70):
    im = Image.open(DOCS / "figures" / f"{stem}.jpg").convert("RGB")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def main():
    three = sys.argv[sys.argv.index("--three") + 1] if "--three" in sys.argv else THREE
    scenes = (DOCS / "3d" / "scenes.js").read_text()
    scenes = scenes.replace("export function", "function").replace("export const", "const")
    scenes = scenes.replace("let THREE;", "").replace("THREE = three;", "")
    tl_path = DOCS / "podcast" / "timeline.json"
    timeline = json.loads(tl_path.read_text()) if tl_path.exists() else None
    posters = {k: poster(v) for k, v in POSTER.items()}
    js = (HERE / "experience.js").read_text()
    js = js.replace("/*__SCENES__*/", scenes)
    js = js.replace("/*__TIMELINE__*/null", json.dumps(timeline, separators=(",", ":")) if timeline else "null")
    js = js.replace("/*__POSTERS__*/{}", json.dumps(posters))
    page = (HERE / "page.html").read_text().replace("__POSTER__", posters["campus"])
    css = (HERE / "experience.css").read_text()
    body = f"""<title>Inside the AI Factory</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<style>{css}</style>
{page}
<script type="importmap">{{"imports":{{"three":"{three}/build/three.module.min.js"}}}}</script>
<script type="module">{js}</script>
"""
    DIST.mkdir(exist_ok=True)
    (DIST / "artifact.html").write_text(body)
    (DIST / "index.html").write_text('<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n'
                                     '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
                                     '</head><body>\n' + body + "</body></html>\n")
    audio = DIST / "audio"; audio.mkdir(exist_ok=True)
    if timeline:
        for c in timeline["chapters"]:
            src = DOCS / "podcast" / c["file"]
            shutil.copy2(src, audio / src.name)
    size = (DIST / "artifact.html").stat().st_size / 1e6
    print(f"artifact.html {size:.2f} MB · audio files: {len(list(audio.glob('*.mp3')))}")


if __name__ == "__main__":
    main()
