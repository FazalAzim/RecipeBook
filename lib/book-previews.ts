export interface BookPreviewPage {
  src: string;
  alt: string;
  caption: string;
}

/** Match storefront books by title (case-insensitive substring). */
const PREVIEW_BY_TITLE: Array<{ match: string; pages: BookPreviewPage[] }> = [
  {
    match: 'dessert',
    pages: [
      {
        src: '/books/previews/desserts-dreams-mousse-interior.png',
        alt: 'Classic Chocolate Mousse Cake — recipe overview page',
        caption: 'Chocolate Mousse Cake · overview',
      },
      {
        src: '/books/previews/desserts-dreams-mousse-instructions.png',
        alt: 'Classic Chocolate Mousse Cake — step-by-step instructions',
        caption: 'Chocolate Mousse Cake · instructions',
      },
    ],
  },
  {
    match: 'homemade',
    pages: [
      {
        src: '/books/previews/homemade-goodness-mayo-interior.png',
        alt: 'Classic Homemade Mayonnaise — recipe overview page',
        caption: 'Homemade Mayonnaise · overview',
      },
      {
        src: '/books/previews/homemade-goodness-mayo-instructions.png',
        alt: 'Classic Homemade Mayonnaise — step-by-step instructions',
        caption: 'Homemade Mayonnaise · instructions',
      },
      {
        src: '/books/previews/homemade-goodness-croissants-interior.jpg',
        alt: 'Homemade Croissants — recipe overview page',
        caption: 'Homemade Croissants · overview',
      },
      {
        src: '/books/previews/homemade-goodness-croissants-instructions.png',
        alt: 'Homemade Croissants — step-by-step instructions',
        caption: 'Homemade Croissants · instructions',
      },
    ],
  },
];

export function getBookPreviewPages(title: string): BookPreviewPage[] {
  const normalized = title.trim().toLowerCase();
  const found = PREVIEW_BY_TITLE.find((entry) => normalized.includes(entry.match));
  return found?.pages ?? [];
}
