import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteContentPage } from '@/components/layout/SiteContentPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — RecipeBooks Market',
  description:
    'Privacy Policy for RecipeBooks Market: what data we collect, how we use it, cookies, payments, and your choices.',
};

export default function PrivacyPage() {
  const updated = 'October 1, 2026';

  return (
    <SiteContentPage
      title="Privacy Policy"
      subtitle={`Last updated: ${updated}. This policy explains how RecipeBooks Market collects, uses, and protects information when you use our website and services.`}
    >
      <h2>1. Who this applies to</h2>
      <p>
        This Privacy Policy applies to visitors and customers of RecipeBooks Market (the “Site”), including
        people who browse cookbooks, create an account, purchase digital products, or contact us for
        support.
      </p>

      <h2>2. Information we collect</h2>
      <h3>Account &amp; profile</h3>
      <p>
        When you register or sign in, we store information such as your name, email address, and a hashed
        password. We use this to authenticate you and connect purchases to your library.
      </p>
      <h3>Orders &amp; library</h3>
      <p>
        When you buy a cookbook or Lifetime All-Access, we store order details needed for fulfillment:
        customer name, email, purchased items or entitlement, payment reference identifiers, and download
        activity for your library. Payment card numbers are processed by Lemon Squeezy; we do not store
        full card data on our servers.
      </p>
      <h3>Technical &amp; usage data</h3>
      <p>
        Like most websites, we may collect basic technical information such as IP address, browser type,
        device type, pages visited, and approximate timestamps. We may use this to keep the Site secure,
        fix errors, understand which pages are useful, and improve the storefront.
      </p>
      <h3>Communications</h3>
      <p>
        If you email us or use the contact page, we receive the message content and the email address you
        provide so we can respond.
      </p>

      <h2>3. How we use information</h2>
      <ul>
        <li>Provide the Site, accounts, checkout, library access, and PDF downloads.</li>
        <li>Process payments through Lemon Squeezy and fulfill digital orders.</li>
        <li>Send transactional messages (order confirmation, download help, account security).</li>
        <li>Monitor abuse, fraud, and technical issues.</li>
        <li>
          Show advertising through Google AdSense where enabled, subject to Google’s policies and your
          consent choices where required.
        </li>
        <li>Improve catalog content, navigation, and customer experience.</li>
      </ul>

      <h2>4. Cookies &amp; similar technologies</h2>
      <p>
        We use cookies and similar storage for essential functions (for example, keeping you signed in and
        remembering your cart). Third parties such as Google AdSense and Lemon Squeezy may also set cookies
        for advertising, analytics, fraud prevention, or payment security. You can control cookies through
        your browser settings; disabling some cookies may limit Site features.
      </p>

      <h2>5. Advertising (Google AdSense)</h2>
      <p>
        We may display ads served by Google AdSense. Google and its partners may use cookies or device
        identifiers to show ads based on your visits to this and other sites. Learn more about how Google
        uses data at{' '}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
          Google Advertising Policies
        </a>
        . You can manage ad personalization via Google’s ad settings.
      </p>

      <h2>6. Sharing of information</h2>
      <p>We share information only as needed to run the business, including with:</p>
      <ul>
        <li>
          <strong>Lemon Squeezy</strong> — payment processing and digital delivery as merchant of record.
        </li>
        <li>
          <strong>Hosting &amp; infrastructure providers</strong> — for example hosting, database, and file
          storage services that process data on our behalf.
        </li>
        <li>
          <strong>Google</strong> — when AdSense or related measurement tools are used.
        </li>
        <li>
          <strong>Legal requirements</strong> — if we must disclose information to comply with law, enforce
          our terms, or protect rights and safety.
        </li>
      </ul>
      <p>We do not sell your personal information as a standalone product list.</p>

      <h2>7. Data retention</h2>
      <p>
        We keep account, order, and library records for as long as needed to provide downloads, support
        purchases, meet accounting or legal obligations, and resolve disputes. You may request account
        deletion where applicable; we may retain limited records required by law or for fraud prevention.
      </p>

      <h2>8. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect personal data, including
        encrypted connections (HTTPS) and hashed passwords. No method of transmission or storage is 100%
        secure; please use a strong unique password for your account.
      </p>

      <h2>9. Your choices</h2>
      <ul>
        <li>Update account details by signing in (where available).</li>
        <li>Request access, correction, or deletion of personal data by contacting us.</li>
        <li>Opt out of non-essential marketing emails if we send any (transactional emails may still be sent).</li>
        <li>Manage browser cookies and Google ad personalization settings.</li>
      </ul>

      <h2>10. Children</h2>
      <p>
        The Site is intended for adults purchasing digital cookbooks. We do not knowingly collect personal
        information from children under 13 (or the minimum age required in your region). If you believe a
        child provided information, contact us so we can delete it.
      </p>

      <h2>11. International users</h2>
      <p>
        Our infrastructure and payment partners may process data in countries other than your own. By using
        the Site, you understand that your information may be transferred to those locations with
        appropriate safeguards where required.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. The “Last updated” date at the top will change
        when we do. Continued use of the Site after updates means you accept the revised policy.
      </p>

      <h2>13. Contact</h2>
      <p>
        For privacy questions or requests, please use our <Link href="/contact">Contact</Link> page or email
        the support address listed there. See also our <Link href="/terms">Terms of Service</Link>.
      </p>
    </SiteContentPage>
  );
}
