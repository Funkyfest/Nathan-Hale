#!/usr/bin/env python3
"""Build every edition of the data-center design guide from data-center-design.md.

Outputs (all in docs/):
  data-center-design.html   standalone web edition: inline figures, interactive 3-D viewer
  artifact.html             the same page as a fragment, for publishing as a claude.ai artifact
  data-center-design.pdf    typeset print edition (WeasyPrint)
  data-center-design.docx   Word edition (pandoc + styled reference document)

Requirements: pandoc, Python packages cairosvg, weasyprint, python-docx, pillow.
The 3-D figures are rendered separately:  cd 3d && npm install && node render.mjs
"""
import base64, io, pathlib, re, shutil, subprocess, sys

from PIL import Image

import figures2d

ROOT = pathlib.Path(__file__).resolve().parent
FIG = ROOT / "figures"
SRC = ROOT / "data-center-design.md"
THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.169.0"
SCENE_OF = {"fig01-campus": "campus", "fig02-cutaway": "cutaway", "fig04-hall": "hall", "fig05-rack": "rack", "fig09-pod": "pod"}


def run(*args, **kw):
    return subprocess.run(args, cwd=ROOT, check=True, capture_output=True, text=True, **kw).stdout


# ------------------------------------------------------------------ figures
def build_2d():
    import cairosvg
    for name, fn in figures2d.FIGURES.items():
        svg = fn()
        (FIG / f"{name}.svg").write_text(svg)
        cairosvg.svg2png(bytestring=svg.encode(), write_to=str(FIG / f"{name}.png"), output_width=2400)


def jpeg_from_render(stem):
    """3-D renders are stored as PNG by render.mjs; keep a JPEG copy for the documents."""
    png, jpg = FIG / f"{stem}.png", FIG / f"{stem}.jpg"
    if png.exists() and (not jpg.exists() or png.stat().st_mtime > jpg.stat().st_mtime):
        Image.open(png).convert("RGB").save(jpg, quality=88, optimize=True, progressive=True)
        png.unlink()


def data_uri_jpeg(path, width=2000, q=80):
    im = Image.open(path).convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


# ------------------------------------------------------------------ pandoc → HTML pieces
def pandoc_html():
    body = run("pandoc", str(SRC), "-f", "markdown", "-t", "html5", "--wrap=none")
    tpl = ROOT / ".toc.tpl"; tpl.write_text("$toc$")
    toc = run("pandoc", str(SRC), "-f", "markdown", "-t", "html5", "--toc", "--toc-depth=2", "-s", f"--template={tpl}")
    tpl.unlink()
    meta = {}
    for k in ("title", "subtitle", "author", "date"):
        m = re.search(rf"^{k}:\s*\"?(.*?)\"?\s*$", SRC.read_text(), re.M)
        meta[k] = m.group(1) if m else ""
    return body, toc, meta


def wrap_tables(html):
    return re.sub(r"(<table.*?</table>)", r'<div class="table-wrap">\1</div>', html, flags=re.S)


def web_figures(html):
    def repl(m):
        src, alt = m.group(1), m.group(2)
        stem = pathlib.Path(src).stem
        if src.endswith(".png") and (FIG / f"{stem}.svg").exists():
            svg = (FIG / f"{stem}.svg").read_text()
            svg = svg.replace("<svg ", f'<svg role="img" aria-label="{alt}" ', 1)
            return f'<div class="schematic">{svg}</div>'
        uri = data_uri_jpeg(FIG / pathlib.Path(src).name)
        scene = SCENE_OF.get(stem)
        btn = (f'<div class="plate-bar"><button type="button" class="orbit" data-scene="{scene}" aria-pressed="false">'
               f'<span class="on">Rotate in 3-D</span><span class="off">Back to the labelled image</span></button>'
               f'<span class="hint">drag to orbit · scroll or pinch to zoom</span></div>') if scene else ""
        return f'<div class="plate"><div class="stage"><img src="{uri}" alt="{alt}" loading="lazy"></div>{btn}</div>'
    return re.sub(r'<img src="([^"]+)" alt="([^"]*)"\s*/?>', repl, html)


def print_figures(html):
    def repl(m):
        src = m.group(1); stem = pathlib.Path(src).stem
        path = FIG / f"{stem}.svg" if (FIG / f"{stem}.svg").exists() else FIG / pathlib.Path(src).name
        return f'<img src="{path.as_uri()}" alt="{m.group(2)}">'
    return re.sub(r'<img src="([^"]+)" alt="([^"]*)"\s*/?>', repl, html)


