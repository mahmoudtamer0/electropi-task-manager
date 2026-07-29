import { apiRequest } from "./clients";
import type { User } from "../types";

interface AuthResponse {
  status: string;
  token: string;
  user: User;
}

export const registerRequest = (data: { name: string; email: string; password: string }) =>
  apiRequest<{ status: string; message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const verifyEmailRequest = (data: { email: string; otp: string }) =>
  apiRequest<AuthResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const resendOtpRequest = (data: { email: string }) =>
  apiRequest<{ status: string; message: string }>("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const loginRequest = (data: { email: string; password: string }) =>
  apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });