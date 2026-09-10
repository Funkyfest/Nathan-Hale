---
title: "Data Center Design — A Comprehensive Guide to Digital and AI Infrastructure"
author: "Prepared for Nathan Hale"
date: "September 10, 2026"
subject: "Data center engineering, hyperscale, AI factories"
---

# Data Center Design

## A Comprehensive Guide to Digital and AI Infrastructure

*From site selection to the silicon — how modern data centers and AI factories are conceived, built, powered, cooled, and operated.*

---

## Executive Summary

A modern data center is best understood as **a building whose entire job is to keep silicon safe, cool, and fed with electricity**. Nothing in it — the concrete, the chillers, the switchgear, the fiber, the fences — exists for its own sake. Every subsystem is a means of getting **useful compute per watt per dollar per square foot per hour of uptime**.

The last three years have collapsed decades of gradual change. Enterprise racks that averaged 4–8 kW in 2015 have given way to AI training racks in the **120 kW to over 1 MW** range, cooled not by air but by warm water flowing through cold plates bolted directly to the GPU. What used to be a suburban office park with a raised floor is now a **fenced 200-acre industrial campus** with its own 230 kV substation, its own water plant, and hundreds of megawatts of on-site backup generation. The people who plan them talk less about "IT rooms" and more about **factories** — because that is what they are.

This document is a technical guide for someone who wants to understand every layer of that factory. It is written to be readable by a curious generalist while remaining precise enough for an engineer, an investor, or a policymaker to trust the numbers. Where a term of art appears — *2N*, *PUE*, *CDU*, *rail-optimized*, *NVLink*, *Uptime Tier IV* — it is defined the first time it is used and again in the glossary at the end.

The document is organized into nine parts:

1. **Foundations** — what a data center is and how the species evolved
2. **Siting and Civil** — where you put one and how the building is shaped
3. **The Power Chain** — from the utility to the chip, and how it is made redundant
4. **Thermal Management** — why cooling is the hardest problem, and how liquid replaced air
5. **The White Space** — the geometry of racks, aisles, and cabling
6. **The Network** — leaf-spine, InfiniBand, and rail-optimized fabrics for GPUs
7. **The AI Factory** — what is different when the tenant is 100,000 GPUs
8. **Safety, Security, Operations** — fire, guards, DCIM, and commissioning
9. **The Business and the Future** — economics, regulation, and the frontier

Ten technical figures — isometric renderings and diagrams — accompany the text.

**Key findings, up front:**

- The binding constraint on new capacity is no longer land, capital, or chips. It is **grid interconnection** — the queue of permits, transformers, and transmission lines a utility can build.
- **Power density has grown ~30× in a decade** and is still climbing. Air cooling is out of budget above roughly 30–40 kW per rack. Every serious AI build is now liquid-cooled at the chip.
- The industry is converging on **~1.10 PUE** for new hyperscale and **~1.20** for retrofits. The next order-of-magnitude efficiency gain will come from **heat reuse** (district heating, greenhouses), not from further compression of the mechanical loop.
- **AI training clusters are not just bigger; they are qualitatively different.** They demand a coherent scale-up domain (measured in nanoseconds), a rail-optimized scale-out fabric, and synchronous power transients that stress the utility feeder in a way conventional loads do not.
- The frontier in the next five years is not more clever software but **primary energy** — behind-the-meter gas, on-site solar plus storage, and the first small modular reactors (SMRs) contracted directly to compute campuses.

The rest of this document explains, in detail, how each of these observations comes to be true.

---

## How to Read This Document

Read Parts I–II if you want the shape of the industry and the campus. Skim Parts III–IV if you are not interested in electrical or mechanical engineering, but read the summaries — the vocabulary here is used in every other section. Parts V–VII are the meat for anyone specifically interested in AI infrastructure. Parts VIII–IX are for operators and decision-makers.

Chapters are short and self-contained. Every unusual term is defined at first use. A **glossary** at the back gives one-line refreshers for everything.

Numbers throughout are typical of new-build hyperscale and AI campuses as of late 2025 / 2026. Where a range is given, the low end is a good enterprise data center; the high end is a state-of-the-art AI factory.

---

# Part I — Foundations

## Chapter 1 · What a Data Center Actually Is

A **data center** is a purpose-built industrial facility whose primary function is to house, power, cool, connect, and protect computing equipment. Everything else — the walls, the roof, the loading dock, the security fence, the diesel generators, the fiber vault — exists in service of that function.

Physically, a modern data center is a windowless single- or two-story warehouse-scale building, usually rectangular, usually near a substation, usually near a fiber route, usually far from anything else. It contains:

- **White space** — the rooms where computers live (the visible product)
- **Grey space** — the mechanical, electrical, and telecom rooms that keep the white space alive (much larger than most people expect)
- **Support space** — offices, security, loading, staging, storage
- **Yard space** — generator paddocks, water plant, transformer yard, cooling towers, solar, batteries

The interior is designed around three inviolable requirements:

1. **Electricity must be delivered reliably** and at very tight voltage and frequency tolerances, to every rack, 8,760 hours a year.
2. **Heat must be removed** as fast as it is generated. A 100 MW data center is thermodynamically equivalent to a small steel mill — the electricity in becomes heat out.
3. **Data must be able to leave the building**, in both directions, at hundreds of terabits per second, over redundant fiber paths.

Almost every design decision — where the building sits, what its roof looks like, how the aisles are laid out, how the doors open — is downstream of one of these three requirements.

## Chapter 2 · From Mainframes to AI Factories

Data centers evolved through five overlapping generations. Understanding the pattern makes the current AI-factory era easier to place.

**Generation 1 — Mainframe rooms (1960s–80s).** A single large computer in a raised-floor room in a corporate basement. Chilled by CRAC units. Uptime measured in "the machine was down all Tuesday." 1–3 kW per system.

**Generation 2 — Client-server data rooms (1990s).** Racks of pizza-box servers. Growth of the internet drove the first commercial *colocation* buildings — third-party facilities that rented cages to enterprises. 2–5 kW per rack. UPS systems, dual power, and Uptime Institute's tier classifications emerged in this era.

**Generation 3 — Enterprise data centers (2000s).** Multi-megawatt facilities operated by banks, telcos, and Fortune 500s. Hot/cold aisle containment became standard. PUE (Power Usage Effectiveness) emerged as the efficiency metric. Typical rack 3–6 kW.

**Generation 4 — Hyperscale (2010s–present).** Google, Amazon, Microsoft, Meta, Alibaba began operating facilities at 30–100 MW critical IT load, using custom hardware (Open Compute Project) and unprecedented efficiency (PUE 1.10–1.15). Free cooling, evaporative cooling, and warm-water designs became standard. Typical rack 8–15 kW; late-generation halls 20–30 kW.

**Generation 5 — AI factories (2023–present).** GPU-dominated buildings whose entire electromechanical stack is redesigned around one workload: **large-model training and increasingly inference**. Racks 60–200 kW routine, 500 kW–1 MW proposed. Liquid-cooling mandatory. Coherent memory domains measured in nanoseconds. Power draw that can transient tens of megawatts in seconds — a genuinely new problem for the electric grid. Prominent examples now under construction or expansion include **xAI Colossus** (Memphis), **Meta Hyperion / Prometheus**, the **Microsoft–OpenAI Stargate** program, **Google's Council Bluffs and Oklahoma TPU campuses**, and CoreWeave / Crusoe / Nebius purpose-built AI colo.

The transition from Gen 4 to Gen 5 is not incremental — it is a phase change. The plumbing, the electrical topology, and the network fabric are all being reimagined at the same time.

