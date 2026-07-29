const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

import { emitToast } from "../lib/ToastBridg";

export class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) {
    const message = data?.message || "Something went wrong";
    emitToast("error", message);
    throw new ApiClientError(message, res.status);
  }

  return data as T;
}