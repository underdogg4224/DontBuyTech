import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create categories
  const categories = [
    { name: 'Smart Home', description: 'IoT devices and home automation', icon: '🏠' },
    { name: 'Wearables', description: 'Smartwatches, fitness trackers, etc.', icon: '⌚' },
    { name: 'Audio', description: 'Headphones, speakers, earbuds', icon: '🎧' },
    { name: 'Computing', description: 'Laptops, tablets, accessories', icon: '💻' },
    { name: 'Gaming', description: 'Consoles, peripherals, accessories', icon: '🎮' },
    { name: 'Photography', description: 'Cameras, lenses, accessories', icon: '📷' },
    { name: 'Kitchen Tech', description: 'Smart appliances and gadgets', icon: '🍳' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  // Sample products with regrets
  const products = [
    {
      name: 'Smart Juice Press Pro',
      category: 'Kitchen Tech',
      manufacturer: 'JuiceCorp',
      msrp: 699.99,
      imageUrl: 'https://via.placeholder.com/400x300?text=Smart+Juice+Press',
      description: 'AI-powered juice press with app connectivity and subscription-based juice packs',
      whyPeopleRegret: 'Overpriced, requires expensive proprietary juice packs, DRM prevents using your own fruits, app constantly breaks, company shut down servers making it a $700 paperweight',
      marketingHypeScore: 9.5,
      actualUsefulnessScore: 2.0,
      remorseScore: 95,
      totalReviews: 847,
    },
    {
      name: 'VR Fitness Headset Ultra',
      category: 'Wearables',
      manufacturer: 'FitVR Inc',
      msrp: 549.99,
      imageUrl: 'https://via.placeholder.com/400x300?text=VR+Fitness+Headset',
      description: 'Virtual reality headset specifically designed for workout experiences',
      whyPeopleRegret: 'Heavy and uncomfortable for workouts, makes you sweat excessively, games are boring after a week, regular exercise is more effective and free',
      marketingHypeScore: 8.5,
      actualUsefulnessScore: 3.5,
      remorseScore: 78,
      totalReviews: 523,
    },
    {
      name: 'Smart Mirror Display',
      category: 'Smart Home',
      manufacturer: 'MirrorTech',
      msrp: 1499.99,
      imageUrl: 'https://via.placeholder.com/400x300?text=Smart+Mirror',
      description: 'Interactive smart mirror with workout classes, weather, news, and more',
      whyPeopleRegret: 'Extremely expensive for a screen you glance at once a day, requires monthly subscription, cheaper to use a phone propped on the counter',
      marketingHypeScore: 9.0,
      actualUsefulnessScore: 2.5,
      remorseScore: 88,
      totalReviews: 312,
    },
    {
      name: 'Premium Wireless Earbuds X',
      category: 'Audio',
      manufacturer: 'AudioLux',
      msrp: 299.99,
      imageUrl: 'https://via.placeholder.com/400x300?text=Premium+Earbuds',
      description: 'High-end wireless earbuds with active noise cancellation and premium sound',
      whyPeopleRegret: 'Sound quality barely better than $50 alternatives, easy to lose, battery dies after 1 year, you already had decent headphones',
      marketingHypeScore: 7.5,
      actualUsefulnessScore: 5.5,
      remorseScore: 62,
      totalReviews: 1893,
    },
    {
      name: 'Gaming RGB Mechanical Keyboard Elite',
      category: 'Gaming',
      manufacturer: 'GameTech Pro',
      msrp: 249.99,
      imageUrl: 'https://via.placeholder.com/400x300?text=RGB+Keyboard',
      description: 'Professional gaming keyboard with customizable RGB lighting and mechanical switches',
      whyPeopleRegret: 'RGB lighting is distracting, mechanical switches are too loud for office, doesnt make you better at games, $50 keyboard works just as well',
      marketingHypeScore: 8.0,
      actualUsefulnessScore: 6.0,
      remorseScore: 55,
      totalReviews: 1247,
    },
    {
      name: 'AI Smart Pet Feeder',
      category: 'Smart Home',
      manufacturer: 'PetTech Solutions',
      msrp: 199.99,
      imageUrl: 'https://via.placeholder.com/400x300?text=Smart+Pet+Feeder',
      description: 'AI-powered automatic pet feeder with camera, portion control, and smartphone app',
      whyPeopleRegret: 'Pet figured out how to trick the sensors, app connectivity is unreliable, $15 gravity feeder does the same job, camera quality is terrible',
      marketingHypeScore: 7.0,
      actualUsefulnessScore: 4.0,
      remorseScore: 68,
      totalReviews: 678,
    },
  ]

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    })

    // Add sample reviews for each product
    const reviewsCount = Math.floor(Math.random() * 3) + 2 // 2-4 reviews per product

    for (let i = 0; i < reviewsCount; i++) {
      await prisma.review.create({
        data: {
          productId: product.id,
          authorName: `User${Math.floor(Math.random() * 1000)}`,
          purchasePrice: product.msrp * (0.7 + Math.random() * 0.3),
          purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          usageDuration: ['1 month', '3 months', '6 months', '1 year', '2 years'][Math.floor(Math.random() * 5)],
          story: getRandomStory(product.name),
          whatTheyWanted: 'To improve my life and solve a problem',
          whatTheyActuallyUsed: 'Nothing, it sits in a drawer',
          marketingHypeRating: Math.floor(product.marketingHypeScore),
          actualUsefulnessRating: Math.floor(product.actualUsefulnessScore),
          remorseLevel: Math.floor(product.remorseScore * (0.8 + Math.random() * 0.4)),
          wouldRecommend: product.actualUsefulnessScore > 5,
          upvotes: Math.floor(Math.random() * 100),
        },
      })
    }

    // Add use cases
    await prisma.useCase.create({
      data: {
        productId: product.id,
        intendedUseCase: getIntendedUseCase(product.category),
        recommendation: 'Save your money. You probably don\'t need this.',
        alternatives: getAlternatives(product.category),
        moneySaved: product.msrp * 0.8,
      },
    })
  }

  console.log('Seeding finished.')
}

