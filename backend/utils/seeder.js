const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const connectDB = require('../config/db');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    phone: '9876543210',
  },
  {
    name: 'Vijay Kumar',
    email: 'vijay@example.com',
    password: 'password123',
    role: 'customer',
    phone: '8765432109',
  },
];

const categoriesData = [
  {
    name: 'Skin Care',
    slug: 'skin-care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    description: 'Nourishing clay masks, organic serums, and natural toners to bring out your skin’s natural glow.',
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop',
    description: 'Ayurvedic hair oils, sulfate-free herbal shampoos, and deep-conditioning botanicals.',
  },
  {
    name: 'Bath & Body',
    slug: 'bath-body',
    image: 'https://images.unsplash.com/photo-1607006342411-1a90d7dcdeae?q=80&w=600&auto=format&fit=crop',
    description: 'Handmade cold-pressed soaps, revitalizing body washes, and deep hydration lotions.',
  },
  {
    name: 'Fragrance & Wellness',
    slug: 'fragrance-wellness',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    description: 'Pure essential oils, mood-lifting botanical mists, and luxury aromatherapeutics.',
  },
];

const productsData = [
  // Skin Care
  {
    name: 'Kumkumadi Youth Elixir Facial Serum',
    slug: 'kumkumadi-youth-elixir-facial-serum',
    description: 'This classical Ayurvedic formulation is a blend of 21 precious herbs, including pure Kashmiri Saffron, Sandalwood, and Vetiver. Formulated to reduce pigmentation, dark spots, and signs of aging while imparting an instant golden radiance.',
    shortDescription: '100% natural night serum with pure Kashmiri Saffron for skin brightening and anti-aging.',
    price: 1299,
    discountPrice: 999,
    sku: 'SK-KUM-01',
    inventoryCount: 45,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1608248597481-496100c8c836?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.8,
    numReviews: 4,
    reviews: [
      { name: 'Aditi Sharma', rating: 5, title: 'Amazing glow!', comment: 'Been using this for two weeks and my skin feels incredibly soft. Dark spots are fading.' },
      { name: 'Rohan Gupta', rating: 4, title: 'Very nice', comment: 'Smells authentic, feels light. Good product.' },
    ],
  },
  {
    name: 'Rose & Vetiver Hydrating Toner',
    slug: 'rose-vetiver-hydrating-toner',
    description: 'Steam-distilled from fresh Kannauj roses and cooling vetiver roots, this alcohol-free facial mist tightens pores, balances pH, and provides instant hydration.',
    shortDescription: 'Alcohol-free pore-tightening rosewater mist for fresh and glowing skin.',
    price: 499,
    discountPrice: 399,
    sku: 'SK-ROS-02',
    inventoryCount: 120,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.6,
    numReviews: 2,
    reviews: [
      { name: 'Kriti Sen', rating: 5, title: 'Super refreshing!', comment: 'I spray it on in the middle of a workday and it wakes up my skin immediately.' },
    ],
  },
  {
    name: 'Neem & Tea Tree Clarifying Clay Mask',
    slug: 'neem-tea-tree-clarifying-clay-mask',
    description: 'Formulated with French Green Clay, Neem leaf extract, and organic Tea Tree oil, this cooling clay mask draws out deep impurities, calms active breakouts, and absorbs excess oil without drying the skin.',
    shortDescription: 'Purifying clay mask for oily and acne-prone skin.',
    price: 599,
    discountPrice: 0,
    sku: 'SK-NEE-03',
    inventoryCount: 60,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.4,
    numReviews: 2,
  },
  // Hair Care
  {
    name: 'Bhringraj & Amla Hair Vitalizing Oil',
    slug: 'bhringraj-amla-hair-vitalizing-oil',
    description: 'A traditional recipe containing handpicked herbs slow-brewed in cold-pressed Sesame oil. Infused with Bhringraj (king of hair) and vitamin-rich Amla to strengthen roots, control hair fall, and prevent premature graying.',
    shortDescription: 'Ayurvedic hair fall control oil with Bhringraj and Amla.',
    price: 749,
    discountPrice: 599,
    sku: 'HR-BHR-01',
    inventoryCount: 85,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.9,
    numReviews: 3,
  },
  {
    name: 'Sulfate-Free Hibiscus Herbal Shampoo',
    slug: 'sulfate-free-hibiscus-herbal-shampoo',
    description: 'A gentle, low-foaming cleanser enriched with fresh Hibiscus flowers, Shikakai, and Aloe Vera. Cleanses hair and scalp thoroughly while maintaining natural moisture levels, leaving hair silky and manageable.',
    shortDescription: 'Mild daily hair cleanser for shine and volume.',
    price: 649,
    discountPrice: 499,
    sku: 'HR-HIB-02',
    inventoryCount: 15,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.5,
    numReviews: 5,
  },
  // Bath & Body
  {
    name: 'Cold-Pressed Almond & Saffron Bathing Soap',
    slug: 'cold-pressed-almond-saffron-soap',
    description: 'Indulge in a luxurious bathing experience with our handcrafted cold-pressed soap. Enriched with sweet Almond oil, pure saffron threads, and raw honey to gently scrub, nourish, and soften your body.',
    shortDescription: 'Luxurious handcrafted soap for glowing and soft skin.',
    price: 299,
    discountPrice: 249,
    sku: 'BB-SOAP-01',
    inventoryCount: 200,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1607006342411-1a90d7dcdeae?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.7,
    numReviews: 12,
  },
  {
    name: 'Nourishing Shea Butter Body Lotion',
    slug: 'nourishing-shea-butter-body-lotion',
    description: 'Infused with raw Shea Butter, Cocoa Butter, and cold-pressed Coconut oil, this rich body lotion provides 24-hour hydration, repairing dry skin and leaving behind a sweet fragrance of warm vanilla.',
    shortDescription: 'Deep moisturizing lotion for dry skin repair.',
    price: 549,
    discountPrice: 449,
    sku: 'BB-LOT-02',
    inventoryCount: 0, // Mock out of stock
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'out_of_stock',
    rating: 4.3,
    numReviews: 1,
  },
  // Wellness & Fragrance
  {
    name: 'Pure Lavender Essential Oil',
    slug: 'pure-lavender-essential-oil',
    description: '100% steam-distilled Lavender (Lavandula angustifolia) essential oil. Known for its soothing, relaxing properties. Ideal for aromatherapy, diffusers, or diluting with a carrier oil for soothing body massage.',
    shortDescription: '100% Pure steam-distilled essential oil for stress relief.',
    price: 899,
    discountPrice: 799,
    sku: 'WL-LAV-01',
    inventoryCount: 50,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.8,
    numReviews: 8,
  },
  {
    name: 'Ubtan Radiant Face & Body Pack',
    slug: 'ubtan-radiant-face-body-pack',
    description: 'A traditional Ayurvedic ubtan paste containing turmeric, chickpea flour, sandalwood powder, and almond meal. Gently exfoliates dead skin cells, removes tan, and restores natural skin radiance.',
    shortDescription: 'Traditional exfoliating ubtan for natural tan removal and skin glow.',
    price: 699,
    discountPrice: 549,
    sku: 'SK-UBT-04',
    inventoryCount: 95,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.7,
    numReviews: 6,
  },
  {
    name: 'Red Onion & Black Seed Hair Mask',
    slug: 'red-onion-black-seed-hair-mask',
    description: 'An intensive conditioning treatment enriched with Red Onion extract and Black Seed oil. Strengthens the hair shaft, repairs damage from styling, and leaves hair visibly thicker and softer.',
    shortDescription: 'Intensive root strengthening and conditioning mask.',
    price: 849,
    discountPrice: 699,
    sku: 'HR-ONN-03',
    inventoryCount: 50,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.6,
    numReviews: 3,
  },
  {
    name: 'Soundarya Luxury Body Polish',
    slug: 'soundarya-luxury-body-polish',
    description: 'A sea salt and cane sugar scrub infused with pure sandalwood oil, rose petals, and almond paste. Polishes away dry skin flakes and wraps the body in a soothing, exotic fragrance.',
    shortDescription: 'Exfoliating sea salt and sandalwood body scrub.',
    price: 999,
    discountPrice: 849,
    sku: 'BB-SCRB-03',
    inventoryCount: 40,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1590156546746-c2240b5f164b?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.8,
    numReviews: 5,
  },
  {
    name: 'Pure Lemongrass Essential Oil',
    slug: 'pure-lemongrass-essential-oil',
    description: '100% steam-distilled Lemongrass essential oil. Refreshing citrus notes that uplift mood, repel insects, and cleanse the air when used in a diffuser.',
    shortDescription: 'Citrus aroma essential oil for ambient freshness.',
    price: 799,
    discountPrice: 649,
    sku: 'WL-LEM-02',
    inventoryCount: 80,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.5,
    numReviews: 4,
  },
  {
    name: 'Vitamin C & Kakadu Plum Brightening Serum',
    slug: 'vit-c-kakadu-plum-brightening-serum',
    description: 'A powerful antioxidant serum containing Kakadu Plum extract (the richest natural source of Vitamin C) and Hyaluronic Acid. Boosts collagen production, repairs UV damage, and targets hyperpigmentation for a clear, radiant skin tone.',
    shortDescription: 'Natural Vitamin C face serum for dark spots and skin glow.',
    price: 1199,
    discountPrice: 899,
    sku: 'SK-VITC-05',
    inventoryCount: 75,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.8,
    numReviews: 12,
  },
  {
    name: 'Kera-Restore Pea Peptide Hair Conditioner',
    slug: 'kera-restore-pea-peptide-conditioner',
    description: 'Formulated with plant-derived Pea Peptides, organic Argan oil, and coconut milk extracts. Reconstructs dry, brittle strands, increases elasticity, and shields hair against pollutant particles and heat styling.',
    shortDescription: 'Deep nourishment plant keratin conditioner for frizz control.',
    price: 699,
    discountPrice: 599,
    sku: 'HR-KER-04',
    inventoryCount: 90,
    brand: 'Pure Botanical',
    images: [
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
    ],
    stockStatus: 'in_stock',
    rating: 4.6,
    numReviews: 7,
  },
];