# ------------------------------------------------------------------ web edition
WEB_CSS = r"""
/* Layout: sticky contents rail + one reading column; figures break out wider. Drawing-sheet neutrals, coolant blue/red accents. */
:root{
  --paper:#f4f5f3; --panel:#ffffff; --ink:#17212b; --muted:#5a6573; --rule:#d6dbe0;
  --supply:#2563c9; --return:#c2413b; --tint:#e7eef8; --code:#eef1f4;
  --f-display:"Archivo","Arial Narrow",Arial,sans-serif;
  --f-body:"Source Serif 4",Georgia,"Times New Roman",serif;
  --f-mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;
  --measure:68ch;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --paper:#0f1418; --panel:#161d23; --ink:#e4e9ee; --muted:#9aa6b2; --rule:#2a343d;
  --supply:#73a7ff; --return:#f08078; --tint:#17263a; --code:#1b232b; color-scheme:dark}}
:root[data-theme="dark"]{
  --paper:#0f1418; --panel:#161d23; --ink:#e4e9ee; --muted:#9aa6b2; --rule:#2a343d;
  --supply:#73a7ff; --return:#f08078; --tint:#17263a; --code:#1b232b; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font:17px/1.62 var(--f-body);margin:0}
.shell{display:grid;grid-template-columns:minmax(0,1fr);gap:0 48px;max-width:1240px;margin:0 auto;padding-inline:20px;padding-block:0 96px}
@media (min-width:1080px){.shell{grid-template-columns:250px minmax(0,1fr)}}
nav.rail{display:none}
@media (min-width:1080px){nav.rail{display:block;position:sticky;top:env(safe-area-inset-top,0px);align-self:start;max-height:100vh;overflow:auto;padding-block:32px;font:13px/1.45 var(--f-display)}}
nav.rail ul{list-style:none;margin:0;padding:0}
nav.rail>ul>li{margin-block:10px 2px}
nav.rail>ul>li>a{font-weight:700;color:var(--ink)}
nav.rail ul ul a{color:var(--muted);display:block;padding:2px 0 2px 10px;border-left:1px solid var(--rule)}
nav.rail a{text-decoration:none}
nav.rail a:hover,nav.rail a:focus-visible{color:var(--supply)}
details.toc-mobile{margin-block:8px 24px;border:1px solid var(--rule);border-radius:8px;background:var(--panel);padding:10px 14px;font:14px/1.5 var(--f-display)}
details.toc-mobile summary{cursor:pointer;font-weight:700}
details.toc-mobile ul{padding-left:16px}
details.toc-mobile a{color:var(--ink)}
@media (min-width:1080px){details.toc-mobile{display:none}}
main{min-width:0}
.doc{counter-reset:ch}
.doc>*{max-width:var(--measure)}
.doc>.plate,.doc>.schematic,.doc>figure,.doc>.table-wrap{max-width:none}
header.cover{padding-block:56px 28px;border-bottom:1px solid var(--rule);margin-bottom:12px}
.eyebrow{font:600 12px/1 var(--f-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--supply)}
header.cover h1{font:800 clamp(40px,7vw,76px)/.98 var(--f-display);letter-spacing:-.02em;margin:14px 0 14px;text-wrap:balance;font-stretch:90%}
header.cover p.sub{font-size:21px;line-height:1.45;color:var(--muted);max-width:52ch;margin:0}
header.cover .meta{display:flex;flex-wrap:wrap;gap:6px 22px;margin-top:22px;font:13px/1.4 var(--f-mono);color:var(--muted)}
header.cover .meta b{color:var(--ink);font-weight:500}
.cover-plate{margin-top:28px}
h1,h2,h3{font-family:var(--f-display);text-wrap:balance;color:var(--ink)}
.doc h1{font-size:34px;line-height:1.1;font-weight:800;letter-spacing:-.01em;margin:88px 0 18px;padding-top:22px;border-top:3px solid var(--ink)}
.doc h1.unnumbered{border-top-width:1px;font-size:28px;margin-top:64px}
.doc h2{font-size:24px;line-height:1.2;font-weight:700;margin:52px 0 10px;display:flex;gap:14px;align-items:baseline}
.doc h2::before{counter-increment:ch;content:counter(ch,decimal-leading-zero);font:500 13px/1 var(--f-mono);color:var(--supply);letter-spacing:.06em;flex:none;transform:translateY(-3px)}
.doc h3{font-size:18px;margin:32px 0 6px}
.doc p,.doc li{hyphens:auto}
.doc ul,.doc ol{padding-left:1.3em}
.doc li{margin-block:4px}
.doc li::marker{color:var(--muted)}
.doc strong{font-weight:600}
.doc a{color:var(--supply);text-underline-offset:3px}
.doc code{font:14px var(--f-mono);background:var(--code);padding:1px 5px;border-radius:4px}
.table-wrap{overflow-x:auto;margin-block:22px;border:1px solid var(--rule);border-radius:8px;background:var(--panel)}
table{border-collapse:collapse;width:100%;font:14px/1.4 var(--f-display);font-variant-numeric:tabular-nums}
caption{caption-side:bottom;text-align:left;padding:10px 14px;font:13px/1.45 var(--f-body);color:var(--muted)}
th,td{padding:9px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--rule)}
thead th{font-weight:700;background:var(--tint);white-space:nowrap}
tbody tr:last-child td{border-bottom:0}
td:first-child{font-weight:600}
figure{margin:30px 0}
figcaption{font:14px/1.5 var(--f-body);color:var(--muted);margin-top:10px;max-width:var(--measure)}
.plate{border-radius:10px;overflow:hidden;border:1px solid var(--rule);background:var(--panel)}
.stage{position:relative;aspect-ratio:16/10;max-width:100%;background:#e9edf1;overflow:hidden}
.stage img{display:block;width:100%;height:100%;object-fit:cover}
.stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none;cursor:grab}
.stage canvas:active{cursor:grabbing}
.stage .ov{position:absolute;inset:0;pointer-events:none}
.plate-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:10px 14px;border-top:1px solid var(--rule)}
button.orbit{font:600 13px/1 var(--f-display);color:var(--panel);background:var(--ink);border:0;border-radius:999px;padding:9px 16px;cursor:pointer}
button.orbit:hover{background:var(--supply)}
button.orbit:focus-visible{outline:3px solid var(--supply);outline-offset:2px}
button.orbit .off{display:none}
button.orbit[aria-pressed="true"] .on{display:none}
button.orbit[aria-pressed="true"] .off{display:inline}
.plate-bar .hint{font:12px var(--f-mono);color:var(--muted)}
.plate-bar .msg{font:12px var(--f-mono);color:var(--return)}
.schematic{border:1px solid var(--rule);border-radius:10px;overflow-x:auto;background:#fff}
.schematic svg{display:block;width:100%;height:auto;min-width:640px}
dl{margin:18px 0}
dt{font:700 15px/1.3 var(--f-display);margin-top:14px}
dd{margin:2px 0 0 0;color:var(--ink)}
footer.colophon{margin-top:64px;padding-top:18px;border-top:1px solid var(--rule);font:13px/1.5 var(--f-mono);color:var(--muted)}
@media (max-width:640px){.stage .ov span{display:none!important}.stage .ov .lbl{font-size:11px!important;padding:2px 6px!important}.stage{aspect-ratio:4/3}body{font-size:16px}.doc h1{font-size:28px;margin-top:64px}.doc h2{font-size:21px}}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
"""

