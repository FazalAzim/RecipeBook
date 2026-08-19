import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles
} from 'lucide-react';
import { booksService } from '../../services/firebase/booksService';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CATEGORIES, CUISINES } from '../../components/books/BookFilters';

export const AdminNewBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'Pakistani & South Asian');
  const [cuisine, setCuisine] = useState(CUISINES[1] || 'Pakistani');
  const [tagsInput, setTagsInput] = useState('');
  const [price, setPrice] = useState('19.99');
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
    setTitle('Mastering Mughlai Kebabs & Tandoor Secrets');
    setAuthor('Chef Tariq Mahmood');
    setDescription('Unlock royal Mughal culinary heritage. Step-by-step marinades, clay-oven emulation in domestic kitchens, authentic seekh kebab spices, and fragrant mint chutneys.');
    setCategory('Pakistani & South Asian');
    setCuisine('Pakistani');
    setTagsInput('Kebabs, Tandoor, BBQ, Spices, Grill');
    setPrice('22.50');
    setPageCount('154');
    setCoverPreview('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80');
    setIsPublished(true);
    setIsFeatured(true);
    showToast('Autofilled sample cookbook template!', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required.';
    if (!author.trim()) errors.author = 'Author name is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.price = 'Valid price is required.';
    if (!pageCount || isNaN(Number(pageCount)) || Number(pageCount) < 1) errors.pageCount = 'Page count must be >= 1.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please correct the highlighted fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await booksService.createBook(
        {
          title: title.trim(),
          author: author.trim(),
          description: description.trim(),
          category,
          cuisine,
          tags,
          price: Number(Number(price).toFixed(2)),
          pageCount: Number(pageCount),
          coverImageUrl: coverPreview || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',
          pdfFileUrl: '#',
          pdfFileName: pdfFile ? pdfFile.name : `${title.replace(/\s+/g, '_')}.pdf`,
          fileSize: pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB` : '4.2 MB',
          isPublished,
          featured: isFeatured,
        },
        coverFile,
        pdfFile,
        (progress) => setUploadProgress(progress)
      );

      showToast(`Cookbook "${title}" successfully added!`, 'success');
      navigate('/admin');
    } catch (err: any) {
      console.error('Error creating book:', err);
      showToast(err.message || 'Failed to save cookbook.', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
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
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Add New Recipe Book</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Upload cover artwork, private PDF e-book asset, and configure pricing.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles size={16} />}
          onClick={handleAutofillExample}
        >
          Autofill Demo Info
        </Button>
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
          {/* Left Column: Book Details */}
          <div className="surface-card" style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Book Information</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Book Title"
                placeholder="e.g. Traditional Pakistani Flavors & Royal Curries"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                }}
                error={formErrors.title}
              />

              <Input
                label="Author / Executive Chef"
                placeholder="e.g. Chef Ayla Farooq"
                required
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  if (formErrors.author) setFormErrors({ ...formErrors, author: '' });
                }}
                error={formErrors.author}
              />

              <div className="form-group">
                <label className="form-label">Book Description & Culinary Highlights</label>
                <textarea
                  className={`form-textarea ${formErrors.description ? 'form-input-error' : ''}`}
                  rows={4}
                  placeholder="Provide an enticing summary of the recipes, secrets, folding guides, and pantry essentials covered in this e-book..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  required
                />
                {formErrors.description && <span className="form-error-msg">{formErrors.description}</span>}
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
                label="Culinary Tags (Comma Separated)"
                placeholder="Biryani, Curry, Slow Cook, Halal"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                hint="Used for search filtering and recommendations"
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

              {/* Publication Status Checks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Publish immediately to Storefront</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Feature on homepage banner</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: File Uploads */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Cover Artwork Upload */}
            <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
              <h4 style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={18} color="var(--primary)" />
                <span>Cover Artwork</span>
              </h4>

              {coverPreview ? (
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      borderRadius: '50%',
                      padding: '4px',
                      display: 'flex',
                    }}
                    title="Remove artwork"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => coverInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-dark)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-subtle)',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  <UploadCloud size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Click to select cover image
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    PNG, JPG, WebP up to 10MB
                  </div>
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
                {coverPreview ? 'Replace Artwork' : 'Browse Image'}
              </Button>
            </div>

            {/* PDF E-Book File Upload */}
            <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
              <h4 style={{ marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="#D91B24" />
                <span>PDF E-Book Asset</span>
              </h4>

              {pdfFile ? (
                <div
                  style={{
                    backgroundColor: '#FFF0F0',
                    border: '1px solid #FFC9C9',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#D91B24', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {pdfFile.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    style={{ color: '#D91B24', padding: '4px', display: 'flex' }}
                    title="Remove PDF"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-dark)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-subtle)',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  <FileText size={32} color="#D91B24" style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Select PDF Recipe Book
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    PDF file up to 50MB (Private & Secure)
                  </div>
                </div>
              )}

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
                {pdfFile ? 'Replace PDF File' : 'Browse PDF'}
              </Button>
            </div>

            {/* Submission CTAs */}
            <div className="surface-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
              {uploadProgress !== null && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.375rem' }}>
                    <span>Uploading to Storage...</span>
                    <strong>{uploadProgress}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.2s ease' }} />
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
                  Save & Publish Book
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
