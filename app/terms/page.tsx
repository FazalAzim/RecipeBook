import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteContentPage } from '@/components/layout/SiteContentPage';

export const metadata: Metadata = {
  title: 'Terms of Service — RecipeBooks Market',
  description:
    'Terms of Service for RecipeBooks Market digital cookbook purchases, library access, Lifetime All-Access, and acceptable use.',
};

export default function TermsPage() {
  const updated = 'October 1, 2026';

  return (
    <SiteContentPage
      title="Terms of Service"
      subtitle={`Last updated: ${updated}. These Terms govern your use of RecipeBooks Market and purchases of digital cookbooks.`}
    >
      <h2>1. Agreement</h2>
      <p>
        By accessing RecipeBooks Market (the “Site”) or purchasing digital products, you agree to these
        Terms of Service and our <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not
        use the Site.
      </p>

      <h2>2. The service</h2>
      <p>
        RecipeBooks Market sells <strong>digital PDF cookbooks</strong> and optional{' '}
        <strong>Lifetime All-Access</strong> (a one-time unlock of published titles, including Coming Soon
        and future published releases while your entitlement remains valid). We do not provide physical
        shipping. Product descriptions, prices, and availability may change.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You are responsible for keeping your login credentials confidential and for activity under your
        account. Provide accurate information. We may suspend accounts that appear abusive, fraudulent, or
        in violation of these Terms.
      </p>

      <h2>4. Orders &amp; payments</h2>
      <p>
        Payments are processed by Lemon Squeezy (or another payment provider we designate). Prices are shown
        in the currency displayed at checkout. Taxes and fees may apply based on your location and Lemon
        Squeezy’s rules. An order is completed when payment is successfully confirmed and access is granted
        to your library or Lifetime entitlement.
      </p>

      <h2>5. Digital delivery &amp; license</h2>
      <p>
        After purchase, you receive a personal, non-exclusive, non-transferable license to download and use
        the PDF for your own household cooking and private use. You may not:
      </p>
      <ul>
        <li>Resell, redistribute, or publicly share the PDF files.</li>
        <li>Upload cookbooks to file-sharing sites or membership communities.</li>
        <li>Remove copyright notices or claim authorship of our materials.</li>
        <li>Use automated tools to scrape or bulk-download content beyond normal personal use.</li>
      </ul>
      <p>
        Lifetime All-Access grants library access to published titles under the same personal-use license.
        Coming Soon titles without an uploaded PDF cannot be downloaded until the file is available.
      </p>

      <h2>6. Refunds</h2>
      <p>
        Because products are digital and delivered immediately, sales are generally final once the file or
        Lifetime access has been granted. If a technical issue prevents download of a paid title, contact
        us via the <Link href="/contact">Contact</Link> page and we will help restore access. Chargebacks
        for successfully delivered digital goods may result in account suspension. Lemon Squeezy’s buyer
        policies may also apply as merchant of record.
      </p>

      <h2>7. Acceptable use</h2>
      <p>You agree not to misuse the Site, including attempts to:</p>
      <ul>
        <li>Break security, access other users’ libraries, or interfere with servers.</li>
        <li>Post unlawful, harmful, or infringing content where user input is allowed.</li>
        <li>Use the Site for spam, scraping at scale, or reverse engineering beyond permitted law.</li>
      </ul>

      <h2>8. Intellectual property</h2>
      <p>
        Cookbook content, branding, site design, and related materials are owned by RecipeBooks Market or
        its licensors. Purchase grants access under the license above — not ownership of copyrights.
      </p>

      <h2>9. Third-party services</h2>
      <p>
        The Site may integrate Lemon Squeezy, hosting providers, and advertising partners such as Google
        AdSense. Their terms and privacy policies apply to their services. We are not responsible for
        third-party outages outside our reasonable control.
      </p>

      <h2>10. Disclaimer</h2>
      <p>
        Cookbooks are provided for informational and educational cooking purposes. Results vary by
        ingredients, equipment, and skill. The Site and products are provided “as is” without warranties
        beyond those required by applicable law. Recipes may involve heat, allergens, and kitchen tools —
        cook carefully and follow food-safety practices.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, RecipeBooks Market is not liable for indirect, incidental,
        special, or consequential damages arising from use of the Site or digital products. Our aggregate
        liability for a claim related to a purchase is limited to the amount you paid for that purchase.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these Terms. The “Last updated” date will change when we do. Continued use after
        changes means you accept the updated Terms for future use of the Site.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms? See <Link href="/about">About</Link> or{' '}
        <Link href="/contact">Contact</Link>.
      </p>
    </SiteContentPage>
  );
}
