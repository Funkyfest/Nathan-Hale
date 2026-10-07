"""2-D schematic figures (SVG) for the data-center design guide. Light 'drawing sheet' style."""
import math

INK, SUB, LINE, PAPER, PANEL = "#1b2430", "#5b6675", "#c4ccd6", "#ffffff", "#f3f6f9"
BLUE, RED, AMBER, GREEN, VIOLET = "#2f6fd6", "#d64541", "#c99a1e", "#2e9d62", "#6b5bd1"
FONT = "IBM Plex Sans, Arial, Helvetica, sans-serif"


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def sheet(w, h, title, sub, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="{FONT}">'
            f'<rect width="{w}" height="{h}" fill="{PAPER}"/>'
            f'<text x="24" y="34" fill="{INK}" font-size="19" font-weight="700">{esc(title)}</text>'
            f'<text x="24" y="54" fill="{SUB}" font-size="12.5">{esc(sub)}</text>'
            f'{body}</svg>')


def block(x, y, w, h, title, sub="", stroke=INK, fill=PANEL):
    s = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="1.6"/>'
    cy = y + h / 2 + (-4 if sub else 4)
    s += f'<text x="{x + w / 2}" y="{cy}" text-anchor="middle" fill="{INK}" font-size="12.5" font-weight="600">{esc(title)}</text>'
    if sub:
        s += f'<text x="{x + w / 2}" y="{cy + 16}" text-anchor="middle" fill="{SUB}" font-size="11">{esc(sub)}</text>'
    return s


def line(pts, color, w=2.4, dash=None, arrow=None):
    d = "M" + " L".join(f"{x},{y}" for x, y in pts)
    s = f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}"'
    if dash:
        s += f' stroke-dasharray="{dash}"'
    if arrow:
        s += f' marker-end="url(#{arrow})"'
    return s + "/>"


def markers():
    out = "<defs>"
    for name, c in [("aBlue", BLUE), ("aRed", RED), ("aInk", INK), ("aAmber", AMBER)]:
        out += (f'<marker id="{name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
                f'<path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>')
    return out + "</defs>"


# ------------------------------------------------------------------ power single-line
def power():
    W, H = 1200, 600
    b = markers()
    yA, yB, bh = 110, 400, 56
    names = [("Utility feed", "230 kV"), ("Main transformer", "230 → 34.5 kV"), ("MV switchgear", "34.5 kV"),
             ("Unit substation", "34.5 kV → 480 V"), ("LV switchboard", "480 V"), ("UPS + batteries", "~5 min ride-through")]
    cols = [(t, s_, 24 + i * 156, 140) for i, (t, s_) in enumerate(names)]
    for path, y, c in (("A", yA, RED), ("B", yB, BLUE)):
        for i, (t, s, x, w) in enumerate(cols):
            b += block(x, y, w, bh, t + f" {path}", s, stroke=c)
            if i:
                px = cols[i - 1][2] + cols[i - 1][3]
                b += line([(px, y + bh / 2), (x, y + bh / 2)], c, 2.6)
        b += line([(944, y + bh / 2), (965, y + bh / 2), (965, 283 + (-14 if path == "A" else 14)), (990, 283 + (-14 if path == "A" else 14))], c, 2.6, arrow="aRed" if path == "A" else "aBlue")
    # generators tie into MV bus of each path
    for y0, yb, p_ in ((yA + bh + 34, yA + bh, "A"), (yB - 34 - 50, yB, "B")):
        b += block(336, y0, 140, 50, f"Generators {p_}", "N+1 · 3 MW each", stroke=SUB)
        b += line([(406, y0 + 50 if yb > y0 else y0), (406, yb)], SUB, 2, dash="5,4")
    b += f'<text x="490" y="{yA + bh + 64}" fill="{SUB}" font-size="11">start and synchronise in ~10 s, then an automatic transfer switch moves the bus</text>'
    # dual-corded rack
    b += block(990, 236, 180, 94, "Rack power shelf", "dual-corded: A and B", stroke=INK)
    b += line([(1080, 330), (1080, 372)], AMBER, 2.4, arrow="aAmber")
    b += block(990, 374, 180, 50, "Server PSU / DC bus", "→ ~50 V DC", stroke=AMBER)
    b += line([(1080, 424), (1080, 462)], AMBER, 2.4, arrow="aAmber")
    b += block(990, 464, 180, 50, "VRM next to the chip", "50 V → ~0.8 V, ~1,000 A", stroke=AMBER)
    # legend / sequence
    b += f'<rect x="24" y="520" width="940" height="62" rx="6" fill="{PANEL}" stroke="{LINE}"/>'
    b += line([(40, 542), (76, 542)], RED, 3) + f'<text x="86" y="546" fill="{INK}" font-size="12">Path A</text>'
    b += line([(40, 564), (76, 564)], BLUE, 3) + f'<text x="86" y="568" fill="{INK}" font-size="12">Path B — fully independent; either path can carry 100% of the load (2N)</text>'
    b += (f'<text x="560" y="546" fill="{INK}" font-size="12" font-weight="600">If the utility fails:</text>'
          f'<text x="560" y="566" fill="{SUB}" font-size="11.5">t = 0 batteries carry load · t ≈ 10 s generators online · t ≈ 15 s transfer · batteries recharge</text>')
    return sheet(W, H, "Power path — from the transmission line to the chip",
                 "Each stage steps voltage down; the A and B paths never share a component until they meet inside the rack.", b)


