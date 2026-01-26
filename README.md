# DontBuyTech 🛍️🤖

**AI-Powered Deals Discovery & Curation Platform**

> Find, summarize, and surface the best tech deals — automatically, intelligently, and transparently.

---

## 🎯 What is DontBuyTech?

DontBuyTech is an AI-forward platform that surfaces the best electronics and tech deals online with no junk and no spam. Think of it as **Reddit meets Rtings** — a clean, user-driven deal discovery site powered by Claude AI agents that automatically research, filter, and curate the best deals.

### Key Features

- **Top 5 Deals Per Category** - Only the best deals make it to the top
- **AI-Generated Summaries** - Quick insights, price highlights, and product details
- **Community Voting** - User-driven ranking system
- **Automated Curation** - Claude AI agents handle discovery and validation
- **Smart Archiving** - Expired and low-quality deals automatically removed
- **Ask-AI** - Context-aware product recommendations (coming soon)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (Postgres + pgvector), Drizzle ORM |
| **AI** | Claude (Anthropic SDK), LangGraph.js |
| **Infrastructure** | Vercel, Vercel Cron, Edge Functions |
| **Queue** | Upstash QStash (optional) |
| **Cache** | Upstash Redis (optional) |

---

## 🧠 AI Architecture

DontBuyTech uses a multi-agent system powered by Claude Code Orchestra:

1. **Fetcher Agent** - Collects deals from trusted sources
2. **Filter Agent** - Validates legitimacy and quality
3. **Summarizer Agent** - Generates concise, factual summaries
4. **Ranker Agent** - Scores deals based on multiple signals
5. **Archivist Agent** - Manages deal lifecycle and archiving

See [docs/PROJECT_STARTER_PROMPT.md](./docs/PROJECT_STARTER_PROMPT.md) for the full vision.

---

## 📁 Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── deals/               # Deal pages
│   ├── api/                 # API routes
│   └── ...
├── components/              # React components
│   ├── DealCard.tsx
│   ├── CategorySection.tsx
│   └── ...
├── lib/                     # Utilities and business logic
│   ├── db.ts               # Database client
│   ├── schema.ts           # Drizzle schema
│   ├── ai.ts               # AI utilities
│   └── ranking.ts          # Ranking algorithm
├── orchestra/              # AI agent orchestration
│   ├── graph.ts           # Agent workflow
│   └── agents/            # Individual agents
├── docs/                   # Documentation
│   ├── PROJECT_STARTER_PROMPT.md
│   └── ROADMAP.md
└── claude-code-agents-orchestra/  # Agent library (submodule)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Anthropic API key (for Claude)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DontBuyTech
   git submodule update --init --recursive
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Add your credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Anthropic
   ANTHROPIC_API_KEY=your-anthropic-key

   # Database
   DATABASE_URL=your-database-url
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Seed test data** (optional)
   ```bash
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📖 Documentation

- **[Project Vision](./docs/PROJECT_STARTER_PROMPT.md)** - Detailed product vision and strategy
- **[Development Roadmap](./docs/ROADMAP.md)** - Phase-by-phase development plan
- **[Claude Code Orchestra](./claude-code-agents-orchestra/README.md)** - AI agent library

---

## 🧭 Development Roadmap

### Current Phase: Phase 1 - Foundation

- [x] Set up orchestration framework
- [x] Create project documentation
- [ ] Initialize Next.js + Supabase
- [ ] Build database schema
- [ ] Create core UI components
- [ ] Implement basic voting system

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the complete roadmap.

---

## 🤝 Contributing

This is a private repository. All contributions should follow the established patterns and coding standards.

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Write tests for critical functionality
- Use Prettier and ESLint for formatting

---

## 🔒 License

All rights reserved. This is a private repository.

---

## 🎯 North Star

**"Find, summarize, and surface the best tech deals — automatically, intelligently, and transparently."**

- **Claude** handles the research and reasoning
- **Next.js** handles the presentation and performance
- **You** handle the direction

---

## 📞 Support

For questions or issues, please create an issue in the repository.

---

**Built with ❤️ using Claude Code Orchestra**
