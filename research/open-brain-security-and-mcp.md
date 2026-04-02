# Open Brain: Security Architecture & MCP Setup Guide

## Context

You're building an "Open Brain" - a digital second brain / knowledge management system with Nate B Jones. Currently data flows through cloud APIs (Claude, GPT, Supabase). This research covers security risks of that approach, how to build a secure local alternative, and how to set up MCP (Model Context Protocol) for Claude Code integration.

---

## 1. Supabase Security Assessment

### Platform Overview
- Open-source Firebase alternative built on PostgreSQL
- Managed cloud runs on AWS (multiple regions)
- Also available as self-hosted Docker deployment

### Security Strengths
| Feature | Status |
|---------|--------|
| Encryption at rest | AES-256 |
| Encryption in transit | TLS 1.2+ enforced |
| SOC 2 Type 2 | Certified, annual audits |
| HIPAA | Compliant (with BAA add-on) |
| Row Level Security (RLS) | Available (PostgreSQL native) |
| MFA | TOTP + phone supported |
| Key management | FIPS 140-2 compliant HSMs |
| Self-hosting option | Full Docker deployment available |

### Known Breaches & Vulnerabilities

| Incident | Date | Impact |
|----------|------|--------|
| **Moltbook Hack** | Jan 2026 | API key in frontend JS + RLS disabled = **1.5M API keys + 35K emails leaked** |
| **Lovable AI Apps (CVE-2025-48757)** | 2025 | AI-generated code missed RLS = **170+ apps with PII, financials, credentials exposed** |
| **Mass Misconfiguration** | Ongoing | Thousands of Supabase DBs publicly queryable via curl |
| **MCP "Lethal Trifecta"** | 2025 | LLM agents with service_role keys can be prompt-injected to leak entire databases |
| **CVE-2024-10979** | 2024 | PostgreSQL vulnerability affecting versions before 17.1 |

### Critical Risk: RLS is OFF by Default
- 9 out of 10 new tables have NO row-level security
- The `anon` key is PUBLIC by design (embedded in frontend)
- If RLS is missing, anyone with the anon key can read ALL data
- The `service_role` key bypasses ALL security - must NEVER be in frontend code

### Data Privacy Concerns
- Cloud data lives on Supabase's AWS infrastructure
- Supabase staff could theoretically access your data
- Subject to US legal process (subpoenas)
- Data retained for duration of service agreement + 30 days
- A breach on their end = your brain exposed
- No published transparency/canary reports found

---

## 2. The Three-Tier Architecture (Recommended)

### Tier 1: LOCAL POSTGRESQL (Maximum Security)
**What goes here:** Personal thoughts, client confidentials, deal strategies, financial info, health data, credentials, proprietary business logic

- Runs on your ThinkPad in WSL2
- Data NEVER leaves your machine
- MCP transport: `stdio` (fully local)
- Encrypted via BitLocker

### Tier 2: SELF-HOSTED SUPABASE (High Security)
**What goes here:** Open Brain knowledge base, project management, research, curated intelligence

- Runs on your ThinkPad via Docker
- Full Supabase features (auth, storage, realtime, REST API)
- You control all encryption keys
- MCP transport: local HTTP (localhost:54321)

### Tier 3: CLOUD SUPABASE (Moderate Security)
**What goes here:** VibeCoding app data, marketing content, public APIs, anything you'd be OK seeing publicly

- Runs on Supabase's AWS infrastructure
- RLS enabled, read-only MCP access
- Scoped Personal Access Token
- MCP transport: cloud HTTP (read-only)

---

## 3. MCP Setup Guide

### What is MCP?
Model Context Protocol - an open standard that connects Claude Code to external tools and data sources. Think "USB-C port for AI." Claude can query your databases, access files, and use tools through MCP.

