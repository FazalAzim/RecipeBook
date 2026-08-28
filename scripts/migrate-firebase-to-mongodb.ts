/**
 * Standalone database setup script for RecipeBooks Market.
 * Ensures the default admin account and removes legacy demo cookbooks.
 *
 * Usage:
 *   npx ts-node scripts/migrate-firebase-to-mongodb.ts
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipebooks';

const LEGACY_SEED_BOOK_IDS = [
  'book-pk-01',
  'book-asia-04',
  'book-it-02',
  'book-med-03',
  'book-des-05',
  'book-fam-06',
  'book-eu-dessert-01',
];

async function main() {
  console.log('🚀 Starting MongoDB setup script...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB at:', MONGODB_URI);
    const db = client.db();

    const booksCol = db.collection('books');
    const purgeResult = await booksCol.deleteMany({
      $or: [
        { id: { $in: LEGACY_SEED_BOOK_IDS } },
        { category: { $in: ['Pakistani & South Asian', 'Asian & Street Food'] } },
      ],
    });
    console.log(`✅ Removed ${purgeResult.deletedCount} legacy demo cookbook(s).`);

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

    console.log('🎉 Setup script completed successfully!');
  } catch (err) {
    console.error('❌ Setup failed:', err);
  } finally {
    await client.close();
  }
}

main();
