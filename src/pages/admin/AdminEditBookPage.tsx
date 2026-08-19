import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { booksService } from '../../services/firebase/booksService';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CATEGORIES, CUISINES } from '../../components/books/BookFilters';
import type { Book } from '../../types';

export const AdminEditBookPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
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
        const data = await booksService.getBookById(bookId);
        if (!data) {
          showToast('Recipe book not found.', 'error');
          navigate('/admin');
          return;
        }

        setExistingBook(data);
        setTitle(data.title);
        setAuthor(data.author);
        setDescription(data.description);
        setCategory(data.category);
        setCuisine(data.cuisine);
        setTagsInput(data.tags ? data.tags.join(', ') : '');
        setPrice(data.price.toString());
        setPageCount(data.pageCount.toString());
        setIsPublished(data.isPublished);
        setIsFeatured(Boolean(data.featured));
        setCoverPreview(data.coverImageUrl);
      } catch (err: any) {
        showToast(err.message || 'Error loading book', 'error');
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBook();
  }, [bookId, navigate, showToast]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    setNewCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('Please select a valid PDF file.', 'error');
      return;
    }

    setNewPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) return;

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required.';
    if (!author.trim()) errors.author = 'Author name is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!price || isNaN(Number(price))) errors.price = 'Valid price is required.';
    if (!pageCount || isNaN(Number(pageCount))) errors.pageCount = 'Page count must be >= 1.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await booksService.updateBook(
        bookId,
        {
          title: title.trim(),
          author: author.trim(),
          description: description.trim(),
          category,
          cuisine,
          tags,
          price: Number(Number(price).toFixed(2)),
          pageCount: Number(pageCount),
          isPublished,
          featured: isFeatured,
        },
        newCoverFile,
        newPdfFile,
        (progress) => setUploadProgress(progress)
      );

      showToast('Recipe book updated successfully!', 'success');
      navigate('/admin');
    } catch (err: any) {
      console.error('Error updating book:', err);
      showToast(err.message || 'Failed to update book.', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  if (loadingBook) {
    return <LoadingSpinner fullHeight message="Loading book details for editing..." />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/admin"
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
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Edit Recipe Book</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Modify details, replace artwork, or update digital PDF documents.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '2.5rem',
            alignItems: 'start',
          }}
          className="admin-book-form-grid"
        >
          {/* Left Column: Book Fields */}
          <div className="surface-card" style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Cookbook Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Book Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={formErrors.title}
              />

              <Input
                label="Author / Chef"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                error={formErrors.author}
              />

              <div className="form-group">
                <label className="form-label">Book Description</label>
                <textarea
                  className={`form-textarea ${formErrors.description ? 'form-input-error' : ''}`}
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cuisine</label>
                  <select
                    className="form-select"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                  >
                    {CUISINES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Tags (Comma Separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <Input
                  label="Price ($ USD)"
                  type="number"
                  step="0.01"
                  min="0.99"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  error={formErrors.price}
                />

                <Input
                  label="Page Count"
                  type="number"
                  min="1"
                  required
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                  error={formErrors.pageCount}
                />
              </div>

              {/* Status Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Published on Storefront</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Featured on Homepage</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Files Management */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Cover Image Replacement */}
            <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
              <h4 style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={18} color="var(--primary)" />
                <span>Cover Artwork</span>
              </h4>

              {coverPreview && (
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              )}

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                style={{ display: 'none' }}
              />

              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => coverInputRef.current?.click()}
              >
                {newCoverFile ? 'Change New Artwork' : 'Replace Cover Artwork'}
              </Button>
            </div>

            {/* PDF File Replacement */}
            <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
              <h4 style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="#D91B24" />
                <span>PDF E-Book Document</span>
              </h4>

              <div
                style={{
                  backgroundColor: '#FFF0F0',
                  border: '1px solid #FFC9C9',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#D91B24', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {newPdfFile ? `New: ${newPdfFile.name}` : `Current: ${existingBook?.pdfFileName || 'recipe_book.pdf'}`}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {newPdfFile ? `${(newPdfFile.size / (1024 * 1024)).toFixed(2)} MB (Ready to replace)` : `${existingBook?.fileSize} (Uploaded)`}
                </div>
              </div>

              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfSelect}
                style={{ display: 'none' }}
              />

              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => pdfInputRef.current?.click()}
              >
                {newPdfFile ? 'Select Different PDF' : 'Replace PDF File'}
              </Button>
            </div>

            {/* Submit Updates */}
            <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
              {uploadProgress !== null && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                    <span>Updating files...</span>
                    <strong>{uploadProgress}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                >
                  Save Changes
                </Button>

                <Link to="/admin" style={{ textDecoration: 'none' }}>
                  <Button type="button" variant="ghost" size="md" fullWidth>
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @media (max-width: 900px) {
          .admin-book-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
