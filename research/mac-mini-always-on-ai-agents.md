# Mac Mini Research for Always-On AI Agent Workloads

## Context

You're an AI enthusiast (level 5.5-6) who has built and launched VibeCoding, does agentic work with Claude Code, built an open brain with Nate B Jones, and is moving toward multi-agent orchestration and Claude remote agents. You currently use a PC + iPhone. You need an always-on machine to run AI agents 24/7. This research covers Mac Mini options, alternatives, pricing, pros/cons, and a final recommendation.

---

## 1. Current Mac Mini Lineup (October 2024 Redesign)

### M4 Mac Mini - Base ($599)
| Spec | Details |
|------|---------|
| CPU | 10-core M4 (4 perf + 6 efficiency) |
| GPU | 10-core integrated |
| RAM | 16GB unified memory (up to 32GB BTO) |
| Storage | 256GB SSD (up to 8TB BTO) |
| Ports | 3x Thunderbolt 4, Gigabit Ethernet, USB-C |
| Size | 5" x 5" x 2" / 1.5 lbs |
| Idle Power | 2.6-4W |
| Max Power | 65W |

**Pricing tiers:**
- 16GB / 256GB SSD: **$599**
- 16GB / 512GB SSD: **$799**
- 24GB / 512GB SSD: **$999**

### M4 Pro Mac Mini ($1,399+)
| Spec | Details |
|------|---------|
| CPU | 12-core M4 Pro (8 perf + 4 efficiency) |
| GPU | 16-core integrated |
| RAM | 24GB unified (up to 64GB BTO) |
| Storage | 512GB SSD (up to 8TB BTO) |
| Ports | 3x Thunderbolt 5 (120Gb/s), Gigabit Ethernet |

> Note: M4 Max is NOT available for Mac Mini (Mac Studio only).

---

## 2. Comparison Chart: All Options

### Hardware Options

| Option | Price | CPU | RAM | Always-On Power Cost/yr | Best For |
|--------|-------|-----|-----|------------------------|----------|
| **M4 Mac Mini (base)** | $599 | 10-core M4 | 16GB | ~$26-40 | Best overall value |
| **M4 Mac Mini (mid)** | $799 | 10-core M4 | 16GB + 512GB | ~$26-40 | More storage |
| **M4 Mac Mini (24GB)** | $999 | 10-core M4 | 24GB | ~$26-40 | Multi-agent work |
| **M4 Pro Mac Mini** | $1,399 | 12-core M4 Pro | 24GB | ~$40-50 | Heavy orchestration |
| **Refurb M2 Mac Mini** | ~$319 | 8-core M2 | 8GB | ~$20-30 | Budget entry |
| **Refurb M1 Mac Mini** | ~$450-500 | 8-core M1 | 8-16GB | ~$20-30 | Budget + decent perf |
| **Beelink Mini S13** | $189-250 | Intel N150 | 16GB | ~$40 | Ultra-budget |
| **Minisforum EM780** | $619 | Ryzen 7 7840U | 16-32GB | ~$50-60 | AMD alternative |
| **ASUS ROG NUC** | $2,349 | Core Ultra 9 | 16GB+ | ~$80-100 | Overkill / gaming |

### Cloud VPS Options (Monthly Recurring)

| Option | Monthly Cost | Annual Cost | vCPU | RAM | Notes |
|--------|-------------|-------------|------|-----|-------|
| **Hetzner Cloud** | $4-9/mo | $48-108/yr | 2-4 | 4-8GB | Most affordable, Linux only |
| **DigitalOcean** | $6-24/mo | $72-288/yr | 1-4 | 1-8GB | Developer-friendly |
| **Vultr** | $6-24/mo | $72-288/yr | 1-4 | 1-8GB | High-freq CPU options |
| **AWS EC2 Mac** | $468+/mo | $5,616+/yr | 8 | 16GB | macOS in cloud, very expensive |

---

## 3. Always-On Capabilities Assessment

### Mac Mini Always-On Setup
- **Disable sleep entirely** (System Settings > Energy Saver) - the recommended approach
- Idle power is only 2.6-4W, so running 24/7 costs ~$2-3.50/month in electricity
- Wake-on-LAN is **NOT supported** on Apple Silicon (removed since M1)
- Workaround: just never let it sleep - trivial electricity cost makes this practical
- Remote access via SSH, Screen Sharing, or Tailscale

