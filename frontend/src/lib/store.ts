import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/features/api/api";
import uiReducer from "@/features/ui/uiSlice";
import cartReducer from "@/features/cart/cartSlice";
import authReducer from "@/features/auth/authSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    ui: uiReducer,
    cart: cartReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
