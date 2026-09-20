'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AD_CLIENT = 'ca-pub-4291207946566587';
const AD_SLOT = '7549403630';

/**
 * Responsive AdSense display unit.
 * Clearly labeled and visually separated from site navigation / CTAs
 * to comply with AdSense “Site Behavior: Navigation” policies.
 */
export function AdSenseDisplayAd({ className }: { className?: string }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.warn('AdSense failed to render:', err);
    }
  }, []);

  return (
    <aside
      className={className}
      aria-label="Advertisement"
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '1.5rem auto',
        padding: '0.75rem 0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed #3A322C',
        backgroundColor: 'rgba(16, 14, 12, 0.45)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '0.65rem',
          textAlign: 'center',
        }}
      >
        Advertisement
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
