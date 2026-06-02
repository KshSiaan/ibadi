export interface Category {
  id: string;
  name: string;
  image: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

/* ─── Auth Types ─── */
export interface User {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  fcmToken: string | null;
  status: string;
  role: "user" | "professional";
  profile: string;
  phoneNumber: string;
  isVerified: boolean;
  customerId: string;
  avgRating: number;
  totalReview: number;
  location: string | null;
  expireAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  verification: { status: boolean };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/* ─── Password Reset Types ─── */
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  email: string;
  token: string;
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

/* ─── Registration Types ─── */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  otpToken: {
    token: string;
  };
}

export interface VerifyOtpForRegisterResponse {
  message: string;
}
