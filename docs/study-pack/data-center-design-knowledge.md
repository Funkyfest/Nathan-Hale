# Data Center Design — knowledge file for local AI tools

This file combines the full guide and the podcast transcript so a local model (LM Studio, Open WebUI, AnythingLLM) can answer questions and quiz you from it.

---

# PART A · THE GUIDE

# Executive summary

A data center is a building whose only job is to keep computer chips powered, cool, connected and safe. The concrete, chillers, switchgear, fibre and fences all serve that job. Every design decision is a trade-off between four things: how much useful computing you get, how much it costs, how much electricity it uses, and how often it fails.

In the last three years AI has changed the numbers more than the previous twenty did. A typical cloud server rack draws 10–20 kW. An AI training rack such as NVIDIA's GB200 NVL72 draws about 130 kW and weighs about 1.4 tonnes, and vendors have announced racks of 600 kW and more. Air cannot carry that much heat away, so the chips are now cooled by warm water flowing through metal plates bolted directly onto them. The largest new campuses are planned at one to five gigawatts, as much as a mid-sized city, and some bring their own gas turbines or contract with nuclear plants because the grid cannot connect them fast enough.

This guide explains every layer of these buildings. It is written so a curious non-engineer can follow it, with enough precise numbers that an engineer or investor can use them. Each technical term is explained the first time it appears and again in the glossary.

### Key findings
- **Power is the bottleneck.** Land, money and chips are easier to get than a large grid connection. In several US markets the wait for hundreds of megawatts is several years.
- **AI racks draw 10× more than cloud racks** and the gap is still widening. Above roughly 30–45 kW per rack, air cooling stops being practical, so every serious AI build now uses liquid cooling at the chip.
- **New buildings are very efficient already.** The best new facilities spend only 10–20% extra energy on top of the computers themselves (a PUE of 1.1–1.2). The next big gain is using the waste heat, for example for district heating.
- **AI clusters behave like one machine.** Tens of thousands of GPUs work in lockstep. That demands extremely fast networks and creates large, synchronised swings in power draw that the grid has never seen from a building before.
- **Energy supply is the next frontier.** On-site gas generation, large batteries, restarted and uprated nuclear plants, and in time small modular reactors are being contracted directly for data center campuses.

### Figures at a glance
| Measure | Enterprise data center | Cloud hyperscale | AI factory |
|---|---|---|---|
| Typical size (IT load) | 1–10 MW | 30–300 MW per campus | 100 MW – 5 GW per campus |
| Power per rack | 5–10 kW | 10–30 kW | 60–150 kW, heading to 600 kW+ |
| Main cooling method | room air | air with containment, some liquid | direct-to-chip liquid plus air |
| Network | general-purpose Ethernet | leaf-spine Ethernet | NVLink inside racks plus a dedicated InfiniBand or Ethernet GPU fabric |
| Power profile | steady | steady, many small jobs | large synchronised swings |
| Floor load | ~12 kPa (250 lb/ft²) | ~12–15 kPa | up to ~25–35 kPa (500–750 lb/ft²) |
| Typical PUE | 1.5–1.8 | 1.1–1.2 | 1.1–1.3 |
| Build time to first power | 18–30 months | 15–24 months | as little as 4–12 months for record builds |

# How to read this guide

The guide has nine parts. Parts I and II give you the overall picture and the campus. Parts III and IV cover the electrical and cooling systems; every other part uses their vocabulary. Parts V to VII cover the inside of the building, the network and what makes AI facilities different. Parts VIII and IX cover operations, money and what comes next. The final chapter works through the numbers for a 100 MW AI hall from start to finish.

The figures are 3-D renderings and engineering schematics made for this guide. The HTML edition lets you rotate the 3-D models. Numbers are typical for new builds in 2025–2026. Where a range is given, the low end is a good conventional data center and the high end is a leading AI facility.

# Part I — Foundations

## What a data center is

A **data center** is an industrial building designed to house, power, cool, connect and protect computers. A modern one is usually a large windowless box of one or two storeys, close to a high-voltage substation and a fibre route, and usually far from homes.

Its spaces fall into four groups:

- **White space**: the rooms where the computers stand in rows of racks.
- **Grey space**: the electrical, mechanical and telecom rooms that keep the white space running. It often takes up as much floor area as the white space.
- **Support space**: offices, the security desk, loading docks, storage and workshops.
- **Yard**: generators, transformers, cooling equipment, water tanks, batteries and sometimes solar panels.

Three requirements drive nearly every design decision:

1. **Electricity must arrive reliably**, within tight voltage and frequency limits, to every rack, 8,760 hours a year.
2. **Heat must leave as fast as it is made.** Essentially every watt of electricity that goes in comes out as heat. A 100 MW data center gives off as much heat as about 50,000 electric space heaters running flat out.
3. **Data must flow in and out** at hundreds of terabits per second over at least two separate fibre routes.

## From mainframes to AI factories

Data centers have gone through five overlapping generations.

1. **Mainframe rooms (1960s–1980s).** One large computer in a raised-floor room, cooled by room air conditioners. 1–3 kW per machine.
2. **Server rooms and early colocation (1990s).** Racks of small servers. The internet boom created **colocation** buildings, where companies rent space, power and cooling for their own equipment. 2–5 kW per rack. UPS systems, dual power feeds and the Uptime Institute's tier ratings appeared in this era.
3. **Enterprise data centers (2000s).** Multi-megawatt sites run by banks, telecom companies and large corporations. Hot-aisle/cold-aisle layouts and the PUE efficiency metric became standard. 3–6 kW per rack.
4. **Hyperscale (2010s–present).** Google, Amazon, Microsoft, Meta, Alibaba and others built 30–300 MW campuses with custom hardware, outside-air cooling and PUEs near 1.1. 8–30 kW per rack.
5. **AI factories (2023–present).** Buildings designed around one job: training and running large AI models on GPUs or other accelerators. Racks of 60–150 kW are normal and much larger ones are coming. Liquid cooling is required. Tens of thousands of chips act as one computer. Power draw can swing by tens of megawatts in under a second.

The move from generation 4 to 5 is a change in kind, not just in size. Power distribution, cooling and networking are all being redesigned at once.

## The anatomy at a glance

Figure 1 shows a typical AI campus: a 230 kV substation, three data halls, a generator yard beside each hall, a central utility plant, battery storage, an office and security building, and solar panels. The rest of this guide zooms into these pieces.

