# DontBuyTech Development Roadmap

## Overview

This roadmap outlines the development phases for building the DontBuyTech AI-powered deals discovery platform, from initial foundation to full AI orchestration.

---

## Phase 1: Foundation (MVP Core) 🏗️

**Goal**: Build the basic infrastructure and UI for displaying deals

### 1.1 Project Setup
- [x] Initialize Next.js 14 with App Router
- [ ] Configure Supabase project
- [ ] Set up Drizzle ORM with migrations
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up environment variables
- [ ] Create .gitignore (Next.js/Node standard)

### 1.2 Database Schema
- [ ] Design and implement `deals` table
  - id, title, description, price, original_price, discount_percentage
  - url, image_url, category, brand
  - score, votes, created_at, expires_at, archived
- [ ] Design and implement `votes` table
  - id, deal_id, user_id, vote_type (+1/-1), created_at
- [ ] Design and implement `categories` table
  - id, name, slug, description, icon
- [ ] Set up pgvector extension for embeddings (future AI features)
- [ ] Create initial Drizzle migrations
- [ ] Seed test data (10-15 sample deals across categories)

### 1.3 Core UI Components
- [ ] Create `DealCard` component
  - Deal image, title, price display
  - Discount badge, vote buttons
  - Category tag, expiration indicator
- [ ] Create `CategorySection` component
  - Category header with icon
  - Top 5 deals grid/list
  - "View All" link
- [ ] Create base layout with navigation
- [ ] Implement responsive design (mobile-first)

### 1.4 Core Pages
- [ ] `/` - Homepage with top 5 per category
- [ ] `/deals/[category]` - Full category view
- [ ] `/deals/[id]` - Individual deal detail page
- [ ] `/archive` - Archived deals view

### 1.5 Basic Voting System
- [ ] Implement vote API endpoint (`/api/vote`)
- [ ] Add vote count tracking
- [ ] Implement basic ranking algorithm (votes + freshness)
- [ ] Add optimistic UI updates for voting

**Deliverable**: Working website with manual deal entry, voting, and basic ranking

---

## Phase 2: Automation & AI Summaries 🤖

**Goal**: Add AI-powered summarization and automated archiving

### 2.1 Claude Integration
- [ ] Set up Anthropic SDK
- [ ] Create AI utility functions (`lib/ai.ts`)
- [ ] Implement rate limiting and error handling
- [ ] Add AI response caching

### 2.2 Deal Summarization
- [ ] Create summarization API endpoint (`/api/ai/summarize`)
- [ ] Design summarization prompt
  - Extract key features
  - Highlight price drops
  - Generate concise summary (2-3 sentences)
- [ ] Add summary field to database schema
- [ ] Batch summarize existing deals
- [ ] Display AI summaries on deal cards

### 2.3 Automated Archiving
- [ ] Create archiving cron job (`/api/cron/archive`)
- [ ] Implement expiration logic
  - Check deal expiration dates
  - Archive deals with broken links
  - Archive deals with low scores + age
- [ ] Set up Vercel Cron (or similar)
- [ ] Add archive notification system
- [ ] Create archive restoration endpoint (if needed)

### 2.4 Enhanced Ranking
- [ ] Update ranking algorithm (`lib/ranking.ts`)
  - Combine votes, freshness, and AI quality score
  - Implement decay function for old deals
  - Add category-specific boosting
- [ ] Add quality scoring to AI summarization
- [ ] Store ranking metadata in database

**Deliverable**: Platform with AI summaries and automated deal lifecycle management

---

## Phase 3: AI Orchestration (Multi-Agent System) 🎭

**Goal**: Implement the Claude Code Orchestra for automated deal discovery and curation

### 3.1 Orchestra Infrastructure
- [ ] Create `orchestra/` directory structure
- [ ] Set up LangGraph.js (or custom orchestration)
- [ ] Define agent communication protocol
- [ ] Implement agent state management
- [ ] Create logging and monitoring system

### 3.2 Fetcher Agent
- [ ] Design deal source integration
  - Reddit APIs (r/buildapcsales, r/deals)
  - SlickDeals RSS/API
  - Other deal aggregators
- [ ] Implement data normalization
- [ ] Handle rate limiting and retries
- [ ] Store raw deal data
- [ ] Create fetcher schedule (hourly/daily)

### 3.3 Filter Agent
- [ ] Design filtering criteria
  - Brand reputation check
  - Minimum discount threshold
  - Price history validation
  - Spam/junk detection
- [ ] Implement Claude-powered legitimacy scoring
- [ ] Add duplicate detection
- [ ] Filter out low-quality deals
- [ ] Log filtering decisions

### 3.4 Summarizer Agent
- [ ] Extract product specifications
- [ ] Generate factual summaries
- [ ] Create relevant tags
- [ ] Add price context (historical comparison)
- [ ] Implement quality checks

### 3.5 Ranker Agent
- [ ] Combine multiple signals:
  - AI quality score
  - User votes
  - Deal freshness
  - Discount depth
  - Brand reputation
- [ ] Implement ranking persistence
- [ ] Create ranking update schedule
- [ ] Add A/B testing framework