## Chapter 3 · The Anatomy at a Glance

Before we go deeper, it helps to see the whole factory at once. Figure 1 shows a typical hyperscale AI campus — one substation, three data halls, a central utility plant, a generator yard, admin/SOC, fiber meet-me room, and a solar/BESS field. Everything else in this document is a zoom into one of these boxes.

![Figure 1 · Isometric campus](diagrams/01-campus-iso.svg)

The campus in Figure 1 is a plausible ~144 MW facility on ~150 acres. Real hyperscale campuses now under construction range from ~100 MW to over **2 GW** on 500–2,000 acres. But the pattern — buildings for compute, an industrial park for the utilities that feed them — is universal.

Figure 2 slices one of those buildings vertically. The vertical stack of *roof mechanical → penthouse → data halls → electrical* is the defining shape of the modern data center. Older enterprise sites put all this on one floor; new hyperscale buildings stack it to shorten pipe runs and preserve floor plate for compute.

![Figure 2 · Building cutaway](diagrams/02-building-cutaway.svg)

The rest of the document explains what is happening inside each of those slices.

---

# Part II — Siting and Civil

## Chapter 4 · Site Selection

Choosing a site is a multi-variable optimization problem. In practice, the developer builds a scoring model with dozens of weighted factors and evaluates candidate sites over 6–24 months. The dominant factors have shifted in the last decade.

**Historically the top three factors were:**

1. Fiber diversity (multiple long-haul routes converging)
2. Latency to end users (metro proximity)
3. Cost of land and power

**Today the top three factors for AI-class builds are:**

1. **Speed to power** — how fast can the utility deliver 100–500 MW of firm interconnection?
2. **Water availability** — do we have a supply for evaporative cooling and, increasingly, a discharge permit for warm return?
3. **Political and community acceptance** — will the county grant the special-use permit and the noise variance?

Other factors that still matter:

- **Climate.** Cool, dry climates favor free-cooling (Nordic, Pacific Northwest, Iowa, Ireland). Warmer, wetter climates need adiabatic or mechanical cooling.
- **Seismic and severe-weather risk.** Buildings are hardened to local codes; Tier IV requires higher factors of safety. Tornado alley builds now include hardened concrete tilt-ups instead of steel skin.
- **Natural-disaster exposure.** 100-year floodplain is disqualifying. Wildfire wildland-urban interface adds insurance cost.
- **Tax and incentive environment.** Sales-tax exemption on IT gear, property-tax abatement, cheap industrial electricity rates.
- **Fiber and dark-fiber availability.** For AI training, cross-campus fiber matters more than long-haul; for inference and edge, metro proximity matters more.
- **Labor market.** Skilled electricians, mechanical trades, and DC technicians for both construction and operations.
- **Zoning and setbacks.** Industrial (M-1/M-2) with adequate setbacks for generators and cooling towers. Noise limits at property line drive generator enclosure design.
- **Environmental review.** NEPA/state equivalents; wetland delineation; endangered-species surveys. These can add 6–18 months.

A useful rule of thumb: the site-selection team's first job is to eliminate 95 percent of candidate sites in the first week using GIS layers, and then spend a year on the remaining 5 percent. The three showstoppers, in practice, are: (a) utility says "we can give you 30 MW in 2028 or 300 MW in 2032"; (b) the county says "not here"; (c) the water utility says "we can't guarantee your cooling volume in a drought year."

## Chapter 5 · The Campus and Building Shell

Modern hyperscale campuses share a small family of building shapes.

**The single-block hyperscale hall.** ~200 m × ~80 m, one or two stories, 30–80 MW critical load. Steel or tilt-up concrete. Flat roof housing the mechanical plant. Central spine of support space with data halls to either side. Loading dock at one gable end; MV switchgear yard along one long side; generators along the other.

**The multi-hall campus.** 3–8 identical blocks on a common utility spine, sharing a central utility plant (CUP) that houses chillers, pumps, and the water plant. This is what Figure 1 shows.

**The multi-story stack.** In dense metros (northern Virginia, Frankfurt, Singapore, Tokyo, San Jose) where land is scarce, halls are stacked 3–8 stories, with the ground floor and roof reserved for mechanical/electrical.

**Modular / prefab.** For faster deployment, some builds use pre-assembled 40-foot or 53-foot skids or ISO-container-shaped units delivered pre-cabled. Common for edge, colocation, and rapid AI expansion.

**Structural specifics:**

- **Slab-on-grade** with 6–10 inch reinforced concrete rated for 250–500 lb/ft² live load (raised-floor days) or up to 1,000+ lb/ft² for liquid-cooled AI racks that can exceed 2 metric tons apiece.
- **Ceiling height** 20–35 ft to allow overhead cable trays, busway, and mechanical piping in a common return plenum.
- **Fire compartments** every 25,000–50,000 ft², separated by 2-hour fire walls.
- **No windows** in data halls (thermal load and security). Admin has glazing.
- **Redundant physical entrances** for utilities: two fiber vaults on opposite sides of the building, two MV feeds routed through non-adjacent conduits.

Construction schedules for new hyperscale builds have compressed from ~24 months to as fast as **12–14 months** for the shell + first hall, driven by prefab electrical rooms, MV skid packages, and integrated commissioning workflows. The rate-limiting step is almost never construction — it is utility interconnection.

---

# Part III — The Power Chain

## Chapter 6 · From the Grid to the Chip

Electricity enters a hyperscale data center from the utility at **transmission voltage** — typically 115 kV, 230 kV, or 345 kV. Inside the fence, it is stepped down through a sequence of transformers and distribution equipment before it finally arrives at a GPU as ~0.7 volts DC. The complete chain is shown in Figure 5.

![Figure 5 · Power single-line](diagrams/05-power-single-line.svg)

The stages, in order:

1. **Utility feeder(s).** One or two independent transmission lines terminate at the campus. Two feeders from two different substations, ideally on two different transmission rings, is the gold standard.
2. **On-site substation.** A gravel yard filled with structural steel, disconnect switches, breakers, and one or more large power transformers ("main transformers") that step 115–345 kV down to **medium voltage** — most often 34.5 kV in North America, 11 kV or 33 kV elsewhere.
3. **MV switchgear.** Metal-clad breakers and bus that distribute MV around the campus, feeding each data building. Redundant bus arrangements ("main-tie-main" or "ring bus") allow any single breaker to be maintained without dropping load.
4. **Building unit substations.** Each hall has its own transformers stepping MV down to **low voltage** — 480 V in North America, 400 V in Europe, 415 V in most of the rest of the world.
5. **Low-voltage main switchboard (LV MSB).** The building's electrical "spine" from which UPS systems, mechanical loads, and PDUs branch.
6. **Uninterruptible power supply (UPS).** Battery- or flywheel-backed system that carries the IT load through utility disturbances. Modern UPS are Li-ion battery-based, ~2–5 minutes autonomy — long enough for generators to start.
7. **Static transfer switch (STS).** Sub-cycle transfer between two independent UPS-fed sources.
8. **Power distribution unit (PDU).** Wall- or floor-mounted transformer plus breakers that hands off dedicated circuits to each row or each rack.
9. **Overhead busway.** Aluminum or copper bus running along the top of each row, tapped at every rack with plug-in breakers.
10. **Rack PDU ("PDU strip" or "smart strip").** Vertical bar in the rack that distributes A-side and B-side circuits to individual server power supplies.
11. **Server PSU.** Converts AC (or 380/48 VDC in newer OCP designs) to a DC bus (typically 12 V or, increasingly, 48 V or 400 V) delivered to the motherboard.
12. **Voltage regulator modules (VRMs).** On the motherboard, step the DC bus down to the chip's operating voltage — often 0.7–1.0 V at hundreds to thousands of amperes per socket.

