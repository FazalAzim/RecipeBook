'use client';

import { usePathname } from 'next/navigation';

/** Fixed full-page dessert atmosphere behind storefront (not admin). */
export function PageAtmosphere() {
  const pathname = usePathname() || '';
  if (pathname.startsWith('/admin')) return null;

  return <div className="page-atmosphere" aria-hidden="true" />;
}