### Configuration File
Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "brain-private": {
      "command": "npx",
      "args": [
        "-y", "@modelcontextprotocol/server-postgres",
        "postgresql://brain_reader:${BRAIN_DB_PASS}@localhost:5432/open_brain"
      ]
    },
    "supabase-local": {
      "command": "npx",
      "args": [
        "-y", "@supabase/mcp-server-supabase",
        "--url", "http://localhost:54321",
        "--service-role-key", "${LOCAL_SERVICE_KEY}"
      ]
    },
    "supabase-cloud": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=${SUPA_PROJECT}&read_only=true",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_PAT}"
      }
    }
  }
}
```

### MCP Security Summary
| MCP Server | Transport | Data Location | Security Level |
|-----------|-----------|---------------|----------------|
| `brain-private` | stdio (local) | Never leaves ThinkPad | Maximum |
| `supabase-local` | HTTP (localhost) | Never leaves ThinkPad | High |
| `supabase-cloud` | HTTP (remote) | Supabase AWS servers | Moderate (read-only) |

### Key MCP Security Facts
- **stdio transport**: All data stays local. No network traffic.
- **http to localhost**: Data stays on machine but uses network stack
- **http to cloud**: Data sent to remote servers
- **WARNING**: The original `@modelcontextprotocol/server-postgres` package is archived and has known input sanitization issues. Always use a read-only database user.
- **NEVER**: Use MCP with service_role keys on production data. The "Lethal Trifecta" attack is real.

---

## 4. Setup Steps

### Step 1: Enable BitLocker (30 min)
- Windows Settings > Privacy & Security > Device Encryption
- Or: Control Panel > BitLocker Drive Encryption > Turn on

### Step 2: Install WSL2 + PostgreSQL (1 hour)
```bash
# PowerShell (admin)
wsl --install

# In WSL2 (Ubuntu)
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### Step 3: Create Open Brain Database (30 min)
```sql
sudo -u postgres psql

-- Create the database
CREATE DATABASE open_brain;

-- Create read-only user for MCP
CREATE USER brain_reader WITH PASSWORD 'your_strong_password_here';
GRANT CONNECT ON DATABASE open_brain TO brain_reader;
\c open_brain
GRANT USAGE ON SCHEMA public TO brain_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO brain_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO brain_reader;

-- Create read-write user for your apps
CREATE USER brain_writer WITH PASSWORD 'different_strong_password';
GRANT CONNECT ON DATABASE open_brain TO brain_writer;
\c open_brain
GRANT USAGE ON SCHEMA public TO brain_writer;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO brain_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO brain_writer;

\q
```

### Step 4: Create Initial Schema
```sql
\c open_brain

-- Personal thoughts and reflections
CREATE TABLE thoughts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge base entries
CREATE TABLE knowledge (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(500),
    category VARCHAR(100),
    tags TEXT[],
    embedding VECTOR(384),  -- for semantic search (requires pgvector)
    created_at TIMESTAMP DEFAULT NOW()
);

-- Client/business confidentials
CREATE TABLE confidentials (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    classification VARCHAR(50) DEFAULT 'confidential',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Strategy and planning
CREATE TABLE strategies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 5: Configure MCP (15 min)
```bash
# Set environment variables in ~/.bashrc
export BRAIN_DB_PASS="your_strong_password_here"
export SUPABASE_PAT="sbp_xxxxxxxxxxxx"
export SUPA_PROJECT="your_project_id"
source ~/.bashrc
```

Create `.mcp.json` in your project root (see Section 3 above).

### Step 6: Install Ollama + Local Models (30 min)
```bash
# In WSL2
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull llama3.1:8b    # Fast, general tasks (4.7GB)
ollama pull mistral:7b      # Good reasoning (4.1GB)

# Test
ollama run llama3.1:8b "Summarize what an Open Brain is"
```

### Step 7: Install Open WebUI (30 min)
```bash
# Local ChatGPT-like interface for your private models
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

Access at http://localhost:3000 - private, local, no data leaves your machine.

### Step 8: Self-Host Supabase (Optional, 1 hour)
```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env

# EDIT .env - change ALL default passwords:
# POSTGRES_PASSWORD=<strong random password>
# JWT_SECRET=<strong random 32+ char string>
# DASHBOARD_USERNAME=<your username>
# DASHBOARD_PASSWORD=<strong password>

docker compose up -d
```

Access Studio dashboard at http://localhost:54323

