'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { CATEGORIES, CUISINES } from '@/components/books/BookFilters';
import { uploadBookAsset } from '@/lib/upload-client';

export default function AdminNewBookPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'Desserts & Baking');
  const [cuisine, setCuisine] = useState(CUISINES[1] || 'Italian');
  const [tagsInput, setTagsInput] = useState('');
  const [price, setPrice] = useState('19.99');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [pageCount, setPageCount] = useState('120');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Cover image upload state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // PDF file upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [draftBookId] = useState(
    () => `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  );

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10 MB.', 'error');
      return;
    }

    setCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverPreview(objectUrl);
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('Please select a valid PDF recipe document.', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('PDF file size must be less than 50 MB.', 'error');
      return;
    }

    setPdfFile(file);
  };

  const handleAutofillExample = () => {
    setTitle('Velvet Chocolate Mousse Cake Masterclass');
    setAuthor('Pastry Chef Claire Dupont');
    setDescription(
      'Master elegant European-style chocolate mousse cakes with silky layers, glossy ganache, and professional decoration techniques for home bakers.'
    );
    setCategory('Desserts & Baking');
    setCuisine('French');
    setTagsInput('Chocolate, Mousse, Baking, Patisserie, Cakes');
    setPrice('21.99');
    setPageCount('156');
    setCoverPreview('/books/chocolate-mousse-cake-cover.png');
    setIsPublished(true);
    setIsFeatured(true);
    showToast('Autofilled sample cookbook template!', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required.';
    if (!author.trim()) errors.author = 'Author name is required.';
    if (!description.trim()) errors.description = 'Cookbook description is required.';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.price = 'Please enter a valid price.';
    if (
      compareAtPrice.trim() &&
      (isNaN(Number(compareAtPrice)) || Number(compareAtPrice) <= Number(price))
    ) {
      errors.compareAtPrice = 'Original price must be higher than the sale price.';
    }
    if (!pageCount || isNaN(Number(pageCount)) || Number(pageCount) < 1) errors.pageCount = 'Page count must be >= 1.';
    if (!pdfFile) errors.pdf = 'A cookbook PDF is required before publishing.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please resolve the errors highlighted in the form.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      let coverImageUrl = coverPreview || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80';
      let pdfFileUrl = '';
      let pdfFileName = pdfFile!.name;
      let fileSize = `${(pdfFile!.size / (1024 * 1024)).toFixed(1)} MB`;

      // 1. Upload cover image if provided
      if (coverFile) {
        setUploadProgress(30);
        const uploadData = await uploadBookAsset(coverFile, 'cover', draftBookId);
        coverImageUrl = uploadData.url;
      }

      // 2. Upload PDF document (required) — direct to R2, bypasses Vercel 4.5 MB limit
      setUploadProgress(60);
      const uploadData = await uploadBookAsset(pdfFile!, 'pdf', draftBookId);
      pdfFileUrl = uploadData.url;
      pdfFileName = uploadData.fileName;
      fileSize = uploadData.fileSize;

      setUploadProgress(85);

      // 3. Create book record in MongoDB
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const bookRes = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftBookId,
          title,
          author,
          description,
          category,
          cuisine,
          tags,
          price: Number(price),
          compareAtPrice: compareAtPrice.trim() ? Number(compareAtPrice) : undefined,
          pageCount: Number(pageCount),
          coverImageUrl,
          pdfFileUrl,
          pdfFileName,
          fileSize,
          isPublished,
          featured: isFeatured,
        }),
      });

      if (!bookRes.ok) {
        const errData = await bookRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create recipe book in database.');
      }

      setUploadProgress(100);
      showToast(`Cookbook "${title}" published successfully!`, 'success');
      router.push('/admin');
    } catch (err: any) {
      console.error('Error creating cookbook:', err);
      showToast(err.message || 'Error publishing cookbook', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Publish New Recipe Cookbook</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Upload high-resolution cover artwork and authentic digital recipe masterclass PDF.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles size={16} color="var(--primary)" />}
          onClick={handleAutofillExample}
        >
          Autofill Sample Template
        </Button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Section 1: Basic Information */}
        <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            1. Book Details & Overview
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Cookbook Title"
              required
              placeholder="e.g. Velvet Chocolate Mousse Cake Masterclass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={formErrors.title}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="stack-sm">
              <Input
                label="Author / Executive Chef"
                required
                placeholder="e.g. Chef Ayla Farooq"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                error={formErrors.author}
              />

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="stack-sm">
              <div className="form-group">
                <label className="form-label">Cuisine Region</label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="form-select"
                >
                  {CUISINES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tags (Comma separated)"
                placeholder="Chocolate, Baking, Patisserie, Cakes"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                hint="Used for search filtering and chips"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description & Culinary Highlights</label>
              <textarea
                rows={4}
                required
                placeholder="Describe the recipe collection, cooking techniques, and meal guides included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`form-textarea ${formErrors.description ? 'form-input-error' : ''}`}
              />
              {formErrors.description && <span className="form-error-msg">{formErrors.description}</span>}
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Specifications */}
        <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            2. Pricing & Publication Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }} className="stack-sm">
            <Input
              label="Sale Price (USD)"
              type="number"
              step="0.01"
              required
              placeholder="9.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={formErrors.price}
            />

            <Input
              label="Original Price (optional)"
              type="number"
              step="0.01"
              placeholder="19.99"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              error={formErrors.compareAtPrice}
            />

            <Input
              label="Page Count"
              type="number"
              required
              placeholder="148"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              error={formErrors.pageCount}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Set an original price higher than the sale price to show a % OFF offer label on the storefront.
          </p>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Publish immediately on storefront</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Feature as Chef&apos;s Pick on Home Page</span>
            </label>
          </div>
        </div>

        {/* Section 3: File Uploads (Cover Image & PDF Document) */}
        <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            3. Digital Assets Upload (R2 Storage)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="stack-sm">
            {/* Cover Image */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Cookbook Cover Image
              </label>

              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <div
                onClick={() => coverInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-base)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-subtle)',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {coverPreview ? (
                  <div style={{ position: 'relative', width: '100%', maxHeight: '180px', overflow: 'hidden' }}>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{ maxHeight: '160px', margin: '0 auto', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>
                      Click to change image
                    </span>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Choose Cover Artwork
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG or WebP up to 10MB</span>
                  </>
                )}
              </div>
            </div>

            {/* Recipe PDF Document */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Recipe Book PDF Document
              </label>

              <input
                type="file"
                ref={pdfInputRef}
                onChange={handlePdfSelect}
                accept="application/pdf"
                style={{ display: 'none' }}
              />

              <div
                onClick={() => pdfInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-base)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-subtle)',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {pdfFile ? (
                  <div>
                    <FileText size={36} color="var(--accent-berry)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {pdfFile.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '0.5rem' }}>
                      Click to replace PDF
                    </span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={32} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Upload Cookbook PDF
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Digital PDF up to 50MB</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {uploadProgress !== null && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                <span>Uploading digital cookbook to Cloudflare R2...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
          <Link href="/admin">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" size="lg" type="submit" isLoading={isSubmitting}>
            Save & Publish Cookbook
          </Button>
        </div>
      </form>
    </div>
  );
}
