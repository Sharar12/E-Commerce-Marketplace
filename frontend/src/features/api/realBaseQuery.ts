import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * REAL BASE QUERY
 * ---------------------------------------------------------------------
 * Points every RTK Query endpoint at the Laravel API (Section 7 of the
 * backend build). The URL / params contract is identical to the mock
 * baseQuery — only the transport changed.
 *
 *  - baseUrl comes from NEXT_PUBLIC_API_URL (.env.local), defaulting to
 *    the local Laravel dev server.
 *  - The Sanctum bearer token (apnardokan_token) is attached to every
 *    request; a 401 clears the local session so the UI returns to login.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const SESSION_TOKEN_KEY = "apnardokan_token";

const raw = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem(SESSION_TOKEN_KEY);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

export const realBaseQuery: BaseQueryFn<
  FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await raw(args, api, extraOptions);

  // Session expired / invalid token — drop the session so guards bounce
  // the user back to /login instead of showing stale dashboards.
  if (result.error?.status === 401 && typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  }

  return result;
};