function getRandomStory(productName: string): string {
  const stories = [
    `I bought the ${productName} thinking it would change my life. It didn't. Now it collects dust.`,
    `The marketing made it look amazing. Reality was disappointing. Wish I could get my money back.`,
    `Used it twice, then forgot about it. Total waste of money. Should have bought something practical.`,
    `It looked so cool in the ads. In real life, it's just overpriced junk that doesn't work well.`,
    `I fell for the hype. Don't make the same mistake. Save your money for something useful.`,
  ]
  return stories[Math.floor(Math.random() * stories.length)]
}

function getIntendedUseCase(category: string): string {
  const useCases: Record<string, string> = {
    'Kitchen Tech': 'Make healthy juices and smoothies every day',
    'Wearables': 'Track fitness and stay motivated to exercise',
    'Smart Home': 'Automate my home and make life more convenient',
    'Audio': 'Enjoy high-quality music on the go',
    'Gaming': 'Improve gaming performance and experience',
    'Computing': 'Be more productive and efficient',
    'Photography': 'Take professional-quality photos',
  }
  return useCases[category] || 'Improve my daily life'
}

function getAlternatives(category: string): string {
  const alternatives: Record<string, string> = {
    'Kitchen Tech': 'A regular blender for $30, or just eat whole fruits',
    'Wearables': 'Free fitness apps on your phone, or just go for a walk',
    'Smart Home': 'Do it manually, it takes 5 seconds and costs nothing',
    'Audio': 'Quality $50 earbuds work just as well for most people',
    'Gaming': 'Practice and skill matter more than expensive gear',
    'Computing': 'Your current device probably works fine',
    'Photography': 'Modern smartphone cameras are incredibly good',
  }
  return alternatives[category] || 'Think carefully if you really need this'
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
