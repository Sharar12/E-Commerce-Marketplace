/**
 * ApnarDokan — Shared domain types.
 * All mock data and every feature slice is typed against these interfaces,
 * so swapping in real Laravel endpoints later never touches the UI layer.
 */

export type Role = "customer" | "seller" | "delivery" | "support" | "admin";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned"
  | "refunded";

export type PaymentMethod = "card" | "bkash" | "nagad" | "cod";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // lucide icon name
  image: string;
  productCount: number;
  parentId?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Color"
  value: string; // e.g. "Midnight Black"
  priceDelta: number;
  stock: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  highlights: string[];
  categoryId: string;
  categoryName: string;
  brand: string;
  sellerId: string;
  price: number;
  mrp: number;
  currency: "BDT";
  stock: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isFlashSale?: boolean;
  flashSaleEndsAt?: string;
  isFeatured?: boolean;
  isPublished: boolean;
  isFlagged?: boolean;
  flagReason?: string;
  createdAt: string;
  deliveryEstimateDays: [number, number];
  freeDelivery: boolean;
}

export interface Seller {
  id: string;
  shopName: string;
  slug: string;
  ownerName: string;
  email: string;
  phone: string;
  logo: string;
  coverImage: string;
  categoryIds: string[];
  rating: number;
  reviewCount: number;
  productCount: number;
  followers: number;
  joinedAt: string;
  status: "pending" | "active" | "suspended" | "rejected";
  verificationDocs: { id: string; name: string; type: string; uploadedAt: string }[];
  bankAccount?: { bankName: string; accountName: string; accountNo: string; routingNo: string };
  address: string;
  bio: string;
  responseRate: number;
  avgResponseTime: string;
  commissionRate: number; // platform %
  payoutBalance: number;
  pendingPayout: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  status: "active" | "suspended";
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  addresses: Address[];
  savedCards: { id: string; brand: string; last4: string; expiry: string; type: PaymentMethod }[];
  notificationPrefs: { email: boolean; sms: boolean; push: boolean };
  referredBy?: string;
  referralCode: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  area: string;
  postalCode: string;
  isDefault: boolean;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  email: string;
  vehicle: { type: string; regNo: string };
  serviceAreas: string[];
  status: "active" | "suspended";
  online: boolean;
  rating: number;
  completedDeliveries: number;
  completionRate: number;
  earningsToday: number;
  earningsWeek: number;
  totalEarnings: number;
  payoutBalance: number;
  joinedAt: string;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "suspended";
  role: "agent" | "lead" | "manager";
  ticketsResolved: number;
  avgResponseTime: string;
  satisfactionScore: number;
  skills: string[];
  joinedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  variantLabel?: string;
  sellerId: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  sellerId: string; // primary seller (single-seller orders for simplicity)
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  deliveryAddress: Address;
  assignedPartnerId?: string;
  timeline: OrderTimelineEvent[];
  placedAt: string;
  updatedAt: string;
  eta?: string;
  deliveryNote?: string;
  returnRequest?: ReturnRequest;
  codAmount?: number; // for delivery partner reconciliation
}

export interface ReturnRequest {
  id: string;
  reason: string;
  detail: string;
  images: string[];
  requestedAt: string;
  status: "pending" | "approved" | "denied" | "refunded";
  refundAmount?: number;
  decisionNote?: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  title?: string;
  body: string;
  images: string[];
  createdAt: string;
  verifiedPurchase: boolean;
  sellerResponse?: { body: string; createdAt: string };
  isFlagged?: boolean;
  flagReason?: string;
}

export interface SupportTicketMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role | "customer";
  body: string;
  createdAt: string;
  isInternalNote?: boolean;
}

export type TicketCategory =
  | "order_issue"
  | "payment"
  | "return"
  | "account"
  | "seller_complaint"
  | "delivery"
  | "other";

export type TicketStatus = "new" | "open" | "pending" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  orderCode?: string;
  assignedAgentId?: string;
  createdBy: "customer" | "seller";
  messages: SupportTicketMessage[];
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  escalated?: { to: "admin"; reason: string; at: string };
}

export interface PayoutRecord {
  id: string;
  sellerId: string;
  amount: number;
  method: PaymentMethod;
  accountSummary: string;
  status: "pending" | "processing" | "paid" | "rejected";
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  paidAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  title: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  startsAt: string;
  endsAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

export interface FlashSaleCampaign {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  productIds: string[];
  discountPercent: number;
  active: boolean;
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  bgClass: string;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  body: string;
  updatedAt: string;
  views: number;
}

export interface AdminAuditEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  detail: string;
  at: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variantLabel?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sort?: "popular" | "price_asc" | "price_desc" | "newest" | "rating";
  q?: string;
  page?: number;
  pageSize?: number;
  sellerId?: string;
}