At every stage there are transformer losses (0.5–1%), conversion losses (1–3% in the UPS, 5–8% at the PSU, 5–10% at the VRM), and distribution losses (~1%). Together these amount to **10–15% of the electricity delivered to the building becoming waste heat before the CPU/GPU ever sees a volt**. Cutting that number is worth billions across the industry.

The push to move the DC distribution voltage upward — from 12 V motherboards to 48 V (OCP), and now to **400 V DC in-row** for AI racks — is an attempt to reduce copper mass and I²R losses at very high current. NVIDIA's roadmap for the post-Blackwell era assumes ~800 V DC rack distribution.

## Chapter 7 · Redundancy and the Uptime Tiers

Not every data center needs the same level of reliability. The industry standard framework for classifying reliability is the **Uptime Institute Tier system**, summarized in Figure 10.

![Figure 10 · Tier classification](diagrams/10-tier-comparison.svg)

The vocabulary is precise:

- **N** — enough equipment to serve the load. No spare.
- **N+1** — one additional spare unit beyond N.
- **2N** — two independent, complete systems, each of which can carry the full load alone.
- **2(N+1)** — two independent systems, each with its own internal spare. Belt, suspenders, and a second pair of pants.

Tier definitions map to these:

- **Tier I (Basic).** Single non-redundant path. Any maintenance takes the data center down. Common only in labs and small enterprises.
- **Tier II (Redundant components).** Single path but with N+1 spare capacity components. Still requires shutdown for path maintenance.
- **Tier III (Concurrently maintainable).** Multiple paths, one active. Any single component can be replaced or serviced without dropping the load. This is the sweet spot for enterprise, colocation, and most hyperscale.
- **Tier IV (Fault tolerant).** Two active, independent paths. Survives any single failure or event. Highest capex; used by finance, government, and critical infrastructure.

Availability numbers are misleadingly precise; **the real driver of downtime is human error**, not equipment failure, and Uptime's own field data suggests that ~70% of outages trace to operations rather than hardware.

A subtle point: **many hyperscalers deliberately build Tier III rather than Tier IV**, because their software already handles single-facility failures via geographic distribution. If Google's US-central-1 fails, the load shifts to US-west-2. Paying for 2N inside every building buys them very little.

**For AI training** the calculus is different again. A single lost checkpoint costs hours or days of training. But because training is inherently stateful and asynchronous, the workload can *pause and resume*. This means training halls can — and increasingly do — build to Tier II or III rather than Tier IV, spending the saved capex on more compute instead.

## Chapter 8 · Backup Power

When the utility fails — and it always will, eventually — the data center relies on stored and locally generated energy to ride through until utility restoration or until it can shed load gracefully.

**Batteries (UPS).** Every serious data center has a UPS. The dominant technologies:

- **Valve-regulated lead-acid (VRLA).** Legacy, 3–5 year lifespan, high floor loading, needs 20+% floor space.
- **Wet-cell lead-acid.** Long-life, 15–20 year, larger footprint.
- **Lithium-ion (LFP or NMC).** Now dominant in new-build. 8–15 year lifespan, one-third the footprint of VRLA, more thermally tolerant, higher round-trip efficiency, and — critically — able to double as **grid-services BESS** (battery energy storage system) that can inject or absorb power from the utility for frequency regulation and demand response.
- **Flywheel.** Kinetic storage in a spinning mass; 15–30 seconds of ride-through. Common as a supplement to diesel start-up rather than a standalone.

Modern UPS ride-through is **1–5 minutes**. Anything longer is wasteful; the generators start in seconds.

**Generators.** The industry standard is **standby diesel** — 2–3 MW cylindrical engines packaged in acoustic enclosures on outdoor concrete pads. A hyperscale campus may have twenty or more, arranged N+1 or N+2. Cold-start to full load is 8–12 seconds, and an ATS (automatic transfer switch) picks up the load once the gen bus is stable.

Diesel is entrenched because of energy density, reliability, and the developed maintenance supply chain. But it has increasing problems:

- **Air-permit constraints.** Many jurisdictions cap the annual runtime of diesel gensets (typically 100–500 hours/year) and impose Tier 4 emissions requirements. In the AI-factory era, permit boards are pushing back on new diesel farms altogether.
- **Fuel logistics.** A campus that runs 40 gensets at load for 72 hours can burn well over 1 million gallons of diesel; on-site tank farms and delivery contracts are non-trivial.
- **Public perception.** Diesel spills and diesel smoke are highly visible.

Alternatives now being deployed or piloted:

- **Natural-gas reciprocating engines.** Similar dynamics to diesel but with cleaner emissions and pipeline fuel. Increasingly popular where a gas main exists.
- **Natural-gas turbines** (aeroderivative or industrial frame). Larger blocks (10–40 MW each), used at gigawatt-scale campuses. Sometimes run **behind-the-meter** as primary generation, with the utility as backup — a growing pattern for accelerating AI builds.
- **Fuel cells.** Bloom Energy solid-oxide fuel cells run on pipeline gas and produce cleaner power at slightly lower efficiency than the grid. Increasingly used as primary distributed generation.
- **BESS (utility-scale batteries).** Large lithium arrays now provide 15 minutes to 4 hours of full-load ride-through, participate in grid ancillary markets, and buffer transient loads.
- **Small modular reactors (SMRs).** Contracted at several sites (Amazon–TVA, Google–Kairos, Oracle–Oklo) for 2028–2032 delivery. The first SMR-powered AI campuses will change the shape of the industry.

The dominant trend of the coming decade is **behind-the-meter primary generation** — putting a small power plant, gas or nuclear, directly on the fence line — because the utility grid queue can no longer keep up with AI demand.

---

# Part IV — Thermal Management

## Chapter 9 · Why Cooling Is the Hardest Problem

The second law of thermodynamics is inescapable: every watt of electricity that enters a data center leaves as an equal watt of heat. A 100 MW building must therefore reject 100 MW of heat continuously, in every weather condition, without ever letting the interior temperature drift outside a narrow band.

This is not a hard problem when racks draw 3 kW and are spread out. It becomes extraordinarily hard when racks draw 120 kW and are packed shoulder to shoulder.

**Heat flux — watts per unit area — is what matters, not total watts.** A 1990s server rack rejected ~500 W/ft² of floor. A modern AI rack rejects **5,000–15,000 W/ft²** — heat densities comparable to a steel-mill electrode. Air can carry away perhaps 20–30 kW per rack economically before airflow velocities become dangerous and acoustic power becomes intolerable. Above that, liquid is mandatory.

Cooling is also **the single largest source of parasitic overhead** in a data center. In a 1.5-PUE facility, the cooling plant consumes as much electricity as one-third of the IT load itself. Every point of PUE improvement is worth 8-figures per year at hyperscale.

## Chapter 10 · Air Cooling and the Evolution of the Aisle

The original air-cooling approach — "just put a lot of CRAC units around the room" — worked until it didn't. The failure mode is **short-circuit airflow**: hot exhaust from the back of one row is drawn into the front of the adjacent row, and the CRAC units end up cooling their own exhaust.

The fix, standardized in the mid-2000s, is **hot-aisle / cold-aisle** arrangement: rows of racks are placed back-to-back so the exhausts face into a common hot aisle, and cold supply arrives at the front of each rack from the opposite side. Figure 3 shows the geometry.

![Figure 3 · Aisle containment](diagrams/03-aisle-containment.svg)

Two variants dominate:

