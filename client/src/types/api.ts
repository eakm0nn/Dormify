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
  id: number;
  roomNumber: string;
  capacity: number;
  price: string | number;
  type: string;
  isAvailable: boolean;
  propertyId: number;
  images?: string[];
  property?: Dormitory;
}
export interface Review {
  id: number;
  studentName?: string;
  name?: string;
  rating: number;
  date: string;
  text: string;
}
export type MealMenu = Record<
  string,
  Partial<Record<'breakfast' | 'lunch' | 'snacks' | 'dinner', string>>
>;
export interface Dormitory {
  id: number;
  name: string;
  address: string;
  city: string;
  type: string;
  rules: string | null;
  hasMess: boolean;
  owner?: Pick<PublicUser, 'name' | 'email'>;
  rooms: Room[];
  // Optional presentation fields retained for compatibility; no mock data.
  images?: string[];
  messMenu?: MealMenu;
  reviews?: Review[];
}
export interface Booking {
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
