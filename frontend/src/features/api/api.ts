import { createApi } from "@reduxjs/toolkit/query/react";
import { realBaseQuery } from "./realBaseQuery";
import type {
  Paginated, Product, ProductFilters, Category, Brand, Seller, Customer,
  DeliveryPartner, SupportAgent, Order, Review, Role,
  SupportTicket, SupportTicketMessage, PayoutRecord, PromoCode, FlashSaleCampaign,
  HomepageBanner, KnowledgeArticle, AdminAuditEntry,
} from "@/types";
import type { SessionUser } from "@/features/auth/authSlice";

/**
 * Transport — always the real Laravel API at NEXT_PUBLIC_API_URL (/api/v1).
 * The mock layer was removed in the full de-mock phase.
 */
const baseQuery = realBaseQuery;

/** Dashboard aggregates (typed inline — mirror of mock builders) */
export interface AdminDashboard {
  kpis: {
    gmv: number; gmvToday: number; ordersToday: number; activeUsers: number;
    sellers: number; pendingSellers: number; avgOrderValue: number; conversionRate: number;
  };
  revenueTrend: { label: string; value: number }[];
  orderTrend: { label: string; value: number }[];
  categoryPerformance: { name: string; revenue: number; orders: number }[];
  paymentSplit: { name: string; value: number }[];
  sellerLeaderboard: { sellerId: string; shopName: string; gmv: number; orders: number; rating: number }[];
}

export interface SellerDashboard {
  kpis: {
    revenueToday: number; revenueWeek: number; ordersPending: number; lowStock: number;
    avgRating: number; unitsSold: number;
  };
  revenueTrend: { label: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; sold: number; revenue: number; stock: number }[];
  demographics: { name: string; value: number }[];
}

export interface CustomerDashboard {
  kpis: { totalOrders: number; totalSpent: number; inTransit: number; loyaltyPoints: number };
  recentOrders: Order[];
}

export interface DeliveryDashboard {
  kpis: {
    assignedToday: number; deliveredToday: number; earningsToday: number; earningsWeek: number;
    completionRate: number; pendingPayout: number; codToRemit: number; codCollected: number;
  };
  weekEarnings: { label: string; value: number }[];
}

export interface SupportDashboard {
  kpis: {
    openTickets: number; pendingTickets: number; resolvedToday: number; slaBreaches: number;
    avgResponseTime: string; satisfaction: number;
  };
  ticketsByCategory: { name: string; value: number }[];
  agentPerformance: { id: string; name: string; resolved: number; avgResponse: string; satisfaction: number }[];
}

/**
 * ApnarDokan API — served by the Laravel REST API (/api/v1).
 */
