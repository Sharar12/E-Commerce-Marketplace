"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, WishlistItem } from "@/types";

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
  couponCode: string | null;
  open: boolean;
}

const STORAGE = "apnardokan_cart";
const WISH_STORAGE = "apnardokan_wishlist";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const initialState: CartState = {
  items: load<CartItem[]>(STORAGE, []),
  wishlist: load<WishlistItem[]>(WISH_STORAGE, []),
  couponCode: null,
  open: false,
};

function save<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ productId: string; quantity?: number; variantLabel?: string }>) => {
      const { productId, quantity = 1, variantLabel } = action.payload;
      const existing = state.items.find(
        (i) => i.productId === productId && (i.variantLabel ?? undefined) === variantLabel,
      );
      if (existing) existing.quantity += quantity;
      else state.items.push({ productId, quantity, variantLabel });
      save(STORAGE, state.items);
    },
    removeItem: (state, action: PayloadAction<{ productId: string; variantLabel?: string }>) => {
      state.items = state.items.filter(
        (i) => !(i.productId === action.payload.productId && (i.variantLabel ?? undefined) === action.payload.variantLabel),
      );
      save(STORAGE, state.items);
    },
    setQuantity: (state, action: PayloadAction<{ productId: string; variantLabel?: string; quantity: number }>) => {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId && (i.variantLabel ?? undefined) === action.payload.variantLabel,
      );
      if (item && action.payload.quantity > 0) item.quantity = action.payload.quantity;
      save(STORAGE, state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      save(STORAGE, state.items);
    },
    setCoupon: (state, action: PayloadAction<string | null>) => {
      state.couponCode = action.payload;
    },
    toggleCart: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const exists = state.wishlist.some((w) => w.productId === action.payload);
      state.wishlist = exists
        ? state.wishlist.filter((w) => w.productId !== action.payload)
        : [...state.wishlist, { productId: action.payload, addedAt: new Date().toISOString() }];
      save(WISH_STORAGE, state.wishlist);
    },
  },
});

export const {
  addItem,
  removeItem,
  setQuantity,
  clearCart,
  setCoupon,
  toggleCart,
  toggleWishlist,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectWishlist = (state: { cart: CartState }) => state.cart.wishlist;
export const selectCartOpen = (state: { cart: CartState }) => state.cart.open;

export default cartSlice.reducer;