- **Cold-aisle containment (CAC).** A physical barrier — plastic curtains, sliding doors, glass panels — encloses the cold aisle. Cold air is trapped where it is needed. The rest of the room becomes hot exhaust. Retrofit-friendly, since existing raised-floor supply can be used.
- **Hot-aisle containment (HAC).** The hot aisle is enclosed and vented to a return plenum, typically the space above a suspended ceiling. The rest of the room becomes a large cold-air reservoir. Preferred for new builds; more efficient because the temperature differential (ΔT) across the CRAH is higher.

The supply air itself is delivered by:

- **CRAC units** (Computer Room Air Conditioners) with internal compressors. Older approach.
- **CRAH units** (Computer Room Air Handlers) — fan coils on a chilled-water loop, no compressor. Dominant in modern builds.
- **Fan walls** (in-row or wall-mounted arrays of EC fans). Highest efficiency, lowest footprint.

Recommended set-points have crept upward: ASHRAE's TC 9.9 committee now allows **cold-aisle supply up to 27 °C (80.6 °F)** for the "recommended" envelope and up to **40 °C (104 °F)** for "allowable." Warmer supply means more hours of free cooling — the biggest single lever on PUE.

## Chapter 11 · Liquid Cooling

Above ~30 kW per rack, air cooling loses. Fan power grows with the cube of airflow, so doubling the heat output roughly quadruples fan energy. The industry answer is to move the heat out of the box using liquid, which is ~3,500× more effective per unit volume.

Four dominant liquid approaches:

- **Rear-door heat exchangers (RDHx).** A finned coil bolted to the back of a rack. The rack still contains air-cooled servers, but the coil captures the exhaust before it enters the room, reducing effective air heat load to near zero. 40–80 kW per rack routine. Retrofittable and vendor-neutral.
- **Direct-to-chip cold plates (DTC or DLC).** A metal plate with internal microchannels sits atop each CPU/GPU package. Warm water — supply typically 30–45 °C — flows through the plate and picks up 70–90% of the chip's heat. Rear-door or in-cabinet air still handles the residual (memory, NICs, PSUs). This is the standard for NVIDIA GB200 NVL72, HGX H100/H200 in high-density mode, and AMD MI300X. Figure 4 shows a representative rack.
- **Immersion cooling.** Whole servers submerged in a dielectric fluid. Two subtypes:
  - **Single-phase** — fluid stays liquid; heat carried out by pumped flow.
  - **Two-phase** — fluid boils at chip temperature, vapor rises, condenser at top returns liquid. Highest heat flux capacity, complex.
- **Spray cooling.** Fluid sprayed at chips inside sealed servers. Niche.

![Figure 4 · Liquid-cooled AI rack](diagrams/04-liquid-rack.svg)

The industry has converged on **DTC + rear-door as the standard** for GPU racks in the 60–200 kW range, and is watching immersion for the >500 kW rack of the near future.

An important design choice: **warm water, not cold water.** DTC systems are designed to accept **facility water in the 30–45 °C range** — warm enough that the outside air (in most climates) can reject the heat without any mechanical refrigeration. This is what enables PUEs approaching 1.05.

## Chapter 12 · The Cooling Loops

A production data center has two or three coupled fluid loops, each optimized for its own physical role. Figure 6 shows the coupling.

![Figure 6 · Cooling loops](diagrams/06-cooling-loop.svg)

**Facility loop (a.k.a. condenser-water loop or primary loop).** Rejects heat from the building to the outside atmosphere. Composed of pumps, piping, heat-rejection equipment (dry coolers, cooling towers, adiabatic coils, or a mix), and — in warmer climates or for critical redundancy — mechanical chillers that can force-cool the loop below outside ambient.

**Technology loop (a.k.a. secondary loop, CDU loop, or tech-cool water loop).** Carries treated, filtered water (or a water-glycol mix) directly to the rack manifolds and cold plates. Isolated from the facility loop by a **coolant distribution unit (CDU)** — a plate-and-frame heat exchanger with its own pumps, filters, and instrumentation. The CDU is the demarcation between "building water" and "IT water."

**Air loop.** A conventional chilled-water loop feeding CRAH units or fan walls that handle whatever heat the liquid loop does not — memory, optics, PSUs, power electronics.

The design goals for these loops:

- **High ΔT.** Bigger temperature differences mean lower flow rates, smaller pipes, and smaller pumps. Modern designs target 10–15 K rise across the rack, up from 5–8 K in older builds.
- **High supply temperature.** Every degree of supply temperature above the outside wet-bulb reduces or eliminates chiller runtime.
- **Redundancy.** N+1 on pumps, chillers, cooling-tower cells, CDUs. Cross-tied piping to allow any single unit to be isolated for service.
- **Water conservation.** WUE (Water Usage Effectiveness) increasingly reported; targets under 0.5 L/kWh IT drive designs toward closed-loop dry coolers rather than open evaporative towers.

## Chapter 13 · Efficiency: PUE, WUE, CUE

Three metrics dominate operational reporting:

- **PUE (Power Usage Effectiveness) = Total facility power ÷ IT power.** A perfect data center has PUE = 1.0 (every watt goes to compute). Best hyperscale new-build now runs **1.08–1.15**. Legacy enterprise sites often 1.6–2.0. Colocation typical 1.4–1.5.

- **WUE (Water Usage Effectiveness) = Liters of water consumed ÷ IT kWh.** Ranges from ~0 (fully closed dry-cooled, sometimes at PUE cost) to ~2.5 L/kWh (aggressive evaporative). Increasingly the metric that regulators and communities care about.

- **CUE (Carbon Usage Effectiveness) = kg CO₂ ÷ IT kWh.** Depends on the local grid mix; drives the shift to on-site renewables, PPAs, and 24/7 carbon-free energy matching.

PUE is a coarse metric — it does not distinguish between wasted heat and useful heat, does not credit heat reuse, and can be gamed by moving certain loads across the "IT" boundary. But it remains the *lingua franca* of the industry.

The next frontier is **heat reuse** — capturing the ~30 °C water returning from CDUs and using it for district heating (already deployed in Nordic sites, notably Meta Odense and CloudHQ Stockholm), for greenhouses (Facebook Prineville), for adjacent industrial processes, or for absorption chillers that recycle the heat into further cooling. Full heat reuse breaks the PUE formalism and requires new metrics (ERE — Energy Reuse Effectiveness).

---

# Part V — The White Space

## Chapter 14 · IT Hall Geometry

The "white space" is where the servers live. Its geometry is the compromise between many competing pressures.

**Raised floor vs slab.** For decades, the standard was a **raised access floor** — perforated tiles above a plenum through which cold air was delivered. The plenum also carried power and structured cabling. But raised floors have downsides: floor loading limits, seismic performance, contamination risk, and — most damningly — poor airflow control at very high heat densities.

Modern AI halls almost always use **slab-on-grade** with overhead everything: overhead cable trays, overhead busway, overhead pipe. This preserves the concrete for the enormous mechanical loads of liquid-cooled racks (a fully loaded GB200 NVL72 rack can weigh **1,800 kg**) and improves seismic performance.

**Aisle pitch.** The cold aisle is typically 4 tiles wide (~1.2 m). The hot aisle is often narrower (~0.9 m) since no one stands in it under load. Row length is set by fire compartments and cabling reach — 15–25 m is typical.

**Aisle containment.** As discussed, universal in new builds.

**Ceiling height.** 20–35 ft in modern halls, to accommodate overhead infrastructure and a warm-return plenum.

**Rack density.** New AI halls target **200–400 racks per hall**, arranged in 8–20 rows of 20–30 racks each, all in a single fire compartment where possible.

