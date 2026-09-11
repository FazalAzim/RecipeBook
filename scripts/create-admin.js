/**
 * Creates a single admin user from environment variables.
 * Does NOT hardcode passwords. Safe for local + production setup.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='strong-password' ADMIN_NAME='Site Admin' npm run create-admin
 *
 * Or set those keys in .env.local and run:
 *   npm run create-admin
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const sep = trimmed.indexOf('=');
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    const value = trimmed.slice(sep + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function sanitizeMongoUri(raw) {
  return String(raw || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\r?\n/g, '');
}

async function main() {
  loadEnvLocal();

  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = (process.env.ADMIN_NAME || 'Site Admin').trim();
  const uri = sanitizeMongoUri(process.env.MONGODB_URI);
  const dbName = (process.env.MONGODB_DB_NAME || '').trim() || undefined;

  if (!uri) {
    console.error('❌ MONGODB_URI is required.');
    process.exit(1);
  }
  if (!email || !email.includes('@')) {
    console.error('❌ ADMIN_EMAIL is required (valid email).');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  await users.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });

  const existing = await users.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.log(`ℹ️  Admin already exists: ${email}`);
      const demoEmails = ['admin@recipebooks.com', 'customer@recipebooks.com'];
      const purge = await users.deleteMany({
        email: { $in: demoEmails.filter((e) => e !== email) },
      });
      if (purge.deletedCount > 0) {
        console.log(`🧹 Removed ${purge.deletedCount} legacy demo account(s).`);
      }
      await client.close();
      process.exit(0);
    }
    console.error(`❌ User ${email} already exists with role "${existing.role}". Choose another ADMIN_EMAIL.`);
    await client.close();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();
  const id = `usr-admin-${Date.now().toString(36)}`;

  await users.insertOne({
    id,
    name,
    email,
    passwordHash,
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  });

  // Remove known insecure demo accounts from older seeds (never delete the account we just created)
  const demoEmails = ['admin@recipebooks.com', 'customer@recipebooks.com'].filter((e) => e !== email);
  if (demoEmails.length > 0) {
    const purge = await users.deleteMany({ email: { $in: demoEmails } });
    if (purge.deletedCount > 0) {
      console.log(`🧹 Removed ${purge.deletedCount} legacy demo account(s).`);
    }
  }

  console.log('✅ Admin user created:');
  console.log(`   email: ${email}`);
  console.log(`   name:  ${name}`);
  console.log('   Sign in at /admin/login');

  await client.close();
}

main().catch((err) => {
  console.error('❌ Failed to create admin:', err);
  process.exit(1);
});
