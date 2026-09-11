/**
 * Creates MongoDB indexes required for race-safe order fulfillment.
 *
 * Usage (loads .env.local when present):
 *   npx tsx scripts/create-indexes.ts
 *
 * Or with explicit env:
 *   MONGODB_URI="mongodb+srv://..." MONGODB_DB_NAME="recipebooks" npx tsx scripts/create-indexes.ts
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main(): Promise<void> {
  loadEnvLocal();

  const { ensureOrderIndexes } = await import('../lib/db/order-indexes');
  const { ensureUserIndexes } = await import('../lib/db/users');
  const { ensureAnalyticsIndexes } = await import('../lib/db/analytics');
  const { getMongoDbName } = await import('../lib/mongodb');

  console.log('Creating indexes on database:', getMongoDbName());

  await ensureOrderIndexes();
  await ensureUserIndexes();
  await ensureAnalyticsIndexes();

  console.log('✅ Indexes ensured:');
  console.log('   - orders_paymentReferenceId_unique (unique)');
  console.log('   - orders_lemonSqueezyOrderId_unique (unique, sparse)');
  console.log('   - users_email_unique (unique)');
  console.log('   - page_views_daily_date_unique (unique)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed to create indexes:', error);
    process.exit(1);
  });