**Egress and access.** Every hall has multiple large service doors, allowing forklift access. Aisles are laid out so a fully loaded pallet jack can reach any rack.

## Chapter 15 · Racks and Cabinets

The **19-inch rack** — a standard set by the Electronic Industries Association in 1965 — is still the fundamental unit of the data center. A rack is 19 inches wide inside its rails, 42–48U tall (a "U" is 1.75 inches), and typically 600 mm or 800 mm wide externally, 1000 mm or 1200 mm deep.

For high-density and hyperscale, several variants coexist:

- **Standard 19".** The universal enterprise/colocation cabinet.
- **Open Compute Project (OCP) rack (OpenRack V3).** 21-inch equipment width in a 600 mm-external form factor; centralized 48 VDC bus bar; hot-pluggable trays. Used inside Meta, Microsoft, and much of hyperscale.
- **NVIDIA MGX / NVL72 / OCP-derived AI racks.** Optimized for GPU trays, warm-water manifolds, integrated bus bar, weighed and structural-engineered to floor loading.
- **21-inch and 24-inch "AI cabinet" proposals.** Emerging for the >1 MW rack era.

**Cable management** is a discipline of its own. Horizontal cable managers in every U, vertical cable channels on both sides, and structured overhead pathways keep the front doors closable and airflow uncontaminated. Modern halls use **pre-terminated fiber cassettes** and **MTP/MPO** trunks so a rack's uplinks are plug-and-play.

## Chapter 16 · Structured Cabling and Optical Distribution

Every data center is a fiber factory. A single AI training pod can have **tens of thousands of optical connections**. Getting the cable plant right is often the difference between a hall that turns up in weeks and one that turns up in months.

**Physical layers:**

- **Fiber types.** Multi-mode (OM3/OM4/OM5) for short reach (≤100 m) at lower cost; single-mode (OS2) for everything else. High-speed AI fabrics (400G/800G/1.6T) are increasingly single-mode-only because of reach and lane density.
- **Connectors.** LC for legacy duplex; MPO/MTP for 8/12/16/24-fiber trunks; new **VSFF** (very small form factor: MDC, SN) for higher panel density.
- **Structured cabling standards.** ANSI/TIA-942, ISO/IEC 24764, BICSI-002. Set the rules for pathways, spaces, grounding, labeling.
- **Meet-me room (MMR).** Central telecom room where carriers, cloud on-ramps, and internal cross-connects terminate. Physically a fortress within the fortress.
- **Zone distribution.** Modern practice divides the hall into zones, each with its own patch enclosure ("zone distribution area"), reducing the reach and complexity of any single trunk.

**Optical transceivers** are increasingly the *dominant capital cost of the fabric*, not the switches. A single 800G optic can cost more than a 1U server. AI networks use hundreds of thousands of them. This is driving the industry toward **co-packaged optics (CPO)** — moving the laser onto the ASIC package itself, eliminating the pluggable transceiver — which will roll out in 2026–2028.

---

# Part VI — The Network

## Chapter 17 · Fabric Topologies

For decades, data-center networks were **hierarchical**: access → aggregation → core, with over-subscription at each layer. This is a *scale-up* topology: it works well when most traffic is north-south (client to server).

Modern data-center workloads are dominated by **east-west** traffic (server to server), and hierarchical designs cannot deliver enough bisection bandwidth for them. The industry has therefore converged on the **leaf-spine (Clos) fabric**.

![Figure 7 · Leaf-spine](diagrams/07-leaf-spine.svg)

A leaf-spine has two layers:

- **Leaf (ToR) switches.** One per rack (or per pair of racks). Every host connects to the leaf.
- **Spine switches.** Every leaf connects to every spine. Every server can reach every other server in exactly two hops.

Bisection bandwidth is set by *spine × spine-port-speed*. Modern hyperscale designs run **non-blocking** — spine capacity equals aggregate leaf uplink capacity.

For very large fabrics (>10,000 hosts), a three-tier variant is used: **super-spine** at the top, connecting several leaf-spine pods. Google's Jupiter and Meta's F16 are large-scale examples.

Other topologies worth knowing:

- **Dragonfly / dragonfly+.** Used in HPC and some AI supercomputers (Frontier, Aurora). Fewer long wires, higher radix routers.
- **Torus / hypercube.** Legacy HPC (e.g., Blue Gene). Rare in commercial DC.
- **Fat-tree.** Precursor to Clos, still used academically.

## Chapter 18 · Ethernet vs InfiniBand vs NVLink

Three distinct network technologies coexist in the AI factory.

**Ethernet** is the universal fabric of the internet, cloud, and enterprise. It has evolved to remarkable speeds — 100/200/400G is mainstream, 800G is shipping, 1.6T is imminent — and, with lossless extensions (RoCE v2, DCB, priority-flow-control), can carry RDMA traffic at nearly wire speed. The **Ultra Ethernet Consortium** (2023+) is standardizing extensions specifically for AI (multipath, in-network reduction, better congestion control).

**InfiniBand** (now owned by NVIDIA via Mellanox) was born in the HPC world and remains dominant in large-model training. It uses a lossless, credit-based flow control that avoids Ethernet's tail-latency variance, and its "adaptive routing" spreads traffic across paths. NVIDIA's current products (NDR at 400G per lane, XDR at 800G) are found in every leading AI supercomputer.

**NVLink / NVSwitch.** NVIDIA's proprietary intra-node and (with NVSwitch) intra-rack interconnect. Not a network in the traditional sense — it presents as a coherent memory fabric with sub-microsecond latency, hundreds of gigabytes per second per link. NVL72 racks use NVLink to build a **72-GPU coherent domain** where any GPU can dereference any other GPU's memory.

**Choosing.** The rough rule is: **NVLink for scale-up (intra-rack), InfiniBand or Ultra Ethernet for scale-out (rack-to-rack in the training cluster), Ethernet for everything else (storage, management, external egress).**

## Chapter 19 · Rail-Optimized Networks for GPU Clusters

Training workloads have a highly structured communication pattern: at every gradient step, GPU-*i* on every host must exchange gradients with GPU-*i* on every other host (all-reduce, ring, or tree reductions). If the network is not aware of this, the traffic passes through the spine and creates hot spots.

**Rail-optimized** fabrics solve this by grouping "same-index" NICs across many hosts onto a dedicated ToR (a "rail switch"). A typical 8-GPU host has 8 NICs; a rail-optimized fabric has 8 dedicated ToRs (one per rail), each connecting to the corresponding NIC on every host in the pod.

Figure 7 shows the topology; the shaded lines highlight two rails.

The practical effect is dramatic: **all-reduce traffic collapses to a single switch hop** for the fast phase of the algorithm, reducing latency variance and freeing spine capacity for other traffic. Rail-optimized designs are now standard in every serious AI cluster.

## Chapter 20 · Data Center Interconnect (DCI)

A hyperscale operator does not have "a data center" — it has a **region**, made of 3–8 buildings within a metropolitan area, connected by very high-capacity fiber. The DCI network:

- Runs at **400G–3.2T per wavelength** over DWDM;
- Uses coherent optics with digital signal processing;
- Provides sub-millisecond latency between buildings, enabling zonal fault tolerance;
- Terminates at **spine or super-spine** switches, not at edge routers.

Beyond the metro, **long-haul backbones** (Google B4, Microsoft SWAN, Meta Express Backbone) span continents at petabit-scale, with software-defined routing that treats the whole planet as one fabric.

For **AI**, an additional consideration: model-parallel training across geographically distributed buildings is now being tried (Google Gemini has done cross-region training). This requires DCI capable of tens of terabits per second at sub-millisecond stability.