# ------------------------------------------------------------------ cooling loops
def cooling():
    W, H = 1200, 600
    b = markers()
    # zones
    zones = [(24, "OUTSIDE", 250), (300, "FACILITY WATER LOOP", 330), (656, "TECHNOLOGY (RACK) LOOP", 300), (982, "IT", 194)]
    for x, t, w in zones:
        b += f'<rect x="{x}" y="76" width="{w}" height="400" rx="8" fill="{PANEL}" stroke="{LINE}"/>'
        b += f'<text x="{x + 14}" y="98" fill="{SUB}" font-size="11" font-weight="700" letter-spacing="1.2">{t}</text>'
    b += block(54, 130, 190, 74, "Dry coolers", "fans blow outside air over coils", stroke=INK)
    b += block(54, 250, 190, 74, "Adiabatic pre-cool", "water spray only on hot days", stroke=SUB)
    b += block(54, 370, 190, 74, "Trim chiller (optional)", "runs only above ~30 °C outside", stroke=SUB)
    b += block(340, 170, 250, 70, "Facility pumps", "variable speed, N+1", stroke=INK)
    b += block(340, 310, 250, 70, "Heat-reuse take-off", "district heating, if a customer is near", stroke=GREEN)
    b += f'<rect x="690" y="170" width="230" height="210" rx="6" fill="{PANEL}" stroke="{INK}" stroke-width="1.6"/>'
    b += f'<text x="805" y="200" text-anchor="middle" fill="{INK}" font-size="13" font-weight="700">CDU</text>'
    b += f'<text x="805" y="218" text-anchor="middle" fill="{SUB}" font-size="11">coolant distribution unit</text>'
    for i, t in enumerate(["plate heat exchanger", "keeps facility and IT water apart", "secondary pumps + filters", "watches flow, ΔT, pressure, leaks"]):
        b += f'<text x="805" y="{262 + i * 22}" text-anchor="middle" fill="{SUB}" font-size="11.5">{t}</text>'
    b += block(1000, 130, 160, 120, "Cold plates", "on every GPU & CPU", stroke=INK)
    b += f'<text x="1080" y="214" text-anchor="middle" fill="{SUB}" font-size="11">≈ 80–85% of rack heat</text>'
    b += block(1000, 300, 160, 120, "Rack fans → room air", "memory, NICs, PSUs", stroke=SUB)
    b += f'<text x="1080" y="384" text-anchor="middle" fill="{SUB}" font-size="11">≈ 15–20% of rack heat</text>'
    # facility loop: cold from dry cooler → pumps → CDU ; warm from CDU → dry cooler
    b += line([(244, 158), (300, 158), (300, 195), (340, 195)], BLUE, 3, arrow="aBlue")
    b += f'<text x="252" y="150" fill="{BLUE}" font-size="11">32 °C</text>'
    b += line([(590, 195), (690, 195)], BLUE, 3, arrow="aBlue")
    b += line([(690, 350), (620, 350), (620, 440), (290, 440), (290, 180), (248, 180)], RED, 3, arrow="aRed")
    b += f'<text x="630" y="432" fill="{RED}" font-size="11">42 °C</text>'
    b += line([(465, 380), (465, 430)], GREEN, 2, dash="4,4")
    # tech loop
    b += line([(920, 210), (1000, 190)], BLUE, 3, arrow="aBlue")
    b += f'<text x="930" y="194" fill="{BLUE}" font-size="11">35 °C</text>'
    b += line([(1000, 230), (920, 300)], RED, 3, arrow="aRed")
    b += f'<text x="944" y="318" fill="{RED}" font-size="11">45 °C</text>'
    # notes
    b += f'<rect x="24" y="492" width="1152" height="88" rx="6" fill="#ffffff" stroke="{LINE}"/>'
    notes = [("Why warm water works:", "35 °C coolant is hotter than outside air most of the year, so dry coolers can reject the heat with no compressor running."),
             ("Why two loops:", "the CDU isolates clean, treated rack water from the much larger and dirtier facility loop; a leak in one cannot drain the other."),
             ("Design targets:", "ΔT of 10 K across the rack · approach of 3–5 K at the CDU · PUE 1.1–1.2 · near-zero water use when the adiabatic stage is idle.")]
    for i, (k, v) in enumerate(notes):
        b += f'<text x="40" y="{516 + i * 22}" fill="{INK}" font-size="12" font-weight="700">{k}</text><text x="210" y="{516 + i * 22}" fill="{SUB}" font-size="12">{esc(v)}</text>'
    return sheet(W, H, "Cooling loops — how heat gets from a GPU to the outside air",
                 "Blue is the cooler fluid going toward the load; red is the warmer fluid coming back. Temperatures are typical for a warm-water AI hall.", b)


