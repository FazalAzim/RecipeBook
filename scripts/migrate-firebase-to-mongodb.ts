/**
 * Standalone database maintenance for RecipeBooks Market.
 * Removes legacy demo cookbooks. Does NOT create default passwords/users.
 *
 * Create an admin with:
 *   npm run create-admin
 *
 * Usage:
 *   npx ts-node scripts/migrate-firebase-to-mongodb.ts
 */

import { MongoClient } from 'mongodb';

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
  console.log('🚀 Starting MongoDB maintenance script...');
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

    // Remove known insecure demo accounts if they still exist
    const usersCol = db.collection('users');
    const demoEmails = ['admin@recipebooks.com', 'customer@recipebooks.com'];
    const removedUsers = await usersCol.deleteMany({ email: { $in: demoEmails } });
    if (removedUsers.deletedCount > 0) {
      console.log(`✅ Removed ${removedUsers.deletedCount} legacy demo user account(s).`);
    }

    await usersCol.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });
    console.log('✅ Ensured unique index on users.email');

    console.log('🎉 Maintenance completed. Create an admin with: npm run create-admin');
  } catch (err) {
    console.error('❌ Setup failed:', err);
  } finally {
    await client.close();
  }
}

main();
