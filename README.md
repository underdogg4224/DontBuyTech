# DontBuyTech - Tech Minimalism Challenge Tracker

A Next.js application that helps users track their tech minimalism journey, avoid unnecessary tech purchases, and build sustainable tech habits through community challenges and achievement badges.

## Features

### 1. Device Tracking
- Track all your current tech devices (smartphones, laptops, tablets, etc.)
- Monitor device inventory with purchase dates and costs
- Track device status (active, sold, donated, recycled)
- View total device count and cumulative value

### 2. Avoided Purchases Tracker
- Log tech purchases you successfully avoided
- Calculate money saved over time
- View savings statistics:
  - Total saved (all time)
  - Savings this month
  - Savings this year
  - Average savings per avoided purchase
- Track reasons for avoiding purchases

### 3. Community Challenges
- Join pre-defined community challenges:
  - **30 Days No Tech Purchases**: Go 30 days without buying new tech
  - **Device Declutter**: Reduce your tech devices by selling/donating
  - **90 Days Tech Minimalist**: Complete mindful tech usage goals
- Track challenge progress with daily check-ins
- View active, completed, and available challenges
- See participant counts for community engagement

### 4. Achievement Badges
- Earn badges for sustainable tech habits:
  - **First Step**: Avoid your first tech purchase
  - **Saving Streak**: Save $1000 by avoiding purchases
  - **Challenge Champion**: Complete your first challenge
  - **Minimalist Master**: Reduce device count by 5+
  - **30 Day Warrior**: Stay committed for 30 days
- View earned and locked achievements
- Track progress towards unlocking new badges

### 5. Goal Setting
- Set personal tech minimalism goals:
  - Save money targets
  - Device reduction goals
  - Purchase avoidance targets
- Track progress with visual indicators
- Optional deadlines for accountability
- View completed goals history

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components (shadcn/ui style)
- **Database**: SQLite (via Prisma ORM)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd DontBuyTech
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up the database:
\`\`\`bash
# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main models:

- **User**: User accounts and profiles
- **Device**: Tech devices owned by users
- **AvoidedPurchase**: Purchases users successfully avoided
- **Challenge**: Community challenge definitions
- **UserChallenge**: User participation in challenges
- **ChallengeCheckIn**: Daily progress check-ins
- **Achievement**: Badge definitions
- **UserAchievement**: Badges earned by users
- **Goal**: Personal tech minimalism goals

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run db:generate\` - Generate Prisma Client
- \`npm run db:push\` - Push schema to database
- \`npm run db:seed\` - Seed database with sample data
- \`npm run db:studio\` - Open Prisma Studio (database GUI)

## Project Structure

\`\`\`
DontBuyTech/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed data
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── ui/              # UI components
│   │   └── dashboard/       # Dashboard components
│   ├── lib/                 # Utility libraries
│   │   ├── prisma.ts        # Prisma client
│   │   └── utils.ts         # Utility functions
│   └── types/               # TypeScript types
├── .env                     # Environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
\`\`\`

## Features in Detail

### Dashboard
The main dashboard provides an overview of:
- Total money saved
- Number of purchases avoided
- Active challenges count
- Achievements earned
- Quick access to all features

### Device Tracking
- Add new devices with details (name, category, purchase date, cost)
- View all devices in a categorized list
- See icons for different device types
- Track device status changes
- Calculate total investment in tech

### Savings Calculator
Automatically calculates:
- Cumulative savings from all avoided purchases
- Monthly and yearly savings breakdowns
- Average savings per avoided purchase
- Trends and patterns in spending avoidance

### Challenge System
- Browse available community challenges
- Join challenges with one click
- Track daily progress
- View completion percentage
- See days remaining
- Check-in system for accountability

### Achievement System
- Unlock badges automatically based on activity
- View requirements for locked achievements
- Track progress across different categories:
  - Savings milestones
  - Challenge completions
  - Device reductions
  - Mindfulness streaks

## Demo Data

The seed script includes:
- 1 demo user (demo@dontbuytech.com)
- 3 sample devices (iPhone, MacBook, iPad)
- 3 avoided purchases ($1,847 saved)
- 3 community challenges
- 5 achievement badges
- 1 active goal

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js and Tailwind CSS
- UI components inspired by shadcn/ui
- Icons by Lucide React
- Database powered by Prisma ORM

---

**Start your tech minimalism journey today!** 🌱
