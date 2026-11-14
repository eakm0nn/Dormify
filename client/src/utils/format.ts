const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Bangkok',
});
const roomTypes: Partial<Record<string, string>> = {
  AC: 'ห้องปรับอากาศ',
  'NON-AC': 'ห้องพัดลม',
};
const bookingStatuses: Partial<Record<string, { label: string; className: string }>> = {
  EXPIRED: { label: 'หมดเวลาการกันห้อง', className: 'badge-neutral' },
  CONVERTED: { label: 'ทำสัญญาแล้ว', className: 'badge-success' },
  PENDING: { label: 'รอดำเนินการ', className: 'badge-warning' },
  CONFIRMED: { label: 'อนุมัติแล้ว', className: 'badge-success' },
  APPROVED: { label: 'อนุมัติแล้ว', className: 'badge-success' },
  REJECTED: { label: 'ไม่อนุมัติ', className: 'badge-error' },
  CANCELLED: { label: 'ยกเลิกแล้ว', className: 'badge-neutral' },
  PAID: { label: 'ชำระแล้ว', className: 'badge-success' },
  FAILED: { label: 'ไม่สำเร็จ', className: 'badge-error' },
};
const unknownStatus = { label: 'ไม่ทราบสถานะ', className: 'badge-neutral' };

export const money = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return 'ยังไม่ระบุ';
  }
  const number = Number(value);
  return Number.isFinite(number) ? currencyFormatter.format(number) : 'ยังไม่ระบุ';
};
export const thaiDate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 'ยังไม่ระบุ';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'ยังไม่ระบุ' : dateFormatter.format(date);
};
export const roomType = (type: string) =>
  Object.hasOwn(roomTypes, type) ? roomTypes[type]! : 'ห้องพัก';
export const bookingStatus = (status: string) =>
  Object.hasOwn(bookingStatuses, status) ? bookingStatuses[status]! : unknownStatus;
export const roleName = (role: string | undefined) => (role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน');
