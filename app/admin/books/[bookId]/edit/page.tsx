'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  UploadCloud,
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CATEGORIES, CUISINES } from '@/components/books/BookFilters';
import type { Book } from '@/lib/types';

export default function AdminEditBookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [loadingBook, setLoadingBook] = useState(true);
  const [existingBook, setExistingBook] = useState<Book | null>(null);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [price, setPrice] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // New file replacement states
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      setLoadingBook(true);
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) {
          throw new Error('Recipe book not found.');
        }
        const data = await res.json();
        const book: Book = data.book;

        setExistingBook(book);
        setTitle(book.title);
        setAuthor(book.author);
        setDescription(book.description);
        setCategory(book.category);
        setCuisine(book.cuisine);
        setTagsInput(book.tags ? book.tags.join(', ') : '');
        setPrice(book.price.toString());
        setPageCount(book.pageCount.toString());
        setIsPublished(book.isPublished);
        setIsFeatured(Boolean(book.featured));
        setCoverPreview(book.coverImageUrl);
      } catch (err: any) {
        showToast(err.message || 'Error loading book', 'error');
        router.push('/admin');
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBook();
  }, [bookId, router, showToast]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    setNewCoverFile(file);
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

    setNewPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required.';
    if (!author.trim()) errors.author = 'Author name is required.';
    if (!description.trim()) errors.description = 'Cookbook description is required.';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.price = 'Please enter a valid price.';
    if (!pageCount || isNaN(Number(pageCount)) || Number(pageCount) < 1) errors.pageCount = 'Page count must be >= 1.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please resolve errors in form.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);

    try {
      const updates: Partial<Book> = {
        title,
        author,
        description,
        category,
        cuisine,
        tags: tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0),
        price: Number(price),
        pageCount: Number(pageCount),
        isPublished,
        featured: isFeatured,
      };

      // 1. Upload replacement cover if chosen
      if (newCoverFile) {
        setUploadProgress(40);
        const formData = new FormData();
        formData.append('file', newCoverFile);
        formData.append('type', 'cover');
        formData.append('bookId', bookId);

        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Cover image upload failed.');
        }

        const uploadData = await uploadRes.json();
        updates.coverImageUrl = uploadData.url;
      }

      // 2. Upload replacement PDF if chosen
      if (newPdfFile) {
        setUploadProgress(70);
        const formData = new FormData();
        formData.append('file', newPdfFile);
        formData.append('type', 'pdf');
        formData.append('bookId', bookId);

        const uploadRes = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || 'PDF upload failed. Check Cloudflare R2 configuration.');
        }

        const uploadData = await uploadRes.json();
        updates.pdfFileUrl = uploadData.url;
        updates.pdfFileName = uploadData.fileName;
        updates.fileSize = uploadData.fileSize;
      }

      setUploadProgress(90);

      // 3. Update book in MongoDB
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error('Failed to update book in database.');
      }

      setUploadProgress(100);
      showToast(`Updated "${title}" successfully!`, 'success');
      router.push('/admin');
    } catch (err: any) {
      console.error('Error updating book:', err);
      showToast(err.message || 'Error updating cookbook', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (loadingBook) {
    return <LoadingSpinner fullHeight message="Loading book details for editing..." />;
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem' }}>
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
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Edit Recipe Cookbook</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Update catalog details, adjust pricing, or replace cover and PDF documents.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Basic Details */}
        <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            1. Cookbook Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Cookbook Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={formErrors.title}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="stack-sm">
              <Input
                label="Author / Chef"
                required
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
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description & Culinary Highlights</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`form-textarea ${formErrors.description ? 'form-input-error' : ''}`}
              />
              {formErrors.description && <span className="form-error-msg">{formErrors.description}</span>}
            </div>
          </div>
        </div>

        {/* Pricing & Settings */}
        <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            2. Pricing & Publication
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="stack-sm">
            <Input
              label="Price (USD)"
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={formErrors.price}
            />

            <Input
              label="Page Count"
              type="number"
              required
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              error={formErrors.pageCount}
            />
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Visible on live storefront</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Featured as Chef Pick</span>
            </label>
          </div>
        </div>

        {/* File Replacements */}
        <div className="surface-card" style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            3. Digital Assets (Optional Replacement)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="stack-sm">
            {/* Cover Image Replacement */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Cover Artwork
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
                  <div style={{ position: 'relative', width: '100%', maxHeight: '180px' }}>
                    <img
                      src={coverPreview}
                      alt="Cover"
                      style={{ maxHeight: '140px', margin: '0 auto', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '0.5rem' }}>
                      Click to choose replacement image
                    </span>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={32} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Replace Cover</span>
                  </>
                )}
              </div>
            </div>

            {/* PDF File Replacement */}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Cookbook PDF File
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
                {newPdfFile ? (
                  <div>
                    <FileText size={36} color="var(--accent-berry)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{newPdfFile.name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '0.5rem' }}>
                      Click to choose different PDF
                    </span>
                  </div>
                ) : (
                  <div>
                    <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Current: {existingBook?.pdfFileName || 'Standard PDF'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {existingBook?.fileSize || '5 MB'}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '0.5rem' }}>
                      Click to upload new PDF version
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {uploadProgress !== null && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                <span>Uploading replacement assets to R2...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link href="/admin">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" size="lg" type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
