/**
 * Shared env helpers for local vs Vercel, and Lemon Squeezy test vs live.
 */

export type LemonSqueezyMode = 'test' | 'live';

function trimEnv(value: string | undefined): string {
  return (value || '').trim();
}

export function getAppUrl(): string {
  return trimEnv(process.env.NEXT_PUBLIC_APP_URL) || 'http://localhost:3000';
}

export function isLocalAppUrl(): boolean {
  const url = getAppUrl().toLowerCase();
  return url.includes('localhost') || url.includes('127.0.0.1');
}

export function getLemonSqueezyMode(): LemonSqueezyMode {
  const mode = trimEnv(process.env.LEMON_SQUEEZY_MODE).toLowerCase();
  return mode === 'test' ? 'test' : 'live';
}

/**
 * Resolves the active Lemon Squeezy API key.
 * Preference order for the current mode:
 *   1) LEMON_SQUEEZY_API_KEY_LIVE / LEMON_SQUEEZY_API_KEY_TEST
 *   2) LEMON_SQUEEZY_API_KEY (legacy / single-key setup)
 */
export function getLemonSqueezyApiKey(): string {
  const mode = getLemonSqueezyMode();
  const modeKey =
    mode === 'test'
      ? trimEnv(process.env.LEMON_SQUEEZY_API_KEY_TEST)
      : trimEnv(process.env.LEMON_SQUEEZY_API_KEY_LIVE);

  return modeKey || trimEnv(process.env.LEMON_SQUEEZY_API_KEY);
}

/**
 * Resolves the variant for the active mode.
 * Test and live Lemon Squeezy modes use different product/variant IDs.
 */
export function getLemonSqueezyVariantId(): string {
  const mode = getLemonSqueezyMode();
  const modeVariant =
    mode === 'test'
      ? trimEnv(process.env.LEMON_SQUEEZY_VARIANT_ID_TEST)
      : trimEnv(process.env.LEMON_SQUEEZY_VARIANT_ID_LIVE);

  return modeVariant || trimEnv(process.env.LEMON_SQUEEZY_VARIANT_ID);
}

export function getEnvSummary(): {
  appUrl: string;
  isLocal: boolean;
  lemonMode: LemonSqueezyMode;
  hasMongo: boolean;
  hasR2: boolean;
  hasLemonApiKey: boolean;
  hasLemonStore: boolean;
  hasLemonVariant: boolean;
  hasLemonWebhook: boolean;
  hasAuthSecret: boolean;
} {
  return {
    appUrl: getAppUrl(),
    isLocal: isLocalAppUrl(),
    lemonMode: getLemonSqueezyMode(),
    hasMongo: Boolean(trimEnv(process.env.MONGODB_URI)),
    hasR2: Boolean(
      trimEnv(process.env.CLOUDFLARE_R2_ENDPOINT) &&
        trimEnv(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) &&
        trimEnv(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY)
    ),
    hasLemonApiKey: Boolean(getLemonSqueezyApiKey()),
    hasLemonStore: Boolean(trimEnv(process.env.LEMON_SQUEEZY_STORE_ID)),
    hasLemonVariant: Boolean(trimEnv(process.env.LEMON_SQUEEZY_VARIANT_ID)),
    hasLemonWebhook: Boolean(trimEnv(process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)),
    hasAuthSecret: Boolean(trimEnv(process.env.AUTH_SECRET)),
  };
}