WEB_JS = r"""
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
__SCENES__
const active = new Map();
function open3d(btn) {
  const plate = btn.closest(".plate"), stage = plate.querySelector(".stage"), img = stage.querySelector("img");
  const W = stage.clientWidth, H = stage.clientHeight;
  const canvas = document.createElement("canvas"), ov = document.createElement("div"); ov.className = "ov";
  stage.append(canvas, ov);
  const r = buildScene(THREE, btn.dataset.scene);
  r.scene.background = skyTexture(THREE, r.sky);
  r.scene.traverse(o => { if (o.isDirectionalLight && o.castShadow) o.shadow.mapSize.set(2048, 2048); });
  const ren = makeRenderer(THREE, canvas, W, H, Math.min(devicePixelRatio, 2));
  r.camera.aspect = W / H; r.camera.updateProjectionMatrix();
  const ctl = new OrbitControls(r.camera, canvas);
  ctl.target.set(...r.target); ctl.maxPolarAngle = Math.PI * 0.49;
  ctl.minDistance = r.extent * 0.05; ctl.maxDistance = r.extent * 4;
  const draw = () => { ren.render(r.scene, r.camera); layoutLabels(THREE, ov, r.camera, r.labels, stage.clientWidth, stage.clientHeight); };
  ctl.addEventListener("change", draw); ctl.update(); draw();
  const onResize = () => { const w = stage.clientWidth, h = stage.clientHeight; ren.setSize(w, h, false); r.camera.aspect = w / h; r.camera.updateProjectionMatrix(); draw(); };
  addEventListener("resize", onResize);
  img.hidden = true; btn.setAttribute("aria-pressed", "true");
  active.set(btn, () => { ctl.dispose(); ren.dispose(); canvas.remove(); ov.remove(); removeEventListener("resize", onResize); img.hidden = false; btn.setAttribute("aria-pressed", "false"); });
}
for (const btn of document.querySelectorAll("button.orbit")) {
  btn.addEventListener("click", () => {
    if (active.has(btn)) { active.get(btn)(); active.delete(btn); return; }
    try { open3d(btn); } catch (e) {
      const bar = btn.parentElement; let m = bar.querySelector(".msg");
      if (!m) { m = document.createElement("span"); m.className = "msg"; bar.append(m); }
      m.textContent = "3-D view needs WebGL, which this browser has turned off. The labelled image above shows the same model.";
    }
  });
}
"""