### Claude Code Remote Agent Requirements
- **Minimal hardware**: 2GB RAM minimum, any modern CPU
- **Claude Code does NOT run AI models locally** - it calls the Anthropic API
- The Mac Mini is a **command center**, not a compute engine - actual AI runs in the cloud
- This means even a base M4 Mac Mini is MORE than sufficient
- Key need: reliable internet + always-on terminal session (tmux/screen)

### Multi-Agent Orchestration Resource Needs
- Each Claude Code teammate = separate process with its own context window
- 3-teammate team uses **3-4x tokens** vs single agent (cost multiplier, not hardware)
- Requires **tmux** or **iTerm2** for split-pane monitoring
- RAM recommendation: 16GB handles 3-5 concurrent agents comfortably
- 24GB+ recommended for 5+ concurrent agents

---

## 4. Pros & Cons Analysis

### Mac Mini - PROS
| Pro | Why It Matters |
|-----|---------------|
| Exceptional power efficiency | 2.6-4W idle = ~$3/month to run 24/7 |
| One-time cost vs recurring | $599 once vs $50-470+/month for cloud |
| Native macOS | Full Claude Code Desktop app + CLI support |
| Apple Silicon performance | M4 chip handles multi-agent orchestration easily |
| Tiny form factor | 5"x5"x2" - fits anywhere, silent operation |
| Ecosystem synergy | You already use iPhone - AirDrop, Handoff, Universal Clipboard |
| Reliability | Solid-state design, no moving parts, runs for years |
| Physical ownership | Your data stays local, no cloud dependency |

### Mac Mini - CONS
| Con | Why It Matters |
|-----|---------------|
| No Wake-on-LAN | Must stay powered on (mitigated by low power draw) |
| No GPU expansion | Can't add NVIDIA GPU for local ML training |
| RAM not upgradeable | Must choose right config at purchase |
| Headless limitations | Claude Code Remote Control needs active terminal session (use tmux) |
| Single point of failure | No cloud redundancy - power outage = downtime |
| macOS updates | Auto-updates can restart the machine unexpectedly |
| No monitor included | Need a display for initial setup (can go headless after) |

### Cloud VPS - PROS
| Pro | Why It Matters |
|-----|---------------|
| Geographic redundancy | Runs even if your home loses power/internet |
| No hardware maintenance | Provider handles everything |
| Scalable | Add more resources on demand |
| Linux-native | Better for headless Claude Code operation |

### Cloud VPS - CONS
| Con | Why It Matters |
|-----|---------------|
| Recurring cost | $50-470+/month adds up fast |
| No macOS (except AWS) | AWS Mac instances are $468+/month |
| Latency | Remote terminal has slight lag |
| Data on someone else's server | Privacy/control tradeoff |

---

## 5. Cost Comparison Over Time

| Option | Year 1 | Year 2 | Year 3 | 5-Year Total |
|--------|--------|--------|--------|-------------|
| **M4 Mac Mini ($599)** | $639 | $40 | $40 | **$759** |
| **M4 Mac Mini ($999, 24GB)** | $1,039 | $40 | $40 | **$1,159** |
| **Refurb M2 ($319)** | $349 | $30 | $30 | **$469** |
| **Hetzner Cloud ($9/mo)** | $108 | $108 | $108 | **$540** |
| **DigitalOcean ($24/mo)** | $288 | $288 | $288 | **$1,440** |
| **AWS EC2 Mac ($468/mo)** | $5,616 | $5,616 | $5,616 | **$28,080** |

> Mac Mini wins decisively in total cost of ownership after year 1.

---

## 6. Hybrid Strategy (Best of Both Worlds)

You don't have to choose one or the other. The optimal setup:

1. **Mac Mini at home** ($599-999) - your always-on command center
   - Run Claude Code agent teams via tmux
   - SSH in from your iPhone or PC
   - Use Claude Code Remote Control from any device
2. **Claude Code `--remote` flag** (included in your Anthropic subscription)
   - Offload heavy autonomous tasks to Anthropic's cloud infrastructure
   - No extra hardware needed - runs on Anthropic's servers
   - Perfect for fire-and-forget tasks
3. **Optional: Hetzner VPS ($4-9/mo)** as a backup/redundancy node
   - Linux server for when you need geographic redundancy
   - Run lightweight monitoring agents

---