### Step 9: Set Up Tailscale (30 min)
```bash
# Secure remote access from iPhone
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Install Tailscale on iPhone. Now you can SSH into your ThinkPad from anywhere, securely.

### Step 10: Encrypted Backup (1 hour)
```bash
# Weekly encrypted backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -U brain_writer open_brain | \
  gpg --symmetric --cipher-algo AES256 \
  -o "/mnt/backup/open_brain_${DATE}.sql.gpg"
```

---

## 5. Data Classification Guide

### Tier 1 - LOCAL ONLY (Never cloud)
- Personal reflections, journal entries
- Client names, deal terms, financial details
- Health information
- Passwords, API keys, credentials
- Proprietary business strategies
- Family/personal information
- Legal documents
- Anything you'd be devastated to see leaked

### Tier 2 - SELF-HOSTED SUPABASE (Your machine)
- Open Brain knowledge base
- Research notes and curated intelligence
- Project plans and task tracking
- Technical documentation
- Meeting notes (non-confidential)

### Tier 3 - CLOUD SUPABASE (Public-facing)
- VibeCoding app data
- Marketing content
- Public documentation
- Blog posts, social content drafts
- Open-source project data
- Anything you'd be fine posting on LinkedIn

---

## 6. Cloud vs Local Economics

### Cloud API Costs (5-Year Projection)
| Usage Level | Monthly | Annual | 5-Year |
|------------|---------|--------|--------|
| Light (1 agent, casual) | $50-100 | $600-1,200 | $3,000-6,000 |
| Medium (3 agents, daily) | $500-2,000 | $6,000-24,000 | $30,000-120,000 |
| Heavy (5+ agents, 24/7) | $2,000-5,000+ | $24,000-60,000 | $120,000-300,000 |

### Local Compute Costs (5-Year)
| Setup | One-Time | Annual Electricity | 5-Year Total |
|-------|----------|-------------------|-------------|
| ThinkPad (owned) + Ollama | $0 | $55 | $275 |
| + Mac Mini dedicated server | $999 | $95 | $1,474 |
| + DGX Spark (2027) | $4,699 | $175 | $5,574 |

### The Hybrid Math
- Use local models for 70-80% of queries (free after hardware)
- Use Claude/GPT API for 20-30% complex reasoning ($50-200/mo)
- **Result: $600-2,400/yr instead of $6,000-24,000/yr**
- **Savings: 80-90% reduction in AI compute costs**

---

## 7. Supabase Security Hardening Checklist

If you continue using cloud Supabase for any tier:

- [ ] Enable RLS on EVERY table (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`)
- [ ] Use `auth.uid() = user_id` NOT `auth.role() = 'authenticated'` in policies
- [ ] Remove `service_role` key from ALL frontend code
- [ ] Remove `service_role` from ALL `NEXT_PUBLIC_*` env vars
- [ ] Run Supabase Security Advisor before any deployment
- [ ] Enable MFA on your Supabase dashboard account
- [ ] Rotate API keys quarterly
- [ ] Audit RLS policies on every new table creation
- [ ] Never use MCP with service_role on production data
- [ ] Set up monitoring for unusual query patterns

---

## Sources

### Supabase Security
- Supabase Trust Center (trust.supabase.io)
- Supabase Security Documentation (supabase.com/docs/guides/platform/security)
- SOC 2 / HIPAA compliance docs (supabase.com/docs/guides/security)

### Breach Reports
- Moltbook Hack: Wiz.io research (Jan 2026)
- CVE-2025-48757: Lovable RLS bypass (mattpalmer.io)
- Mass misconfiguration: Deepstrike.io research
- MCP Lethal Trifecta: Pomerium.com, Simon Willison

### MCP Documentation
- Model Context Protocol (modelcontextprotocol.io)
- Claude Code MCP docs (code.claude.com/docs/en/mcp)
- @supabase/mcp-server-supabase (npmjs.com)
- @modelcontextprotocol/server-postgres (npmjs.com)
- Self-hosted Supabase MCP (github.com/HenkDz/selfhosted-supabase-mcp)

### Privacy & Legal
- Supabase Privacy Policy (supabase.com/privacy)
- Supabase Data Processing Addendum
- Supabase Shared Responsibility Model