def web_page(body, toc, meta, three_base=THREE_CDN, fragment=True):
    scenes = (ROOT / "3d" / "scenes.js").read_text().replace("export function", "function").replace("export const", "const")
    scenes = scenes.replace("let THREE;", "").replace("THREE = three;", "")  # the page imports THREE itself
    js = WEB_JS.replace("__SCENES__", scenes)
    toc_inner = re.sub(r"^<nav[^>]*>|</nav>\s*$", "", toc.strip())
    cover_img = data_uri_jpeg(FIG / "fig02-cutaway.jpg", 2000, 80)
    body = re.sub(r'<h1 class="unnumbered" id="executive-summary">', '<h1 class="unnumbered" id="executive-summary">', body)
    html = f"""<title>Data Center Design Guide</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,500..800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap">
<style>{WEB_CSS}</style>
<div class="shell">
<nav class="rail" aria-label="Contents">{toc_inner}</nav>
<main>
<header class="cover">
  <div class="eyebrow">Technical guide · {meta['date']}</div>
  <h1>{meta['title']}</h1>
  <p class="sub">{meta['subtitle']}. From the substation to the cold plate, with 3-D models you can rotate.</p>
  <div class="meta"><span><b>9</b> parts</span><span><b>33</b> chapters + worked example</span><span><b>5</b> rotatable 3-D models</span><span><b>4</b> schematics</span><span>{meta['author']}</span></div>
  <div class="plate cover-plate"><div class="stage"><img src="{cover_img}" alt="Exploded cutaway of an AI data hall"></div>
  <div class="plate-bar"><button type="button" class="orbit" data-scene="cutaway" aria-pressed="false"><span class="on">Rotate in 3-D</span><span class="off">Back to the labelled image</span></button><span class="hint">every 3-D figure in this guide can be rotated</span></div></div>
</header>
<details class="toc-mobile"><summary>Contents</summary>{toc_inner}</details>
<article class="doc">
{body}
</article>
<footer class="colophon">Figures are original 3-D renderings and schematics of generic, publicly documented designs. They do not depict any specific operator's facility. Also available as PDF and Word editions in the repository.</footer>
</main>
</div>
<script type="importmap">{{"imports":{{"three":"{three_base}/build/three.module.min.js","three/addons/":"{three_base}/examples/jsm/"}}}}</script>
<script type="module">{js}</script>
"""
    if fragment:
        return html
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + html.replace("<div class=\"shell\">", "</head>\n<body>\n<div class=\"shell\">", 1) + "</body>\n</html>\n")


# ------------------------------------------------------------------ print (PDF) edition
def font_faces():
    out = []
    for f in sorted((ROOT / "fonts").glob("*.ttf")):
        fam, spec = f.stem.split("-")
        name = {"Archivo": "Archivo", "SourceSerif4": "Source Serif 4", "IBMPlexMono": "IBM Plex Mono", "IBMPlexSans": "IBM Plex Sans"}[fam]
        out.append(f'@font-face{{font-family:"{name}";src:url("{f.as_uri()}");font-weight:{spec.rstrip("i")};font-style:{"italic" if spec.endswith("i") else "normal"}}}')
    return "\n".join(out)