const couponsData = [
  {
    code: 'BOTANICAL15',
    discountType: 'percentage',
    discountValue: 15,
    minPurchase: 500,
    maxDiscount: 300,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
  },
  {
    code: 'FLAT100',
    discountType: 'fixed',
    discountValue: 100,
    minPurchase: 799,
    maxDiscount: 100,
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    isActive: true,
  },
];

const seedDB = async () => {
  // Safeguards to prevent accidental database wiping
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === 'true' || process.env.VERCEL) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: Seeding is disabled in Production or Vercel environments to prevent permanent data loss!');
    process.exit(1);
  }

  if (!process.argv.includes('--force')) {
    console.warn('\x1b[33m%s\x1b[0m', 'WARNING: Running this seeder will CLEAR your database (all products, categories, users, and coupons will be DELETED).');
    console.warn('If you are absolutely sure, run the command with the --force flag:');
    console.warn('\x1b[32m%s\x1b[0m', '  npm run seed -- --force');
    process.exit(0);
  }

  try {
    await connectDB();

    // 1. Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();

    console.log('Database cleared.');

    // 2. Insert Users (use create() one-by-one so bcrypt pre-save hook fires for password hashing)
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`Seeded ${createdUsers.length} users.`);

    // 3. Insert Coupons
    const createdCoupons = await Coupon.insertMany(couponsData);
    console.log(`Seeded ${createdCoupons.length} coupons.`);

    // 4. Insert Categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${createdCategories.length} categories.`);

    // Map category names to IDs
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 5. Map categories to products and insert
    const customerUser = createdUsers.find((u) => u.role === 'customer');
    const productsToSeed = productsData.map((prod) => {
      let categoryId;
      if (prod.sku.startsWith('SK')) {
        categoryId = categoryMap['Skin Care'];
      } else if (prod.sku.startsWith('HR')) {
        categoryId = categoryMap['Hair Care'];
      } else if (prod.sku.startsWith('BB')) {
        categoryId = categoryMap['Bath & Body'];
      } else {
        categoryId = categoryMap['Fragrance & Wellness'];
      }
      
      // Inject user ID into reviews if they exist
      const reviews = prod.reviews
        ? prod.reviews.map((r) => ({ ...r, user: customerUser._id }))
        : [];

      return { ...prod, category: categoryId, reviews };
    });

    const createdProducts = await Product.insertMany(productsToSeed);
    console.log(`Seeded ${createdProducts.length} products.`);

    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error(`Database Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