export interface AuthLoginResponse {
  token: string;
  user: SessionUser;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Product", "Order", "Review", "Cart", "Ticket"],
  endpoints: (build) => ({
    // ------------------------------------------------------------------
    // Auth
    // ------------------------------------------------------------------
    login: build.mutation<AuthLoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: build.mutation<
      AuthLoginResponse,
      {
        name: string;
        email: string;
        password: string;
        phone?: string;
        role?: Role;
        shopName?: string;
        address?: string;
      }
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),

    // ------------------------------------------------------------------
    // Catalog
    // ------------------------------------------------------------------
    getCategories: build.query<{ items: Category[]; total: number }, void>({
      query: () => ({ url: "/categories" }),
      providesTags: ["Product"],
    }),
    getBrands: build.query<{ items: Brand[]; total: number }, void>({
      query: () => ({ url: "/brands" }),
    }),

    // ------------------------------------------------------------------
    // Products
    // ------------------------------------------------------------------
    getProducts: build.query<Paginated<Product>, ProductFilters>({
      query: (params) => ({ url: "/products", params }),
      providesTags: ["Product"],
    }),
    getProduct: build.query<Product, string>({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),
    getCategoryProducts: build.query<{ items: Product[]; total: number }, string>({
      query: (categoryId) => ({ url: "/products/category", params: { categoryId } }),
      providesTags: ["Product"],
    }),
    getFlashSaleProducts: build.query<{ items: Product[]; total: number }, void>({
      query: () => ({ url: "/products/flash-sale" }),
      providesTags: ["Product"],
    }),
    getRecommendedProducts: build.query<{ items: Product[]; total: number }, void>({
      query: () => ({ url: "/products/recommended" }),
      providesTags: ["Product"],
    }),
    getTopSellingProducts: build.query<{ items: Product[]; total: number }, void>({
      query: () => ({ url: "/products/top-sellers" }),
      providesTags: ["Product"],
    }),
    getSearchSuggestions: build.query<
      { items: { id: string; name: string; price: number; image: string; brand: string }[] },
      string
    >({
      query: (q) => ({ url: "/products/search-suggest", params: { q } }),
    }),

    // ------------------------------------------------------------------
    // People
    // ------------------------------------------------------------------
    getSellers: build.query<{ items: Seller[]; total: number }, void>({
      query: () => ({ url: "/sellers" }),
    }),
    getSeller: build.query<Seller, string>({
      query: (id) => ({ url: `/sellers/${id}` }),
    }),
    getCustomers: build.query<{ items: Customer[]; total: number }, void>({
      query: () => ({ url: "/customers" }),
    }),
    getDeliveryPartners: build.query<{ items: DeliveryPartner[]; total: number }, void>({
      query: () => ({ url: "/delivery-partners" }),
    }),
    getSupportAgents: build.query<{ items: SupportAgent[]; total: number }, void>({
      query: () => ({ url: "/support-agents" }),
    }),

    // ------------------------------------------------------------------
    // Orders
    // ------------------------------------------------------------------
    getOrders: build.query<
      Paginated<Order>,
      { status?: string; customerId?: string; sellerId?: string; partnerId?: string; q?: string; page?: number; pageSize?: number }
    >({
      query: (params) => ({ url: "/orders", params }),
      providesTags: ["Order"],
    }),
    getOrder: build.query<Order, string>({
      query: (idOrCode) => ({ url: `/orders/${idOrCode}` }),
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),
    getCustomerOrders: build.query<{ items: Order[]; total: number }, string>({
      query: (customerId) => ({ url: "/orders/customer", params: { customerId } }),
      providesTags: ["Order"],
    }),
    getSellerOrders: build.query<{ items: Order[]; total: number }, string>({
      query: (sellerId) => ({ url: "/orders/seller", params: { sellerId } }),
      providesTags: ["Order"],
    }),
    getPartnerOrders: build.query<{ items: Order[]; total: number }, string>({
      query: (partnerId) => ({ url: "/orders/partner", params: { partnerId } }),
      providesTags: ["Order"],
    }),

    // ------------------------------------------------------------------
    // Reviews
    // ------------------------------------------------------------------
    getProductReviews: build.query<{ items: Review[]; total: number }, string>({
      query: (productId) => ({ url: "/reviews", params: { productId } }),
      providesTags: ["Review"],
    }),
    getReviews: build.query<
      { items: Review[]; total: number },
      { productId?: string; sellerId?: string } | void
    >({
      query: (params) => ({
        url: "/reviews",
        ...(params ? { params } : {}),
      }),
      providesTags: ["Review"],
    }),

    // ------------------------------------------------------------------
    // Tickets (support + customer views)
    // ------------------------------------------------------------------
    getTickets: build.query<
      { items: SupportTicket[]; total: number },
      { status?: string; customerId?: string; pageSize?: number } | void
    >({
      query: (params) => ({
        url: "/tickets",
        ...(params ? { params } : {}),
      }),
      providesTags: ["Ticket"],
    }),
    getTicket: build.query<SupportTicket, string>({
      query: (id) => ({ url: `/tickets/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "Ticket", id }],
    }),
    replyTicket: build.mutation<
      SupportTicketMessage,
      { ticketId: string; body: string; isInternalNote?: boolean }
    >({
      query: ({ ticketId, body, isInternalNote }) => ({
        url: `/tickets/${ticketId}/messages`,
        method: "POST",
        body: { body, isInternalNote },
      }),
      invalidatesTags: (_r, _e, { ticketId }) => [{ type: "Ticket", id: ticketId }],
    }),

    // ------------------------------------------------------------------
    // Order placement
    // ------------------------------------------------------------------
    createOrder: build.mutation<
      Order,
      {
        customerId?: string;
        customerName?: string;
        customerPhone?: string;
        customerEmail?: string;
        sellerId?: string;
        items: {
          productId: string;
          name: string;
          image?: string;
          quantity: number;
          price: number;
          variantLabel?: string;
          sellerId?: string;
        }[];
        address: Record<string, unknown>;
        payment: { method: string };
        totals: {
          subtotal: number;
          discount?: number;
          shippingFee?: number;
          tax?: number;
          total: number;
          couponCode?: string;
        };
      }
    >({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),

    // ------------------------------------------------------------------
    // Product management (seller)
    // ------------------------------------------------------------------
    createProduct: build.mutation<
      Product,
      {
        name: string;
        description?: string;
        price: number;
        mrp?: number;
        stock?: number;
        categoryId?: string;
        brand?: string;
        highlights?: string[];
        images?: { url: string; alt?: string }[];
        isPublished?: boolean;
      }
    >({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: build.mutation<
      Product,
      {
        id: string;
        name?: string;
        description?: string;
        price?: number;
        mrp?: number;
        stock?: number;
        categoryId?: string;
        brand?: string;
        highlights?: string[];
        images?: { url: string; alt?: string }[];
        isPublished?: boolean;
      }
    >({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Product", id }],
    }),

    // ------------------------------------------------------------------
    // Payout requests (seller)
    // ------------------------------------------------------------------
    requestPayout: build.mutation<
      {
        id: string;
        sellerId: string;
        amount: number;
        method: string;
        accountSummary: string;
        status: string;
        createdAt: string;
      },
      { method: string; accountSummary?: string }
    >({
      query: (body) => ({ url: "/payouts/requests", method: "POST", body }),
    }),

    // ------------------------------------------------------------------
    // Financials / ops
    // ------------------------------------------------------------------
    getPayouts: build.query<{ items: PayoutRecord[]; total: number }, { sellerId?: string } | void>({
      query: (params) => ({
        url: "/payouts",
        ...(params ? { params } : {}),
      }),
    }),
    getPromotions: build.query<
      { coupons: PromoCode[]; flashSales: FlashSaleCampaign[]; banners: HomepageBanner[] },
      void
    >({
      query: () => ({ url: "/promotions" }),
    }),
    getKnowledgeArticles: build.query<{ items: KnowledgeArticle[]; total: number }, void>({
      query: () => ({ url: "/knowledge" }),
    }),
    getAuditLogs: build.query<{ items: AdminAuditEntry[]; total: number }, void>({
      query: () => ({ url: "/audit-logs" }),
    }),

    // ------------------------------------------------------------------
    // People detail (account + delivery profile pages)
    // ------------------------------------------------------------------
    getCustomer: build.query<Customer, string>({
      query: (id) => ({ url: `/customers/${id}` }),
    }),
    getDeliveryPartner: build.query<DeliveryPartner, string>({
      query: (id) => ({ url: `/delivery-partners/${id}` }),
    }),

    // ------------------------------------------------------------------
    // Role dashboards
    // ------------------------------------------------------------------
    getAdminDashboard: build.query<AdminDashboard, void>({
      query: () => ({ url: "/dashboard/admin" }),
    }),
    getSellerDashboard: build.query<SellerDashboard, string>({
      query: (sellerId) => ({ url: "/dashboard/seller", params: { sellerId } }),
    }),
    getCustomerDashboard: build.query<CustomerDashboard, string>({
      query: (customerId) => ({ url: "/dashboard/customer", params: { customerId } }),
    }),
    getDeliveryDashboard: build.query<DeliveryDashboard, string>({
      query: (partnerId) => ({ url: "/dashboard/delivery", params: { partnerId } }),
    }),
    getSupportDashboard: build.query<SupportDashboard, void>({
      query: () => ({ url: "/dashboard/support" }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useReplyTicketMutation,
  useCreateOrderMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useRequestPayoutMutation,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoryProductsQuery,
  useGetFlashSaleProductsQuery,
  useGetRecommendedProductsQuery,
  useGetTopSellingProductsQuery,
  useGetSearchSuggestionsQuery,
  useGetSellersQuery,
  useGetSellerQuery,
  useGetCustomersQuery,
  useGetDeliveryPartnersQuery,
  useGetSupportAgentsQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetCustomerOrdersQuery,
  useGetSellerOrdersQuery,
  useGetPartnerOrdersQuery,
  useGetProductReviewsQuery,
  useGetReviewsQuery,
  useGetTicketsQuery,
  useGetTicketQuery,
  useGetPayoutsQuery,
  useGetPromotionsQuery,
  useGetKnowledgeArticlesQuery,
  useGetAuditLogsQuery,
  useGetCustomerQuery,
  useGetDeliveryPartnerQuery,
  useGetAdminDashboardQuery,
  useGetSellerDashboardQuery,
  useGetCustomerDashboardQuery,
  useGetDeliveryDashboardQuery,
  useGetSupportDashboardQuery,
} = api;
