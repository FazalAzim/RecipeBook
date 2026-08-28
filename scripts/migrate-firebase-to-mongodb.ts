/**
 * Standalone Migration & Database Seeding Script for RecipeBooks Market
 * Migrates initial recipe cookbooks and admin accounts to MongoDB.
 *
 * Usage:
 *   npx ts-node scripts/migrate-firebase-to-mongodb.ts
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipebooks';

const INITIAL_BOOKS = [
  {
    id: 'book-eu-dessert-01',
    title: 'Velvet Chocolate Mousse Cake Masterclass',
    author: 'Pastry Chef Claire Dupont',
    description:
      'Master elegant European-style chocolate mousse cakes from your home kitchen. Learn silky mousse layers, glossy ganache glazing, chocolate shard decoration, and professional plating—perfect for dinner parties and bakery-quality celebrations across Europe and the US.',
    category: 'Desserts & Baking',
    cuisine: 'French',
    tags: ['Chocolate', 'Mousse', 'Baking', 'Patisserie', 'Cakes', 'European'],
    price: 21.99,
    coverImageUrl: '/books/chocolate-mousse-cake-cover.png',
    pdfFileUrl: '',
    pdfFileName: 'Velvet_Chocolate_Mousse_Cake_Masterclass.pdf',
    fileSize: '7.4 MB',
    pageCount: 156,
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-01'),
    salesCount: 342,
    isPublished: true,
    featured: true,
    rating: 4.9,
    reviewCount: 88,
  },
  {
    id: 'book-it-02',
    title: 'Italian Homemade Pasta: The Nonna’s Handbook',
    author: 'Chef Marco Rossi',
    description: 'Master the timeless craft of artisanal pasta from scratch. From silky tagliatelle and hand-pinched tortellini to rich Tuscan ragù, Roman carbonara, and airy focaccia. Packed with high-resolution folding diagrams.',
    category: 'Italian & European',
    cuisine: 'Italian',
    tags: ['Pasta', 'Handmade', 'Comfort Food', 'Tuscan', 'Sauces'],
    price: 24.50,
    coverImageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169b?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Italian_Homemade_Pasta_Masterclass.pdf',
    fileSize: '8.2 MB',
    pageCount: 196,
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-02-10'),
    salesCount: 520,
    isPublished: true,
    featured: true,
    rating: 5.0,
    reviewCount: 142,
  },
  {
    id: 'book-med-03',
    title: 'Healthy Mediterranean: Sun-Drenched Everyday Meals',
    author: 'Dr. Elena Vasquez',
    description: 'Nourishing, heart-healthy recipes rich in extra virgin olive oil, crisp vegetables, fresh seafood, herbs, and vibrant citrus. Includes complete 30-day seasonal meal plans and dietitian nutritional breakdowns.',
    category: 'Mediterranean & Healthy',
    cuisine: 'Mediterranean',
    tags: ['Healthy', 'Olive Oil', 'Heart-Smart', 'Seafood', 'Salads', 'Clean Eating'],
    price: 18.00,
    coverImageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Healthy_Mediterranean_Cooking.pdf',
    fileSize: '5.1 MB',
    pageCount: 160,
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-14'),
    salesCount: 290,
    isPublished: true,
    featured: true,
    rating: 4.8,
    reviewCount: 64,
  },
  {
    id: 'book-des-05',
    title: 'Traditional Desserts & French Patisserie Master',
    author: 'Pastry Chef Claire Dupont',
    description: 'Precision pastry techniques demystified. Create flawless glossy fruit tarts, flaky croissants, cardamom gulab jamuns, velvety chocolate mousses, and elegant celebration cakes with confidence.',
    category: 'Desserts & Baking',
    cuisine: 'French',
    tags: ['Baking', 'Pastry', 'Desserts', 'Cakes', 'Sweet Treats', 'Chocolate'],
    price: 22.00,
    coverImageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Traditional_Desserts_and_Baking.pdf',
    fileSize: '9.6 MB',
    pageCount: 220,
    createdAt: new Date('2026-01-28'),
    updatedAt: new Date('2026-02-12'),
    salesCount: 180,
    isPublished: true,
    featured: false,
    rating: 4.9,
    reviewCount: 51,
  },
  {
    id: 'book-fam-06',
    title: 'Quick Family Meals: 30-Minute Weeknight Magic',
    author: 'Sarah Jenkins',
    description: 'Stress-free, kid-approved, one-pot and sheet-pan dinners that bring everyone together. Includes budget shopping guides, freezer-prep tips, and minimal cleanup techniques for busy households.',
    category: 'Quick & Family Meals',
    cuisine: 'American',
    tags: ['One Pot', 'Weeknight', 'Family Friendly', 'Budget', '30 Minutes'],
    price: 14.99,
    coverImageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    pdfFileUrl: '',
    pdfFileName: 'Quick_Family_Meals_30Min.pdf',
    fileSize: '3.9 MB',
    pageCount: 112,
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-18'),
    salesCount: 310,
    isPublished: true,
    featured: true,
    rating: 4.7,
    reviewCount: 73,
  }
];

async function main() {
  console.log('🚀 Starting MongoDB Migration & Seed Script...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB at:', MONGODB_URI);
    const db = client.db();

    // 1. Seed Books
    const booksCol = db.collection('books');
    for (const book of INITIAL_BOOKS) {
      await booksCol.updateOne(
        { id: book.id },
        { $set: book },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded/Updated ${INITIAL_BOOKS.length} recipe cookbooks.`);

    await booksCol.deleteMany({
      $or: [
        { id: { $in: ['book-pk-01', 'book-asia-04'] } },
        { category: { $in: ['Pakistani & South Asian', 'Asian & Street Food'] } },
      ],
    });
    console.log('✅ Removed deprecated Asian/Pakistani catalog books.');

    // 2. Seed Default Admin
    const usersCol = db.collection('users');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await usersCol.updateOne(
      { email: 'admin@recipebooks.com' },
      {
        $set: {
          id: 'admin-user-001',
          name: 'Master Chef Admin',
          email: 'admin@recipebooks.com',
          passwordHash: adminPasswordHash,
          role: 'admin',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log('✅ Admin account ensured: admin@recipebooks.com');

    console.log('🎉 Migration script completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.close();
  }
}

main();
