#!/usr/bin/env python3
"""Generate all 10 diagrams and build HTML/DOCX/PDF for the data-center design doc."""
import os, re, pathlib, subprocess, textwrap

ROOT = pathlib.Path(__file__).parent
DIAGRAMS = ROOT / "diagrams"
DIAGRAMS_PNG = ROOT / "diagrams-png"
DIAGRAMS.mkdir(exist_ok=True)
DIAGRAMS_PNG.mkdir(exist_ok=True)

# ---- SVG builders -----------------------------------------------------------
BG_GRAD = ('<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
           '<stop offset="0%" stop-color="#0b1322"/><stop offset="100%" stop-color="#141f32"/>'
           '</linearGradient></defs>')

def head(w, h, title, subtitle):
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'font-family="Inter, Arial, sans-serif">'
            f'{BG_GRAD}<rect width="{w}" height="{h}" fill="url(#bg)"/>'
            f'<text x="20" y="28" fill="#f3f6fa" font-size="18" font-weight="700">{title}</text>'
            f'<text x="20" y="46" fill="#94a3b8" font-size="11">{subtitle}</text>')

# ---------- Figure 1 · Isometric campus ----------
def fig1():
    w, h = 1000, 620
    s = [head(w, h, "Figure 1 · Hyperscale AI Campus (Isometric)",
              "144 MW IT critical load · redundant 230 kV feeds · on-site generation, water, and solar")]
    s.append('<ellipse cx="500" cy="600" rx="600" ry="90" fill="#1c2634"/>')
    s.append('<polygon points="120,540 880,540 940,560 80,560" fill="#2a3442" stroke="#1a2330"/>')
    s.append('<line x1="120" y1="550" x2="880" y2="550" stroke="#c9b23a" stroke-width="1.6" stroke-dasharray="10,10"/>')

    def iso_building(x, y, wx, wy, ht, roof="#8ea1b5", wallL="#5c6b7e", wallR="#4a586a", label=None, cool=False):
        top = f'M{x},{y+wy} L{x+wx},{y} L{x+wx+wx*0.5},{y+wy*0.5} L{x+wx*0.5},{y+wy*1.5} Z'
        left = f'M{x},{y+wy} L{x+wx*0.5},{y+wy*1.5} L{x+wx*0.5},{y+wy*1.5+ht} L{x},{y+wy+ht} Z'
        right = f'M{x+wx*0.5},{y+wy*1.5} L{x+wx+wx*0.5},{y+wy*0.5} L{x+wx+wx*0.5},{y+wy*0.5+ht} L{x+wx*0.5},{y+wy*1.5+ht} Z'
        out = []
        out.append(f'<path d="{top}" fill="{roof}" stroke="#111820"/>')
        out.append(f'<path d="{left}" fill="{wallL}" stroke="#0d141d"/>')
        out.append(f'<path d="{right}" fill="{wallR}" stroke="#0d141d"/>')
        if cool:
            for i in range(4):
                cx = x + 30 + i*50
                cy = y + wy - 6 - i*8
                out.append(f'<rect x="{cx}" y="{cy}" width="30" height="14" fill="#9aa8bd" stroke="#0d141d" transform="skewY(-18)"/>')
        out.append(f'<rect x="{x+wx*0.5+10}" y="{y+wy*1.5+ht-40}" width="{wx-20}" height="4" fill="#30a1ff" opacity="0.7"/>')
        if label:
            out.append(f'<text x="{x+wx*0.5+10}" y="{y+wy*1.5+ht-16}" fill="#e5e7eb" font-size="12" font-weight="600">{label}</text>')
        return "".join(out)

    s.append(iso_building(380, 250, 200, 40, 100, label="Data Hall A · 48 MW", cool=True))
    s.append(iso_building(430, 180, 200, 40, 100, label="Data Hall B · 48 MW", cool=True))
    s.append(iso_building(480, 110, 200, 40, 100, label="Data Hall C · 48 MW", cool=True))

    s.append('<polygon points="80,420 220,380 280,410 140,450" fill="#33404f" stroke="#111820"/>')
    for tx, ty in [(122,410),(172,403),(222,395)]:
        s.append(f'<polygon points="{tx-12},{ty} {tx},{ty-10} {tx+12},{ty} {tx},{ty+10}" fill="#4d5a6c" stroke="#d6dde5"/>')
        s.append(f'<line x1="{tx}" y1="{ty-10}" x2="{tx}" y2="{ty-50}" stroke="#d6dde5" stroke-width="1.4"/>')
        s.append(f'<line x1="{tx-7}" y1="{ty-40}" x2="{tx+7}" y2="{ty-40}" stroke="#d6dde5" stroke-width="1.4"/>')
    s.append('<rect x="238" y="410" width="18" height="14" fill="#5a6878" stroke="#0d141d"/>')
    s.append('<rect x="260" y="406" width="18" height="14" fill="#5a6878" stroke="#0d141d"/>')
    s.append('<text x="130" y="470" fill="#cbd5e1" font-size="12">230 kV Substation</text>')

    s.append('<polygon points="300,420 430,388 500,410 370,442" fill="#2e3a48" stroke="#0c131c"/>')
    for j in range(2):
        for i in range(3):
            gx = 315 + i*36
            gy = 405 + j*12 - i*3
            s.append(f'<rect x="{gx}" y="{gy}" width="30" height="10" fill="#b7b350" stroke="#1a1a10" transform="skewY(-18)"/>')
    s.append('<text x="310" y="460" fill="#cbd5e1" font-size="12">Diesel Genset Yard (N+1)</text>')

    s.append(iso_building(770, 340, 120, 30, 60, roof="#8ea1b5", label="Central Utility Plant"))
    for i in range(3):
        s.append(f'<ellipse cx="{800+i*40}" cy="{365-i*10}" rx="10" ry="4" fill="#415368" stroke="#0d141d"/>')

    s.append(iso_building(120, 460, 90, 20, 40, label="Admin and SOC"))
    s.append(iso_building(40, 310, 60, 14, 30, label="Fiber MMR"))

    s.append('<polygon points="700,480 900,440 950,460 750,500" fill="#1b3550" stroke="#081628"/>')
    for i in range(15):
        for j in range(3):
            s.append(f'<rect x="{705+i*15+j*4}" y="{480+j*7-i*2}" width="12" height="6" fill="#2a4c72" stroke="#0d1e30" stroke-width="0.4"/>')
    s.append('<text x="770" y="516" fill="#cbd5e1" font-size="11">PV Array + BESS</text>')

    s.append('<g transform="translate(930,60)"><circle r="18" fill="#0f1a2b" stroke="#64748b"/>'
             '<polygon points="0,-12 5,6 0,2 -5,6" fill="#e5e7eb"/><text x="-4" y="30" fill="#94a3b8" font-size="10">N</text></g>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 2 · Building cutaway ----------
def fig2():
    w, h = 1000, 620
    s = [head(w, h, "Figure 2 · Building Cutaway — Roof Mech, Penthouse, Data Halls, Spine",
              "Vertical stack of mechanical, electrical, and IT spaces in a single hyperscale block")]

    def iso_slab(y, color_top, color_left, color_right, label=None, sub=None, contents=None):
        s2 = []
        s2.append(f'<polygon points="150,{y} 670,{y-40} 810,{y-20} 290,{y+20}" fill="{color_top}" stroke="#0d141d"/>')
        s2.append(f'<polygon points="150,{y} 290,{y+20} 290,{y+80} 150,{y+60}" fill="{color_left}" stroke="#0d141d"/>')
        s2.append(f'<polygon points="290,{y+20} 810,{y-20} 810,{y+40} 290,{y+80}" fill="{color_right}" stroke="#0d141d"/>')
        if contents:
            s2.append(contents)
        if label:
            s2.append(f'<text x="310" y="{y+52}" fill="#e5e7eb" font-size="12" font-weight="600">{label}</text>')
        if sub:
            s2.append(f'<text x="310" y="{y+68}" fill="#94a3b8" font-size="10">{sub}</text>')
        return "".join(s2)

    roof_contents = ""
    for i in range(6):
        roof_contents += f'<rect x="{190+i*80}" y="{80+i*(-6)}" width="60" height="16" fill="#6c8395" stroke="#0a1019" transform="skewY(-12)"/>'
    s.append(iso_slab(150, "#2c3a4d", "#1e2a3f", "#28374f",
                     "Roof mechanical — dry coolers / adiabatic (N+1)",
                     "outdoor air heat rejection", roof_contents))

    s.append(iso_slab(240, "#3a4a5f", "#2a3648", "#32405a",
                     "Mechanical Penthouse — CDUs, pumps, heat exchangers",
                     "coolant distribution &amp; primary/secondary loop coupling"))

    ai_contents = ""
    for r in range(2):
        for i in range(14):
            ai_contents += f'<rect x="{320+i*22-r*8}" y="{318-r*(-14)+r*8}" width="16" height="34" fill="#0ea5e9" stroke="#061322" transform="skewY(-12)"/>'
    s.append(iso_slab(340, "#1e2a3f", "#12192a", "#182338",
                     "Data Hall 2 — liquid-cooled AI racks · 120 kW/rack",
                     "DTC + rear-door · warm-water loop"))

    s.append(iso_slab(440, "#1e2a3f", "#12192a", "#182338",
                     "Data Hall 1 — air-cooled with rear-door HX · 30 kW/rack",
                     "hot/cold aisle containment"))

    elec_contents = ""
    colors = ["#eab308","#eab308","#ef4444","#64748b","#64748b","#64748b"]
    labs = ["UPS","UPS","BESS","Swgr","Swgr","Swgr"]
    for i, (c,l) in enumerate(zip(colors, labs)):
        elec_contents += f'<rect x="{320+i*70}" y="{540-i*6}" width="46" height="20" fill="{c}" stroke="#1a1a10" transform="skewY(-12)"/>'
        elec_contents += f'<text x="{330+i*70-i*3}" y="{558-i*6}" fill="#0b1322" font-size="9" font-weight="700">{l}</text>'
    s.append(iso_slab(540, "#2a3547", "#1f2939", "#283345",
                     "Ground Floor — MV switchgear, UPS, BESS, PDUs",
                     None, elec_contents))

    s.append('<g stroke="#475569" stroke-width="1" fill="none"><path d="M840,140 L880,140 L880,600 L840,600"/></g>')
    labs2 = [("Roof mech",150), ("Penthouse",250), ("AI hall",340), ("Std hall",440), ("Electrical",540)]
    for text, y in labs2:
        s.append(f'<text x="892" y="{y+30}" fill="#cbd5e1" font-size="11">{text}</text>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 3 · Hot/cold aisle containment ----------
def fig3():
    w, h = 1000, 560
    s = [head(w, h, "Figure 3 · Hot-Aisle / Cold-Aisle Containment (Isometric)",
              "Cold supply from below, hot exhaust captured overhead to return plenum")]
    s.append('<polygon points="80,480 920,380 960,420 120,520" fill="#2b3543" stroke="#0d141d"/>')

    def row(dx, dy, front_color):
        out = []
        for i in range(8):
            x = dx + i*60
            y = dy - i*14
            out.append(f'<polygon points="{x},{y+40} {x+60},{y+26} {x+60},{y+126} {x},{y+140}" fill="{front_color}" stroke="#0d141d"/>')
            out.append(f'<polygon points="{x+60},{y+26} {x+80},{y+34} {x+80},{y+134} {x+60},{y+126}" fill="#1b2330" stroke="#0d141d"/>')
            out.append(f'<polygon points="{x},{y+40} {x+60},{y+26} {x+80},{y+34} {x+20},{y+48}" fill="#485867" stroke="#0d141d"/>')
            out.append(f'<line x1="{x+15}" y1="{y+55}" x2="{x+55}" y2="{y+45}" stroke="#22c55e" stroke-width="1"/>')
        return "".join(out)

    s.append(row(180, 260, "#2b3648"))
    s.append(row(220, 360, "#2b3648"))

    s.append('<polygon points="230,270 660,170 700,178 260,278" fill="#60a5fa" fill-opacity="0.18" '
             'stroke="#60a5fa" stroke-opacity="0.6"/>')
    s.append('<polygon points="260,278 700,178 700,198 260,298" fill="#60a5fa" fill-opacity="0.08" '
             'stroke="#60a5fa" stroke-opacity="0.4"/>')

    for x, y in [(310,455),(410,441),(510,427),(610,413),(710,399)]:
        s.append(f'<polygon points="{x-6},{y} {x-2},{y} {x-2},{y-16} {x+2},{y-16} {x+2},{y} {x+6},{y} {x},{y+10}" fill="#60a5fa"/>')

    s.append('<text x="300" y="180" fill="#93c5fd" font-size="12" font-weight="600">Cold aisle (contained)</text>')
    s.append('<text x="300" y="196" fill="#93c5fd" font-size="10">18–24 °C supply from raised floor</text>')
    s.append('<text x="40" y="260" fill="#fca5a5" font-size="12" font-weight="600">Hot aisle (rear)</text>')
    s.append('<text x="40" y="276" fill="#fca5a5" font-size="10">35–45 °C return to ceiling plenum</text>')
    s.append('<text x="720" y="280" fill="#fca5a5" font-size="12" font-weight="600">Hot aisle (rear)</text>')
    s.append('<text x="40" y="500" fill="#94a3b8" font-size="10">Raised floor plenum (600 mm) · cabling below</text>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 4 · Liquid-cooled AI rack ----------
def fig4():
    w, h = 1000, 620
    s = [head(w, h, "Figure 4 · Liquid-Cooled AI Rack (NVL72-class) — 120 kW",
              "18 compute trays · 9 NVSwitch trays · rear manifold · warm-water direct-to-chip")]
    s.append('<polygon points="200,560 820,560 860,590 160,590" fill="#24303f" stroke="#0d141d"/>')
    s.append('<polygon points="320,130 540,90 540,530 320,570" fill="#334155" stroke="#0a1019"/>')
    s.append('<polygon points="540,90 640,120 640,560 540,530" fill="#1a2330" stroke="#0a1019"/>')
    s.append('<polygon points="320,130 540,90 640,120 420,160" fill="#4a5769" stroke="#0a1019"/>')

    def tray(y_off, color, has_leds=True):
        y = 140 + y_off
        return (f'<polygon points="334,{y} 530,{y-33} 530,{y-18} 334,{y+15}" fill="{color}" stroke="#0a1019"/>'
                + ("".join(f'<circle cx="{384+i*40}" cy="{y-4-i*7}" r="3" fill="#22c55e"/>' for i in range(3)) if has_leds else ""))
    y = 0
    for i in range(9):
        s.append(tray(y, "#1f2a3d")); y += 18
    for i in range(9):
        s.append(tray(y, "#1e40af", has_leds=False)); y += 16
    for i in range(9):
        s.append(tray(y, "#1f2a3d")); y += 18

    s.append('<polygon points="630,120 680,100 680,540 630,560" fill="#b91c1c" stroke="#450a0a"/>')
    s.append('<polygon points="680,100 690,105 690,545 680,540" fill="#7f1d1d" stroke="#450a0a"/>')
    s.append('<polygon points="600,130 650,110 650,540 600,560" fill="#1e40af" stroke="#0a1326"/>')
    s.append('<polygon points="650,110 660,115 660,545 650,540" fill="#1e3a8a" stroke="#0a1326"/>')
    s.append('<text x="672" y="95" fill="#fca5a5" font-size="10">supply 35°C</text>')
    s.append('<text x="562" y="125" fill="#93c5fd" font-size="10">return 45°C</text>')

    for i in range(6):
        s.append(f'<path d="M534,{160+i*25} C 560,{164+i*25} 590,{180+i*25} 630,{200+i*22}" '
                 'stroke="#dc2626" stroke-width="1.5" fill="none" opacity="0.85"/>')

    s.append('<polygon points="720,470 830,440 890,458 780,490" fill="#334155" stroke="#0a1019"/>')
    s.append('<polygon points="720,470 780,490 780,550 720,530" fill="#1e293b" stroke="#0a1019"/>')
    s.append('<polygon points="780,490 890,458 890,518 780,550" fill="#263244" stroke="#0a1019"/>')
    s.append('<text x="732" y="568" fill="#cbd5e1" font-size="11">Coolant Distribution Unit</text>')

    s.append('<line x1="260" y1="170" x2="330" y2="170" stroke="#64748b"/>')
    s.append('<text x="170" y="174" fill="#cbd5e1" font-size="11" text-anchor="end">Compute trays × 9 (top)</text>')
    s.append('<line x1="260" y1="350" x2="330" y2="350" stroke="#64748b"/>')
    s.append('<text x="170" y="354" fill="#cbd5e1" font-size="11" text-anchor="end">NVSwitch trays × 9</text>')
    s.append('<line x1="260" y1="480" x2="330" y2="480" stroke="#64748b"/>')
    s.append('<text x="170" y="484" fill="#cbd5e1" font-size="11" text-anchor="end">Compute trays × 9 (bot)</text>')

    s.append('<rect x="150" y="510" width="180" height="52" rx="6" fill="#0f172a" stroke="#334155"/>')
    s.append('<text x="160" y="530" fill="#f8fafc" font-size="11" font-weight="700">Rack envelope</text>')
    s.append('<text x="160" y="546" fill="#cbd5e1" font-size="10">120 kW · 72 GPUs</text>')
    s.append('<text x="160" y="560" fill="#cbd5e1" font-size="10">~1400 A @ 48 VDC bus</text>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 5 · Power single-line ----------
def fig5():
    w, h = 1100, 560
    s = [head(w, h, "Figure 5 · Power Single-Line — Utility to Chip (2N to the UPS, N+1 PDU)",
              "Two independent paths: A (red) and B (blue). Each can carry 100% of the load.")]
    s.append('<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
             '<path d="M0,0 L10,5 L0,10 z" fill="#eab308"/></marker></defs>')

    def block(x, y, w2, h2, lbl, sub, color):
        return (f'<rect x="{x}" y="{y}" width="{w2}" height="{h2}" fill="#1e2a3d" stroke="{color}" stroke-width="1.5" rx="4"/>'
                f'<text x="{x+w2/2}" y="{y+h2/2-3}" text-anchor="middle" fill="#e5e7eb" font-size="11">{lbl}</text>'
                f'<text x="{x+w2/2}" y="{y+h2/2+13}" text-anchor="middle" fill="#94a3b8" font-size="10">{sub}</text>')

    pa = "#ef4444"; pb = "#3b82f6"
    yA = 100; yB = 380
    s.append(f'<circle cx="70" cy="{yA+20}" r="26" fill="#1e2a3d" stroke="{pa}" stroke-width="1.5"/>'
             f'<text x="70" y="{yA+24}" text-anchor="middle" fill="#e5e7eb" font-size="11">Util A</text>'
             f'<text x="70" y="{yA+60}" text-anchor="middle" fill="#94a3b8" font-size="10">230 kV</text>')
    s.append(f'<circle cx="70" cy="{yB+20}" r="26" fill="#1e2a3d" stroke="{pb}" stroke-width="1.5"/>'
             f'<text x="70" y="{yB+24}" text-anchor="middle" fill="#e5e7eb" font-size="11">Util B</text>'
             f'<text x="70" y="{yB+60}" text-anchor="middle" fill="#94a3b8" font-size="10">230 kV</text>')

    stages = [("XFMR", "230/34.5", 150, 56, 44),
              ("MV Swgr A", "34.5 kV", 250, 90, 44),
              ("XFMR", "34.5/0.48", 390, 56, 44),
              ("LV MSB A", "480 V", 490, 90, 44),
              ("UPS A", "2 MW Li-ion", 630, 80, 44)]
    for lbl, sub, x, w2, h2 in stages:
        s.append(block(x, yA, w2, h2, lbl, sub, pa))
    for x1, x2 in [(96,150),(206,250),(340,390),(446,490),(580,630),(710,760)]:
        s.append(f'<line x1="{x1}" y1="{yA+22}" x2="{x2}" y2="{yA+22}" stroke="{pa}" stroke-width="2.2"/>')

    for lbl, sub, x, w2, h2 in stages:
        lbl2 = lbl.replace(" A", " B")
        s.append(block(x, yB, w2, h2, lbl2, sub, pb))
    for x1, x2 in [(96,150),(206,250),(340,390),(446,490),(580,630),(710,760)]:
        s.append(f'<line x1="{x1}" y1="{yB+22}" x2="{x2}" y2="{yB+22}" stroke="{pb}" stroke-width="2.2"/>')

    s.append(block(250, 180, 90, 48, "Gensets N+1", "diesel 3 MW × 8", "#64748b"))
    s.append(block(250, 300, 90, 48, "Gensets N+1", "diesel 3 MW × 8", "#64748b"))
    s.append(f'<line x1="295" y1="180" x2="295" y2="146" stroke="#94a3b8" stroke-dasharray="4,3"/>')
    s.append(f'<line x1="295" y1="300" x2="295" y2="{yB-2}" stroke="#94a3b8" stroke-dasharray="4,3"/>')

    s.append(block(770, 210, 90, 54, "PDU (N+1)", "415/240 V", "#64748b"))
    s.append(f'<line x1="760" y1="{yA+22}" x2="760" y2="224" stroke="{pa}" stroke-width="2.2"/>')
    s.append(f'<line x1="760" y1="{yB+22}" x2="760" y2="250" stroke="{pb}" stroke-width="2.2"/>')
    s.append(f'<line x1="760" y1="224" x2="770" y2="224" stroke="{pa}" stroke-width="2.2"/>')
    s.append(f'<line x1="760" y1="250" x2="770" y2="250" stroke="{pb}" stroke-width="2.2"/>')

    s.append(block(910, 210, 150, 40, "Busway → Rack PDU", "dual-corded A+B", "#64748b"))
    s.append(block(910, 300, 150, 40, "Server PSUs", "AC→48V or DC bus", "#64748b"))
    s.append(block(910, 390, 150, 40, "VRM → chip", "48→0.7 V @ 1000 A", "#64748b"))
    s.append(f'<line x1="860" y1="230" x2="905" y2="230" stroke="#eab308" stroke-width="1.4" marker-end="url(#arr)"/>')
    s.append(f'<line x1="980" y1="250" x2="980" y2="298" stroke="#eab308" stroke-width="1.4" marker-end="url(#arr)"/>')
    s.append(f'<line x1="980" y1="340" x2="980" y2="388" stroke="#eab308" stroke-width="1.4" marker-end="url(#arr)"/>')

    s.append('<rect x="30" y="480" width="1040" height="60" fill="#0f172a" stroke="#334155" rx="6"/>')
    s.append('<line x1="44" y1="502" x2="74" y2="502" stroke="#ef4444" stroke-width="2.5"/>'
             '<text x="84" y="506" fill="#e5e7eb" font-size="11">Path A · 2N redundant · MV→LV→UPS→STS</text>')
    s.append('<line x1="44" y1="524" x2="74" y2="524" stroke="#3b82f6" stroke-width="2.5"/>'
             '<text x="84" y="528" fill="#e5e7eb" font-size="11">Path B · independent parallel path</text>')
    s.append('<text x="500" y="504" fill="#e5e7eb" font-size="11">Loss-of-utility sequence:</text>')
    s.append('<text x="500" y="524" fill="#94a3b8" font-size="10">t=0: UPS covers load · t≈10s: gensets at rated V · t≈15s: ATS transfers · UPS recharges.</text>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 6 · Cooling loops ----------
def fig6():
    w, h = 1100, 560
    s = [head(w, h, "Figure 6 · Cooling Loops — Facility Loop Coupled to Technology Loop via CDU",
              "Red = hot fluid · Blue = cold fluid · Orange = warm intermediate")]
    s.append('<defs><marker id="flow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">'
             '<path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1"/></marker></defs>')

    def box(x,y,w2,h2,title,lines,accent="#64748b"):
        out=[f'<rect x="{x}" y="{y}" width="{w2}" height="{h2}" fill="#1e2a3d" stroke="{accent}" stroke-width="1.5" rx="6"/>']
        out.append(f'<text x="{x+w2/2}" y="{y+22}" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">{title}</text>')
        for i,ln in enumerate(lines):
            out.append(f'<text x="{x+w2/2}" y="{y+42+i*15}" text-anchor="middle" fill="#94a3b8" font-size="10">{ln}</text>')
        return "".join(out)

    s.append(box(40, 90, 180, 90, "Heat Rejection", ["Dry cooler / adiabatic / tower","outside air 5–40 °C","fans modulate to setpoint"]))
    s.append(box(40, 220, 180, 74, "Chiller (when needed)", ["mechanical refrigeration","bypassed in free-cool"]))
    s.append(box(40, 330, 180, 54, "Condenser-water pumps", ["VFD, redundant N+1"]))
    s.append(box(450, 180, 220, 180, "CDU — Coolant Distribution Unit",
                 ["liquid-to-liquid heat exchanger","isolates facility ↔ IT water","","secondary pumps · filtration",
                  "supplies racks at 35 °C","glycol-water or treated DI","telemetry: flow, ΔT, pH"]))
    s.append('<rect x="870" y="170" width="200" height="200" fill="#1e2a3d" stroke="#64748b" stroke-width="1.5" rx="6"/>')
    s.append('<text x="970" y="192" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">Rack — cold plates on chips</text>')
    s.append('<text x="970" y="210" text-anchor="middle" fill="#94a3b8" font-size="10">direct-to-chip (DTC)</text>')
    for row in range(2):
        for col in range(4):
            s.append(f'<rect x="{908+col*36}" y="{226+row*26}" width="30" height="20" fill="#6366f1" stroke="#0b1020"/>')
    s.append('<text x="970" y="300" text-anchor="middle" fill="#94a3b8" font-size="10">70–90% heat via liquid</text>')
    s.append('<text x="970" y="316" text-anchor="middle" fill="#94a3b8" font-size="10">10–30% via rear-door HX</text>')
    s.append('<text x="970" y="340" text-anchor="middle" fill="#94a3b8" font-size="10">120 kW/rack typical for AI</text>')

    s.append(box(870, 400, 200, 80, "CRAH / Fan Wall", ["handles residual sensible heat","memory, NICs, optics, PSUs"]))

    s.append('<path d="M130,220 L130,180" stroke="#3b82f6" stroke-width="3" fill="none" marker-end="url(#flow)"/>')
    s.append('<path d="M170,180 L170,220" stroke="#ef4444" stroke-width="3" fill="none" marker-end="url(#flow)"/>')
    s.append('<path d="M130,330 L130,294" stroke="#3b82f6" stroke-width="3" fill="none" marker-end="url(#flow)"/>')
    s.append('<path d="M170,294 L170,330" stroke="#ef4444" stroke-width="3" fill="none" marker-end="url(#flow)"/>')
    s.append('<path d="M220,354 L330,354 L330,260 L450,260" stroke="#3b82f6" stroke-width="3" fill="none" marker-end="url(#flow)"/>')
    s.append('<path d="M450,280 L330,280 L330,384 L220,384" stroke="#ef4444" stroke-width="3" fill="none" marker-end="url(#flow)"/>')

    s.append('<path d="M670,230 L770,230 L770,206 L870,206" stroke="#f59e0b" stroke-width="3" fill="none" marker-end="url(#flow)"/>')
    s.append('<path d="M870,250 L770,250 L770,310 L670,310" stroke="#ef4444" stroke-width="3" fill="none" marker-end="url(#flow)"/>')

    s.append('<path d="M870,420 L790,420 L790,360 L870,360" stroke="#3b82f6" stroke-width="3" fill="none" marker-end="url(#flow)"/>')
    s.append('<path d="M870,440 L760,440 L760,470 L870,470" stroke="#ef4444" stroke-width="3" fill="none" marker-end="url(#flow)"/>')

    s.append('<rect x="260" y="90" width="160" height="60" fill="#0f1e36" stroke="#22c55e" rx="6"/>'
             '<text x="340" y="112" text-anchor="middle" fill="#22c55e" font-size="12" font-weight="700">Free-Cooling</text>'
             '<text x="340" y="130" text-anchor="middle" fill="#94a3b8" font-size="10">bypass chiller when OAT low</text>'
             '<text x="340" y="144" text-anchor="middle" fill="#94a3b8" font-size="10">save 30–60% cooling energy</text>')
    s.append('<rect x="260" y="220" width="160" height="54" fill="#0f1e36" stroke="#eab308" rx="6"/>'
             '<text x="340" y="242" text-anchor="middle" fill="#eab308" font-size="12" font-weight="700">ΔT engineering</text>'
             '<text x="340" y="260" text-anchor="middle" fill="#94a3b8" font-size="10">higher ΔT = smaller pipes &amp; pumps</text>')

    s.append('<rect x="30" y="490" width="1040" height="48" fill="#0f172a" stroke="#334155" rx="6"/>'
             '<text x="44" y="510" fill="#e5e7eb" font-size="11" font-weight="700">Design KPIs:</text>'
             '<text x="44" y="526" fill="#94a3b8" font-size="10">PUE target 1.10–1.20 · WUE &lt; 0.5 L/kWh · approach 4–6 K · N+1 on chillers/pumps/CDUs · liquid share &gt; 70% for &gt;50 kW racks.</text>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 7 · Leaf-spine with rail-optimized layer ----------
def fig7():
    w, h = 1100, 540
    s = [head(w, h, "Figure 7 · Leaf-Spine Fabric with Rail-Optimized GPU Layer",
              "Every leaf connects to every spine (Clos). GPUs on the same rail share a direct ToR path.")]
    spine_x = [175, 325, 475, 625, 775, 925]
    for i, x in enumerate(spine_x):
        s.append(f'<rect x="{x-55}" y="110" width="110" height="36" fill="#1e293b" stroke="#38bdf8" stroke-width="1.6" rx="6"/>'
                 f'<text x="{x}" y="132" text-anchor="middle" fill="#e5e7eb" font-size="10">SPINE-{i+1}</text>')
    s.append('<text x="20" y="130" fill="#f3f6fa" font-size="11" font-weight="700">Spine</text>')

    leaf_x = [145, 255, 365, 475, 585, 695, 805, 915]
    for i, x in enumerate(leaf_x):
        s.append(f'<rect x="{x-45}" y="260" width="90" height="30" fill="#1e293b" stroke="#a78bfa" stroke-width="1.4" rx="5"/>'
                 f'<text x="{x}" y="280" text-anchor="middle" fill="#e5e7eb" font-size="10">ToR-{i+1}</text>')
    s.append('<text x="20" y="278" fill="#f3f6fa" font-size="11" font-weight="700">Leaf (ToR)</text>')

    for sx in spine_x:
        for lx in leaf_x:
            s.append(f'<line x1="{sx}" y1="146" x2="{lx}" y2="260" stroke="#94a3b8" stroke-width="0.8" opacity="0.5"/>')

    for row in range(3):
        for i, x in enumerate(leaf_x[:4]):
            gnum = row*4 + i + 1
            s.append(f'<rect x="{x-45}" y="{340+row*32}" width="90" height="26" fill="#1e293b" stroke="#22c55e" stroke-width="1.2" rx="4"/>'
                     f'<text x="{x}" y="{358+row*32}" text-anchor="middle" fill="#e5e7eb" font-size="10">GPU-{gnum:02d}</text>')

    for x in leaf_x[:4]:
        s.append(f'<line x1="{x}" y1="340" x2="{x}" y2="290" stroke="#f97316" stroke-width="1.3" opacity="0.9"/>')
    s.append('<text x="120" y="450" fill="#f97316" font-size="10" font-weight="600">rail 0 →</text>')

    for x in leaf_x[:4]:
        s.append(f'<line x1="{x}" y1="404" x2="{x}" y2="366" stroke="#22d3ee" stroke-width="1.3" opacity="0.9" stroke-dasharray="4,3"/>')
    s.append('<text x="120" y="470" fill="#22d3ee" font-size="10" font-weight="600">rail 7 →</text>')

    s.append('<rect x="560" y="340" width="500" height="140" fill="#0f172a" stroke="#334155" rx="8"/>')
    s.append('<text x="572" y="362" fill="#f3f6fa" font-size="12" font-weight="700">Why rail-optimized?</text>')
    lines = [
        "In distributed training, NIC-i on every host must talk to NIC-i on every",
        "other host (ring/tree all-reduce). Grouping rail-0 NICs into a dedicated ToR",
        "collapses that traffic to one switch hop instead of spine traversal.",
        "",
        "Result: 2–3× reduction in tail latency · 20–40% higher training throughput",
        "Typical AI cluster: 8 rails × 400/800 Gbps Ethernet or NDR/XDR InfiniBand.",
    ]
    colors = ["#e5e7eb"]*3+["#94a3b8"]+["#fca5a5","#94a3b8"]
    for i, ln in enumerate(lines):
        s.append(f'<text x="572" y="{382+i*17}" fill="{colors[i]}" font-size="10.5">{ln}</text>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 8 · AI training pod ----------
def fig8():
    w, h = 1100, 560
    s = [head(w, h, "Figure 8 · AI Training Pod — 1,024-GPU scale-up domain",
              "Copper NVLink inside pod (ns latency) · fiber scale-out between pods (100s of ns)")]
    s.append('<polygon points="100,500 1040,500 1080,540 60,540" fill="#222e3f" stroke="#0d141d"/>')

    def rack(x, y):
        return (f'<polygon points="{x},{y} {x+40},{y-15} {x+40},{y+95} {x},{y+110}" fill="#334155" stroke="#0a1019"/>'
                f'<polygon points="{x+40},{y-15} {x+56},{y-10} {x+56},{y+100} {x+40},{y+95}" fill="#1a2330" stroke="#0a1019"/>')

    for i in range(8):
        s.append(rack(220 + i*42, 180 - i*4))
    for i in range(8):
        s.append(rack(220 + i*42, 320 - i*4))
    s.append('<rect x="160" y="258" width="540" height="14" fill="#facc15" stroke="#78350f" rx="2" transform="skewY(-8)"/>')
    s.append('<text x="175" y="255" fill="#fde68a" font-size="10">NVLink copper scale-up · 130 Tb/s · &lt;10 ns latency</text>')
    s.append('<polygon points="100,120 900,30 940,44 140,140" fill="#1e293b" stroke="#0a1019"/>')
    s.append('<text x="200" y="90" fill="#93c5fd" font-size="11">Overhead fiber tray — 800G/1.6T scale-out to spine</text>')

    s.append('<rect x="780" y="180" width="280" height="270" fill="#0f172a" stroke="#334155" rx="8"/>')
    s.append('<text x="794" y="202" fill="#f3f6fa" font-size="12" font-weight="700">Pod specification</text>')
    lines = [
        "• 16 racks × 64 GPUs = 1,024 GPUs",
        "• ~2 MW IT · 100% liquid cooled",
        "• Copper scale-up domain (intra-pod)",
        "• Fiber scale-out to 64 sibling pods",
        "• 8 rails × 800 GbE or NDR IB",
        "• 1 SU-scheduler domain (coherent)",
        "• ~200 kW/rack envelope",
        "• Dual-fed A+B busway (N+1)",
        "• Fire: pre-action water + VESDA",
        "• Training job placement granularity",
        "  = 1 pod minimum",
    ]
    for i, ln in enumerate(lines):
        s.append(f'<text x="794" y="{224+i*20}" fill="#cbd5e1" font-size="10.5">{ln}</text>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 9 · Rack power density evolution ----------
def fig9():
    w, h = 1100, 460
    s = [head(w, h, "Figure 9 · Rack Power Density Evolution (kW per rack)",
              "Enterprise + hyperscale (blue) vs AI training racks (red). Log scale.")]
    s.append('<line x1="80" y1="80" x2="80" y2="400" stroke="#475569"/>')
    s.append('<line x1="80" y1="400" x2="1060" y2="400" stroke="#475569"/>')
    yticks = [(380,"3 kW"),(320,"10 kW"),(260,"30 kW"),(200,"100 kW"),(140,"300 kW"),(90,"1 MW")]
    for y, lbl in yticks:
        s.append(f'<line x1="80" y1="{y}" x2="1060" y2="{y}" stroke="#334155" stroke-dasharray="3,3"/>')
        s.append(f'<text x="56" y="{y+4}" text-anchor="end" fill="#94a3b8" font-size="10">{lbl}</text>')
    xlbl = [(140,"2005"),(260,"2010"),(380,"2015"),(500,"2020"),(620,"2022"),(740,"2024"),(860,"2026"),(980,"2028 (proj.)")]
    for x, lbl in xlbl:
        s.append(f'<text x="{x}" y="418" text-anchor="middle" fill="#cbd5e1" font-size="10">{lbl}</text>')
    enterprise = [(120,388,12,"4"),(240,372,28,"6"),(360,344,56,"10"),(480,312,88,"15"),
                  (600,296,104,"20"),(720,280,120,"25"),(840,272,128,"30"),(960,264,136,"35")]
    for x, y, ht, lbl in enterprise:
        s.append(f'<rect x="{x}" y="{y}" width="30" height="{ht}" fill="#3b82f6"/>')
        s.append(f'<text x="{x+15}" y="{y-4}" text-anchor="middle" fill="#93c5fd" font-size="10">{lbl}</text>')
    ai = [(155,348,52,"8"),(275,320,80,"15"),(395,268,132,"30"),(515,212,188,"80"),
          (635,176,224,"120"),(755,144,256,"200"),(875,108,292,"400"),(995,86,314,"≥1000")]
    for x, y, ht, lbl in ai:
        s.append(f'<rect x="{x}" y="{y}" width="30" height="{ht}" fill="#ef4444"/>')
        s.append(f'<text x="{x+15}" y="{y-4}" text-anchor="middle" fill="#fca5a5" font-size="10">{lbl}</text>')
    s.append('<rect x="780" y="60" width="300" height="48" fill="#0f172a" stroke="#334155" rx="6"/>')
    s.append('<rect x="794" y="70" width="18" height="10" fill="#3b82f6"/>')
    s.append('<text x="820" y="80" fill="#cbd5e1" font-size="11">Enterprise / hyperscale rack</text>')
    s.append('<rect x="794" y="88" width="18" height="10" fill="#ef4444"/>')
    s.append('<text x="820" y="98" fill="#cbd5e1" font-size="11">AI training rack (GPU / TPU)</text>')
    s.append('</svg>')
    return "".join(s)

# ---------- Figure 10 · Uptime tier comparison ----------
def fig10():
    w, h = 1100, 500
    s = [head(w, h, "Figure 10 · Uptime Institute Tier Classification",
              "Tiers describe concurrent maintainability and fault tolerance — NOT efficiency or scale.")]
    s.append('<rect x="40" y="70" width="1020" height="40" fill="#1e293b" stroke="#334155"/>')
    headers = [("Characteristic",20),("Tier I — Basic",260),("Tier II — Redundant",470),
               ("Tier III — Concurrent",680),("Tier IV — Fault-Tolerant",890)]
    for txt, x in headers:
        s.append(f'<text x="{40+x}" y="96" fill="#f3f6fa" font-size="13" font-weight="700">{txt}</text>')

    rows = [
        ("Power paths", "1 (non-redundant)", "1 + redundant capacity", "2 paths, 1 active", "2 paths, both active (2N)"),
        ("Cooling paths", "1", "1 + redundant units", "Multiple, 1 active", "Multiple, active/active"),
        ("Concurrent maintainability", "no", "no", "yes", "yes"),
        ("Fault tolerance", "no", "no", "partial", "yes"),
        ("Availability", "99.671 %", "99.741 %", "99.982 %", "99.995 %"),
        ("Annual downtime", "~28.8 h", "~22.7 h", "~1.6 h", "~26 min"),
        ("Typical use case", "lab, dev, SMB", "SMB production", "enterprise, colo", "finance, gov, critical AI"),
        ("Relative capex", "1.0×", "1.3×", "1.8–2.2×", "2.4–3.0×"),
    ]
    for i, (col1, col2, col3, col4, col5) in enumerate(rows):
        y = 110 + i*40
        fill = "#14213a" if i%2 else "#101a2d"
        s.append(f'<rect x="40" y="{y}" width="1020" height="40" fill="{fill}" stroke="#1f2a3f"/>')
        for txt, x in [(col1,20),(col2,260),(col3,470),(col4,680),(col5,890)]:
            s.append(f'<text x="{40+x}" y="{y+24}" fill="#e5e7eb" font-size="11">{txt}</text>')
    s.append('</svg>')
    return "".join(s)

# ---- Emit SVGs --------------------------------------------------------------
figs = {
    "01-campus-iso.svg": fig1(),
    "02-building-cutaway.svg": fig2(),
    "03-aisle-containment.svg": fig3(),
    "04-liquid-rack.svg": fig4(),
    "05-power-single-line.svg": fig5(),
    "06-cooling-loop.svg": fig6(),
    "07-leaf-spine.svg": fig7(),
    "08-ai-pod.svg": fig8(),
    "09-power-density-evolution.svg": fig9(),
    "10-tier-comparison.svg": fig10(),
}
for name, content in figs.items():
    (DIAGRAMS / name).write_text(content)
    print(f"  svg {name} {(DIAGRAMS/name).stat().st_size} bytes")

# ---- Convert to PNG for DOCX ------------------------------------------------
import cairosvg
for name, _ in figs.items():
    src = DIAGRAMS / name
    dst = DIAGRAMS_PNG / (src.stem + ".png")
    cairosvg.svg2png(url=str(src), write_to=str(dst), output_width=1800)
    print(f"  png {dst.name} {dst.stat().st_size} bytes")

# ---- Build HTML with inlined SVGs -------------------------------------------
def md_to_html(md_text, svgs):
    md = re.sub(r"^---\n.*?\n---\n", "", md_text, count=1, flags=re.DOTALL)
    lines = md.split("\n")
    parts = []; i = 0; in_list = False; list_tag = None
    def esc(t): return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
    def inl(t):
        t = esc(t)
        t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
        t = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", t)
        t = re.sub(r"`(.+?)`", r"<code>\1</code>", t)
        return t
    def close_list():
        nonlocal in_list, list_tag
        if in_list:
            parts.append(f"</{list_tag}>"); in_list = False; list_tag = None
    while i < len(lines):
        line = lines[i]
        m = re.match(r"^!\[(.*?)\]\((.+?)\)\s*$", line)
        if m:
            close_list()
            alt, path = m.group(1), m.group(2)
            fname = os.path.basename(path)
            svg = svgs.get(fname, "")
            svg = re.sub(r"<\?xml.*?\?>\s*", "", svg)
            parts.append(f'<figure class="diagram">{svg}<figcaption>{esc(alt)}</figcaption></figure>')
            i += 1; continue
        if line.strip() == "---":
            close_list(); parts.append("<hr/>"); i += 1; continue
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            close_list()
            level = len(m.group(1)); text = m.group(2).strip()
            anchor = re.sub(r"[^a-z0-9]+","-", text.lower()).strip("-")
            parts.append(f'<h{level} id="{anchor}">{inl(text)}</h{level}>')
            i += 1; continue
        m = re.match(r"^-\s+(.*)$", line)
        if m:
            if not in_list or list_tag != "ul":
                close_list(); parts.append("<ul>"); in_list = True; list_tag = "ul"
            parts.append(f"<li>{inl(m.group(1))}</li>"); i += 1; continue
        m = re.match(r"^(\d+)\.\s+(.*)$", line)
        if m:
            if not in_list or list_tag != "ol":
                close_list(); parts.append("<ol>"); in_list = True; list_tag = "ol"
            parts.append(f"<li>{inl(m.group(2))}</li>"); i += 1; continue
        if line.strip() == "":
            close_list(); i += 1; continue
        para = [line]; j = i + 1
        while j < len(lines) and lines[j].strip() and not re.match(r"^(#{1,6}\s|-\s|\d+\.\s|!\[|---$)", lines[j]):
            para.append(lines[j]); j += 1
        close_list()
        parts.append(f"<p>{inl(' '.join(para))}</p>")
        i = j
    close_list()
    return "\n".join(parts)

md_source = (ROOT / "data-center-design.md").read_text()
svgs_str = {name: (DIAGRAMS / name).read_text() for name in figs}
body = md_to_html(md_source, svgs_str)
body = re.sub(r'<h1 id="data-center-design">.*?</h1>', "", body, count=1)

toc_items = []
for line in md_source.split("\n"):
    m = re.match(r"^#\s+(.*)$", line)
    if m:
        txt = m.group(1).strip()
        anchor = re.sub(r"[^a-z0-9]+","-", txt.lower()).strip("-")
        toc_items.append((txt, anchor))
toc_html = ('<div class="toc"><h2>Contents</h2><ul>'
            + "".join(f'<li><a href="#{a}">{t}</a></li>' for t,a in toc_items)
            + "</ul></div>")

css = """
:root{--bg:#0b1322;--panel:#101a2d;--ink:#e6edf5;--sub:#a6b3c4;--line:#2b3a52;--accent:#60a5fa;--code:#111a2b}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font:15px/1.62 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif}
main{max-width:960px;margin:0 auto;padding:40px 28px 120px}
h1,h2,h3,h4{color:#f4f7fb;line-height:1.24;letter-spacing:-.01em}
h1{font-size:2.4em;margin:1em 0 .2em;border-bottom:2px solid var(--accent);padding-bottom:.2em}
h2{font-size:1.7em;margin:1.8em 0 .4em;color:#c9dcff;border-left:4px solid var(--accent);padding-left:12px}
h3{font-size:1.25em;margin:1.6em 0 .3em;color:#ffd6a8}
h4{font-size:1.05em;margin:1.2em 0 .2em;color:#eab308}
p{margin:.55em 0;color:#dbe4ee}
strong{color:#fff}
em{color:#f0d78e;font-style:italic}
code{background:var(--code);padding:1px 6px;border-radius:4px;font-family:SF Mono,Menlo,monospace;font-size:.92em;color:#93c5fd}
ul,ol{padding-left:1.4em}
li{margin:.2em 0;color:#dbe4ee}
hr{border:none;border-top:1px dashed var(--line);margin:2.4em 0}
figure.diagram{margin:1.8em 0;background:#0f172a;border:1px solid var(--line);border-radius:10px;padding:8px;text-align:center;overflow:hidden}
figure.diagram svg{max-width:100%;height:auto;display:block;margin:0 auto}
figure.diagram figcaption{font-size:.86em;color:var(--sub);padding:8px 4px 4px;text-align:center}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.cover{background:linear-gradient(135deg,#0f1e36,#0b1322 60%);border:1px solid var(--line);border-radius:12px;padding:44px 36px;margin-bottom:28px}
.cover h1{border:none;margin:0 0 8px;font-size:2.6em}
.cover .sub{color:#94a3b8;font-size:1.05em}
.cover .meta{color:#64748b;margin-top:18px;font-size:.9em}
.toc{background:var(--panel);border-radius:10px;padding:22px 26px;margin:12px 0 32px;border:1px solid var(--line)}
.toc h2{border:none;padding:0;margin:0 0 8px;font-size:1.15em;color:#c9dcff}
.toc ul{list-style:none;padding-left:0;column-count:2;column-gap:24px}
.toc li{break-inside:avoid;margin:3px 0;font-size:.94em}
.toc a{color:#c9dcff}
@media (max-width:700px){main{padding:20px 14px 60px}.toc ul{column-count:1}h1{font-size:2em}}
@media print{body{background:#fff;color:#111}main{max-width:100%;padding:0}h1,h2,h3,h4{color:#111}p,li{color:#222}
.cover{background:#fff;border:1px solid #ccc}.toc{background:#fafafa;border:1px solid #ccc}
figure.diagram{background:#fff;border:1px solid #ccc;page-break-inside:avoid}h2{page-break-after:avoid}h3,h4{page-break-after:avoid}}
"""

cover = ('<div class="cover"><h1>Data Center Design</h1>'
         '<div class="sub">A Comprehensive Guide to Digital and AI Infrastructure</div>'
         '<div class="sub" style="margin-top:6px;">From site selection to the silicon — how modern data centers and AI factories are conceived, built, powered, cooled, and operated.</div>'
         '<div class="meta">Prepared for Nathan Hale · September 10, 2026 · 10 original isometric figures</div></div>')

html = (f'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>'
        f'<meta name="viewport" content="width=device-width,initial-scale=1"/>'
        f'<title>Data Center Design — Comprehensive Guide</title><style>{css}</style></head>'
        f'<body><main>{cover}{toc_html}{body}</main></body></html>')

(ROOT / "data-center-design.html").write_text(html)
print(f"  html data-center-design.html {len(html)} bytes")

# ---- Build DOCX via pandoc (points at PNGs) ---------------------------------
png_md = re.sub(r"\(diagrams/([^)]+)\.svg\)", r"(diagrams-png/\1.png)", md_source)
(ROOT / "data-center-design.png.md").write_text(png_md)
r = subprocess.run(
    ["pandoc", "data-center-design.png.md", "-o", "data-center-design.docx",
     "--resource-path=.", "--toc", "--toc-depth=2", "--standalone"],
    cwd=str(ROOT), capture_output=True, text=True)
print("  pandoc stdout:", r.stdout.strip() or "(ok)")
if r.stderr.strip():
    print("  pandoc stderr:", r.stderr.strip()[:400])
if (ROOT/"data-center-design.docx").exists():
    print(f"  docx data-center-design.docx {(ROOT/'data-center-design.docx').stat().st_size} bytes")

# ---- Build PDF via weasyprint (from the HTML we just built) -----------------
from weasyprint import HTML
try:
    HTML(string=html, base_url=str(ROOT)).write_pdf(str(ROOT / "data-center-design.pdf"))
    print(f"  pdf data-center-design.pdf {(ROOT/'data-center-design.pdf').stat().st_size} bytes")
except Exception as e:
    print("  pdf FAIL:", e)

print("\nAll artifacts:")
for f in sorted(ROOT.iterdir()):
    if f.is_file():
        print(f"  {f.name} · {f.stat().st_size} bytes")
