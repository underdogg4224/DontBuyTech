# DontBuyTech - Smart Tech Comparison Engine

Make informed tech purchases with intelligent product comparisons, marketing gimmick detection, and longevity predictions.

## Features

### 1. Smart Tech Comparison Engine
An intelligent comparison tool that provides:

- **Plain-Language Spec Comparisons**: Compares technical specifications with easy-to-understand explanations
- **Marketing Gimmick Detection**: Identifies marketing buzzwords and features that offer minimal real-world benefit
- **Real Improvement Highlighting**: Focuses on meaningful upgrades that actually matter
- **Year-over-Year Analysis**: Special analysis for comparing successive generations of the same product line
- **Upgrade Recommendations**: Data-driven recommendations on whether an upgrade is worth it (scored 1-10)

### 2. Price History Tracking & Best Time to Buy
- **Price History Visualization**: Track how prices change over time
- **Predictive Pricing**: Estimates future price ranges based on historical data
- **Best Time to Buy Recommendations**: Intelligent suggestions on when to purchase
- **Seasonal Buying Guides**: Month-by-month recommendations for the best deals
- **Confidence Ratings**: Transparency about prediction accuracy

### 3. Longevity Predictions
Based on comprehensive analysis:
- **Support Lifecycle**: Official software support timelines
- **Repairability Scores**: How easy and cost-effective repairs will be
- **Expected Lifespan**: Real-world durability predictions
- **Long-term Value Analysis**: Total cost of ownership considerations
- **Positive and Negative Factors**: Transparent breakdown of longevity drivers

### 4. Marketing Gimmick Detection
Automatically identifies:
- Minimal battery improvements marketed as "all-day battery"
- Megapixel increases that don't improve photo quality
- Processor name changes without performance gains
- Weight differences too small to notice
- Other common marketing tricks

### 5. Comprehensive Product Database
- Detailed specifications for all products
- Multiple categories (Smartphones, Laptops, Tablets, etc.)
- Release dates, pricing, and support information
- Repairability scores and warranty details

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Layer**: Mock database (easily replaceable with real database)
- **API**: RESTful API routes

## Project Structure

```
DontBuyTech/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API endpoints
│   │   │   ├── compare/       # Comparison engine API
│   │   │   ├── products/      # Product CRUD operations
│   │   │   ├── categories/    # Category endpoints
│   │   │   └── price-history/ # Price tracking API
│   │   ├── compare/           # Comparison page
│   │   ├── products/          # Product listing page
│   │   ├── price-tracker/     # Price tracking page
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ComparisonView.tsx
│   │   ├── PricePrediction.tsx
│   │   └── LongevityView.tsx
│   ├── lib/                   # Core logic
│   │   ├── comparison-engine.ts     # Intelligent comparison logic
│   │   ├── price-prediction.ts      # Price analysis algorithms
│   │   ├── longevity-prediction.ts  # Longevity assessment
│   │   └── db.ts                    # Database layer
│   └── types/                 # TypeScript type definitions
└── prisma/                    # Database schema (for future use)
```

## Core Algorithms

### Comparison Engine (`src/lib/comparison-engine.ts`)
- Spec-by-spec comparison with improvement classification
- Marketing gimmick pattern matching
- Plain-language explanation generation
- Year-over-year analysis for product generations
- Upgrade scoring algorithm (1-10 scale)

### Price Prediction (`src/lib/price-prediction.ts`)
- Historical price trend analysis
- Seasonal buying pattern recognition
- Price volatility calculations
- Best time to buy recommendations
- Confidence level assessment

### Longevity Prediction (`src/lib/longevity-prediction.ts`)
- Support lifecycle analysis
- Repairability impact assessment
- Category-specific lifespan predictions
- Specification-based longevity factors
- Comprehensive scoring system

## API Endpoints

### Products
- `GET /api/products` - List all products (optional: filter by categoryId)
- `GET /api/products/[id]` - Get single product

### Categories
- `GET /api/categories` - List all categories

### Comparison
- `GET /api/compare?product1Id={id}&product2Id={id}` - Compare two products

### Price History
- `GET /api/price-history/[productId]` - Get price history for a product

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Sample Data

The application includes sample data for demonstration:
- 3 categories (Smartphones, Laptops, Tablets)
- 3 products (2 phones, 1 laptop)
- Price history data
- Complete specifications for comparisons

## Future Enhancements

### Database Integration
Replace the mock database with a real database:
1. Set up PostgreSQL/MySQL
2. Configure Prisma (schema already created in `prisma/schema.prisma`)
3. Update `src/lib/db.ts` to use Prisma Client

### Additional Features
- User accounts and saved comparisons
- User reviews and ratings
- Community-driven repairability scores
- Real-time price scraping
- Email alerts for price drops
- Mobile app
- Browser extension for inline comparisons
- AI-powered Q&A about products

### Data Sources
- Integrate with retail APIs (Amazon, Best Buy, etc.)
- Manufacturer specifications databases
- iFixit repairability data
- Community contributions

## Marketing Gimmick Patterns Detected

The engine identifies these common marketing tricks:
1. **Battery**: <100mAh difference marketed as major improvement
2. **Camera**: Megapixel increases above 12MP without sensor improvements
3. **Processor**: Name changes without significant performance gains
4. **RAM**: <2GB increases marketed as "blazing fast"
5. **Weight**: <10g differences marketed as "ultra-lightweight"
6. **Charging**: <5W charging speed differences
7. **Buzzword Detection**: "AI-powered," "revolutionary," etc.

## Contributing

This is a demonstration project. For production use:
1. Replace mock data with real database
2. Add authentication and authorization
3. Implement rate limiting on API endpoints
4. Add comprehensive error handling
5. Implement caching strategies
6. Add automated testing

## License

MIT License - see LICENSE file for details

## About

DontBuyTech helps consumers make informed technology purchases by cutting through marketing hype and providing data-driven, plain-language analysis of product comparisons.
