// ─── Shared ───────────────────────────────────────────────────────────────────

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export type MealMap = {
  Breakfast: number;
  Lunch: number;
  Dinner: number;
};

export type MealMenuMap = {
  Breakfast: string;
  Lunch: string;
  Dinner: string;
};

export type Department =
  | 'Temple Administration'
  | 'Deity Department'
  | 'Kitchen / Prasadam'
  | 'Education / Gurukul'
  | 'Guest House'
  | 'Security'
  | 'Accounts'
  | 'Outreach / Sankirtan'
  | 'IT / Media'
  | 'Others';

// ─── Prasadam Bookings ────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'approved' | 'declined';

export interface PrasadamBooking {
  _id: string;
  id: string;
  name: string;
  mobile: string;
  email?: string;
  location: 'Thiruvanmiyur' | 'NLBR';
  date: string;
  meals: MealMap;
  total: number;
  status: BookingStatus;
  submitted?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrasadamBookingDto {
  name: string;
  mobile: string;
  email?: string;
  location: 'Thiruvanmiyur' | 'NLBR';
  date: string;
  meals: MealMap;
  total: number;
}

// ─── Party Enquiries ──────────────────────────────────────────────────────────

export type EnquiryStatus = 'pending' | 'accepted' | 'declined';

export interface PartyEnquiry {
  _id: string;
  id: string;
  name: string;
  mobile: string;
  email?: string;
  eventDate: string;
  address: string;
  meals: MealMap;
  preferredMenu?: string;
  preferredPrice?: number;
  confirmedMenu?: string;
  confirmedPrice?: number;
  mealPrices: MealMap;
  status: EnquiryStatus;
  paid: boolean;
  submitted?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartyEnquiryDto {
  name: string;
  mobile: string;
  email?: string;
  eventDate: string;
  address: string;
  meals: MealMap;
  preferredMenu?: string;
  preferredPrice?: number;
}

export interface UpdatePartyEnquiryDto {
  status?: EnquiryStatus;
  paid?: boolean;
  confirmedMenu?: string;
  confirmedPrice?: number;
  mealPrices?: Partial<MealMap>;
  meals?: Partial<MealMap>;
}

// ─── Internal Orders ──────────────────────────────────────────────────────────

export interface InternalOrder {
  _id: string;
  id: string;
  name: string;
  mobile: string;
  date: string;
  dept: Department;
  meal: MealType;
  count: number;
  location: string;
  accepted: boolean;
  delivered: boolean;
  submitted?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInternalOrderDto {
  name: string;
  mobile: string;
  date: string;
  dept: Department;
  meal: MealType;
  count: number;
  location: string;
}

// ─── Slot Dates ───────────────────────────────────────────────────────────────

export interface MealStatus {
  stopped: boolean;
  removed: boolean;
}

export interface SlotDate {
  _id: string;
  date: string;
  meals: MealType[];
  stopped: boolean;
  isFestival: boolean;
  festivalName?: string;
  mealStatus: {
    Breakfast: MealStatus;
    Lunch: MealStatus;
    Dinner: MealStatus;
  };
  priceOverrides: {
    Breakfast?: number;
    Lunch?: number;
    Dinner?: number;
  };
  createdAt: string;
  updatedAt: string;
}

/** Public-facing slot map: { 'YYYY-MM-DD': MealType[] } */
export type SlotMap = Record<string, MealType[]>;

// ─── Meal Menus ───────────────────────────────────────────────────────────────

export interface MealMenu {
  _id: string;
  date: string;
  meals: MealMenuMap;
  createdAt: string;
  updatedAt: string;
}

/** Public-facing menu map: { 'YYYY-MM-DD': MealMenuMap } */
export type MenuMap = Record<string, MealMenuMap>;

// ─── Festivals ────────────────────────────────────────────────────────────────

export interface Festival {
  _id: string;
  date: string;
  name: string;
  description?: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