# ------------------------------------------------------------------ leaf-spine + rails
def fabric():
    W, H = 1200, 610
    b = markers()
    spines = [150 + i * 180 for i in range(6)]
    for i, x in enumerate(spines):
        b += block(x - 60, 84, 120, 40, f"Spine {i + 1}", stroke=VIOLET)
    rails = [130 + i * 135 for i in range(8)]
    for i, x in enumerate(rails):
        b += block(x - 52, 250, 104, 40, f"Rail {i} leaf", stroke=AMBER if i in (0, 7) else INK)
    for sx in spines:
        for lx in rails:
            b += f'<line x1="{sx}" y1="124" x2="{lx}" y2="250" stroke="{LINE}" stroke-width="1"/>'
    # hosts: 4 servers, each with 8 GPUs/NICs
    for h in range(4):
        x0 = 70 + h * 270
        b += f'<rect x="{x0}" y="400" width="250" height="96" rx="8" fill="{PANEL}" stroke="{INK}" stroke-width="1.4"/>'
        b += f'<text x="{x0 + 125}" y="486" text-anchor="middle" fill="{INK}" font-size="12" font-weight="600">GPU server {h + 1}</text>'
        for g in range(8):
            gx = x0 + 14 + g * 29
            c = AMBER if g in (0, 7) else SUB
            b += f'<rect x="{gx}" y="414" width="22" height="40" rx="3" fill="#ffffff" stroke="{c}" stroke-width="1.4"/>'
            b += f'<text x="{gx + 11}" y="438" text-anchor="middle" fill="{c}" font-size="10">{g}</text>'
            if g in (0, 7):
                b += line([(gx + 11, 414), (rails[g], 290)], AMBER, 1.8)
            else:
                b += f'<line x1="{gx + 11}" y1="414" x2="{rails[g]}" y2="290" stroke="#d9dee5" stroke-width="1"/>'
    b += f'<text x="24" y="108" fill="{SUB}" font-size="11" font-weight="700" letter-spacing="1">SPINE</text>'
    b += f'<text x="24" y="274" fill="{SUB}" font-size="11" font-weight="700" letter-spacing="1">LEAF</text>'
    b += f'<text x="24" y="396" fill="{SUB}" font-size="11" font-weight="700" letter-spacing="1">SERVERS</text>'
    b += (f'<rect x="24" y="512" width="1152" height="78" rx="6" fill="#ffffff" stroke="{LINE}"/>'
          f'<text x="40" y="536" fill="{INK}" font-size="12" font-weight="700">Leaf-spine:</text>'
          f'<text x="150" y="536" fill="{SUB}" font-size="12">every leaf connects to every spine, so any two servers are at most three switch hops apart, with many equal paths.</text>'
          f'<text x="40" y="560" fill="{INK}" font-size="12" font-weight="700">Rail-optimized:</text>'
          f'<text x="150" y="560" fill="{SUB}" font-size="12">GPU 0 in every server plugs into the "rail 0" leaf, GPU 1 into rail 1, and so on (two rails highlighted).</text>'
          f'<text x="150" y="578" fill="{SUB}" font-size="12">Training traffic mostly flows between same-numbered GPUs, so most of it crosses one switch instead of three.</text>')
    return sheet(W, H, "Network fabric — leaf-spine with rail-optimized GPU connections",
                 "Each server has 8 GPUs and 8 network cards. One scalable unit shown; large clusters add a third (super-spine) tier on top.", b)