## 7. Final Recommendation

### Buy the M4 Mac Mini with 24GB RAM / 512GB SSD ($999)

Since your budget is flexible, you're unsure on agent count, and you might want local AI models later - the 24GB config is the sweet spot that future-proofs you without overspending.

**Why this specific configuration:**

| Factor | Reasoning |
|--------|-----------|
| **Why Mac Mini over cloud** | One-time $999 vs $108-5,616/year recurring. Pays for itself in months. |
| **Why M4 over M4 Pro** | Claude Code calls the API - you don't need 12 cores. M4 is more than enough. Save $400. |
| **Why 24GB over 16GB** | RAM is NOT upgradeable. 24GB gives headroom for 5+ concurrent agents, local AI models (Ollama), browser, and other tools. Critical for future-proofing since you're "not sure yet" on scale. |
| **Why 512GB over 256GB** | Multiple repos, Docker containers, local model weights (7B models = 4-8GB each), logs. 256GB fills up fast. |
| **Why Mac over Linux mini PC** | iPhone ecosystem synergy, Claude Code Desktop app, macOS reliability, superior power efficiency. |
| **Why not M4 Pro ($1,399)** | The $400 premium gets you 2 more CPU cores and Thunderbolt 5. Not worth it unless you're running 10+ agents or doing heavy local inference. You can always upgrade later if needed. |
| **Why not refurbished M2** | Only 8GB RAM severely limits multi-agent work and makes local AI models impossible. The $680 premium for M4 24GB is worth the 3x RAM and newer chip. |

### Setup Checklist After Purchase:
1. Disable sleep (System Settings > Energy Saver > Never)
2. Enable SSH (System Settings > General > Sharing > Remote Login)
3. Install tmux (`brew install tmux`)
4. Install Claude Code CLI
5. Set up Tailscale for secure remote access from iPhone/PC
6. Configure tmux sessions for agent teams
7. Disable automatic macOS updates (set to manual to prevent surprise restarts)
8. Set up a UPS (uninterruptible power supply, $50-80) for power outage protection

### Budget Alternatives:
- **Tight budget**: Refurbished M2 Mac Mini ($319) - works fine for 1-2 agents
- **Ultra-tight budget**: Hetzner Cloud VPS ($9/mo) - Linux only, no macOS

---

---

## 8. YOUR THINKPAD T14s Gen 6 - What You Already Own

**UPDATE: Your existing hardware changes the entire equation.**

### ThinkPad T14s Gen 6 Specs (21QA0036US)
| Spec | Details |
|------|---------|
| CPU | Intel Core Ultra 7 268V (Lunar Lake, 8-core, 2.2GHz, built-in NPU) |
| GPU | Intel Arc 140V (16GB dedicated VRAM) |
| RAM | 32GB DDR5-8533 (soldered - already locked in) |
| Storage | 954GB SSD (713GB free) |
| OS | Windows 11 Pro 25H2 |
| Form | Laptop - pen & touch, can leave plugged in 24/7 |

### Why Your ThinkPad Beats the Mac Mini M4 24GB
| Factor | ThinkPad T14s Gen 6 | Mac Mini M4 24GB |
|--------|---------------------|-----------------|
| RAM | **32 GB** | 24 GB |
| GPU VRAM | **16 GB (Arc 140V)** | 0 (shared memory) |
| NPU | **Yes (Lunar Lake)** | Yes |
| Local AI | **7B-13B models** | 7B (limited) |
| New Cost | **$0 (already owned)** | $999 |
| Storage | **954 GB** | 512 GB |
| Idle Power | ~10W | **2.6W** |
| 5-Year Cost | **$275 (electricity only)** | $1,199 |

---

## 9. Supply Chain Crisis (March 2026)

