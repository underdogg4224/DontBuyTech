/**
 * Database Seed Script
 * Populates the database with test data for development and testing
 *
 * Run with: npm run db:seed
 */

import 'dotenv/config';
import { db, migrationClient } from './index';
import { categories, deals, votes } from './schema';
import { sql } from 'drizzle-orm';

// Helper to calculate discount percentage
function calculateDiscount(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100);
}

// Helper to create dates relative to now
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await db.delete(votes);
    await db.delete(deals);
    await db.delete(categories);
    console.log('✅ Existing data cleared\n');

    // Seed Categories
    console.log('📁 Seeding categories...');
    const categoriesData = [
      {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Portable computers for work, gaming, and everyday use',
        icon: 'laptop',
      },
      {
        name: 'Monitors',
        slug: 'monitors',
        description: 'Desktop displays for productivity and entertainment',
        icon: 'monitor',
      },
      {
        name: 'Keyboards',
        slug: 'keyboards',
        description: 'Mechanical and membrane keyboards for typing and gaming',
        icon: 'keyboard',
      },
      {
        name: 'Mice',
        slug: 'mice',
        description: 'Computer mice for precision and comfort',
        icon: 'mouse',
      },
      {
        name: 'Headphones',
        slug: 'headphones',
        description: 'Audio devices for music, gaming, and calls',
        icon: 'headphones',
      },
    ];

    const insertedCategories = await db
      .insert(categories)
      .values(categoriesData)
      .returning();

    console.log(`✅ Seeded ${insertedCategories.length} categories\n`);

    // Create a map of category slug to ID for easy reference
    const categoryMap = insertedCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, string>);

    // Seed Deals
    console.log('💰 Seeding deals...');

    const dealsData = [
      // Laptops (3 deals)
      {
        title: 'Dell XPS 13 - Ultra-thin 13.3" FHD+ Laptop',
        description: 'Intel Core i7-1355U, 16GB RAM, 512GB SSD. Perfect for professionals who need portability without compromising performance. Features InfinityEdge display and premium build quality.',
        price: '899.99',
        original_price: '1299.99',
        discount_percentage: calculateDiscount(1299.99, 899.99),
        url: 'https://example.com/dell-xps-13',
        image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
        category_id: categoryMap.laptops,
        brand: 'Dell',
        score: 156.8,
        votes_count: 42,
        expires_at: daysFromNow(7), // Active - expires in 7 days
        archived: false,
      },
      {
        title: 'ASUS ROG Zephyrus G14 Gaming Laptop - 14" QHD 165Hz',
        description: 'AMD Ryzen 9 7940HS, NVIDIA RTX 4060, 32GB DDR5, 1TB SSD. Compact gaming powerhouse with exceptional battery life. Perfect for gamers who travel.',
        price: '1399.99',
        original_price: '1999.99',
        discount_percentage: calculateDiscount(1999.99, 1399.99),
        url: 'https://example.com/asus-rog-g14',
        image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302',
        category_id: categoryMap.laptops,
        brand: 'ASUS',
        score: 234.5,
        votes_count: 67,
        expires_at: daysFromNow(2), // Expiring soon - 2 days
        archived: false,
      },
      {
        title: 'MacBook Air M2 - 13.6" Liquid Retina Display',
        description: 'Apple M2 chip, 8GB RAM, 256GB SSD. Fanless design, all-day battery life, and stunning display. The ultimate ultraportable for Apple ecosystem users.',
        price: '949.00',
        original_price: '1199.00',
        discount_percentage: calculateDiscount(1199.00, 949.00),
        url: 'https://example.com/macbook-air-m2',
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        category_id: categoryMap.laptops,
        brand: 'Apple',
        score: 89.3,
        votes_count: 28,
        expires_at: daysFromNow(-3), // Expired - 3 days ago
        archived: false,
      },

      // Monitors (3 deals)
      {
        title: 'LG 27" UltraGear QHD Gaming Monitor - 165Hz 1ms',
        description: '2560x1440 resolution, NVIDIA G-SYNC Compatible, HDR10. IPS panel with 98% DCI-P3 color gamut. Ideal for competitive gaming and content creation.',
        price: '279.99',
        original_price: '449.99',
        discount_percentage: calculateDiscount(449.99, 279.99),
        url: 'https://example.com/lg-ultragear-27',
        image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
        category_id: categoryMap.monitors,
        brand: 'LG',
        score: 198.7,
        votes_count: 54,
        expires_at: daysFromNow(14), // Active - 14 days
        archived: false,
      },
      {
        title: 'Dell UltraSharp 32" 4K USB-C Hub Monitor',
        description: '3840x2160 IPS Black, 99% sRGB, Thunderbolt 4. Built-in KVM and RJ45. Perfect productivity monitor with excellent color accuracy for professionals.',
        price: '549.99',
        original_price: '799.99',
        discount_percentage: calculateDiscount(799.99, 549.99),
        url: 'https://example.com/dell-ultrasharp-32',
        image_url: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2',
        category_id: categoryMap.monitors,
        brand: 'Dell',
        score: 167.2,
        votes_count: 45,
        expires_at: daysFromNow(5), // Active - 5 days
        archived: false,
      },
      {
        title: 'Samsung Odyssey G7 28" 4K UHD 144Hz Gaming Monitor',
        description: 'IPS panel, 1ms response, HDMI 2.1, AMD FreeSync Premium Pro. CoreSync lighting and height-adjustable stand. Great for PS5/Xbox Series X.',
        price: '399.99',
        original_price: '649.99',
        discount_percentage: calculateDiscount(649.99, 399.99),
        url: 'https://example.com/samsung-odyssey-g7',
        image_url: 'https://images.unsplash.com/photo-1527443195645-1133f7f28990',
        category_id: categoryMap.monitors,
        brand: 'Samsung',
        score: 45.1,
        votes_count: 15,
        expires_at: daysFromNow(-1), // Expired - 1 day ago
        archived: false,
      },

      // Keyboards (3 deals)
      {
        title: 'Keychron K8 Pro Wireless Mechanical Keyboard',
        description: 'Hot-swappable switches, RGB backlight, QMK/VIA support. Aluminum frame with Mac and Windows compatibility. Includes Gateron switches.',
        price: '89.99',
        original_price: '119.99',
        discount_percentage: calculateDiscount(119.99, 89.99),
        url: 'https://example.com/keychron-k8-pro',
        image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
        category_id: categoryMap.keyboards,
        brand: 'Keychron',
        score: 312.4,
        votes_count: 89,
        expires_at: daysFromNow(10), // Active - 10 days
        archived: false,
      },
      {
        title: 'Logitech MX Keys Advanced Wireless Keyboard',
        description: 'Perfect-stroke keys, smart illumination, USB-C rechargeable. Multi-device connectivity (3 devices). Premium typing experience for professionals.',
        price: '79.99',
        original_price: '129.99',
        discount_percentage: calculateDiscount(129.99, 79.99),
        url: 'https://example.com/logitech-mx-keys',
        image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212',
        category_id: categoryMap.keyboards,
        brand: 'Logitech',
        score: 203.9,
        votes_count: 61,
        expires_at: daysFromNow(1), // Expiring very soon - 1 day
        archived: false,
      },
      {
        title: 'Razer BlackWidow V3 Pro - Wireless Mechanical Gaming Keyboard',
        description: 'Razer Green switches, Chroma RGB, 200-hour battery life. Tournament-grade performance with wireless freedom. HyperSpeed wireless technology.',
        price: '149.99',
        original_price: '229.99',
        discount_percentage: calculateDiscount(229.99, 149.99),
        url: 'https://example.com/razer-blackwidow-v3',
        image_url: 'https://images.unsplash.com/photo-1560762484-813fc97650a0',
        category_id: categoryMap.keyboards,
        brand: 'Razer',
        score: 123.6,
        votes_count: 38,
        expires_at: daysFromNow(21), // Active - 21 days
        archived: false,
      },

      // Mice (3 deals)
      {
        title: 'Logitech MX Master 3S - Wireless Performance Mouse',
        description: 'Ultra-quiet clicks, 8K DPI sensor, USB-C quick charging. Ergonomic design with thumb scroll wheel. Perfect for productivity and creative work.',
        price: '79.99',
        original_price: '99.99',
        discount_percentage: calculateDiscount(99.99, 79.99),
        url: 'https://example.com/logitech-mx-master-3s',
        image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
        category_id: categoryMap.mice,
        brand: 'Logitech',
        score: 267.3,
        votes_count: 73,
        expires_at: daysFromNow(4), // Active - 4 days
        archived: false,
      },
      {
        title: 'Razer DeathAdder V3 Pro - Wireless Gaming Mouse',
        description: 'Focus Pro 30K sensor, 90-hour battery, optical switches Gen-3. Only 63g weight. Esports-grade performance with HyperSpeed wireless.',
        price: '99.99',
        original_price: '149.99',
        discount_percentage: calculateDiscount(149.99, 99.99),
        url: 'https://example.com/razer-deathadder-v3',
        image_url: 'https://images.unsplash.com/photo-1563297007-0686b7003af7',
        category_id: categoryMap.mice,
        brand: 'Razer',
        score: 189.4,
        votes_count: 52,
        expires_at: daysFromNow(8), // Active - 8 days
        archived: false,
      },
      {
        title: 'Logitech G502 X Plus - Wireless RGB Gaming Mouse',
        description: 'LIGHTFORCE hybrid switches, HERO 25K sensor, 13 programmable buttons. Adjustable weight system and LIGHTSYNC RGB.',
        price: '119.99',
        original_price: '159.99',
        discount_percentage: calculateDiscount(159.99, 119.99),
        url: 'https://example.com/logitech-g502-x',
        image_url: 'https://images.unsplash.com/photo-1586920740099-e22c6f59d6c4',
        category_id: categoryMap.mice,
        brand: 'Logitech',
        score: 78.2,
        votes_count: 24,
        expires_at: daysFromNow(-5), // Expired - 5 days ago
        archived: false,
      },

      // Headphones (3 deals)
      {
        title: 'Sony WH-1000XM5 - Premium Noise Cancelling Headphones',
        description: 'Industry-leading ANC, 30-hour battery, multipoint connection. Crystal-clear calls with 4 mics. Exceptional sound quality with LDAC support.',
        price: '299.99',
        original_price: '399.99',
        discount_percentage: calculateDiscount(399.99, 299.99),
        url: 'https://example.com/sony-wh1000xm5',
        image_url: 'https://images.unsplash.com/photo-1545127398-14699f92334b',
        category_id: categoryMap.headphones,
        brand: 'Sony',
        score: 423.7,
        votes_count: 112,
        expires_at: daysFromNow(3), // Active - 3 days
        archived: false,
      },
      {
        title: 'SteelSeries Arctis Nova Pro Wireless - Gaming Headset',
        description: 'Dual wireless (2.4GHz + Bluetooth), Active Noise Cancellation, hot-swap battery system. 360° Spatial Audio. Premium gaming audio experience.',
        price: '279.99',
        original_price: '399.99',
        discount_percentage: calculateDiscount(399.99, 279.99),
        url: 'https://example.com/steelseries-arctis-nova',
        image_url: 'https://images.unsplash.com/photo-1599669454699-248893623440',
        category_id: categoryMap.headphones,
        brand: 'SteelSeries',
        score: 156.9,
        votes_count: 47,
        expires_at: daysFromNow(12), // Active - 12 days
        archived: false,
      },
      {
        title: 'Bose QuietComfort 45 - Wireless Noise Cancelling Headphones',
        description: 'Legendary noise cancellation, Aware Mode, 24-hour battery. Premium comfort for all-day wear. Crisp, balanced audio with adjustable EQ.',
        price: '229.99',
        original_price: '329.99',
        discount_percentage: calculateDiscount(329.99, 229.99),
        url: 'https://example.com/bose-qc45',
        image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944',
        category_id: categoryMap.headphones,
        brand: 'Bose',
        score: 134.5,
        votes_count: 41,
        expires_at: daysFromNow(18), // Active - 18 days
        archived: false,
      },
    ];

    const insertedDeals = await db
      .insert(deals)
      .values(dealsData)
      .returning();

    console.log(`✅ Seeded ${insertedDeals.length} deals\n`);

    // Seed Votes
    console.log('👍 Seeding votes...');

    // Sample user IDs for testing
    const sampleUsers = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'user_006', 'user_007', 'user_008'];

    const votesData = [];

    // Generate realistic voting patterns
    // Popular deals get more votes, mix of upvotes and downvotes
    for (const deal of insertedDeals) {
      const numVoters = Math.floor(deal.votes_count / 2); // Some users voted

      for (let i = 0; i < numVoters && i < sampleUsers.length; i++) {
        // Most votes are upvotes (80%), some downvotes (20%)
        const voteType = Math.random() < 0.8 ? 1 : -1;

        votesData.push({
          deal_id: deal.id,
          user_id: sampleUsers[i],
          vote_type: voteType,
        });
      }
    }

    if (votesData.length > 0) {
      await db.insert(votes).values(votesData);
      console.log(`✅ Seeded ${votesData.length} votes\n`);
    }

    // Summary
    console.log('📊 Seed Summary:');
    console.log('================');
    console.log(`Categories: ${insertedCategories.length}`);
    console.log(`Deals: ${insertedDeals.length}`);
    console.log(`  - Active deals: ${insertedDeals.filter(d => !d.archived && d.expires_at && d.expires_at > new Date()).length}`);
    console.log(`  - Expiring soon (<3 days): ${insertedDeals.filter(d => d.expires_at && d.expires_at > new Date() && d.expires_at <= daysFromNow(3)).length}`);
    console.log(`  - Expired deals: ${insertedDeals.filter(d => d.expires_at && d.expires_at < new Date()).length}`);
    console.log(`Votes: ${votesData.length}`);
    console.log('');
    console.log('✨ Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    // Close the connection
    await migrationClient.end();
    process.exit(0);
  }
}

// Run the seed function
seed();
