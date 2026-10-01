import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteContentPage } from '@/components/layout/SiteContentPage';

export const metadata: Metadata = {
  title: 'About Us — RecipeBooks Market',
  description:
    'Learn about RecipeBooks Market — a curated marketplace for digital cookbooks and instant PDF recipe downloads.',
};

export default function AboutPage() {
  return (
    <SiteContentPage
      title="About RecipeBooks Market"
      subtitle="We help home cooks discover chef-crafted digital cookbooks they can download instantly and keep forever."
    >
      <h2>Who we are</h2>
      <p>
        RecipeBooks Market is an independent digital cookbook storefront. We publish and sell carefully
        prepared PDF recipe books for home kitchens — from everyday staples and baking guides to dessert
        collections and family meals. Our goal is simple: give you clear, practical recipes you can open
        on a phone, tablet, or printed page whenever you cook.
      </p>

      <h2>What we sell</h2>
      <p>
        Every title in our catalog is a <strong>digital PDF cookbook</strong>. After a successful purchase
        (or with Lifetime All-Access), the book is added to your personal library so you can re-download
        it anytime. We do not ship physical books. Coming Soon titles may appear in the catalog as
        previews before the PDF is ready to download.
      </p>

      <h2>How shopping works</h2>
      <ul>
        <li>
          <strong>Browse</strong> the storefront and open a book page to read the description, cuisine,
          and highlights.
        </li>
        <li>
          <strong>Buy one book</strong> through secure Lemon Squeezy checkout, or choose{' '}
          <strong>Lifetime All-Access</strong> for every published title (including Coming Soon and future
          releases).
        </li>
        <li>
          <strong>Download</strong> from <Link href="/library">My Library</Link> after payment is
          confirmed. Keep your account email handy if you checkout as a guest.
        </li>
      </ul>

      <h2>Our standards</h2>
      <p>
        We focus on readable formatting, practical instructions, and cookbooks that work on phones and
        tablets. Listings include honest descriptions of what you receive. Prices and offers (when shown)
        reflect the digital edition you are buying.
      </p>

      <h2>Payments &amp; security</h2>
      <p>
        Checkout is processed by Lemon Squeezy, a reputable digital merchant of record. Card details are
        handled on their secure payment pages — we do not store your full card numbers on our servers.
      </p>

      <h2>Get in touch</h2>
      <p>
        Questions about an order, a download, or a cookbook? Visit our{' '}
        <Link href="/contact">Contact</Link> page. For how we handle data, see our{' '}
        <Link href="/privacy">Privacy Policy</Link>. Purchase terms are covered in our{' '}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    </SiteContentPage>
  );
}
