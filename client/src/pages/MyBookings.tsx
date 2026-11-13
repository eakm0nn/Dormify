import { ArrowUpRight, BedDouble, CalendarDays, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import { useApiResource } from '../hooks/useApiResource';
import type { Booking } from '../types/api';
import { bookingStatus, money, roomType, thaiDate } from '../utils/format';

const MyBookings = ({ roomView = false }) => {
  const {
    data,
    loading,
    error,
    refresh: load,
  } = useApiResource<Booking[]>('/api/bookings/my-bookings', 'ไม่สามารถโหลดรายการเช่าของคุณได้');
  const bookings = data ?? [];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>{roomView ? 'ข้อมูลห้องพัก' : 'รายการเช่าของฉัน'}</h1>
          <p>
            {roomView
              ? 'รายละเอียดห้องพักในรายการเช่าที่คุณส่งไว้'
              : 'ติดตามสถานะคำขอและรายละเอียดการเช่าของคุณ'}
          </p>
        </div>
        <Link to="/#rooms" className="btn btn-outline">
          เลือกดูห้องพัก
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      {loading ? (
        <Loading text="กำลังโหลดรายการเช่า…" />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : !bookings.length ? (
        <section className="surface">
          <EmptyState
            icon={ClipboardList}
            title="ยังไม่มีรายการเช่า"
            description="เมื่อคุณส่งคำขอเช่าห้องพักแล้ว รายการและสถานะจะแสดงที่นี่"
          >
            <Link to="/#rooms" className="btn btn-primary">
              เลือกห้องพัก
            </Link>
          </EmptyState>
        </section>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = bookingStatus(booking.status);
            return (
              <article className="surface p-5 sm:p-6" key={booking.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="section-icon">
                      <BedDouble className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs text-muted">รายการเช่า #{booking.id}</p>
                      <h2 className="mt-1 text-lg">ห้อง {booking.room?.roomNumber}</h2>
                      <p className="mt-1 text-sm text-muted">
                        {booking.room?.property?.name} · {roomType(booking.room?.type)}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>
                <div className="mt-5 flex flex-wrap justify-between gap-4 border-t border-line pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      {thaiDate(booking.startDate)} – {thaiDate(booking.endDate)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted">ยอดที่ระบุในคำขอ </span>
                    <span className="font-semibold text-navy">{money(booking.totalAmount)}</span>
                  </div>
                </div>
                {booking.status === 'PENDING' && (
                  <p className="mt-3 text-xs text-muted">
                    ผู้ดูแลกำลังตรวจสอบคำขอของคุณ กรุณาติดตามสถานะจากหน้านี้
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
};
export default MyBookings;
