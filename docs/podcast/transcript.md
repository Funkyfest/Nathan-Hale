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