### 3.6 Archivist Agent
- [ ] Monitor deal validity
- [ ] Check link health
- [ ] Evaluate engagement metrics
- [ ] Archive low-value deals
- [ ] Generate archive reports

### 3.7 Orchestration Graph
- [ ] Define agent workflow (`orchestra/graph.ts`)
- [ ] Implement task queue
- [ ] Add error recovery and retries
- [ ] Create monitoring dashboard
- [ ] Set up alerting for failures

**Deliverable**: Fully automated deal discovery and curation system

---

## Phase 4: UX & Insights (Advanced Features) ✨

**Goal**: Enhance user experience with AI-powered insights and search

### 4.1 Category AI Digest
- [ ] Generate category-level summaries
  - Best deals this week
  - Trending products
  - Price trends
- [ ] Display digest on category pages
- [ ] Update digest daily
- [ ] Add "What's Hot" section

### 4.2 Ask-AI Feature
- [ ] Design AI query interface
- [ ] Implement RAG (Retrieval-Augmented Generation)
  - Set up pgvector embeddings
  - Index all deals
  - Implement semantic search
- [ ] Create query API endpoint (`/api/ai/ask`)
- [ ] Handle complex queries
  - "Best 4K monitor under $300?"
  - "Compare these two laptops"
  - "Is this deal worth it?"
- [ ] Add query history for users
- [ ] Implement query caching

### 4.3 Enhanced UI/UX
- [ ] Add deal comparison tool
- [ ] Implement price alerts
- [ ] Create personalized recommendations
- [ ] Add dark mode
- [ ] Improve mobile experience
- [ ] Add keyboard shortcuts
- [ ] Implement infinite scroll

### 4.4 User Features
- [ ] User authentication (Supabase Auth)
- [ ] User profiles
- [ ] Saved deals / watchlist
- [ ] Email notifications
- [ ] Deal submission form (community-driven)
- [ ] Comment system (optional)

### 4.5 Analytics & Monitoring
- [ ] Implement usage analytics
- [ ] Track deal performance
- [ ] Monitor AI agent efficiency
- [ ] A/B testing framework
- [ ] Error tracking (Sentry or similar)

**Deliverable**: Feature-rich platform with advanced AI capabilities

---

## Phase 5: Optimization & Scale 🚀

**Goal**: Optimize performance and prepare for scale

### 5.1 Performance
- [ ] Implement Redis caching (Upstash)
  - Cache top-5 queries
  - Cache AI summaries
  - Cache ranking calculations
- [ ] Optimize database queries
- [ ] Add CDN for images
- [ ] Implement lazy loading
- [ ] Optimize bundle size

### 5.2 Infrastructure
- [ ] Set up staging environment
- [ ] Implement CI/CD pipeline
- [ ] Add automated testing
  - Unit tests
  - Integration tests
  - E2E tests (Playwright)
- [ ] Database backup strategy
- [ ] Disaster recovery plan

### 5.3 Scalability
- [ ] Implement queue system (Upstash QStash)
- [ ] Add horizontal scaling for API
- [ ] Optimize AI agent scheduling
- [ ] Implement rate limiting
- [ ] Add load balancing

### 5.4 Monitoring & Observability
- [ ] Set up application monitoring
- [ ] Create performance dashboards
- [ ] Implement health checks
- [ ] Add uptime monitoring
- [ ] Create alerting rules

**Deliverable**: Production-ready, scalable platform

---

## Future Considerations 🔮

### Potential Features
- Mobile app (React Native)
- Browser extension for deal alerts
- Price history charts
- Deal prediction (ML-based)
- Multi-language support
- Regional deal filtering
- Partnership integrations
- Affiliate link management
- Advanced analytics dashboard

### Technical Improvements
- Microservices architecture
- GraphQL API
- Real-time updates (WebSockets)
- Advanced ML models for deal scoring
- Custom trained models for product categorization

---

## Success Metrics by Phase

### Phase 1
- [ ] 100+ test deals seeded
- [ ] All core pages functional
- [ ] Mobile responsive

### Phase 2
- [ ] 90%+ deals have AI summaries
- [ ] <1% expired deals in active feed
- [ ] Improved ranking accuracy

### Phase 3
- [ ] 100+ deals auto-discovered daily
- [ ] <5% false positives in filtering
- [ ] 95%+ uptime for agent system

### Phase 4
- [ ] <500ms Ask-AI response time
- [ ] 80%+ user satisfaction with AI features
- [ ] 2x increase in user engagement

### Phase 5
- [ ] <100ms page load time
- [ ] 99.9% uptime
- [ ] Support for 10,000+ daily active users

---

## Timeline Estimate

- **Phase 1**: 1-2 weeks
- **Phase 2**: 1 week
- **Phase 3**: 2-3 weeks
- **Phase 4**: 2-3 weeks
- **Phase 5**: 1-2 weeks

**Total MVP to Scale**: 7-11 weeks

---

## Current Status

**Phase**: 1 (Foundation)
**Progress**: Setting up orchestration framework and project documentation
**Next Steps**: Initialize Next.js + Supabase project, create database schema
