# DontBuyTech - AI-Powered Deals Discovery Platform

## 🎯 Vision

Create an AI-forward deals discovery and curation platform that surfaces the best electronic and tech deals online — no junk, no spam.

Think of it as a **Reddit-meets-Rtings-style site**: clean UI, user-driven voting, AI-assisted deal validation, and a back-end "orchestra" of Claude agents automating research, filtering, and summarization.

---

## 🧩 Core Idea

The system runs on two synchronized layers:

### Frontend (User-Facing)

- Simple, fast feed of the **top 5 deals per category**
- **Voting system** to push the best deals higher
- **Archived view** for expired or past deals
- **AI-generated summaries**, price highlights, and quick-read insights
- Optional **"Ask-AI" query bar** for product recommendations and deal insights

### Backend (Claude Code Orchestra)

Multi-agent workflow that:

- Fetches and scrapes deals from trusted sources (APIs, RSS, or web)
- Filters for quality and validity using Claude's reasoning
- Summarizes key points (price drop, product value, reliability)
- Scores, categorizes, and stores the data
- Archives expired or invalid deals automatically

---

## 🧠 AI-Forward Strategy

### Claude Multi-Agent Flow:

1. **Fetcher Agent**: Collects and normalizes raw deal data
2. **Filter Agent**: Evaluates legitimacy, discount depth, and brand reputation
3. **Summarizer Agent**: Generates short, factual blurbs and tags
4. **Ranker Agent**: Combines score + votes + freshness + AI quality score
5. **Archivist Agent**: Moves expired or low-value deals out of the live feed

### AI Features for Users:

- **AI summaries** on deal cards
- **Category-level "AI Digest"** — short bullet recaps
- **Ask-AI**: context-aware query ("best 4K monitor under $300?")

---

## 🏗️ Tech Stack (Baseline)

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Next.js (App Router) + Tailwind + shadcn/ui | Clean UI, fast rendering |
| Backend | Supabase (Postgres + pgvector) + Drizzle ORM | Data, auth, embeddings |
| AI | Claude (Anthropic SDK) + optional LangGraph.js | Agents, summaries, orchestration |
| Infra | Vercel Cron / Edge Functions | Archiving, background jobs |
| Queue (optional) | Upstash QStash | Reliable async tasking |
| Cache (optional) | Upstash Redis | Store hot top-5 queries |

---

## ⚙️ Repo Setup Notes

- **Base**: Next.js + Supabase Starter (Vercel official)
- **Add**: Drizzle ORM for typed schema and migrations
- **Enable**: pgvector for embeddings
- **Create**: .gitignore using the standard Next.js / Node template
- **Keep**: repo private (no license = all rights reserved)
- **If**: any component becomes public (e.g., UI library): license that part MIT

---

## 📁 Suggested Repo Structure

```
app/
  deals/page.tsx                 # Top 5 per category
  deals/[category]/page.tsx      # Full category list
  api/
    vote/route.ts
    ai/summarize/route.ts
    cron/archive/route.ts
components/
  DealCard.tsx
  CategorySection.tsx
lib/
  db.ts
  schema.ts
  ranking.ts
  ai.ts
  rag.ts
orchestra/
  graph.ts
  agents/
    fetcher.ts
    filter.ts
    summarizer.ts
    ranker.ts
    archivist.ts
docs/
  PROJECT_STARTER_PROMPT.md
  ROADMAP.md
```

---

## 🧭 Development Path (MVP → AI Integration)

### Phase 1 — Foundation

- Clone base template (Next.js + Supabase)
- Build deal model + vote system
- Static top-5 per category page
- Manual seeding of test data

### Phase 2 — Automation

- Add cron for archiving expired deals
- Integrate Claude summarizer route
- Populate summaries + tags via API

### Phase 3 — AI Orchestration

- Add Claude Code "orchestra" directory with LangGraph pipeline
- Automate deal discovery, filtering, and scoring

### Phase 4 — UX & Insights

- Add AI digest summaries per category
- Implement Ask-AI feature for user deal search

---

## 🔒 Repo Setup Essentials

- **.gitignore**: use Next.js/Node default (ignore node_modules, .next/, .env*, etc.)
- **License**: None (private repo → all rights reserved)
- **Readme**: link to this starter prompt + deployment steps

---

## 💡 North Star

**"Find, summarize, and surface the best tech deals — automatically, intelligently, and transparently."**

- Claude handles the research and reasoning
- Next.js handles the presentation and performance
- You handle the direction

---

## 🎯 Success Metrics

- **Quality over Quantity**: Only the best deals make it to the top 5
- **User Trust**: AI summaries are accurate and helpful
- **Performance**: Fast page loads, real-time updates
- **Automation**: Minimal manual curation needed
- **Scalability**: System handles growing deal volume gracefully
