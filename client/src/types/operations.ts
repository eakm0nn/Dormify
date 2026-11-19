import type { Room } from './api';
export interface Tenant {
  id: number;
  userId: number | null;
  name: string;
  phone?: string;
  address?: string;
  leases?: { id: number; contractNo: string; status: string; roomId: number }[];
}
export interface Deposit {
  id: number;
  leaseId: number;
  kind: string;
  method: string;
  amount: string;
  createdAt: string;
}
export interface Lease {
  id: number;
  contractNo: string;
  tenantId: number;
  roomId: number;
  bookingId: number | null;
  status: string;
  startDate: string;
  endDate: string | null;
  signedDate: string | null;
  monthlyRent: string;
  depositRequired: string;
  dueDaysSnapshot: number;
  depositMonthsSnapshot: number;
  tenant: Tenant;
  room: Room;
  occupants: { id: number; name: string; phone?: string }[];
  deposits: Deposit[];
}
export interface Options {
  users: { id: number; name: string; email: string }[];
  rooms: Room[];
  tenants: Tenant[];
  leases: Lease[];
  bookings: { id: number; roomId: number; userId: number; room: Room; user: { name: string } }[];
}
export interface Policy {
  autoBilling?: boolean;
  id: number;
  holdHours: number;
  depositMonths: number;
  dueDays: number;
}
export interface Rate {
  id: number;
  utilityType: string;
  unitPrice: string;
  effectiveFrom: string;
  sourceReference: string;
}
export interface Reading {
  rawValue?: string | null;
  id: number;
  roomId: number;
  utilityType: string;
  readingDate: string;
  value: string;
  room: Room;
}
export interface InvoiceItem {
  periodStart?: string | null;
  periodEnd?: string | null;
  id: number;
  itemType: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  openingValue: string | null;
  closingValue: string | null;
  sourceReference: string | null;
}
export interface Invoice {
  amountDue?: string;
  adjustments?: {
    id: number;
    amount: string;
    reason: string;
    refundedAt: string | null;
    refundEligible?: boolean | null;
  }[];
  settlement?: { invoiceId: number } | null;
  id: number;
  invoiceNo: string;
  leaseId: number;
  cycleIndex: number;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: string;
  tenantNameSnapshot: string;
  roomNumberSnapshot: string;
  totalAmount: string;
  items: InvoiceItem[];
}
export interface InvoicePayment {
  id: number;
  invoiceId: number;
  method: string;
  amount: string;
  paidDate: string;
  status: string;
  reason: string | null;
  proof: { id: number; mime: string; size: number } | null;
  invoice: Pick<Invoice, 'id' | 'invoiceNo' | 'totalAmount' | 'status' | 'leaseId'>;
}
export interface Maintenance {
  id: number;
  leaseId: number;
  title: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  room: Room;
  lease: { contractNo: string };
}
export interface Expense {
  id: number;
  description: string;
  category: string;
  amount: string;
  expenseDate: string;
}
export interface Announcement {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}
export interface Notification {
  id: number;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}
export interface Audit {
  id: number;
  actorName: string;
  action: string;
  entityType: string;
  entityId: number | null;
  summary: string;
  createdAt: string;
}
export interface Report {
  receipts: string;
  expenses: string;
  operatingBalance: string;
  depositReceived: string;
  depositRefunded: string;
  depositMovement: string;
  outstanding: string;
  totalRooms: number;
  vacantRooms: number;
  activeLeases: number;
  openRepairs: number;
}
