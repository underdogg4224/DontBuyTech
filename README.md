# DontBuyTech - Crowd-Sourced Regret Database

A community-driven platform that helps people avoid buyer's remorse by sharing honest reviews and experiences with tech products.

## Features

### 1. Regret Database
- Browse tech products people regret buying
- View detailed regret scores (0-100 scale)
- Compare marketing hype vs. actual usefulness ratings
- Read real user stories and reviews

### 2. Use Case Validator
- Input what you want to buy and why
- Get honest, unbiased advice
- See similar products others regretted
- Calculate potential savings

### 3. Community Contributions
- Submit products you regret buying
- Share your honest experiences
- Help others make better purchasing decisions
- No affiliate links, no ads - just honest advice

### 4. Advanced Filtering & Search
- Filter by category (Smart Home, Wearables, Audio, etc.)
- Sort by regret score, marketing hype, or recent additions
- Search by product name, brand, or description

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **API**: Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DontBuyTech
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Create and migrate the database
npx prisma db push

# Seed with sample data
npm run db:seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Product
- Product information (name, manufacturer, category, price)
- Aggregate scores (regret, marketing hype, usefulness)
- Review count and metadata

### Review
- User experiences and stories
- Individual ratings (hype, usefulness, remorse)
- Purchase details and usage duration
- Upvote system for helpful reviews

### UseCase
- Intended use cases vs. reality
- Honest recommendations
- Better alternatives
- Potential savings

### Category
- Product categorization
- Icons and descriptions

## API Endpoints

### Products
- `GET /api/products` - List all products (with filtering and sorting)
- `GET /api/products/[id]` - Get product details with reviews
- `POST /api/products` - Submit a new product

### Reviews
- `POST /api/reviews` - Add a review to a product

### Categories
- `GET /api/categories` - List all categories

### Validator
- `POST /api/validator` - Validate a use case and get recommendations

## Project Structure

```
DontBuyTech/
├── app/
│   ├── api/              # API routes
│   │   ├── products/     # Product endpoints
│   │   ├── reviews/      # Review endpoints
│   │   ├── categories/   # Category endpoints
│   │   └── validator/    # Use case validator
│   ├── product/[id]/     # Product detail page
│   ├── submit/           # Product submission form
│   ├── validator/        # Use case validator page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page (product list)
│   └── globals.css       # Global styles
├── lib/
│   └── prisma.ts         # Prisma client instance
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── public/               # Static assets
```

## Key Features Explained

### Regret Score Calculation
The regret score (0-100) is calculated as the average of all user-submitted remorse levels. Higher scores indicate stronger buyer's remorse.

### Marketing Hype vs. Usefulness
- **Marketing Hype Score** (0-10): How overhyped the product was in marketing
- **Actual Usefulness Score** (0-10): How useful the product actually is in practice
- Large gaps between these scores indicate misleading marketing

### Use Case Validator Logic
The validator analyzes:
1. Similar products in the database
2. Matching use cases from other users
3. Average regret scores
4. Provides personalized recommendations and alternatives

## Contributing

We welcome contributions! To add a product:

1. Visit `/submit` on the website
2. Fill out the product details
3. Share your honest experience
4. Your submission helps others avoid the same mistake

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
```

## Future Enhancements

- User authentication and profiles
- Review voting and moderation system
- Product comparison tool
- Price tracking and alerts
- Mobile app
- API for third-party integrations
- Machine learning for better recommendations

## License

MIT License - see LICENSE file for details

## Disclaimer

This platform is for informational purposes only. Product experiences may vary. Always do your own research before making purchasing decisions.

---

Built with honesty, no affiliate links, no sponsored content - just real experiences from real people.
