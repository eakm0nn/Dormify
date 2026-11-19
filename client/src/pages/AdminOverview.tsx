import { Link } from 'react-router-dom';
import { ErrorMessage, Loading } from '../components/Feedback';
import { useDormitory } from '../context/DormitoryContext';
import { useApiResource } from '../hooks/useApiResource';
import type { BookingSummary } from '../types/api';
import type { Report } from '../types/operations';
import { money } from '../utils/format';

const AdminOverview = () => {
  const { dormitory, loading, error, refresh } = useDormitory();
  const report = useApiResource<Report>('/api/operations/reports', 'โหลดสรุปการเงินไม่ได้');
  const {
    data: summary,
    loading: summaryLoading,
    error: bookingError,
    refresh: refreshSummary,
  } = useApiResource<BookingSummary>(
    dormitory ? `/api/bookings/summary?propertyId=${dormitory.id}` : null,
    'ไม่สามารถโหลดข้อมูลสรุปได้ กรุณาลองอีกครั้ง',
  );
  const pending = summaryLoading || loading ? '…' : (summary?.pendingBookings ?? 'ยังโหลดไม่ได้');
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>ภาพรวม</h1>
          <p>{dormitory?.name || 'ระบบบริหารหอพัก'} · ตรวจรายการที่รอดำเนินการก่อนเริ่มงาน</p>
        </div>
        <Link to="/" className="btn btn-outline">
          ดูหน้าเว็บไซต์
        </Link>
      </div>
      {error && <ErrorMessage message={error} onRetry={refresh} />}
      {bookingError && <ErrorMessage message={bookingError} onRetry={refreshSummary} />}
      <div className="grid items-start gap-7 xl:grid-cols-[1fr_1.2fr]">
        <section
          className="overview-priority surface p-6"
          aria-labelledby="pending-booking-heading"
        >
          <h2 id="pending-booking-heading" className="text-lg">
            คำขอรอดำเนินการ
          </h2>
          <p className="priority-count mt-4 text-5xl font-semibold text-navy">{pending}</p>
          <p className="mb-5 mt-3 text-sm leading-7 text-muted">
            {summary?.pendingBookings === 0
              ? 'ยังไม่มีคำขอเช่าที่รออนุมัติ'
              : 'ตรวจรายละเอียดคำขอและสถานะห้องก่อนอนุมัติการกันห้อง'}
          </p>
          <Link to="/admin/bookings" className="btn btn-primary">
            ตรวจสอบคำขอเช่า
          </Link>
        </section>
        <section
          className="overview-followup border-y border-line py-5"
          aria-labelledby="followup-heading"
        >
          <h2 id="followup-heading" className="text-lg">
            การเงินและงานซ่อม
          </h2>
          {report.error ? (
            <ErrorMessage message={report.error} onRetry={report.refresh} />
          ) : report.loading ? (
            <Loading text="กำลังโหลดสรุปการเงินและงานซ่อม…" />
          ) : report.data ? (
            <dl className="mt-3 divide-y divide-line">
              <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <dt className="text-sm text-muted">บิลค้างชำระทั้งหมด</dt>
                  <dd className="mt-1 text-2xl font-semibold text-navy">
                    {money(report.data.outstanding)}
                  </dd>
                </div>
                <Link to="/admin/invoices" className="btn btn-outline">
                  ดูใบแจ้งหนี้
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <dt className="text-sm text-muted">เรื่องซ่อมค้าง</dt>
                  <dd className="mt-1 text-2xl font-semibold text-navy">
                    {report.data.openRepairs} รายการ
                  </dd>
                </div>
                <Link to="/admin/maintenance" className="btn btn-outline">
                  ดูงานแจ้งซ่อม
                </Link>
              </div>
            </dl>
          ) : null}
        </section>
      </div>
      <section id="room-summary" className="mt-8 border-y border-line py-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg">ห้องพักและสัญญา</h2>
          <Link to="/admin/rooms" className="btn btn-outline">
            จัดการห้องพัก
          </Link>
        </div>
        <dl className="summary-facts grid gap-5 sm:grid-cols-3">
          <div>
            <dt>ห้องพักทั้งหมด</dt>
            <dd>{summary?.totalRooms ?? (bookingError || error ? 'โหลดไม่สำเร็จ' : '…')}</dd>
          </div>
          <div>
            <dt>ห้องว่าง</dt>
            <dd>{summary?.availableRooms ?? (bookingError || error ? 'โหลดไม่สำเร็จ' : '…')}</dd>
          </div>
          <div>
            <dt>สัญญาที่ใช้งาน</dt>
            <dd>{report.data?.activeLeases ?? (report.error ? 'โหลดไม่สำเร็จ' : '…')}</dd>
          </div>
        </dl>
      </section>
      <section className="mt-5 flex flex-wrap items-center justify-between gap-4 py-2">
        <div>
          <h2 className="text-sm font-normal text-muted">รายรับสุทธิหลังคืนเงินทั้งหมด</h2>
          <p className="mt-1 text-xl font-semibold text-navy">
            {report.data ? money(report.data.receipts) : 'ยังไม่มีข้อมูล'}
          </p>
        </div>
        <Link to="/admin/reports" className="btn btn-outline">
          ดูรายงานและบันทึกรายจ่าย
        </Link>
      </section>
    </>
  );
};
export default AdminOverview;
