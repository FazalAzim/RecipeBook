'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AD_CLIENT = 'ca-pub-4291207946566587';
const AD_SLOT = '7549403630';

/** Responsive AdSense display unit. Script loads once from root layout. */
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
        margin: '0 auto',
        minHeight: '100px',
        overflow: 'hidden',
      }}
    >
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
