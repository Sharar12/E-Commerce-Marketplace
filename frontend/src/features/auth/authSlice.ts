"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Role, Seller, Customer, DeliveryPartner, SupportAgent } from "@/types";

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  sellerId?: string;
  partnerId?: string;
  agentId?: string;
  shopName?: string;
}

interface AuthState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  persistedRole: Role | null; // role selected at registration
}

const STORAGE_KEY = "apnardokan_session";

function loadSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: typeof window !== "undefined" ? loadSession() : null,
  isAuthenticated: typeof window !== "undefined" ? loadSession() !== null : false,
  persistedRole: null,
};

export const demoAccounts: Record<Role, { email: string; password: string; label: string }> = {
  customer: { email: "rahim.uddin@gmail.com", password: "demo1234", label: "Customer" },
  seller: { email: "tanvir@techpointbd.com", password: "demo1234", label: "Seller" },
  delivery: { email: "habib.mia@apnardokan.delivery", password: "demo1234", label: "Delivery Partner" },
  support: { email: "sharmin@apnardokan.com", password: "demo1234", label: "Web Support" },
  admin: { email: "admin@apnardokan.com", password: "demo1234", label: "Admin" },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<SessionUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.persistedRole = null;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    },
    setPersistedRole: (state, action: PayloadAction<Role>) => {
      state.persistedRole = action.payload;
    },
  },
});

export const { login, logout, setPersistedRole } = authSlice.actions;
export default authSlice.reducer;
