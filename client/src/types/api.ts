// Existing JSON contracts. Prisma Decimal and DateTime values arrive as strings.
export type Role = 'ADMIN' | 'USER';
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}
export type AuthResult = { success: true } | { success: false; error: string };
export interface LoginResponse {
  token: string;
  user: PublicUser;
}
export interface Room {
  amenities?: string[];
  id: number;
  roomNumber: string;
  capacity: number;
  price: string | number;
  type: string;
  isAvailable: boolean;
  isActive: boolean;
  propertyId: number;
  images?: string[];
  property?: Dormitory;
}
export interface Dormitory {
  amenities?: string[];
  id: number;
  name: string;
  address: string;
  city: string;
  type: string;
  rules: string | null;
  owner?: Pick<PublicUser, 'name' | 'email'>;
  rooms: Room[];
  // Optional presentation fields retained for compatibility; no mock data.
  images?: string[];
}
export interface Booking {
  holdExpiresAt?: string | null;
  holdHoursSnapshot?: number | null;
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: string | number;
  createdAt: string;
  userId: number;
  roomId: number;
  room: Room;
  user?: Pick<PublicUser, 'name' | 'email'>;
}
export interface RoomFilters {
  availability: string;
  type: string;
  priceMax: string;
}
export interface BookingSummary {
  totalRooms: number;
  availableRooms: number;
  pendingBookings: number;
}