---

# Part VII — The AI Factory

## Chapter 21 · Why AI Data Centers Are Different

A traditional cloud data center is designed for **many small, independent workloads**. Each rack is more or less self-contained; failures are localized; power draw is smoothed by the law of large numbers.

An AI training data center is designed for **one enormous, tightly coupled workload**. Every GPU is a piece of one distributed computation. Failures cascade. Power draw is *synchronous* — 100,000 GPUs stepping in lockstep can present the grid with a **±30–50 MW step load** at every gradient synchronization.

Five properties make AI data centers qualitatively different:

1. **Extreme rack density.** 60–200 kW today, 500 kW–1 MW planned. Air is out. Figure 9 shows the trajectory.

![Figure 9 · Rack power density evolution](diagrams/09-power-density-evolution.svg)

2. **Liquid cooling everywhere.** DTC + rear-door is the new default.
3. **Coherent scale-up domains.** Racks and pods are single logical machines; you cannot lose one GPU without impacting the whole pod.
4. **Rail-optimized fabrics.** Network is designed for the collective communication of training.
5. **Transient power dynamics.** Training oscillates between compute-heavy and network-heavy phases at multi-Hz frequencies, presenting a novel load profile to the utility. This has forced hyperscalers to add **BESS or flywheels between the UPS and the utility** specifically to smooth transients, and to publish "harmonic filters" and "power-quality" specifications the utility can enforce.

The building itself changes too:

- **Higher floor loading** (1,000+ lb/ft² vs 250 lb/ft²).
- **More mechanical space** per MW of IT (pumps, CDUs, primary and secondary loops).
- **Fewer, larger PDUs** feeding busway rated 800–1600 A.
- **Warmer white space** (25–27 °C) since liquid does most of the heavy lifting.

## Chapter 22 · GPU Pods

The unit of compute in an AI factory is not the rack or the server — it is the **pod**. Figure 8 shows a representative 1,024-GPU pod.

![Figure 8 · AI pod](diagrams/08-ai-pod.svg)

A pod contains:

- 16–64 racks of 8-GPU or 72-GPU compute trays;
- An intra-pod scale-up fabric (NVLink, or an equivalent) providing coherent memory across every GPU;
- A pod-local rail-optimized scale-out fabric to sibling pods;
- Its own mechanical distribution (CDU, manifolds, pumps, PDUs);
- Frequently, its own DCIM subsystem and firmware baseline.

Job schedulers (Slurm, Kubernetes with device plugins, MOSAIC, MAST) place training jobs at pod granularity. A 4,096-GPU job runs on four sibling pods. A 100,000-GPU frontier-model training run may span an entire building or multiple buildings.

Real-world examples of pod-scale designs:

- **NVIDIA GB200 NVL72:** 72-GPU coherent domain per rack; 9 racks form a "SuperPod" (~600 GPUs); customer builds cluster SuperPods into buildings of 20–100k GPUs.
- **Google TPU v5p pod:** 8,960 TPUs in a 3D torus with optical circuit switches for reconfiguration.
- **AMD MI300X node with Infinity Fabric.**
- **Trainium 2 (AWS)** pods with NeuronLink.

## Chapter 23 · Power Synchrony and Transient Loads

Perhaps the most surprising property of an AI factory is the shape of its electrical load.

A conventional cloud building has a **smooth, predictable power curve** — the aggregate of tens of thousands of unrelated workloads averages to a slowly varying baseline.

An AI training cluster has a **jagged, coherent curve**. Every GPU in the cluster:

- Draws maximum power during dense matrix multiplication phases;
- Drops to near-idle during all-reduce network phases;
- Repeats this pattern at multi-Hz frequencies through the training run.

At 100,000 GPUs of ~1 kW each, this is a **100 MW load oscillating tens of MW every few hundred milliseconds**. Utilities have described the effect as "like a steel-mill arc furnace, but continuous."

The engineering answer:

- **BESS on the site bus**, providing spinning reserve and transient smoothing;
- **Programmatic load shaping** in the training software (deliberate all-reduce jitter);
- **Grid-forming inverters** at the substation;
- **Utility coordination** — some sites now have real-time SCADA links so the utility can pre-position reactive power.

Failure to manage this can trip breakers, injure the local grid, or cause the utility to refuse further capacity.

## Chapter 24 · Training vs Inference Halls

Not all AI compute is created equal.

**Training halls** are the "backend" — dense GPU clusters running long-duration, tightly coupled workloads. Optimized for **peak FLOPs per watt**, extreme scale-up density, and pod-level coherence. Latency-insensitive to end users; throughput-obsessed.

**Inference halls** are the "front end" — many smaller GPU or accelerator servers serving user queries. Optimized for **throughput per dollar and low tail-latency** to the user. Often distributed near population centers (metros) rather than concentrated at a single mega-site. Rack densities lower (30–80 kW) than training halls. Network is more like conventional cloud than like a supercomputer.

The distinction is not sharp — the same building can host both, and many hyperscalers use **fungible fleets** that can dispatch to either mode. But the trend is toward **specialization**: gigawatt training campuses in the middle of nowhere; smaller metro-adjacent inference clusters near the users.

## Chapter 25 · Notable Real-World Examples

A short tour of the current frontier (as of 2026):

- **xAI Colossus (Memphis, TN).** Went from empty warehouse to ~100k H100 GPUs in ~19 weeks in 2024, expanded through 200k+ in 2025, now targeting 1M+ GPUs at build-out with on-site gas turbines and Tesla Megapacks.
- **Meta Hyperion (LA campus) and Prometheus** (multiple sites). Multi-gigawatt build-outs across Louisiana, Ohio, and elsewhere.
- **Microsoft–OpenAI Stargate.** A publicly announced $100B+ program building multi-gigawatt AI campuses across the U.S., with the first Abilene, TX site under construction.
- **Amazon–Anthropic "Rainier"** (New Carlisle, IN). Trainium2-based, gigawatt scale.
- **Google Council Bluffs and TPU campuses.** Optical circuit switching, custom TPU pods.
- **Nvidia + Foxconn "AI Factory" in Taiwan.**
- **CoreWeave, Nebius, Crusoe, Lambda.** Neocloud operators building purpose-built AI colo in secondary markets with cheaper power.

Common features across all of them:
- Hundreds of megawatts to multiple gigawatts of contracted power;
- On-site generation or dedicated substations;
- Warm-water liquid cooling at 30–45 °C supply;
- Rail-optimized fabrics with 400/800/1600G optics;
- Faster build cycles than the industry ever did before (12–18 months shell-to-first-load).

---

# Part VIII — Safety, Security, Operations

## Chapter 26 · Physical Security

A modern hyperscale data center is a hard target by design. The security posture is layered:

- **Perimeter** — fence, ballistic vehicle bollards, blast standoff, K-rated gates, CCTV, LiDAR/radar intrusion detection.
- **Site** — guardhouse with 24/7 staffing, license-plate recognition, mantrap vehicle inspection for trucks.
- **Building envelope** — no windows in data halls, hardened concrete or CMU walls, badge-controlled doors, biometric mantraps.
- **Interior zones** — every door is a security boundary; corridors have separate badging; data halls require dual authentication (badge + biometric).
- **Cages and cabinets** — for colocation, individual customer cages, some cage-in-cage, with locked cabinets and camera coverage.
- **SOC (Security Operations Center)** — 24/7 monitoring, on-site guards, drone surveillance in some campuses.

Insider threat is treated seriously. Two-person integrity rules apply to access to certain rooms (crypto, MMR, key management). Background checks are standard for all site personnel and contractors.

