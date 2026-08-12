"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface UiState {
  toasts: Toast[];
  mobileMenuOpen: boolean;
  searchOpen: boolean;
}

const initialState: UiState = {
  toasts: [],
  mobileMenuOpen: false,
  searchOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    pushToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      state.toasts.push({ ...action.payload, id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` });
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },
  },
});

export const { pushToast, dismissToast, setMobileMenu, setSearchOpen } = uiSlice.actions;
export const selectToasts = (state: { ui: UiState }) => state.ui.toasts;

export default uiSlice.reducer;
