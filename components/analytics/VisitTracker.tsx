'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Fires a lightweight page-view beacon on each public route change. */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    const controller = new AbortController();

    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {
      // Ignore network/abort errors — analytics must not affect UX
    });

    return () => controller.abort();
  }, [pathname]);

  return null;
}