## Chapter 27 · Fire Detection and Suppression

Fire in a data center is uniquely hazardous: high-value equipment, high electrical energy, high air movement, and a workload that can't be evacuated. The industry has developed a defence-in-depth stack.

**Detection.**
- **VESDA (Very Early Smoke Detection Apparatus).** Aspirating smoke detectors continuously sample air; can detect a smouldering resistor before flame. Multi-stage alarms (alert → action → pre-alarm → fire) allow graceful response.
- **Spot detectors** as secondary.
- **Linear heat detection** on cable trays.
- **Battery-room hydrogen sensors** (VRLA).
- **AI-based thermal video** for hotspot detection.

**Suppression.**
- **Pre-action sprinkler.** Dry pipe (no water in the pipes) that fills only after a detector alarm, and discharges only if a sprinkler head then fuses. Two-stage safety against accidental discharge.
- **Clean agent (Novec 1230, FM-200, Inergen).** Gaseous suppressants that displace oxygen or absorb heat without wetting equipment. Used in high-value zones (MMR, tape libraries) but declining because of GWP or availability concerns.
- **Mist systems.** Water in very fine droplets, less damaging than sprinkler discharge.
- **Portable clean-agent** at the rack for first response.

**Compartmentalization.** Every 25,000–50,000 ft² of hall is a fire compartment. Cable trays penetrating fire walls are firestopped.

**Battery-room special measures.** Li-ion UPS and BESS rooms require dedicated design — thermal runaway containment, ventilation, gas detection, deluge, and structural blast walls. Standards like NFPA 855 and UL 9540A govern this.

## Chapter 28 · Operations

The building is only as good as its operations team.

**Network Operations Center (NOC).** 24/7 monitoring of network fabric, servers, and services. Escalation to on-call engineers via runbook.

**Building Management System (BMS).** SCADA/BMS software (Siemens Designo, Schneider EBO, Honeywell EBI, Automated Logic WebCTRL) monitors and controls mechanical and electrical plant. Alarms feed the NOC.

**DCIM (Data Center Infrastructure Management).** Software layer that inventories every asset, tracks power draw and thermal profile per rack, manages capacity, and increasingly uses ML for anomaly detection and predictive maintenance. Vendors: Nlyte, Sunbird, Vertiv Environet, Schneider EcoStruxure IT.

**CMMS (Computerized Maintenance Management System).** Work-order and preventative-maintenance tracking. Every generator is exercised weekly and load-bank-tested annually; every UPS is battery-tested; every chiller is quarterly-inspected.

**Change control.** No physical or logical change happens without a written change order, peer review, and rollback plan. This is where most avoidable outages are lost.

**Staffing.** A 100 MW hyperscale might operate with ~30–60 people including security, mechanical, electrical, IT, and management. Neocloud AI-only operators run with lighter teams because there is less variety in the workload.

## Chapter 29 · Commissioning (L1 – L5)

Before a data center enters service, it goes through a multi-level commissioning process:

- **L1 — Factory Acceptance Testing (FAT).** Each major piece of equipment tested at the vendor's factory.
- **L2 — Site Acceptance Testing (SAT).** Same equipment, tested on site after delivery, before install.
- **L3 — Component testing.** Individual systems (UPS, generator, chiller) tested in place with utilities but not integrated.
- **L4 — Integrated systems testing (IST).** Every subsystem in coordinated failure and recovery scenarios. Utility loss → generator start → UPS ride-through → transfer back. Failure of one chiller → automatic failover to redundant. Simulated fire → suppression verification.
- **L5 — Full-load testing.** Load banks simulate full IT draw, and the entire plant is exercised across worst-case scenarios. Real IT is only admitted after L5 sign-off.

Independent commissioning agents (CxAs) issue formal documentation used by insurance underwriters and enterprise tenants. Commissioning can consume 5–15% of project schedule and 2–4% of project cost, and is where most latent design defects are discovered.

---

# Part IX — The Business and the Future

## Chapter 30 · Economics and TCO

The financial model of a hyperscale data center revolves around **cost per MW of IT critical load** and **capex per MW built**.

Ranges (2025 US dollars):

- **Enterprise Tier III retrofit:** $6–9 M / MW-IT.
- **Hyperscale greenfield, air-cooled:** $8–12 M / MW-IT.
- **Hyperscale greenfield, liquid-cooled AI-ready:** $12–18 M / MW-IT.
- **Hyperscale Tier IV or highly redundant AI:** $15–25 M / MW-IT.

These numbers **exclude the IT equipment itself**, which for AI is far more expensive than the building — a single 100 MW AI hall may house **$3–8 billion of GPUs**, dwarfing the ~$1.5B of infrastructure.

Ongoing costs, typical hyperscale:

- **Electricity:** dominant. At $0.05–0.08/kWh industrial rate, a 100 MW facility runs $50–80 M / year in power.
- **Maintenance and staffing:** $8–15 M / year for a 100 MW campus.
- **Property tax, insurance:** varies wildly by jurisdiction, $2–10 M / year.
- **Cooling water and chemicals:** $0.5–3 M / year.

**Revenue** in colocation is priced per **kW/month** (typical $150–400/kW/month for wholesale hyperscale) or per cabinet (retail). AI cloud (CoreWeave et al.) is priced per **GPU-hour** ($1.50 – $6.00 depending on GPU class and term).

The bottleneck for new capacity, as noted, is not capital or land — it is **interconnection queues** at utilities that were sized for a slow-growth industry. The current queue in ERCOT for large loads exceeds 100 GW; PJM is similar. This is the single most important number in the industry.

## Chapter 31 · Regulatory, Environmental, Community

The industry's honeymoon with local governments is ending. Data centers used to be welcomed as tax base with minimal traffic; they are now scrutinized as heavy industrial users of power and water, often in tension with residential neighbors over noise (generator testing, cooling towers) and viewshed.

Emerging patterns:

- **Moratoriums** in some jurisdictions (parts of NoVA, Ireland, Netherlands) pausing new permits.
- **Community benefit agreements** — commitments to local hiring, apprenticeship, road improvements.
- **Sound ordinances** driving generator enclosure design and cooling-tower fan selection.
- **Water permits** with drought triggers.
- **Air permits** with genset-hour caps.
- **Transparency requirements** — utilities being asked to disclose the identity of large-load customers.
- **Renewable-matching mandates** — in EU under the Corporate Sustainability Reporting Directive, and voluntarily via 24/7 CFE programs.

Long-term, data centers will need to be *good neighbors*, not just quiet ones, and the buildings themselves will need to demonstrably contribute more than they take (heat reuse to district heating; renewable buildout that lifts all local ratepayers).

## Chapter 32 · Sustainability and Heat Reuse

Data centers currently consume ~1.5–2% of global electricity, projected to reach 3–4% by 2030 primarily from AI. The industry response spans several axes:

- **Efficiency (PUE).** New builds routinely 1.10–1.15; some 1.05. Diminishing returns.
- **Renewable procurement.** Long-term PPAs for solar and wind, on-site generation.
- **24/7 carbon-free energy matching.** Google, Microsoft, and others have committed to hourly matching, requiring firm carbon-free sources — driving nuclear, geothermal, and long-duration storage investment.
- **Heat reuse.** Nordic sites (Odense, Stockholm) already export waste heat to district networks. Meta and Equinix have similar programs. Reuse only makes sense where a heat customer sits within a few km.
- **Refrigerants.** Move to low-GWP refrigerants (R-1234ze, R-513A) in remaining mechanical cooling.
- **Water recycling.** Closed-loop dry coolers reduce WUE toward zero.
- **Embodied carbon.** Increased attention to concrete, steel, and copper in construction.

