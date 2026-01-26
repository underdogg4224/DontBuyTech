# Enhanced Ranking Algorithm - Visual Guide

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEAL RANKING CALCULATION                      │
└─────────────────────────────────────────────────────────────────────┘

INPUT DATA
┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
│  Upvotes    │  │  Downvotes   │  │  Created At   │  │ AI Quality   │
│    150      │  │      10      │  │  2024-11-01   │  │    85/100    │
└──────┬──────┘  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘
       │                │                  │                  │
       └────────┬───────┘                  │                  │
                │                          │                  │
                ▼                          │                  │
        ┌───────────────┐                 │                  │
        │  BASE SCORE   │                 │                  │
        │  150 - 10     │                 │                  │
        │    = 140      │                 │                  │
        └───────┬───────┘                 │                  │
                │                          │                  │
                │                          │                  │
                ▼                          ▼                  ▼
        ┌──────────────────────────────────────────────────────────┐
        │                      BOOST CALCULATION                    │
        ├──────────────┬─────────────────┬──────────────────────────┤
        │ AI Quality   │ Category        │ Discount                 │
        │ (85/100)*50  │ 45 * 0.1       │ (60/100)*20             │
        │   = 42.5     │   = 4.5        │   = 12                  │
        └──────┬───────┴────────┬────────┴─────────┬────────────────┘
               │                │                  │
               └────────────┬───┴──────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   COMBINED SCORE      │
                │ 140 + 42.5 + 4.5 + 12│
                │      = 199           │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   FRESHNESS DECAY     │
                │   e^(-days/30)        │
                │   Age: 2 days         │
                │   Decay: 0.936        │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │    FINAL SCORE        │
                │   199 * 0.936         │
                │    = 186.26           │
                └───────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Tier:       │
                    │ "Exceptional" │
                    └───────────────┘
```

## Score Breakdown Examples

### Example 1: New Viral Deal
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 VIRAL DEAL - Posted 1 hour ago
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Votes:           500 👍  20 👎
AI Quality:      95/100
Category Pop:    70
Discount:        80%
Age:             1 hour

┌─────────────────────────────────────────┐
│ Base Score (votes)     │      480      │
├────────────────────────┼───────────────┤
│ AI Boost (95/100 × 50) │      47.5     │
├────────────────────────┼───────────────┤
│ Category (70 × 0.1)    │      7        │
├────────────────────────┼───────────────┤
│ Discount (80/100 × 20) │      16       │
├────────────────────────┼───────────────┤
│ Combined               │      550.5    │
├────────────────────────┼───────────────┤
│ Decay (1hr ≈ 1.0)      │      × 0.999  │
├────────────────────────┼───────────────┤
│ FINAL SCORE            │  🌟 549.95   │
└────────────────────────┴───────────────┘

Tier: LEGENDARY 👑
```

### Example 2: Old Popular Deal
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 OLD DEAL - Posted 60 days ago
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Votes:           500 👍  20 👎
AI Quality:      80/100
Category Pop:    60
Discount:        50%
Age:             60 days (2 half-lives)

┌─────────────────────────────────────────┐
│ Base Score (votes)     │      480      │
├────────────────────────┼───────────────┤
│ AI Boost (80/100 × 50) │      40       │
├────────────────────────┼───────────────┤
│ Category (60 × 0.1)    │      6        │
├────────────────────────┼───────────────┤
│ Discount (50/100 × 20) │      10       │
├────────────────────────┼───────────────┤
│ Combined               │      536      │
├────────────────────────┼───────────────┤
│ Decay (60d ≈ 0.25)     │      × 0.25   │
├────────────────────────┼───────────────┤
│ FINAL SCORE            │  📉 134.00    │
└────────────────────────┴───────────────┘

Tier: EXCEPTIONAL ⭐
(Significantly reduced by age)
```

### Example 3: Controversial Deal
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CONTROVERSIAL - Posted 3 days ago
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Votes:           100 👍  95 👎 (nearly equal)
AI Quality:      30/100 (low)
Category Pop:    40
Discount:        20%
Age:             3 days

┌─────────────────────────────────────────┐
│ Base Score (votes)     │      5        │
├────────────────────────┼───────────────┤
│ AI Boost (30/100 × 50) │      15       │
├────────────────────────┼───────────────┤
│ Category (40 × 0.1)    │      4        │
├────────────────────────┼───────────────┤
│ Discount (20/100 × 20) │      4        │
├────────────────────────┼───────────────┤
│ Combined               │      28       │
├────────────────────────┼───────────────┤
│ Decay (3d ≈ 0.905)     │      × 0.905  │
├────────────────────────┼───────────────┤
│ FINAL SCORE            │  📊 25.34     │
└────────────────────────┴───────────────┘

Tier: GOOD ✓
(Saved by AI and category boost)
```

