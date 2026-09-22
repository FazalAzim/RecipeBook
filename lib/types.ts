export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string | number | Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  cuisine: string;
  tags: string[];
  price: number;
  /** Optional original price shown as strikethrough when higher than `price`. */
  compareAtPrice?: number;
  coverImageUrl: string;
  pdfFileUrl: string;
  pdfFileName: string;
  fileSize: string;
  pageCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  salesCount: number;
  isPublished: boolean;
  featured?: boolean;
  /** Visible on storefront but not purchasable yet. */
  comingSoon?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  coverImageUrl: string;
  pdfFileName: string;
  fileSize: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderItem {
  bookId: string;
  title: string;
  author?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  coverImageUrl: string;
  pdfFileName: string;
  fileSize: string;
  pdfFileUrl?: string;
}

export type PaymentMethod =
  | 'lemon_squeezy'
  | 'stripe'
  | 'credit_card'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type OrderStatus = 'completed' | 'processing' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  /** Client redirect reference generated before checkout (Lemon Squeezy). */
  paymentReferenceId?: string;
  /** Lemon Squeezy order id from webhook (idempotency key). */
  lemonSqueezyOrderId?: string;
  /** Lemon Squeezy checkout id from API response. */
  lemonSqueezyCheckoutId?: string;
  /** Legacy Stripe fields (existing orders only). */
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string | Date;
}

export interface LibraryItem {
  id: string;
  userId: string;
  customerEmail?: string;
  bookId: string;
  orderId: string;
  title: string;
  author: string;
  coverImageUrl: string;
  pdfFileName: string;
  fileSize: string;
  pdfFileUrl: string;
  purchasedAt: string | Date;
  downloadCount: number;
  lastDownloadedAt?: string | Date | null;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  cuisine: string;
  selectedTag: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'popular' | 'newest';
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}