## Chapter 33 · The Frontier

Looking forward five years, five threads matter:

1. **Primary on-site generation.** Behind-the-meter natural-gas turbines are here now; SMRs (NuScale, Kairos, Oklo) will begin AI-campus operations 2028–2032. Watch this space closely: it decouples AI from grid interconnection queues.

2. **1 MW racks and 800 V DC distribution.** NVIDIA's post-Rubin roadmap, AMD's roadmap, and OCP working groups all converge on this. Every architectural assumption of the last 20 years is being renegotiated.

3. **Co-packaged optics.** Moving lasers onto the switch and NIC ASIC packages eliminates pluggable transceivers, reduces cost and power, and enables the next generation of fabric speeds (3.2T, 6.4T).

4. **Optical circuit switching.** Google's OCS approach — using MEMS mirrors to reconfigure fibers directly — could displace electrical switches in some layers, reducing latency and power.

5. **Software-defined power and thermal.** DCIM systems that treat power and cooling as elastic resources, dynamically shifting workloads across zones and buildings in response to grid signals, weather, and workload phase.

The economics, the physics, the regulatory environment, and the geopolitics of AI infrastructure are all in flux. What is clear is that the data center — an unglamorous industrial building in a field — has become one of the most strategically important pieces of infrastructure in the world.

---

# Glossary

**2N.** Two independent, complete systems, each able to carry the full load alone.
**Adiabatic cooling.** Evaporative pre-cooling of air before it passes through a dry cooler, effective in hot dry climates.
**All-reduce.** A collective communication operation in distributed training where every node sums gradients with every other node.
**ATS.** Automatic Transfer Switch — a device that switches load between two power sources on loss of primary.
**BESS.** Battery Energy Storage System — utility-scale lithium (or other) batteries used for ride-through, grid services, or primary storage.
**BMS.** Building Management System — SCADA software that monitors and controls mechanical and electrical plant.
**Busway.** Metal-clad power distribution rail, plug-in tapped at each rack.
**CAC / HAC.** Cold-aisle containment / hot-aisle containment.
**CDU.** Coolant Distribution Unit — the heat exchanger and pump skid that couples facility water to IT water for liquid cooling.
**CFE.** Carbon-Free Energy — matched hourly to a data center's consumption.
**Clos.** A non-blocking multi-stage switch topology, of which leaf-spine is the two-stage form.
**CMMS.** Computerized Maintenance Management System.
**CoPacked Optics (CPO).** Integrating an optical engine into a switch or NIC ASIC package.
**CRAC / CRAH.** Computer Room Air Conditioner (with compressor) / Air Handler (chilled-water only).
**CUE.** Carbon Usage Effectiveness — kg CO₂ per IT kWh.
**DCI.** Data Center Interconnect — high-capacity fiber between buildings/campuses.
**DCIM.** Data Center Infrastructure Management software.
**Dark fiber.** Unlit fiber pairs leased to a customer to run their own optics.
**Dragonfly.** A high-radix network topology used in some HPC/AI supercomputers.
**DTC / DLC.** Direct-to-chip / direct liquid cooling — cold plates on the processors.
**DWDM.** Dense Wavelength-Division Multiplexing — many wavelengths per fiber.
**ERE.** Energy Reuse Effectiveness — accounts for waste heat exported for reuse.
**FAT / SAT.** Factory / Site Acceptance Testing.
**Fiber MMR.** Meet-Me Room — the telecom room where all carriers and cross-connects terminate.
**Free cooling.** Any cooling regime that does not require a mechanical chiller compressor.
**GB200.** NVIDIA's Grace-Blackwell architecture; NVL72 is the 72-GPU rack-scale form.
**Grid-forming inverter.** A power-electronics device that can create voltage and frequency reference rather than follow one.
**HDX / NDX / XDR.** InfiniBand data-rate generations.
**HPC.** High-Performance Computing.
**Hyperscale.** Operator running at hundreds of megawatts to gigawatts across many buildings (AWS, Microsoft, Google, Meta, Oracle, Alibaba, Tencent, ByteDance).
**IB.** InfiniBand.
**InfiniBand.** A lossless, credit-based interconnect standard used in HPC and AI.
**Immersion cooling.** Whole-server or whole-rack submersion in a dielectric fluid.
**IT load / critical load.** Power delivered to computing equipment, not to cooling and other overhead.
**LFP / NMC.** Lithium-iron-phosphate / nickel-manganese-cobalt battery chemistries.
**MMR.** Meet-Me Room.
**MV / LV.** Medium Voltage (~1–35 kV) / Low Voltage (<1 kV).
**MTP / MPO.** High-density multi-fiber connectors.
**N+1.** N required plus one spare.
**Neocloud.** New generation of AI-only cloud operators (CoreWeave, Nebius, Crusoe, Lambda).
**NVLink / NVSwitch.** NVIDIA's proprietary coherent GPU interconnect.
**OCP.** Open Compute Project — open hardware specifications originated by Meta.
**OCS.** Optical Circuit Switch — a MEMS mirror device that switches whole wavelengths rather than packets.
**PDU.** Power Distribution Unit.
**Pod.** The unit of AI compute: a coherent scale-up domain plus its scale-out fabric.
**PPA.** Power Purchase Agreement — long-term contract with a renewable developer.
**PUE.** Power Usage Effectiveness = total facility power ÷ IT power.
**Rail-optimized.** A network topology grouping same-index NICs across many hosts onto dedicated ToRs.
**RDHx.** Rear-Door Heat Exchanger.
**RoCE.** RDMA over Converged Ethernet — RDMA over lossless Ethernet.
**Scale-up / scale-out.** Making a single node bigger vs. adding more nodes.
**SMR.** Small Modular Reactor.
**Spine / leaf.** Layers of the modern Clos fabric.
**STS.** Static Transfer Switch — sub-cycle power path switch.
**Substation.** The utility interface: HV → MV transformer yard, protective relays, disconnects.
**Tier I–IV.** Uptime Institute redundancy classification.
**ToR.** Top-of-Rack switch.
**Ultra Ethernet.** Consortium standardizing Ethernet extensions for AI/HPC.
**UPS.** Uninterruptible Power Supply.
**VESDA.** Very Early Smoke Detection Apparatus (aspirating smoke detection).
**VFD.** Variable Frequency Drive — for speed control of pumps and fans.
**VRM.** Voltage Regulator Module — on-motherboard step-down to chip voltage.
**WUE.** Water Usage Effectiveness — liters of water per IT kWh.
**White / grey space.** Rooms housing IT equipment / rooms housing supporting mechanical & electrical.

---

# Further Reading and Sources

- Uptime Institute — *Tier Classification System* and annual *Global Data Center Survey*.
- ASHRAE Technical Committee 9.9 — *Thermal Guidelines for Data Processing Environments*, latest edition.
- Open Compute Project — specifications for OpenRack, ORV3, and OCP servers (opencompute.org).
- NVIDIA — *GB200 NVL72 Reference Architecture* and *DGX SuperPOD Reference Architecture*.
- Meta Engineering Blog — posts on Prineville, Odense, Hyperion.
- Google Research — papers on Jupiter, B4, TPU pods, and 24/7 CFE.
- Microsoft — *Datacenter Fabric* whitepapers, Project Natick.
- The Uptime Institute Journal — case studies on outages and post-mortems.
- SemiAnalysis newsletter — deep dives on AI datacenter builds, power, and networking.
- LBNL — data-center energy studies and free-cooling analyses.

---

*Prepared September 2026. Figures are original isometric SVG diagrams created for this document.*