PRINT_CSS = r"""
@page{size:Letter;margin:22mm 20mm 22mm 22mm;
  @bottom-left{content:string(part);font:8.5pt "IBM Plex Mono",monospace;color:#6b7684}
  @bottom-right{content:counter(page);font:8.5pt "IBM Plex Mono",monospace;color:#6b7684}}
@page cover{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
@page toc{@bottom-left{content:"Contents"}}
body{font:10.4pt/1.5 "Source Serif 4",Georgia,serif;color:#17212b;margin:0}
.cover{page:cover;height:279.4mm;position:relative;background:#eef1f4;break-after:page}
.cover img{width:100%;height:150mm;object-fit:cover;display:block}
.cover .t{padding:16mm 22mm 0}
.cover .eyebrow{font:600 9pt "IBM Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:#2563c9}
.cover h1{font:800 44pt/1 "Archivo";letter-spacing:-.02em;margin:6mm 0 5mm}
.cover p{font-size:15pt;line-height:1.35;color:#4a5562;margin:0;max-width:150mm}
.cover .by{position:absolute;bottom:16mm;left:22mm;font:9pt "IBM Plex Mono";color:#4a5562}
nav.toc{page:toc;break-after:page}
nav.toc h2{font:800 22pt "Archivo";margin:0 0 6mm}
nav.toc ul{list-style:none;padding:0;margin:0}
nav.toc>ul>li{margin-top:3.2mm;font:700 10pt "Archivo"}
nav.toc ul ul li{font:400 9.5pt "Source Serif 4";margin:.6mm 0 0 5mm}
nav.toc a{color:#17212b;text-decoration:none}
nav.toc a::after{content:leader(".") target-counter(attr(href),page);color:#6b7684;font-family:"IBM Plex Mono";font-size:8.5pt}
.doc{counter-reset:ch}
h1,h2,h3{font-family:"Archivo",Arial,sans-serif;color:#17212b;break-after:avoid}
.doc h1{font-size:24pt;line-height:1.08;font-weight:800;break-before:page;margin:0 0 6mm;padding-top:4mm;border-top:2.5pt solid #17212b;string-set:part content()}
.doc h2{font-size:14.5pt;font-weight:700;margin:8mm 0 2mm}
.doc h2::before{counter-increment:ch;content:counter(ch,decimal-leading-zero) "  ";font:500 9.5pt "IBM Plex Mono";color:#2563c9}
p{margin:0 0 2.6mm;orphans:3;widows:3;hyphens:auto;text-align:left}
ul,ol{padding-left:5mm;margin:0 0 3mm}
li{margin-bottom:1.2mm}
a{color:#2563c9;text-decoration:none}
figure{margin:5mm 0 6mm;break-inside:avoid}
figure img{width:100%;display:block;border:.4pt solid #c9d0d7}
figcaption{font-size:8.8pt;line-height:1.4;color:#4a5562;margin-top:2mm}
table{border-collapse:collapse;width:100%;font:8.6pt/1.35 "Archivo";margin:4mm 0 5mm;break-inside:avoid}
caption{caption-side:bottom;text-align:left;font:8.5pt "Source Serif 4";color:#4a5562;padding-top:2mm}
th,td{border-bottom:.5pt solid #c9d0d7;padding:1.6mm 2mm;text-align:left;vertical-align:top}
thead th{background:#e7eef8;font-weight:700}
td:first-child{font-weight:600}
dl{margin:0}
dt{font:700 9.5pt "Archivo";margin-top:2.4mm;break-after:avoid}
dd{margin:0;font-size:9.6pt}
.colophon{margin-top:10mm;font:8pt "IBM Plex Mono";color:#6b7684}
"""