## Time Decay Visualization

```
Score Retention Over Time (30-day half-life)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

100% │ ██████
     │ ██████
     │ ██████
 75% │ ██████▓▓▓▓
     │ ██████▓▓▓▓
     │ ██████▓▓▓▓
 50% │ ██████▓▓▓▓▒▒▒▒
     │ ██████▓▓▓▓▒▒▒▒
     │ ██████▓▓▓▓▒▒▒▒
 25% │ ██████▓▓▓▓▒▒▒▒░░░░
     │ ██████▓▓▓▓▒▒▒▒░░░░
     ├─────┬─────┬─────┬─────┬─────→ Days
  0% │  0   15   30    60    90

Legend:
██ 100% (0-7 days)     - Brand new
▓▓ 75%  (7-20 days)    - Fresh
▒▒ 50%  (20-40 days)   - Aging
░░ 25%  (40-70 days)   - Old
   <10% (70+ days)     - Very old
```

## Boost Impact Comparison

```
Deal Score with Different Boost Combinations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Deal: 50 upvotes, 5 downvotes, 1 day old

No Boosts:           ████████████████████ 45
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

+ AI Quality (90):   ██████████████████████████████ 90
                     (Added: +45 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

+ Category (60):     ███████████████████████████████ 96
                     (Added: +6 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

+ Discount (75%):    ██████████████████████████████████ 111
                     (Added: +15 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All Combined:        ██████████████████████████████████ 111
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Impact Analysis:
- AI Quality:    +146% boost (most significant)
- Category:      +7% boost
- Discount:      +16% boost
- Total:         +147% over base score
```

## Ranking Tiers

```
┌───────────────────────────────────────────────────┐
│              RANKING TIER SYSTEM                  │
├────────────┬─────────────┬────────────────────────┤
│   Tier     │   Score     │   Description          │
├────────────┼─────────────┼────────────────────────┤
│ Legendary  │   200+      │ 👑 Best of the best   │
│            │             │    Viral deals         │
├────────────┼─────────────┼────────────────────────┤
│ Exceptional│  100-199    │ ⭐ Excellent deals    │
│            │             │    High quality        │
├────────────┼─────────────┼────────────────────────┤
│ Great      │   50-99     │ 🌟 Very good deals    │
│            │             │    Recommended         │
├────────────┼─────────────┼────────────────────────┤
│ Good       │   20-49     │ ✓  Good deals          │
│            │             │    Worth checking      │
├────────────┼─────────────┼────────────────────────┤
│ Fair       │    5-19     │ ⚡ Okay deals          │
│            │             │    Average             │
├────────────┼─────────────┼────────────────────────┤
│ New        │    0-4      │ 🆕 New/unproven       │
│            │             │    Need votes          │
├────────────┼─────────────┼────────────────────────┤
│ Poor       │    <0       │ 👎 Low quality        │
│            │             │    More downvotes      │
└────────────┴─────────────┴────────────────────────┘
```

## Component Weight Distribution

```
Typical High-Quality Deal Score Breakdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Score: 200 points
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────────────┐
│ Base Score (votes)     │ ████████ 70%     │ 140 pts
│                        │                  │
│ AI Quality Boost       │ ████ 21%         │ 42 pts
│                        │                  │
│ Category Boost         │ █ 4%             │ 8 pts
│                        │                  │
│ Discount Boost         │ █ 5%             │ 10 pts
└────────────────────────┴──────────────────┘

Key Insight: Votes are still the primary factor (70%),
but quality signals add significant value (30%).
```

## Real-World Scenario Comparison

```
Scenario: Same Base Votes, Different Contexts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Deal A: New + High Quality
├─ Age: 1 day
├─ Votes: 100 upvotes
├─ AI: 90/100
├─ Category: Popular (70)
└─ Score: 147.5 ⭐ EXCEPTIONAL

Deal B: Old + Medium Quality
├─ Age: 45 days
├─ Votes: 100 upvotes
├─ AI: 60/100
├─ Category: Average (40)
└─ Score: 42.8 ✓ GOOD

Deal C: New + Low Quality
├─ Age: 1 day
├─ Votes: 100 upvotes
├─ AI: 20/100
├─ Category: Unpopular (10)
└─ Score: 111.0 ⭐ EXCEPTIONAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Winner: Deal A (best combination of all factors)
Runner-up: Deal C (freshness + votes compensate for low AI)
Last: Deal B (age penalty is severe)
```