### Helium Shortage
- Qatar's LNG facility damaged March 2026, removing **27-30% of global helium supply**
- Spot helium prices surged **40-100%**
- Semiconductor fabs have only **6-12 weeks of helium buffer**
- Samsung most exposed (~65% of South Korea's helium from Qatar)
- Recovery unlikely until **late 2026-2027**
- Impact: **10-20% chip price increases** through 2026

### DDR5 RAM Crisis
- 16GB DDR5 chips up **298% in 3 months** (Sept-Dec 2025)
- 32GB DDR5 kits now $300-450 (were ~$100 in 2024)
- AI data centers hoarding HBM production, starving consumer supply
- Relief unlikely until **late 2027**
- **Your ThinkPad's 32GB is soldered = already protected from price increases**

### SSD Storage Apocalypse
- **ALL 2026 NAND production already sold out** (confirmed by Phison CEO)
- 1TB NVMe: went from $50-62 (2024) to $118-220 (March 2026) = **255% increase**
- Cloud giants locked in supply contracts through 2027
- New production lines won't come online until **late 2027**
- Action: Consider buying a 2TB NVMe ($227-300) NOW as insurance

---

## 10. Cloud vs Local: The Real Math

### Cloud Costs (Claude API + GPT API)
- Claude API: ~$15/M input tokens, ~$75/M output tokens (Opus)
- 3-agent team running 8hrs/day: ~500K-1M tokens/day
- Monthly: **$500-$2,000+**
- Annual: **$6,000-$24,000**
- 5-Year: **$30,000-$120,000**
- Prices may INCREASE as AI demand grows

### Local Compute (ThinkPad + Optional DGX Spark)
- ThinkPad: **$0 hardware** + $55/yr electricity
- Open-source models (Llama, Mistral, Phi): **FREE** after hardware
- DGX Spark ($4,699): Run 200B models locally, 5-year cost: **$5,099**
- Break-even vs cloud: **3-6 months**

### Recommended Hybrid Strategy
1. Use ThinkPad NOW for Claude Code agents (API-based)
2. Run open-source models locally for tasks that don't need Claude/GPT quality
3. Use Claude API for complex reasoning (worth the cost)
4. Consider DGX Spark in 6-12 months when supply stabilizes
5. Result: **$0 upfront + $50-200/mo API = $600-2,400/yr** instead of $6,000-24,000/yr

---

## 11. NVIDIA DGX Spark - The Future-Proof Option

| Spec | Details |
|------|---------|
| Price | $4,699 (shipping NOW as of March 2026) |
| CPU | 20-core ARM (10x Cortex-X925 + 10x Cortex-A725) |
| GPU | NVIDIA Blackwell GB10 Superchip |
| RAM | 128GB unified LPDDR5x |
| Storage | 4TB SSD |
| AI Performance | 1,000 TOPS (1 Petaflop FP4) |
| Model Capacity | Run up to 200B parameter models |
| Power | 240W |
| Size | 5.9" x 5.9" x 2" |

---

## 12. Updated Final Recommendation

### Phase 1 - NOW (Q1-Q2 2026): Use Your ThinkPad ($0)
- Set it up as always-on (disable sleep, enable SSH, install Tailscale)
- Install WSL2 + Claude Code CLI + tmux + Ollama
- Run 7B-13B models on Arc 140V GPU
- Leave it plugged in - modern charge management handles this

### Phase 2 - OPTIONAL (Q3-Q4 2026): Dedicated Server ($0-$999)
- Mac Mini M4 24GB ($999) IF you want:
  - iPhone ecosystem integration
  - Lower power draw (2.6W vs ~10W)
  - Dedicated machine separate from daily driver
- OR buy extra NVMe storage (1-2TB) for model weights

### Phase 3 - SCALE UP (2027): Local AI Powerhouse ($3,000-$5,000)
- DGX Spark or next-gen equivalent
- DDR5 prices should normalize by late 2027
- 200B+ open-source models will be common
- Cloud API costs will likely increase 20-40%

### Phase 4 - FULL LOCAL (2028): Home AI Lab
- 500B+ parameter models locally
- ThinkPad = mobile interface; DGX Spark = home brain
- Cloud only for bleeding-edge models

---

## Sources
- Apple Mac Mini Tech Specs (support.apple.com)
- Jeff Geerling M4 Mac Mini efficiency benchmarks
- Apple official power & thermal output documentation
- Claude Code official documentation (code.claude.com/docs)
- Hetzner, DigitalOcean, Vultr, AWS pricing pages
- MacRumors refurbished pricing data
- Claude Code Agent Teams documentation
- NVIDIA DGX Spark product page (marketplace.nvidia.com)
- Tom's Hardware: Qatar helium shutdown / chip supply chain
- CNBC: Iran war helium supply impact (March 2026)
- Tom's Hardware: Hetzner April 2026 price increases
- TrendForce: NAND/DDR5 pricing forecasts
- Phison CEO: 2026 NAND production sold out confirmation
