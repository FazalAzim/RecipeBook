/**
 * Prints a safe env status (no secret values).
 * Plain Node — no tsx required.
 *
 * Usage:
 *   npm run env:check
 */

const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env.local not found. Copy from .env.example first.');
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = rawValue;
  }
}

function trimEnv(value) {
  return (value || '').trim();
}

function getAppUrl() {
  return trimEnv(process.env.NEXT_PUBLIC_APP_URL) || 'http://localhost:3000';
}

function getLemonMode() {
  return trimEnv(process.env.LEMON_SQUEEZY_MODE).toLowerCase() === 'test' ? 'test' : 'live';
}

function getLemonApiKey() {
  const mode = getLemonMode();
  const modeKey =
    mode === 'test'
      ? trimEnv(process.env.LEMON_SQUEEZY_API_KEY_TEST)
      : trimEnv(process.env.LEMON_SQUEEZY_API_KEY_LIVE);
  return modeKey || trimEnv(process.env.LEMON_SQUEEZY_API_KEY);
}

function getLemonVariantId() {
  const mode = getLemonMode();
  const modeVariant =
    mode === 'test'
      ? trimEnv(process.env.LEMON_SQUEEZY_VARIANT_ID_TEST)
      : trimEnv(process.env.LEMON_SQUEEZY_VARIANT_ID_LIVE);
  return modeVariant || trimEnv(process.env.LEMON_SQUEEZY_VARIANT_ID);
}

function yes(ok) {
  return ok ? '✅ set' : '❌ missing';
}

loadEnvLocal();

const appUrl = getAppUrl();
const isLocal = appUrl.includes('localhost') || appUrl.includes('127.0.0.1');
const lemonMode = getLemonMode();

console.log('\nRecipeBooks env check\n');
console.log(`  App URL          ${appUrl}`);
console.log(`  Target           ${isLocal ? 'LOCAL' : 'REMOTE / Vercel-style'}`);
const activeVariant = getLemonVariantId();
console.log(`  Lemon mode       ${lemonMode.toUpperCase()}`);
console.log(`  Lemon variant    ${activeVariant || '(missing)'} (${lemonMode})`);
console.log(`  MongoDB          ${yes(Boolean(trimEnv(process.env.MONGODB_URI)))}`);
console.log(
  `  Cloudflare R2    ${yes(
    Boolean(
      trimEnv(process.env.CLOUDFLARE_R2_ENDPOINT) &&
        trimEnv(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) &&
        trimEnv(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY)
    )
  )}`
);
console.log(`  Lemon API key    ${yes(Boolean(getLemonApiKey()))}`);
console.log(`  Lemon store ID   ${yes(Boolean(trimEnv(process.env.LEMON_SQUEEZY_STORE_ID)))}`);
console.log(`  Lemon variant    ${yes(Boolean(activeVariant))}`);
console.log(`  Lemon webhook    ${yes(Boolean(trimEnv(process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)))}`);
console.log(`  AUTH_SECRET      ${yes(Boolean(trimEnv(process.env.AUTH_SECRET)))}`);
console.log('\nTip: flip LEMON_SQUEEZY_MODE=test|live in .env.local, then restart npm run dev.');
console.log('Vercel live: set LEMON_SQUEEZY_VARIANT_ID=2107466 (not the test ID 2083597).\n');
