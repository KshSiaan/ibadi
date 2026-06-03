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

/* ─── User Types ─── */
export interface Location {
  type: "Point";
  coordinates: [number, number];
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
}

export interface ServiceProviderInfo {
  bio?: string;
  perHourPrice?: number;
}

/* ─── OTP Types ─── */
export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

/* ─── Notification Types ─── */
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

/* ─── Review Types ─── */
export interface Review {
  id: string;
  rating: number;
  review: string;
  reviewerId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  review: string;
  userId: string;
}

export interface ReviewStatistic {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

/* ─── Booking Types ─── */
export interface BookingDay {
  day: string;
  startTime: string;
  endTime: string;
  durationHours: number;
}

export interface CreateBookingRequest {
  providerId: string;
  price: number;
  startDate: string;
  totalHours: number;
  bookingType: "weekly" | "once";
  bookingDays: BookingDay[];
}

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  price: number;
  startDate: string;
  totalHours: number;
  bookingType: string;
  bookingDays: (BookingDay & { id: string; status: string })[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutRequest {
  bookingId: string;
  additionalComment?: string;
}

/* ─── Favorite Types ─── */
export interface Favorite {
  id: string;
  userId: string;
  serviceProviderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFavoriteRequest {
  serviceProviderId: string;
}

/* ─── Work Schedule Types ─── */
export interface WorkScheduleEntry {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  userId: string;
  startTime: string;
  endTime: string;
  status: boolean;
}

export interface WorkSchedule extends WorkScheduleEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Call History Types ─── */
export interface CallHistory {
  id: string;
  callerId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCallHistoryRequest {
  receiverId: string;
}

/* ─── Address Types ─── */
export interface Address {
  id: string;
  userId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location?: Location;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location?: Location;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  isDefault?: boolean;
}

/* ─── Stripe Types ─── */
export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface SaveCardRequest {
  paymentMethodId: string;
  customerId: string;
}

/* ─── Homepage Types ─── */
export interface HomepageFilters {
  searchTerm?: string;
  categoryId?: string;
  experienceOptionId?: string;
  otherTaskIds?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface AvailabilityRequest {
  providerId: string;
  date: string;
  slotDuration?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

/* ─── Verification Request Types ─── */
export interface VerificationRequest {
  id: string;
  userId: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RejectVerificationRequest {
  reason: string;
}

/* ─── Contents Types ─── */
export interface Content {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/* ─── FAQ Types ─── */
export interface Faq {
  id: string;
  question: string;
  answer: string;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
  categoryId: string;
}

export interface UpdateFaqRequest {
  question?: string;
  answer?: string;
}

/* ─── Experience Options Types ─── */
export interface ExperienceOption {
  id: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExperienceOptionRequest {
  value: string;
}

/* ─── Others Task Options Types ─── */
export interface OthersTaskOption {
  id: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOthersTaskOptionRequest {
  value: string;
}

/* ─── Services Types ─── */
export interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Client Review Types ─── */
export interface ClientReview {
  id: string;
  name: string;
  review: string;
  rating: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Dashboard Types ─── */
export interface AdminCard {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface AdminChart {
  month: string;
  revenue: number;
}

/* ─── Auth Extended Types ─── */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleLoginRequest {
  token: string;
}

/* ─── Chat Types ─── */
export interface Chat {
  id: string;
  participants: string[];
  status: "pending" | "accepted" | "blocked";
  createdAt: string;
  updatedAt: string;
}