[Figure: Figure 1 — A 144 MW AI campus seen from the air. Each hall has its own generator row and unit-substation transformers; dry coolers on the roofs reject the heat.]{#fig:campus}

The campus in Figure 1 holds about 144 MW of computing load on roughly 60 hectares (150 acres). Campuses now under construction range from about 100 MW to several gigawatts on hundreds of hectares, but the layout pattern is the same everywhere: buildings for the computers, and an industrial yard of utilities to feed them.

Figure 2 opens up one hall. The roof is lifted so you can see the inside. Electrical rooms sit at one end. A mechanical gallery of pumps and coolant distribution units runs along one wall. Rows of racks fill the middle, with overhead power and fibre. The roof carries the heat-rejection equipment.

[Figure: Figure 2 — Exploded cutaway of one data hall: electrical room (left), contained rows of liquid-cooled racks (centre), mechanical gallery (back wall), generators (right) and the roof with dry coolers lifted off.]{#fig:cutaway}

# Part II — Siting and the building

## Choosing a site

Developers score candidate sites against dozens of weighted factors, often over 6–24 months. The most important factors have changed.

Ten years ago the top three were fibre (several long-distance routes nearby), latency to users, and the cost of land and power. For AI campuses today they are:

1. **Time to power.** How soon can the utility deliver 100–1,000 MW of firm capacity? This includes new transmission lines and substation transformers, which can take years to manufacture.
2. **Water.** Is there enough for cooling, and a permit to use it and discharge it? This matters less for designs that use little water (see [Efficiency](#efficiency-pue-wue-and-cue)).
3. **Local acceptance.** Will the county grant zoning, noise and air permits?

Other factors still count:

- **Climate.** Cool, dry places allow more hours of cooling with outside air (the Nordics, the Pacific Northwest, Iowa, Ireland). Hot or humid places need more mechanical cooling or evaporative assistance.
- **Natural hazards.** A 100-year floodplain is usually ruled out. Earthquake, tornado and wildfire risk raise construction and insurance costs.
- **Taxes and incentives.** Sales-tax exemptions on equipment, property-tax abatements and industrial power rates.
- **Fibre.** Training campuses need big links between their own buildings more than to cities. Inference sites, which answer user requests, want to be closer to users.
- **Workforce.** Electricians, pipe-fitters and data center technicians for construction and for 24/7 operation.
- **Zoning and setbacks.** Industrial zoning, distance from homes, and noise limits at the property line, which shape generator enclosures and fan choices.
- **Environmental review.** Wetlands, protected species and air-quality modelling can add 6–18 months.

In practice the site team rules out most candidates in the first week using mapping data, then spends a year on the few that remain. The usual deal-breakers are: the utility can offer 30 MW now but 300 MW only years later; the county says no; or the water supplier cannot guarantee volumes in a drought.

## The campus and the building shell

Modern campuses use a few standard building forms.

- **Single-block hall.** Roughly 150–200 m long and 50–80 m wide, one or two storeys, 30–80 MW of IT load. Precast concrete or steel. Generators along one long side, transformers along the other, loading dock at one end.
- **Multi-hall campus.** Three to eight identical halls sharing a substation and a central utility plant, as in Figure 1.
- **Multi-storey.** In dense markets such as Northern Virginia, Frankfurt, Singapore and Tokyo, halls are stacked three to eight storeys high. Microsoft's Fairwater AI site in Wisconsin uses two storeys of racks to shorten cable runs between GPUs.
- **Modular and prefabricated.** Electrical rooms, cooling skids and even whole data halls are built in factories and delivered on trucks. Prefabrication now drives much of the schedule compression.

Structural norms:

- **Floors** are reinforced concrete slabs. A loaded NVL72 rack weighs about 1.4 tonnes on a 0.6 × 1.2 m footprint, roughly 20 kPa (about 400 lb/ft²) directly under the rack. AI floors are designed for 25–35 kPa.
- **Clear height** is 6–10 m to fit overhead busway, cable trays, pipes and a hot-air return space.
- **Fire compartments** of a few thousand square metres are separated by two-hour fire walls.
- **No windows** in data halls.
- **Two of everything that enters**: two fibre vaults at opposite ends and two power routes that never share a trench.

Record builds have gone from bare site to running GPUs in about four months. xAI's first Colossus cluster in Memphis took 122 days, by reusing an existing factory building and bringing in temporary gas turbines. Typical schedules are 15–24 months to first power. The grid connection, not construction, is usually what sets the date.

# Part III — The power chain

## From the grid to the chip

Electricity reaches a large campus at transmission voltage, usually 115–345 kV. Inside the fence it is stepped down in stages until it reaches the chip at under one volt. Figure 3 shows the chain.

[Figure: Figure 3 — The power path from the transmission line to the chip, with two fully independent paths (A and B) that meet only inside the rack.]{#fig:power}

The stages, in order:

1. **Utility feeds.** One or, ideally, two lines from different substations.
2. **On-site substation.** A gravel yard with steel gantries, circuit breakers and large **main transformers** that step down to **medium voltage (MV)**, usually 34.5 kV in North America or 11–33 kV elsewhere.
3. **MV switchgear.** Breakers that distribute MV around the campus. Ring or "main-tie-main" layouts let any breaker be serviced without cutting power.
4. **Unit substations.** Transformers at each building step MV down to **low voltage (LV)**: 480 V in North America, 400–415 V in most other places.
5. **LV switchboards.** The main distribution boards for UPS systems, cooling plant and building services.
6. **Uninterruptible power supply (UPS).** Batteries (now mostly lithium-ion) and power electronics that carry the load through any utility disturbance until generators start. Typical ride-through is about five minutes.
7. **Distribution to the rows.** Power distribution units (PDUs) or remote power panels feed **overhead busway**: a metal bar running above each row with a plug-in tap box for every rack.
8. **Rack power shelves.** Inside AI racks, power shelves convert AC to roughly 50 V DC and feed a copper **busbar** running up the back of the rack.
9. **Voltage regulators (VRMs).** On each board, next to the chip, these step 50 V (or 12 V) down to about 0.7–1.0 V at hundreds to more than a thousand amperes per chip.

Every stage loses a little energy: about 0.5–1% per transformer, 2–4% in a double-conversion UPS (less in "eco" modes), 2–5% in power supplies and 5–10% in on-board regulators. Together, roughly 10–15% of the electricity entering the building becomes heat before it reaches a transistor.

Higher voltages mean less current, thinner copper and lower losses. That is why rack power moved from 12 V to 48–50 V, and why NVIDIA has announced an **800 V DC** rack architecture for its next generation of very large racks. That design moves AC-to-DC conversion out of the rack and into the building.

## Redundancy and the Uptime tiers

Not every facility needs the same reliability. The common framework is the **Uptime Institute Tier** classification. It uses this vocabulary:

- **N**: exactly enough equipment to carry the load, no spare.
- **N+1**: one spare unit, such as nine generators where eight are needed.
- **2N**: two complete, independent systems, each able to carry the whole load (the A and B paths in Figure 3).
- **2(N+1)**: two independent systems, each with its own spare.

| | Tier I | Tier II | Tier III | Tier IV |
|---|---|---|---|---|
| Power and cooling paths | one | one, with spare components | several, one active | several, all active |
| Can be serviced without shutdown | no | no | **yes** | **yes** |
| Survives any single failure | no | no | not always | **yes** |
| Commonly quoted availability | 99.671% | 99.741% | 99.982% | 99.995% |
| Equivalent downtime per year | ~29 h | ~23 h | ~1.6 h | ~26 min |
| Typical users | labs, small offices | small businesses | enterprise, colocation, cloud | finance, government, critical services |
| Relative build cost | 1× | ~1.3× | ~1.8–2.2× | ~2.4–3× |

Table: Uptime Institute tiers. The availability percentages are long-standing industry rules of thumb; Uptime's certification is based on design topology, not on a promised percentage.

Three points matter in practice:

- **People cause most outages.** Uptime's surveys consistently find that a large share of serious outages involve human error or procedure failures, not just equipment.
- **Cloud providers often build to Tier III.** Their software already shifts work between buildings and regions, so paying for Tier IV inside every building buys little.
- **AI training is different again.** A training job saves its progress (a **checkpoint**) regularly and can restart from it. Losing power to a training hall wastes hours of work but does not lose customer data. Some AI training halls therefore use less redundancy, for example single-path power to the GPUs, and spend the savings on more compute. Inference halls, which serve users directly, keep cloud-style redundancy.

## Backup power

When the utility fails, the data center runs first on batteries and then on generators.

### Batteries (UPS)
- **Valve-regulated lead-acid (VRLA)**: the old standard; heavy, bulky, replaced every 4–6 years.
- **Lithium-ion**, mostly lithium iron phosphate (LFP): now standard in new builds. It takes about a third of the space, lasts 10–15 years, and can also earn money by helping the grid with frequency regulation.
- **Flywheels**: a spinning mass that gives 15–30 seconds of ride-through. Sometimes used instead of batteries where the generators start fast.

**Generators.** The standard is diesel: 2–3.5 MW engines in sound-proofed enclosures, arranged N+1 or better. They reach full load in about 10 seconds, and an **automatic transfer switch (ATS)** moves the load onto them. A large campus can have more than a hundred. Diesel is reliable and stores well, but faces growing limits:

- **Air permits** often cap running hours, typically 50–500 hours a year including testing, and require modern emission controls.
- **Fuel.** Running a 300 MW campus on generators for three days takes on the order of 5–6 million litres (1.5 million US gallons) of diesel.
- **Neighbours** notice the smoke and the noise of monthly tests.

Alternatives in use or being deployed:

- **Natural-gas engines and turbines.** Cleaner and fed by pipeline rather than tank. At AI campuses they are increasingly installed **behind the meter** as the primary power source, with the grid as backup, because the grid connection would take too long.
- **Fuel cells.** Solid-oxide fuel cells running on natural gas, used as on-site primary power at several US sites.
- **Large battery systems (BESS).** Container-sized lithium batteries that provide minutes to hours of backup, smooth AI power swings and earn grid-service revenue.
- **Nuclear.** Data center operators have signed long-term contracts with existing and restarting nuclear plants (for example Microsoft with Constellation for the former Three Mile Island Unit 1, and Amazon at Talen's Susquehanna plant). They have also backed small modular reactor developers (Amazon with X-energy, Google with Kairos Power) for the 2030s.

# Part IV — Cooling

## Why cooling is the hardest problem

Essentially all the electricity a data center uses becomes heat. A 100 MW building must reject 100 MW of heat continuously, in any weather, while holding the chips within a few degrees of their target.

That is manageable when racks draw 5 kW and are spread out. It becomes very hard at 130 kW per rack packed shoulder to shoulder. **Heat density matters more than the total.** An AI rack gives off about as much heat as 60–70 household space heaters crammed into a wardrobe-sized box.

Cooling is also the largest energy overhead after the computers. In an older facility with a PUE of 1.6, the cooling plant can use almost half as much energy as the IT equipment. Each 0.1 improvement in PUE on a 100 MW site saves roughly 8–9 GWh a year, worth about $5 million at industrial power prices.

## Air cooling and containment

Early data centers simply filled the room with cold air. The problem was **recirculation**: hot air leaving the back of one rack was pulled into the front of the next, so the air conditioners were cooling their own exhaust.

The fix, standard since the mid-2000s, is the **hot aisle / cold aisle** layout. Rows of racks face each other in pairs, so fronts draw cool air from a shared cold aisle and backs blow hot air into a shared hot aisle. **Containment** then puts a physical barrier around one of the aisles:

- **Cold-aisle containment** encloses the cold aisle with doors and a roof. It is easy to add to older raised-floor rooms.
- **Hot-aisle containment** encloses the hot aisle and ducts the hot air to a return space above the ceiling (Figure 4). The rest of the room becomes a large pool of cool air. This is preferred in new builds because the return air is hotter, which makes the cooling coils more efficient.

The air is cooled by:

- **CRAC units** (computer room air conditioners), each with its own refrigerant compressor. Older design.
- **CRAH units** (computer room air handlers): fans blowing over coils filled with chilled water. Most common today.
- **Fan walls**: a wall of large, efficient fans with coils, serving a whole room or hall.

ASHRAE's thermal guidelines recommend 18–27 °C (64–81 °F) at the server inlet and allow higher temperatures for short periods. Every degree warmer means more hours a year when outside air alone can do the cooling.

[Figure: Figure 4 — Inside a liquid-cooled AI hall. Blue (supply) and red (return) water headers run above the contained hot aisles and drop into every rack. Busway with a plug-in tap per rack and yellow fibre in ladder trays run overhead. The CDU sits at the end of each row.]{#fig:hall}

## Liquid cooling

Above roughly 30–45 kW per rack, air stops working well. Fan power rises steeply as airflow increases, and the air gets too loud and fast to move through the servers. Water carries about 3,500 times more heat than the same volume of air, so the industry has moved to liquid.

| Method | How it works | Typical rack power | Where it is used |
|---|---|---|---|
| Rear-door heat exchanger | a water-cooled coil replaces the rack's back door and cools the exhaust air | 20–50 kW (up to ~80 with active fans) | retrofits, mixed halls |
| Direct-to-chip (DLC) | metal **cold plates** sit on each GPU and CPU; water flows through micro-channels inside them | 60–200 kW today | today's standard for AI (NVIDIA GB200/GB300, AMD MI300/MI350 series, Google TPU) |
| Single-phase immersion | whole servers sit in a tank of non-conducting oil; pumps move the fluid | 100 kW+ per tank | crypto mining, some HPC, pilots |
| Two-phase immersion or two-phase cold plates | the fluid boils at the chip and condenses elsewhere, absorbing a lot of heat per litre | highest | emerging; limited by fluid cost and environmental rules |

Table: Liquid-cooling methods.

With direct-to-chip cooling, about 80–85% of a rack's heat leaves in the water. The rest, from memory, network cards and power supplies, is still removed by fans and room air. Figure 5 shows an NVL72-class rack with one compute tray pulled out, its copper cold plates visible.

[Figure: Figure 5 — A liquid-cooled NVL72-class rack. One compute tray is pulled out to show the cold plates on the GPUs and CPUs. Supply and return manifolds and the copper DC busbar run up the back; the NVLink "spine" of copper cables joins all 72 GPUs.]{#fig:rack}

The key design choice is **warm water**. Cold plates accept coolant at 25–45 °C. Water that warm can be cooled by outside air in most climates for most of the year, with no refrigeration compressor running. That is how AI halls reach PUEs near 1.1 despite their density.

## The cooling loops

Most liquid-cooled facilities have two or three connected loops (Figure 6).

[Figure: Figure 6 — Cooling loops. The facility loop moves heat from the CDU to the outside; the technology loop moves heat from the cold plates to the CDU; residual heat goes to room air.]{#fig:cooling}

- **Facility water loop.** Carries heat from the building to the outside. It includes pumps, large pipes and heat-rejection equipment: **dry coolers** (big radiators with fans), **cooling towers** (which evaporate water and are more efficient but use water), or **adiabatic** dry coolers that spray water only on the hottest days. Some sites add a small **trim chiller** for heat waves.
- **Technology (rack) loop.** Carries very clean, treated water or a water-glycol mix through the rack manifolds and cold plates.
- **Coolant distribution unit (CDU).** A heat exchanger with pumps, filters and sensors that separates the two loops. A leak or contamination in one loop cannot drain or foul the other. CDUs can sit in a gallery (Figure 2), at the end of a row (Figure 4) or inside the rack.
- **Air loop.** Fans and coils (CRAHs or fan walls) remove the heat the liquid does not capture.

Design goals:

- **A large temperature rise (ΔT).** A 10 K rise across the rack needs half the flow of a 5 K rise, so pipes and pumps can be smaller.
- **Warm supply temperatures**, to maximise hours without compressors.
- **N+1 redundancy** on pumps, CDUs and heat-rejection units, with valves that let any one be isolated for repair.
- **Leak detection** at every rack and under every pipe joint, with automatic shut-off valves.
- **Low water use.** Closed-loop dry cooling uses almost no water. Evaporative cooling saves electricity but can use 1–2 litres of water per kWh of IT energy.

## Efficiency: PUE, WUE and CUE

Three ratios dominate efficiency reporting.

- **PUE (power usage effectiveness)** = total facility energy ÷ IT equipment energy. A PUE of 1.0 would mean no overhead at all. The best new facilities report 1.08–1.2. The global average reported by Uptime's surveys has hovered around 1.5–1.6 for years, pulled up by older sites.
- **WUE (water usage effectiveness)** = litres of water consumed ÷ kWh of IT energy. It ranges from near zero for closed-loop dry cooling to about 2 L/kWh for heavily evaporative sites. Communities and regulators increasingly ask for it.
- **CUE (carbon usage effectiveness)** = kg of CO₂ ÷ kWh of IT energy. It depends mostly on the local grid and on clean-energy contracts.

PUE is a blunt tool. It ignores what the computers achieve, it gives no credit for reusing heat, and moving equipment such as server fans into or out of the "IT" side can change it. It remains the industry's common language anyway.

**Heat reuse** is the next step. Water coming back from cold plates at 40–45 °C is warm enough, with a heat pump, to feed district heating networks. Meta's data center in Odense, Denmark, Microsoft's partnership with Fortum in Finland and the Stockholm Data Parks programme all do this. Heat reuse only works where there is a heat customer within a few kilometres, which rules out most remote AI campuses.

# Part V — The white space

## Data hall layout

The white space is where the racks stand. Its layout balances power, cooling, cabling, weight and access.

- **Raised floor or slab.** For decades, cold air came up through perforated tiles in a raised floor about 0.6 m high, with cables underneath. New AI halls almost always use a **concrete slab with everything overhead** (Figure 4). Slabs carry heavy liquid-cooled racks better, perform better in earthquakes, and keep leaks and cables apart.
- **Aisle widths.** Cold aisles are about 1.2 m wide, enough for a person and a server lift. Hot aisles are often about 0.9–1.2 m.
- **Row length** is limited by fire compartments, busway ratings and cable reach. Rows of 15–30 m are typical.
- **Containment** is standard in all new builds.
- **Clear height** of 6–10 m leaves room for busway, trays, pipes and the hot-air return space.
- **Access.** Wide doors, ramps and a clear route from the loading dock so a 1.4-tonne rack on a pallet jack can reach any position.

## Racks

The **19-inch rack**, standardised in the 1960s, is still the basic unit. It is 19 inches (482.6 mm) between mounting rails, typically 42–52 **U** tall (1U = 1.75 in, 44.45 mm), 600–800 mm wide and 1,000–1,200 mm deep.

Variants in high-density facilities:

- **Open Compute Project (OCP) Open Rack.** A 21-inch-wide equipment space with a shared DC busbar at the back and hot-swappable power shelves. Used widely by Meta and Microsoft.
- **NVIDIA MGX and NVL72-class racks** (Figure 5). Built around GPU trays, liquid manifolds and a DC busbar. An NVL72 holds 18 compute trays (72 Blackwell GPUs and 36 Grace CPUs) and 9 NVLink switch trays.
- **Next-generation AI racks**, designed for 600 kW to 1 MW per rack, with power conversion moved to a separate sidecar or to the building.

**Cable management** is a craft of its own. Pre-terminated fibre trunks with multi-fibre **MPO** connectors, labelled patch panels and overhead trays keep airflow clear and make changes quick.

## Cabling and fibre

A data center is a fibre plant as much as a power plant. One AI training cluster can need hundreds of thousands of optical links.

- **Fibre types.** Multimode fibre is cheaper for short runs (under about 100 m). Singlemode fibre is used for everything longer and increasingly for everything, because the fastest optics (400G, 800G, 1.6T) use it.
- **Connectors.** LC for single links; MPO/MTP for 8–24 fibres at once; very small form-factor connectors (MDC, SN) where panel space is tight.
- **Standards.** ANSI/TIA-942, ISO/IEC 11801-5 and BICSI 002 cover cabling layout, labelling and grounding.
- **Meet-me room (MMR).** A secure telecom room where outside carriers and cloud connections meet the building's network.

**Optical transceivers**, the small modules that turn electrical signals into light, are now a large share of network cost and power. An 800G transceiver uses roughly 15 W, and a large cluster needs hundreds of thousands of them. **Co-packaged optics**, which put the lasers next to the switch chip, cut that power substantially. NVIDIA and Broadcom began shipping co-packaged-optics switches in 2025–2026.

# Part VI — The network

## Fabric topologies

Old data center networks were built like a tree: access switches fed aggregation switches, which fed a core. That suited traffic going in and out of the building ("north-south"). Modern workloads send most traffic between servers ("east-west"), and a tree chokes on that.

The answer is the **leaf-spine** design (Figure 7), a form of the **Clos** network invented for telephone exchanges in the 1950s.

[Figure: Figure 7 — Leaf-spine fabric with rail-optimized GPU connections. Every leaf connects to every spine; GPU number 0 in every server connects to the rail-0 leaf, and so on.]{#fig:fabric}

- **Leaf switches** connect to servers.
- **Spine switches** connect to every leaf.
- Any two servers are at most three switch hops apart (leaf, spine, leaf), and there are many equal paths between them.

A non-blocking fabric has as much spine capacity as the leaves can send. Very large networks add a third tier, the **super-spine**. Google's Jupiter network goes further and uses **optical circuit switches** (mirrors that redirect light) in place of the spine.

## Ethernet, InfiniBand and NVLink

Three kinds of network sit inside an AI factory.

| | NVLink (and similar) | InfiniBand | Ethernet (RoCE / Ultra Ethernet) |
|---|---|---|---|
| Role | **scale-up**: makes the GPUs in one rack act as one large GPU | **scale-out**: connects racks in a training cluster | scale-out GPU fabric, storage, management and connection to the outside |
| Reach | inside a rack (copper), or a few racks | the whole cluster | anywhere |
| Speed | 1.8 TB/s per GPU (NVLink 5) | 400 Gb/s (NDR) or 800 Gb/s (XDR) per port | 400–800 Gb/s per port, 1.6 Tb/s arriving |
| Who makes it | NVIDIA; open alternatives (UALink) in development | NVIDIA (from its Mellanox acquisition) | many vendors |

Table: Network technologies in an AI cluster.

- **NVLink** links 72 GPUs in an NVL72 rack into one domain through the NVLink switch trays and about 5,000 copper cables in the rack's spine. Any GPU can read another's memory directly.
- **InfiniBand** was built for supercomputers. It does not drop packets and steers traffic around congestion, giving very consistent latency. It has dominated large training clusters.
- **Ethernet** is everywhere and has many suppliers. With **RDMA over Converged Ethernet (RoCE)** and newer congestion control, it now runs many of the largest training clusters, including Meta's and xAI's. The **Ultra Ethernet Consortium** published its 1.0 specification in 2025 to tune Ethernet further for AI.

## Rail-optimized GPU networks

During training, GPUs constantly exchange results. In a common pattern, GPU 0 in every server talks mostly with GPU 0 in other servers, GPU 1 with GPU 1, and so on.

A **rail-optimized** network takes advantage of this. Each 8-GPU server has 8 network cards. Card 0 in every server connects to the "rail 0" leaf switch, card 1 to rail 1, and so on (Figure 7). Most training traffic then crosses one switch instead of three, which lowers latency and frees spine capacity. Nearly every large GPU cluster is now built this way.

## Connecting buildings

A large operator runs a **region**: several buildings or campuses within a few tens of kilometres, linked by **data center interconnect (DCI)**. This is fibre carrying many wavelengths of light (DWDM) at 400 Gb/s to 1.6 Tb/s each, with round-trip times well under a millisecond. Across continents, private backbones (Google's B4, Microsoft's WAN, Meta's Express Backbone) carry petabits per second.

AI is pushing these links harder. Google has described training Gemini models across multiple data centers, and Microsoft links its Fairwater AI sites over a dedicated high-speed network. When no single site can get enough power, splitting training across sites becomes necessary.

# Part VII — The AI factory

## Why AI data centers are different

A cloud data center serves many small, independent jobs. Each rack mostly works alone, failures are local, and the total power draw is smooth because thousands of unrelated jobs average out.

An AI training data center runs a few enormous jobs. Every GPU is part of one calculation, so a slow or failed GPU can hold up thousands of others. Five properties set these buildings apart:

1. **Rack density** of 60–150 kW today, heading to 600 kW and more (Figure 8).
2. **Liquid cooling everywhere** (see [Liquid cooling](#liquid-cooling)).
3. **Very large scale-up domains.** A whole rack, and soon several racks, behaves as one machine.
4. **Dedicated GPU networks**, rail-optimized and usually non-blocking.
5. **Synchronised power swings** (see [Power swings](#power-swings)).

[Figure: Figure 8 — Rack power density, 2016–2028, on a log scale. Cloud racks have roughly tripled; AI racks have grown about tenfold, past the practical limit of air cooling.]{#fig:density}

The building changes to match:

- Heavier floors and stronger slabs.
- More mechanical space per megawatt: CDUs, pumps and bigger pipes.
- Fewer, larger electrical feeds per row: busway rated 800–1,600 A or more.
- Warmer white space (25–30 °C), because liquid does most of the work.
- Room to grow: power and cooling designed for the next GPU generation, not just this one.

## GPU pods

The building block of an AI factory is the **pod** or **scalable unit**: a group of racks that are installed, cabled, tested and scheduled together. Figure 9 shows one.

[Figure: Figure 9 — A GPU pod row. Eight NVL72 racks (576 GPUs) with network racks in the middle, in-row CDUs at each end, dual overhead busway, liquid headers and fibre running to the spine row.]{#fig:pod}

A typical NVIDIA GB200 scalable unit has:

- **8 NVL72 racks = 576 GPUs**, about 1–1.1 MW of IT load.
- **Network racks** holding the rail leaf switches for the scale-out fabric.
- **Liquid distribution**: in-row CDUs or connections to a facility CDU gallery.
- **Dual busway** (A and B) above the row.

Clusters are built by repeating this unit: 16 units make about 9,000 GPUs, and 100 units make about 57,000. Job schedulers such as Slurm or Kubernetes place training jobs in whole units so traffic stays local.

Other vendors use similar ideas: Google's TPU v5p pods link 8,960 chips and its Ironwood (v7) pods 9,216 chips with optical circuit switches; Amazon's Trainium2 UltraServers link 64 chips; AMD's MI350-series racks link 8-GPU nodes over Ethernet.

## Power swings

The power draw of an AI training cluster is unusual.

A cloud building's power curve is smooth, because many independent jobs average out. A training cluster's curve is jagged and synchronised. All GPUs compute together at full power, then pause together while they exchange results over the network, then compute again. They repeat this cycle many times a second.

At 100,000 GPUs of about 1.2–1.4 kW each (including their share of CPU, memory and network), that is a load of well over 100 MW that can drop and recover by a large fraction in a fraction of a second. A job that crashes or finishes can drop it all at once. To the grid, this looks like a very large, very fast industrial load. Grid operators, including ERCOT in Texas and NERC, now study large AI loads specifically after several incidents in which groups of data centers dropped off the grid together during voltage dips.

Engineering responses include:

- **Batteries on the building bus** to absorb and supply the swings.
- **Software power smoothing.** GPU firmware and training frameworks keep power near a steady floor, for example by running filler work during network phases. NVIDIA added power-smoothing features for this purpose.
- **Grid-forming inverters** and fast reactive-power control at the substation.
- **Ride-through settings** agreed with the utility, so the campus does not disconnect during brief voltage dips.

## Training halls and inference halls

**Training halls** build new models. They run long, tightly coupled jobs and are optimised for maximum computation per watt and the largest possible coherent clusters. They can be far from users and are often in rural areas with cheap power.

**Inference halls** run trained models to answer user requests. They are optimised for cost per answer and fast response, so they sit closer to population centres and need cloud-style reliability. Their racks may be just as dense, since the same GPUs are used, but their networks look more like a normal cloud than a supercomputer.

The boundary is blurring. Inference now uses a growing share of AI compute, and many operators design halls that can switch between the two. The overall pattern is gigawatt training campuses where power is available, and smaller inference sites near users.

## Notable AI campuses

As publicly reported through mid-2026:

- **xAI Colossus, Memphis, Tennessee.** About 100,000 H100 GPUs installed in 122 days in 2024, expanded beyond 200,000. A second, larger site (Colossus 2) targets around a gigawatt, using on-site gas turbines and Tesla Megapack batteries.
- **OpenAI Stargate**, with Oracle and SoftBank. A multi-site US programme, the first in Abilene, Texas (built by Crusoe and operated with Oracle), and further sites announced in Texas, New Mexico, Ohio and the Midwest, plus partner projects abroad.
- **Meta Prometheus** (New Albany, Ohio, ~1 GW) and **Hyperion** (Richland Parish, Louisiana), planned to grow to several gigawatts.
- **Microsoft Fairwater** (Mount Pleasant, Wisconsin, and Atlanta). Two-storey halls with closed-loop liquid cooling, linked into one distributed AI system.
- **Amazon Project Rainier** (New Carlisle, Indiana). Hundreds of thousands of Trainium2 chips, built for Anthropic.
- **Google TPU campuses** in Iowa, Oklahoma, Ohio and elsewhere, built around TPU pods and optical circuit switching.
- **Neoclouds** such as CoreWeave, Nebius, Crusoe and Lambda, which build or lease GPU-specific facilities, often in secondary markets with available power.

Common features: hundreds of megawatts to several gigawatts of contracted power; on-site generation or dedicated substations; warm-water liquid cooling; rail-optimized networks at 400–800 Gb/s per GPU; and build schedules far faster than the industry managed before.

# Part VIII — Safety, security and operations

## Physical security

Large data centers are protected in layers, each harder to pass than the last:

- **Perimeter**: fences, crash-rated barriers and gates, cameras, and intrusion sensors such as radar or buried cable.
- **Site entry**: a staffed guardhouse, vehicle inspection and number-plate recognition.
- **Building**: no windows in halls, hardened walls, badge-controlled doors, and **mantraps** (two-door booths that let one person through at a time, often with biometric checks).
- **Inside**: separate access zones; data halls typically need a badge plus fingerprint or face recognition.
- **Customer cages** in colocation sites, with locked cabinets and their own cameras.
- **Security operations centre**: 24/7 monitoring and guards.

Insider risk is taken seriously: background checks, two-person rules for sensitive rooms, and strict control of anything that stores data leaving the building. Used drives are typically shredded on site.

## Fire detection and suppression

Fire in a data center is dangerous because of the high-value equipment, the electrical energy and the fast air movement.

### Detection
- **Aspirating smoke detection** (VESDA is a common brand) continuously samples air through small pipes and can detect an overheating component long before flames. Alarms escalate in stages: alert, action, fire 1, fire 2.
- **Spot smoke and heat detectors** as backup.
- **Linear heat detection** along cable trays.
- **Gas detection** in battery rooms.

### Suppression
- **Pre-action sprinklers.** The pipes stay dry until a detector alarms. Water is released only if a sprinkler head is also opened by heat, so two things must go wrong before water reaches the equipment.
- **Clean-agent gas** (inert gases or chemical agents) in small high-value rooms such as telecom rooms. Some agents are being phased out over environmental concerns.
- **Water mist** systems, which use less water than sprinklers.

**Compartments.** Fire walls divide the building, and every cable or pipe passing through them is sealed with fire-stopping.

**Battery rooms** get special treatment. Lithium-ion batteries can enter **thermal runaway**, a self-sustaining fire. Standards such as NFPA 855 and UL 9540A set the rules for spacing, ventilation, explosion control and testing.

## Operations

A data center is only as reliable as the people running it.

- **Network operations centre (NOC).** Watches the network and services 24/7.
- **Building management system (BMS).** Controls and monitors the cooling plant, electrical system and alarms.
- **Electrical power monitoring system (EPMS).** Records every breaker and meter at high speed, so faults can be traced afterwards.
- **DCIM software** (data center infrastructure management). Tracks every asset, its power, temperature and location, and plans capacity.
- **Maintenance management.** Generators are run under load monthly; batteries, breakers and cooling units are tested on fixed schedules.
- **Change control.** Every change follows a written method, peer review and a rollback plan. Most avoidable outages trace to skipped or unclear procedures.
- **Staffing.** A 100 MW site might have 30–80 staff across security, electrical, mechanical, IT and management, working in shifts around the clock.

## Commissioning

Before a data center goes live, it is tested in five levels:

1. **Level 1, factory testing.** Major equipment is tested at the manufacturer.
2. **Level 2, delivery inspection.** Equipment is checked on arrival for damage and conformity.
3. **Level 3, installation and start-up.** Each item is installed and started by its vendor.
4. **Level 4, system testing.** Each system (UPS, generators, cooling plant) is tested on its own under load.
5. **Level 5, integrated systems testing.** The whole facility is tested together under simulated full load using **load banks**, with real failures staged: pull the utility, fail a generator, fail a pump, trip a breaker. Only after Level 5 is the hall handed over for IT equipment.

For liquid-cooled halls, commissioning also includes flushing and filling the technology loop, checking water quality, and leak-testing every connection. An independent **commissioning agent** documents the results for the owner, insurers and tenants.

# Part IX — Money and the future

## Costs

Data center costs are usually quoted per megawatt of IT capacity. Approximate 2025–2026 US ranges for the building and its infrastructure:

| Facility type | Build cost per MW of IT |
|---|---|
| Enterprise, Tier III | $8–12 million |
| Hyperscale, air-cooled | $9–12 million |
| AI-ready, liquid-cooled | $11–15 million |
| Highly redundant AI or Tier IV | $15–25 million |

Table: Approximate construction cost per megawatt, excluding IT equipment.

The building is the smaller part of the bill for AI. **The IT equipment usually costs two to four times as much as the building.** An NVL72 rack sells for roughly $3–4 million, so 100 MW of them costs on the order of $2.5–3 billion, compared with about $1.1–1.5 billion for the facility.

Annual operating costs for a 100 MW site:

- **Electricity**: the largest cost. At $0.06/kWh and a PUE of 1.2, about $55–65 million a year.
- **Staff and maintenance**: about $10–20 million.
- **Property tax and insurance**: highly variable, $2–15 million.
- **Water and treatment**: $0.5–3 million.

**Revenue models.** Wholesale colocation is priced per kW per month (roughly $120–200 for large hyperscale leases in major US markets). Retail colocation is priced per cabinet. GPU clouds charge per GPU-hour, roughly $2–6 for current-generation GPUs depending on model and contract length.

## Regulation and communities

Data centers used to be welcomed as quiet taxpayers. They are now examined as heavy users of power, water and land.

- **Grid rules.** Utilities and regulators are creating special tariffs for very large loads, often requiring long contracts, minimum payments or customer-funded grid upgrades so other customers do not carry the cost. Texas, Ohio, Virginia and Georgia have all acted.
- **Pauses and limits.** Ireland's grid operator restricted new connections around Dublin; Amsterdam and Frankfurt have zoning limits.
- **Community agreements**: local hiring, road improvements and payments to schools and services.
- **Noise rules**, which affect generator testing schedules and cooling fan choices.
- **Water permits** with drought conditions attached.
- **Air permits** limiting generator hours.
- **Disclosure.** The EU's Energy Efficiency Directive requires large data centers to report energy, water and heat-reuse figures each year.

## Sustainability

The IEA estimates that data centers used about 415 TWh in 2024, roughly 1.5% of global electricity, and projects about 945 TWh by 2030, driven mostly by AI. Lawrence Berkeley National Laboratory estimated US data centers used 4.4% of US electricity in 2023, rising to between 6.7% and 12% by 2028.

The industry's responses:

- **Efficiency.** New builds at PUE 1.1–1.2, warm-water cooling, more efficient chips per unit of computation.
- **Clean-energy contracts.** Long-term power purchase agreements (PPAs) for wind, solar and storage.
- **24/7 carbon-free energy.** Google and Microsoft aim to match their use with clean energy every hour, not just on an annual total. That pushes demand for always-available sources such as nuclear, geothermal and long-duration storage.
- **Heat reuse** where a heat customer is nearby.
- **Water.** Closed-loop and dry cooling, recycled or non-drinking water for evaporative systems, and published WUE figures.
- **Embodied carbon.** Lower-carbon concrete and steel, and longer equipment lifetimes.

## What comes next

Five trends will shape the next five years:

1. **Bring-your-own power.** On-site gas plants and large batteries are already common at AI campuses. Nuclear restarts and uprates are coming online, and small modular reactors are planned for the 2030s. This separates AI growth from grid connection queues, at a cost in emissions, money or time.
2. **Megawatt racks and 800 V DC.** Rack power is heading toward 1 MW. Power will be converted outside the rack and distributed at 800 V DC to cut copper and losses.
3. **Light instead of copper.** Co-packaged optics put lasers next to switch chips, and optical interconnects will extend scale-up domains beyond one rack.
4. **Optical circuit switching.** Mirrors that redirect light, used by Google, may take over parts of the network from electronic switches.
5. **Flexible demand.** Data centers that can briefly slow down or shift work when the grid is stressed can connect sooner. Several utilities now offer faster connections in exchange for this flexibility.

The data center, a plain industrial building in a field, has become one of the most strategically important kinds of infrastructure in the world.

# Worked example: a 100 MW AI hall

This chapter puts the guide's numbers together for one hypothetical 100 MW (IT) training hall built with NVL72-class racks. Every figure is rounded and meant to show the scale, not to serve as a design.

### Compute
- 100 MW ÷ ~132 kW per rack ≈ **750 racks**
- 750 racks × 72 GPUs ≈ **54,000 GPUs**
- ≈ 94 scalable units of 8 racks

### Electricity
- PUE of 1.2 → **120 MW** at the meter
- At an average 85% load: 120 MW × 0.85 × 8,760 h ≈ **0.9 TWh a year**, about as much as 85,000 US homes
- At $0.06/kWh ≈ **$54 million a year**

### Cooling
- About 85 MW leaves in liquid. With a 10 K temperature rise: flow = 85,000 kW ÷ (4.19 kJ/kg·K × 10 K) ≈ **2,000 litres per second** (about 32,000 US gallons per minute), or roughly 2.7 L/s per rack
- About 15 MW leaves in air. With a 12 K air temperature rise: 15,000 kW ÷ (1.2 kg/m³ × 1.005 kJ/kg·K × 12 K) ≈ **1,000 m³/s** of air (about 2.2 million cubic feet per minute)
- With dry coolers, water use is close to zero except during adiabatic hours in heat waves

### Electrical plant
- **Batteries:** 5 minutes at 100 MW ≈ 8.3 MWh usable, per path
- **Generators:** about 120 MW ÷ 3 MW ≈ 40, plus spares → **45–50 units**, or none if the site relies on on-site gas generation instead
- **Unit-substation transformers:** about 40 × 3 MVA per path

### Space
- About 750 racks at 2.5–3.5 m² of white space each (including aisles and in-row CDUs) ≈ **2,000–2,600 m²** of white space
- Electrical and mechanical rooms usually need two to three times that again

### Money
- **Building and infrastructure:** about $1.1–1.5 billion
- **IT equipment:** about $2.5–3 billion for racks plus roughly 10–15% more for the network and storage
- **Total:** on the order of **$4–5 billion**, with power costs of about $50–60 million a year

### Weight
- 750 racks × ~1.4 t ≈ **1,050 tonnes** of IT equipment, about as much as 700 cars, plus several hundred tonnes of water in the pipes

# Glossary

2N
:   Two complete, independent systems, each able to carry the whole load.

Adiabatic cooling
:   Spraying water onto air or coils so evaporation lowers the temperature; used only on the hottest days in "adiabatic dry coolers".

All-reduce
:   A step in distributed training where every GPU combines its results with every other GPU's.

ATS
:   Automatic transfer switch: moves a load from one power source to another, for example from the utility to generators.

BESS
:   Battery energy storage system; container-sized batteries used for backup, smoothing and grid services.

BMS
:   Building management system: software that controls and monitors cooling, electrical and building equipment.

Busbar / busway
:   A rigid metal conductor; busway runs above rows with plug-in tap boxes, and a busbar runs up the back of a rack.

CDU
:   Coolant distribution unit: a heat exchanger with pumps and filters that separates facility water from rack water.

Checkpoint
:   A saved copy of a training job's progress, so it can restart after a failure.

Clos / leaf-spine
:   A network where every leaf switch connects to every spine switch, giving many equal paths.

Cold plate
:   A metal block with internal channels, fixed to a chip, through which coolant flows.

Colocation
:   A data center that rents space, power and cooling to customers who bring their own equipment.

Containment
:   Doors and panels that separate hot and cold air in a data hall.

Co-packaged optics
:   Optical engines mounted in the same package as a switch or network chip.

CRAC / CRAH
:   Computer room air conditioner (with its own compressor) / air handler (using chilled water).

CUE
:   Carbon usage effectiveness: kg of CO₂ per kWh of IT energy.

DCI
:   Data center interconnect: high-capacity fibre links between buildings or campuses.

DCIM
:   Data center infrastructure management software: asset, power, cooling and capacity tracking.

Dry cooler
:   A large radiator with fans that rejects heat to outside air without using water.

DWDM
:   Dense wavelength-division multiplexing: many colours of light on one fibre.

GPU
:   Graphics processing unit; the main chip used for AI training and inference.

Hot aisle / cold aisle
:   The layout where racks face each other in pairs so all intakes share one aisle and all exhausts share another.

Hyperscaler
:   A company running cloud infrastructure at very large scale (Amazon, Microsoft, Google, Meta, Oracle, Alibaba and others).

InfiniBand
:   A low-latency, lossless network used in supercomputers and AI clusters; generations include HDR (200 Gb/s), NDR (400 Gb/s) and XDR (800 Gb/s).

Inference
:   Running a trained AI model to answer requests.

IT load
:   The power used by the computing equipment itself, excluding cooling and other overhead.

Kilowatt (kW), megawatt (MW), gigawatt (GW)
:   Units of power: 1 MW = 1,000 kW; 1 GW = 1,000 MW.

Mantrap
:   A small two-door security booth that admits one person at a time.

MV / LV
:   Medium voltage (roughly 1–35 kV) / low voltage (under 1 kV).

N+1
:   The number of units needed plus one spare.

Neocloud
:   A cloud provider specialising in GPU computing (CoreWeave, Nebius, Crusoe, Lambda and others).

NVLink
:   NVIDIA's high-speed GPU-to-GPU link; an NVL72 rack joins 72 GPUs in one NVLink domain.

OCP
:   Open Compute Project: an industry group publishing open hardware designs, started by Facebook (now Meta).

Optical circuit switch
:   A switch that redirects light with tiny mirrors instead of processing packets electronically.

PDU
:   Power distribution unit: equipment that distributes power to rows or racks.

PPA
:   Power purchase agreement: a long-term contract to buy electricity, often from a new wind or solar farm.

Pre-action sprinkler
:   A sprinkler system whose pipes stay dry until a detector alarms.

PUE
:   Power usage effectiveness: total facility energy divided by IT energy.

Rail-optimized
:   A GPU network design where same-numbered GPUs in every server share a leaf switch.

RoCE
:   RDMA over Converged Ethernet: lets servers read each other's memory directly across Ethernet.

Scalable unit (pod)
:   A standard group of racks installed and operated together, for example 8 NVL72 racks.

Scale-up / scale-out
:   Making one machine bigger (more GPUs in one NVLink domain) / connecting more machines over a network.

SMR
:   Small modular reactor: a factory-built nuclear reactor of up to about 300 MW.

Tier I–IV
:   Uptime Institute's classification of data center redundancy.

ToR / leaf
:   Top-of-rack or leaf switch: the first switch a server connects to.

UPS
:   Uninterruptible power supply: batteries and electronics that carry the load through power disturbances.

VESDA
:   A brand of aspirating smoke detection, often used as a generic name.

VRM
:   Voltage regulator module: converts board power to the chip's operating voltage, right next to the chip.

White space / grey space
:   Rooms holding IT equipment / rooms holding the electrical and mechanical equipment that supports it.

WUE
:   Water usage effectiveness: litres of water consumed per kWh of IT energy.

# Further reading

- Uptime Institute, *Tier Classification System* and the annual *Global Data Center Survey* — uptimeinstitute.com
- ASHRAE TC 9.9, *Thermal Guidelines for Data Processing Environments* — ashrae.org
- Open Compute Project, Open Rack and advanced cooling specifications — opencompute.org
- NVIDIA, *GB200 NVL72* product pages and *DGX SuperPOD* reference architectures — nvidia.com
- International Energy Agency, *Energy and AI* (2025) — iea.org
- Lawrence Berkeley National Laboratory, *2024 United States Data Center Energy Usage Report* — eta.lbl.gov
- Google, papers on Jupiter networking, TPU pods and optical circuit switching — research.google
- Meta Engineering blog, posts on AI cluster networks and data center design — engineering.fb.com
- Microsoft, Fairwater AI datacenter announcements — blogs.microsoft.com
- NFPA 75 (IT equipment protection) and NFPA 855 (energy storage systems)

*Figures: 3-D renderings and schematics created for this guide from generic, publicly documented design patterns. They are illustrative and do not depict any specific operator's facility.*


---

# PART B · PODCAST TRANSCRIPT (Inside the AI Factory)

# Inside the AI Factory — transcript

## Cold open  (0:00)

**Maya:** Picture a building about the size of three football fields. No windows. A low hum. Outside, a row of generators the size of shipping containers, and a fence with a guard who checks every car. Inside, it uses as much electricity as a small city, and almost every bit of that electricity comes back out as heat.

**Sam:** And the strange part is that the whole building, the concrete, the pipes, the switchgear, the cooling towers, exists to serve something you could hold in two hands. A chip. Thousands and thousands of them.

**Maya:** Welcome to Inside the AI Factory. I'm Maya.

**Sam:** And I'm Sam. This episode walks through the Data Center Design guide, start to finish. If you've got the guide open, we follow its parts in order. If you don't, that's fine too. We'll explain every term as we go.

**Maya:** Sam, give me the one-sentence version first. What is a data center?

**Sam:** A data center is a building whose only job is to keep computer chips powered, cool, connected, and safe. That's it. Every design decision is a trade-off between four things: how much useful computing you get, what it costs, how much energy it uses, and how often it fails.

**Maya:** And why is everybody suddenly talking about them?

**Sam:** Because AI changed the numbers. A normal cloud server rack, a cabinet about the size of a wardrobe, draws maybe ten to twenty kilowatts. The racks being built for AI today draw about a hundred and thirty kilowatts. Same footprint, roughly ten times the power. And the industry has already announced racks five times bigger than that.

**Maya:** So it's not just more of the same.

**Sam:** No. It's a different kind of building. That's the thread we'll pull on the whole way through.

## Part one: foundations  (1:50)

**Maya:** Let's start with the pieces. When you walk into one of these sites, what are you actually looking at?

**Sam:** The guide splits it into four kinds of space. White space is the room with the computers, the rows of racks. Grey space is everything that keeps the white space alive: electrical rooms, cooling plant, telecom rooms. People are always surprised that the grey space is often as big as the white space.

**Maya:** Then support space.

**Sam:** Offices, the security desk, loading docks, workshops. And the yard, which is all the big outdoor equipment: generators, transformers, cooling units, water tanks, batteries, sometimes solar panels.

**Maya:** The guide says three requirements drive almost everything.

**Sam:** Right. One, electricity has to arrive reliably, every hour of the year. Two, heat has to leave as fast as it's made. And three, data has to get in and out, at enormous speed, over at least two separate fibre routes. If you understand those three, you can predict most of the design.

**Maya:** There's a nice line about the heat. A hundred megawatt data center gives off as much heat as about fifty thousand electric space heaters running flat out.

**Sam:** Which is why I like to say a data center is really a heat-removal machine that happens to do some computing.

**Maya:** How did we get here? The guide describes five generations.

**Sam:** Quickly. First, mainframe rooms in the nineteen sixties to eighties. One big computer, a raised floor, air conditioners. Then the nineteen nineties, rooms full of small servers, and the birth of colocation, where you rent space and power for your own equipment. Then the enterprise era in the two thousands, banks and big companies running their own multi-megawatt sites. Then hyperscale: Google, Amazon, Microsoft, Meta, building campuses of hundreds of megawatts with their own custom hardware.

**Maya:** And generation five is the AI factory.

**Sam:** Buildings designed around one job, training and running large AI models. Liquid cooling is required, tens of thousands of chips act like one computer, and the power draw can swing by tens of megawatts in under a second. The guide calls the jump from generation four to five a change in kind, not just in size. Power, cooling, and networking are all being redesigned at the same time.

## Part two: choosing a site and shaping the building  (4:19)

**Maya:** If I wanted to build one of these, where would I put it?

**Sam:** Ten years ago the answer was: near lots of fibre, near your users, and somewhere land and power are cheap. Today, for AI, the first question is simply, how soon can I get power? Not cheap power. Any power. Hundreds of megawatts of it.

**Maya:** Because the grid can't keep up.

**Sam:** In several markets the wait for a big grid connection is years. That includes building new transmission lines and getting huge transformers manufactured, and those have long lead times of their own. So time to power is number one. Number two is water, if your cooling design uses it. Number three is whether the local community and county will say yes.

**Maya:** The guide has a great list of deal-breakers.

**Sam:** My favourite. The utility says, we can give you thirty megawatts now, or three hundred megawatts in six years. Or the county says, not here. Or the water company says, we can't promise your volumes in a drought year. Any one of those kills the site.

**Maya:** And then the building itself.

**Sam:** The common form is a long rectangle, a hundred and fifty to two hundred metres long, fifty to eighty wide, one or two storeys. Generators down one long side, transformers down the other. On a big campus you repeat that hall three to eight times around a shared substation and a central utility plant. Figure one in the guide shows exactly that from the air.

**Maya:** What about the floors? I think people imagine the old raised floor with the perforated tiles.

**Sam:** New AI halls mostly use a plain concrete slab with everything running overhead. Partly because the racks are so heavy. A loaded AI rack weighs about one point four tonnes on a footprint smaller than a single bed.

**Maya:** And how fast can you build one?

**Sam:** Typical is fifteen to twenty-four months to first power. The record that everyone quotes is xAI's first Colossus cluster in Memphis, about a hundred thousand GPUs in a hundred and twenty-two days. They reused an existing factory building and brought in temporary gas turbines. But the usual lesson holds: construction is rarely what sets the date. The grid connection is.

## Part three: the power chain  (6:39)

**Maya:** Let's follow the electricity. Where does it start?

**Sam:** At transmission voltage. Usually somewhere between a hundred and fifteen and three hundred and forty-five thousand volts. It comes into an on-site substation, a gravel yard full of steel frames and big transformers, and gets stepped down to medium voltage, thirty-four and a half thousand volts in North America.

**Maya:** Then it's distributed around the campus.

**Sam:** Through medium-voltage switchgear, basically very large circuit breakers. Each building has its own transformers that step it down again, to four hundred and eighty volts in the U.S. From there it goes through the UPS, the uninterruptible power supply, which is batteries and power electronics. Then out to the rows on overhead busway. Think of busway as a metal power rail above each row, with a plug-in tap for every rack.

**Maya:** And inside the rack?

**Sam:** In AI racks, power shelves convert it to about fifty volts direct current, onto a copper bar running up the back of the rack. And finally, right next to each chip, voltage regulators take it down to under one volt, at hundreds or even more than a thousand amps per chip.

**Maya:** So from three hundred thousand volts to under one.

**Sam:** And you lose a little at every stage. Add it all up and roughly ten to fifteen percent of the electricity becomes heat before it ever reaches a transistor. That's why the industry keeps pushing voltages higher inside the rack. NVIDIA has announced an eight hundred volt D-C design for its next very large racks, to cut copper and losses.

**Maya:** Now redundancy. The guide talks about N, N plus one, and two N.

**Sam:** N means exactly enough equipment to carry the load. N plus one means one spare, so nine generators where you need eight. Two N means two completely separate systems, each able to carry everything by itself. The guide calls them path A and path B, and they never share a component until they meet inside the rack, which has two power cords.

**Maya:** And the Uptime tiers.

**Sam:** Tier one, one path, no spare. Tier two adds spare components. Tier three is the big one: you can service any piece of equipment without shutting down. Tier four survives any single failure, automatically. Most enterprise and cloud facilities are built to Tier three.

**Maya:** There's a twist for AI training, though.

**Sam:** There is. A training job saves its progress regularly. That's called a checkpoint. If a training hall loses power, you lose some hours of work, but no customer data. So some operators build training halls with less redundancy and spend the savings on more GPUs. Inference halls, the ones answering your questions in real time, keep full cloud-style redundancy.

**Maya:** And when the utility fails?

**Sam:** Batteries take the load instantly. Within about ten seconds the generators are running, and an automatic transfer switch moves the building onto them. The standard generator is diesel, two to three and a half megawatts each, and a big campus can have more than a hundred.

**Maya:** But diesel has problems.

**Sam:** Air permits limit how many hours a year you can run them. Fuel adds up fast: running a three hundred megawatt campus for three days takes millions of litres. And neighbours hear the monthly tests. So you see more natural gas engines and turbines, large battery systems, fuel cells, and contracts with nuclear plants. Microsoft signed to restart the former Three Mile Island unit one. Amazon contracted with the Susquehanna plant. Google and Amazon are backing small modular reactor companies for the twenty-thirties.

## Part four: cooling  (10:34)

**Maya:** The guide calls cooling the hardest problem. Why?

**Sam:** Because of density. A hundred megawatts of heat spread across a city is nothing. A hundred and thirty kilowatts packed into one rack is about sixty or seventy space heaters crammed into a wardrobe. You have to get that heat out continuously, in any weather, while holding the chips within a few degrees.

**Maya:** Start with air.

**Sam:** The early mistake was just filling the room with cold air. Hot air from the back of one rack got sucked into the front of the next. The fix is the hot aisle, cold aisle layout. Racks face each other in pairs, so the fronts all breathe from a shared cold aisle and the backs all blow into a shared hot aisle. Then you put doors and a roof around one of those aisles. That's containment.

**Maya:** Figure four in the guide shows that, with a person standing in the cold aisle for scale.

**Sam:** And above about thirty to forty-five kilowatts per rack, air simply stops working well. The fans get too loud, too fast, and too power-hungry. Water carries about thirty-five hundred times more heat than the same volume of air. So AI went to liquid.

**Maya:** Direct to chip.

**Sam:** Right. A metal block called a cold plate sits on top of each GPU and CPU. Water flows through tiny channels inside it and carries the heat away. About eighty to eighty-five percent of the rack's heat leaves in the water. The rest, from memory and network cards and power supplies, still goes into room air. Figure five shows a rack with one tray pulled out so you can see the copper cold plates.

**Maya:** Here's the part that surprised me. The water is warm.

**Sam:** It's the clever bit. The cold plates accept water at twenty-five to forty-five degrees Celsius. Water that warm can be cooled by outside air most of the year, with no refrigeration compressor running. So these incredibly dense halls can actually be more efficient than older air-cooled ones.

**Maya:** Walk me through the loops.

**Sam:** There are usually two water loops. The facility loop carries heat from the building to the outside, through dry coolers, which are basically huge radiators with fans, or cooling towers, which evaporate water. The technology loop carries very clean water through the racks. Between them sits the C-D-U, the coolant distribution unit. It's a heat exchanger with pumps and filters. It keeps the two waters separate, so a leak or contamination in one can't drain or foul the other.

**Maya:** And how do we measure efficiency?

**Sam:** The famous one is P-U-E, power usage effectiveness. Total facility energy divided by the energy the computers use. One point zero would mean zero overhead. The best new sites are around one point one to one point two. Then there's W-U-E for water, litres per kilowatt-hour, and C-U-E for carbon.

**Maya:** And the next frontier is reusing the heat.

**Sam:** Water coming back from cold plates at forty-something degrees can feed district heating with a heat pump. Meta does it in Odense, Denmark. Microsoft works with Fortum in Finland. The catch is you need someone nearby who wants the heat, and most giant AI campuses are in the middle of nowhere.

## Part five: the white space  (13:57)

**Maya:** Let's go inside the hall itself.

**Sam:** Cold aisles are about one point two metres wide, room for a person and a server lift. Rows run fifteen to thirty metres. The ceiling is high, six to ten metres, because everything runs overhead: busway, cable trays, pipes, and the hot air returning to the cooling units.

**Maya:** And the rack.

**Sam:** The nineteen-inch rack, standardised back in the nineteen sixties, is still the basic unit. Height is measured in U, one and three-quarter inches each, and a rack is usually forty-two to fifty-two U tall. Hyperscalers often use the Open Compute Project's Open Rack, which is a bit wider and has a shared power bar at the back.

**Maya:** Tell me about the NVL seventy-two, since it shows up everywhere in the guide.

**Sam:** It's NVIDIA's rack-scale AI system. Eighteen compute trays holding seventy-two Blackwell GPUs and thirty-six Grace CPUs, plus nine NVLink switch trays. About five thousand copper cables at the back join all seventy-two GPUs so they behave like one giant GPU. Roughly a hundred and twenty to a hundred and thirty kilowatts. About one point four tonnes.

**Maya:** And then fibre.

**Sam:** A data center is a fibre plant as much as a power plant. A single AI training cluster can need hundreds of thousands of optical links. The little modules that turn electrical signals into light, transceivers, are now a big chunk of network cost and power. An eight hundred gigabit transceiver uses around fifteen watts, and you need a lot of them. That's why co-packaged optics, putting the lasers right next to the switch chip, is such a big deal.

## Part six: the network  (15:46)

**Maya:** Networking always loses people. Make it easy.

**Sam:** Old data center networks were shaped like a tree. Traffic went up toward the core and back down. That's fine when most traffic goes in and out of the building. But modern workloads mostly talk server to server, and a tree chokes on that.

**Maya:** So, leaf-spine.

**Sam:** Leaf switches connect to the servers. Spine switches connect to every leaf. So any two servers are at most three switch hops apart, leaf, spine, leaf, and there are many equal paths between them. It's an old idea from telephone exchanges, called a Clos network.

**Maya:** Then there are three kinds of network in an AI factory.

**Sam:** NVLink is scale-up. It makes the GPUs inside one rack act as one large GPU, at about one point eight terabytes per second per GPU. InfiniBand and Ethernet are scale-out. They connect racks into a cluster. InfiniBand came from supercomputers and is very consistent. Ethernet is everywhere, has many suppliers, and with newer congestion control it now runs some of the largest clusters, including Meta's and xAI's.

**Maya:** And rail-optimized. I love this one.

**Sam:** It's elegant. During training, GPU number zero in every server mostly talks to GPU zero in the other servers. GPU one to GPU one, and so on. So you plug network card zero of every server into the "rail zero" switch, card one into rail one, and so on. Most training traffic then crosses one switch instead of three. Figure seven shows it with two rails highlighted.

**Maya:** And between buildings?

**Sam:** Fibre carrying many colours of light, each at four hundred gigabits to one point six terabits per second. And AI is pushing this harder because when no single site can get enough power, you start training across several sites. Google has described doing that for Gemini.

## Part seven: the AI factory  (17:50)

**Maya:** This is the heart of it. Why is an AI data center really different?

**Sam:** A cloud data center runs thousands of small, independent jobs. If one server fails, one customer notices. The power draw is smooth because all those jobs average out. An AI training data center runs a few enormous jobs. Every GPU is part of one calculation. A slow GPU can hold up thousands of others.

**Maya:** The guide lists five differences.

**Sam:** Rack density, sixty to a hundred and fifty kilowatts and heading to six hundred or more. Liquid cooling everywhere. Very large scale-up domains, where a whole rack behaves as one machine. Dedicated GPU networks. And synchronised power swings. Figure eight is the chart: cloud racks roughly tripled in eight years, AI racks went up about tenfold, straight through the practical limit of air cooling.

**Maya:** Explain the pod.

**Sam:** The building block is a scalable unit. For NVIDIA's GB two hundred systems, eight NVL seventy-two racks, which is five hundred and seventy-six GPUs and about a megawatt of computing load, plus network racks and cooling. You build a cluster by repeating that unit. Sixteen of them is about nine thousand GPUs. A hundred is about fifty-seven thousand. Figure nine shows one row.

**Maya:** Now the power swings. This is the part that sounds like science fiction.

**Sam:** All the GPUs compute together at full power, then they all pause together to exchange results over the network, then compute again, many times a second. At a hundred thousand GPUs, that's a load of well over a hundred megawatts that can drop and recover by a large fraction in a fraction of a second. If the job crashes, it can drop all at once.

**Maya:** And the grid notices.

**Sam:** Grid operators now study large AI loads specifically, after incidents where groups of data centers dropped off the grid together during voltage dips. The fixes are batteries on the building's power bus to absorb the swings, software that keeps GPU power near a steady floor, faster controls at the substation, and agreed settings so the campus rides through short dips instead of disconnecting.

**Maya:** Training versus inference.

**Sam:** Training builds the model. Long, tightly coupled jobs, wherever power is cheap and available. Inference runs the model to answer requests, so it wants to be closer to people and needs cloud-style reliability. The trend is gigawatt training campuses where the power is, and smaller inference sites near users, though the line is blurring.

**Maya:** Name some of the real places.

**Sam:** xAI's Colossus in Memphis. OpenAI's Stargate programme with Oracle and SoftBank, starting in Abilene, Texas. Meta's Prometheus in Ohio and Hyperion in Louisiana. Microsoft's Fairwater sites in Wisconsin and Atlanta, with two-storey halls. Amazon's Project Rainier in Indiana, built for Anthropic. And Google's TPU campuses. Hundreds of megawatts to several gigawatts each.

## Part eight: safety, security, and operations  (21:10)

**Maya:** How do you protect a place like this?

**Sam:** In layers. A fence and crash-rated gates. A staffed guardhouse. A building with no windows in the halls. Then mantraps, little two-door booths that let one person through at a time, usually with a fingerprint or face scan. Data halls often need a badge plus biometrics. And used drives are typically shredded on site.

**Maya:** Fire seems terrifying in a building full of electricity.

**Sam:** Detection starts very early. Aspirating smoke detectors constantly sniff the air through small pipes and can catch an overheating part long before there's a flame. Suppression is usually pre-action sprinklers. The pipes are dry until a detector alarms, and water only comes out if a sprinkler head is also opened by heat. Two things have to go wrong before any water reaches the equipment.

**Maya:** And lithium batteries?

**Sam:** They get special rooms and special rules, because they can go into thermal runaway, a fire that feeds itself.

**Maya:** Who runs it day to day?

**Sam:** Thirty to eighty people for a hundred megawatt site, around the clock. And a lot of software: a building management system for cooling and electrical, power monitoring that records every breaker, asset tracking. But the culture matters most. Every change follows a written procedure with a rollback plan, because people cause a large share of serious outages.

**Maya:** And before it opens, commissioning.

**Sam:** Five levels of testing, ending with level five, the integrated test. They load the whole building with fake electrical load, called load banks, and then deliberately break things. Pull the utility. Fail a generator. Fail a pump. Only when the building survives all of that does the first real server go in.

## Part nine: money, and a hundred megawatt example  (23:04)

**Maya:** Let's talk money.

**Sam:** The building and its infrastructure run about eleven to fifteen million dollars per megawatt for an AI-ready, liquid-cooled facility. But here's what surprises people: the IT equipment costs two to four times as much as the building. One NVL seventy-two rack sells for roughly three to four million dollars.

**Maya:** The guide ends with a worked example. A hundred megawatt AI hall. Walk us through it.

**Sam:** A hundred megawatts divided by about a hundred and thirty-two kilowatts per rack is about seven hundred and fifty racks. Times seventy-two GPUs, that's about fifty-four thousand GPUs.

**Maya:** Electricity?

**Sam:** With a P-U-E of one point two, a hundred and twenty megawatts at the meter. At typical load, about zero point nine terawatt-hours a year, roughly what eighty-five thousand American homes use. At six cents a kilowatt-hour, about fifty-four million dollars a year.

**Maya:** And cooling.

**Sam:** About eighty-five megawatts leaves in water. With a ten degree temperature rise, that's about two thousand litres of water flowing every second. The other fifteen megawatts leaves in air: about a thousand cubic metres of air per second.

**Maya:** And the total bill?

**Sam:** Building, about one point one to one point five billion dollars. Equipment, two and a half to three billion plus networking. On the order of four to five billion dollars all in. And the racks alone weigh about a thousand tonnes.

**Maya:** What about the bigger picture, energy and communities?

**Sam:** The International Energy Agency estimates data centers used about one and a half percent of the world's electricity in twenty twenty-four, heading toward roughly double by twenty thirty. In the U.S., Lawrence Berkeley National Lab estimated four point four percent in twenty twenty-three, rising to somewhere between seven and twelve percent by twenty twenty-eight. So utilities are writing special rules for very large loads, and communities are asking hard questions about power bills, water, and noise.

**Maya:** And the future?

**Sam:** Five things. Bring-your-own power: on-site gas, big batteries, nuclear. Megawatt racks with eight hundred volt D-C power. Light replacing copper, through co-packaged optics. Optical circuit switches, mirrors that redirect light, taking over parts of the network. And flexible demand: data centers that can briefly slow down when the grid is stressed get connected sooner.

## Wrap-up: the five things to remember  (25:43)

**Maya:** Let's land it. If someone remembers only five things from this episode, what should they be?

**Sam:** One. Power is the bottleneck, not land or money. Two. AI racks draw about ten times more than cloud racks, so they're cooled by warm water on the chip. Three. The best new buildings waste only ten to twenty percent of their energy on overhead, and the next gain is reusing the heat. Four. An AI cluster behaves like one machine, which means special networks and big synchronised power swings. Five. Energy supply itself is the next frontier.

**Maya:** That's a great list. If you want to go deeper, the guide has the 3-D models you can rotate, a full glossary, and the worked example with every number.

**Sam:** And if you're the kind of person who learns by being quizzed, load the guide into a local model and ask it to test you. That's what the study pack is for.

**Maya:** Thanks for listening to Inside the AI Factory.

**Sam:** See you on the next one.