# ------------------------------------------------------------------ density chart (true log scale)
def density():
    W, H = 1200, 560
    x0, x1, y0, y1 = 110, 1150, 470, 90  # plot box (y0 bottom)
    lo, hi = math.log10(2), math.log10(1500)
    Y = lambda kw: y0 - (math.log10(kw) - lo) / (hi - lo) * (y0 - y1)
    years = [2016, 2018, 2020, 2022, 2024, 2026, 2028]
    X = lambda i: x0 + 60 + i * ((x1 - x0 - 120) / (len(years) - 1))
    cloud = [6, 7, 8, 10, 12, 15, 18]
    ai = [(13, "DGX-1"), (24, "DGX-2"), (26, "DGX A100"), (41, "DGX H100"), (132, "GB200 NVL72"), (190, "est. next gen"), (600, "announced target")]
    b = ""
    for kw in [3, 10, 30, 100, 300, 1000]:
        y = Y(kw)
        b += f'<line x1="{x0}" y1="{y:.1f}" x2="{x1}" y2="{y:.1f}" stroke="{LINE}" stroke-dasharray="3,4"/>'
        lab = f"{kw // 1000} MW" if kw >= 1000 else f"{kw} kW"
        b += f'<text x="{x0 - 10}" y="{y + 4:.1f}" text-anchor="end" fill="{SUB}" font-size="12">{lab}</text>'
    b += f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="{INK}"/><line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y1}" stroke="{INK}"/>'
    # air-cooling ceiling band
    ya, yb = Y(30), Y(45)
    b += f'<rect x="{x0 + 1}" y="{yb:.1f}" width="{x1 - x0 - 1}" height="{ya - yb:.1f}" fill="#f6e7c8" opacity="0.7"/>'
    b += f'<text x="{x0 + 10}" y="{yb - 6:.1f}" fill="#8a6513" font-size="11.5" font-weight="600">practical limit of air cooling ≈ 30–45 kW per rack</text>'
    bw = 34
    for i, yr in enumerate(years):
        cx = X(i)
        b += f'<text x="{cx:.1f}" y="{y0 + 22}" text-anchor="middle" fill="{INK}" font-size="12">{yr}</text>'
        # cloud bar
        yc = Y(cloud[i])
        b += f'<rect x="{cx - bw - 2:.1f}" y="{yc:.1f}" width="{bw}" height="{y0 - yc:.1f}" fill="{BLUE}"/>'
        b += f'<text x="{cx - bw / 2 - 2:.1f}" y="{yc - 6:.1f}" text-anchor="middle" fill="{BLUE}" font-size="11">{cloud[i]}</text>'
        kw, name = ai[i]
        ya_ = Y(kw)
        proj = yr >= 2026
        fill = RED if not proj else "url(#hatch)"
        b += f'<rect x="{cx + 2:.1f}" y="{ya_:.1f}" width="{bw}" height="{y0 - ya_:.1f}" fill="{fill}" stroke="{RED}" stroke-width="{1.5 if proj else 0}"/>'
        b += f'<text x="{cx + bw / 2 + 2:.1f}" y="{ya_ - 20:.1f}" text-anchor="middle" fill="{RED}" font-size="11.5" font-weight="700">{kw}</text>'
        b += f'<text x="{cx + bw / 2 + 2:.1f}" y="{ya_ - 6:.1f}" text-anchor="middle" fill="{SUB}" font-size="10">{name}</text>'
    defs = (f'<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
            f'<rect width="7" height="7" fill="#fbe3e2"/><line x1="0" y1="0" x2="0" y2="7" stroke="{RED}" stroke-width="2"/></pattern></defs>')
    leg = (f'<rect x="{x0 + 14}" y="98" width="14" height="12" fill="{BLUE}"/><text x="{x0 + 34}" y="109" fill="{INK}" font-size="12">Typical cloud / enterprise rack</text>'
           f'<rect x="{x0 + 260}" y="98" width="14" height="12" fill="{RED}"/><text x="{x0 + 280}" y="109" fill="{INK}" font-size="12">NVIDIA reference AI rack</text>'
           f'<rect x="{x0 + 470}" y="98" width="14" height="12" fill="url(#hatch)" stroke="{RED}"/><text x="{x0 + 490}" y="109" fill="{INK}" font-size="12">projected / announced</text>')
    b = defs + b + leg
    b += f'<text x="24" y="540" fill="{SUB}" font-size="11">Log scale: each gridline is roughly ×3. AI values are per-rack figures for NVIDIA reference systems (DGX racks assume 4 systems per rack). 2026–28 are estimates and vendor targets.</text>'
    return sheet(W, H, "Rack power density, 2016–2028", "AI racks went from ordinary to roughly ten times a cloud rack in eight years.", b)


FIGURES = {"fig03-power": power, "fig06-cooling": cooling, "fig07-fabric": fabric, "fig08-density": density}