def print_page(body, toc, meta):
    toc_inner = re.sub(r"^<nav[^>]*>|</nav>\s*$", "", toc.strip())
    cover = (FIG / "fig01-campus.jpg").as_uri()
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{meta['title']}</title>
<style>{font_faces()}{PRINT_CSS}</style></head><body>
<section class="cover"><img src="{cover}" alt=""><div class="t"><div class="eyebrow">Technical guide · {meta['date']}</div>
<h1>{meta['title']}</h1><p>{meta['subtitle']}.</p></div><div class="by">{meta['author']}</div></section>
<nav class="toc"><h2>Contents</h2>{toc_inner}</nav>
<article class="doc">{body}</article>
<p class="colophon">Figures are original 3-D renderings and schematics of generic, publicly documented designs; they do not depict any specific operator's facility.</p>
</body></html>"""


# ------------------------------------------------------------------ Word edition
def reference_docx(path):
    from docx import Document
    from docx.shared import Pt, RGBColor, Mm
    raw = subprocess.run(["pandoc", "--print-default-data-file", "reference.docx"], capture_output=True, check=True).stdout
    doc = Document(io.BytesIO(raw))
    ink, blue = RGBColor(0x17, 0x21, 0x2B), RGBColor(0x25, 0x63, 0xC9)
    for s in doc.styles:
        if s.type != 1:
            continue
        f = s.font
        if s.name in ("Normal", "Body Text", "First Paragraph", "Compact"):
            f.name, f.size, f.color.rgb = "Georgia", Pt(10.5), ink
        elif s.name.startswith("Heading") or s.name in ("Title", "Subtitle", "TOC Heading"):
            f.name, f.color.rgb = "Arial", ink
            f.size = {"Title": Pt(32), "Subtitle": Pt(15), "Heading 1": Pt(22), "Heading 2": Pt(15), "Heading 3": Pt(12)}.get(s.name, f.size)
            f.bold = s.name != "Subtitle"
            if s.name == "Heading 1":
                s.paragraph_format.page_break_before = True
            if s.name == "Subtitle":
                f.color.rgb = RGBColor(0x5A, 0x65, 0x73)
        elif s.name in ("Image Caption", "Table Caption", "Caption"):
            f.name, f.size, f.italic, f.color.rgb = "Georgia", Pt(9), False, RGBColor(0x4A, 0x55, 0x62)
        elif s.name == "Hyperlink":
            f.color.rgb = blue
    for sec in doc.sections:
        sec.page_width, sec.page_height = Mm(215.9), Mm(279.4)
        sec.left_margin = sec.right_margin = Mm(22)
        sec.top_margin = sec.bottom_margin = Mm(20)
    doc.save(path)


def build_docx():
    ref = ROOT / ".reference.docx"
    reference_docx(ref)
    run("pandoc", str(SRC), "-o", "data-center-design.docx", f"--reference-doc={ref}", "--toc", "--toc-depth=2",
        "--resource-path=.", "-f", "markdown+implicit_figures")
    ref.unlink()
    # pandoc sizes images from their DPI; force every picture to the text width
    from docx import Document
    from docx.shared import Mm
    d = Document(ROOT / "data-center-design.docx")
    for shp in d.inline_shapes:
        ratio = shp.height / shp.width
        shp.width = Mm(171.9); shp.height = int(Mm(171.9) * ratio)
    for t in d.tables:
        t.style = d.styles["Table"] if "Table" in [s.name for s in d.styles] else t.style
    d.save(ROOT / "data-center-design.docx")


# ------------------------------------------------------------------ main
def main():
    for stem in SCENE_OF:
        jpeg_from_render(stem)
    missing = [s for s in SCENE_OF if not (FIG / f"{s}.jpg").exists()]
    if missing:
        sys.exit(f"missing 3-D renders {missing}: run `cd 3d && npm install && node render.mjs` first")
    build_2d()
    body, toc, meta = pandoc_html()
    body = wrap_tables(body)
    three = sys.argv[sys.argv.index("--three") + 1] if "--three" in sys.argv else THREE_CDN
    (ROOT / "artifact.html").write_text(web_page(web_figures(body), toc, meta, three, fragment=True))
    (ROOT / "data-center-design.html").write_text(web_page(web_figures(body), toc, meta, three, fragment=False))
    from weasyprint import HTML
    HTML(string=print_page(print_figures(body), toc, meta), base_url=str(ROOT)).write_pdf(ROOT / "data-center-design.pdf")
    build_docx()
    for f in ("artifact.html", "data-center-design.html", "data-center-design.pdf", "data-center-design.docx"):
        print(f"{f:28s} {(ROOT / f).stat().st_size / 1e6:6.2f} MB")


if __name__ == "__main__":
    main()
