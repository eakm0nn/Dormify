import { ArrowUpRight, BedDouble, ClipboardList, DoorOpen } from 'lucide-react';
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
    error: bookingError,
    refresh: refreshSummary,
  } = useApiResource<BookingSummary>(
    dormitory ? `/api/bookings/summary?propertyId=${dormitory.id}` : null,
    'ไม่สามารถโหลดข้อมูลสรุปได้ กรุณาลองอีกครั้ง',
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow mb-2">ดูแลหอพักในที่เดียว</p>
          <h1>ภาพรวม</h1>
          <p>ข้อมูลห้องพักและคำขอเช่าล่าสุดจากระบบ</p>
        </div>
        <Link to="/" className="btn btn-outline">
          ดูหน้าเว็บไซต์
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      {error && <ErrorMessage message={error} onRetry={refresh} />}
      {bookingError && <ErrorMessage message={bookingError} onRetry={refreshSummary} />}
      {loading ? (
        <Loading />
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            { label: 'ห้องพักทั้งหมด', count: summary?.totalRooms ?? '—', icon: BedDouble },
            { label: 'ห้องว่าง', count: summary?.availableRooms ?? '—', icon: DoorOpen },
            {
              label: 'คำขอรอดำเนินการ',
              count: summary?.pendingBookings ?? '—',
              icon: ClipboardList,
            },
          ].map(({ label, count, icon: Icon }) => (
            <section className="surface flex items-start justify-between p-6" key={label}>
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="stat-number mt-3">{count}</p>
              </div>
              <span className="section-icon">
                <Icon className="h-5 w-5" />
              </span>
            </section>
          ))}
        </div>
      )}
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <section className="surface p-6">
          <h2 className="text-lg">เริ่มจัดการหอพัก</h2>
          <p className="mt-2 text-sm text-muted">เพิ่มข้อมูลห้องพักและตรวจสอบคำขอเช่าจากผู้ใช้งาน</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/admin/rooms" className="btn btn-primary">
              จัดการห้องพัก
            </Link>
            <Link to="/admin/bookings" className="btn btn-outline">
              ตรวจสอบคำขอเช่า
            </Link>
          </div>
        </section>
        <section className="surface p-6">
          <h2 className="text-lg">การเงิน สัญญา และรายงาน</h2>
          {report.error && <ErrorMessage message={report.error} onRetry={report.refresh} />}
          {report.loading ? (
            <Loading />
          ) : (
            report.data && (
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted">รายรับยืนยันแล้วทั้งหมด</dt>
                  <dd className="mt-1 font-semibold">{money(report.data.receipts)}</dd>
                </div>
                <div>
                  <dt className="text-muted">บิลค้างชำระทั้งหมด</dt>
                  <dd className="mt-1 font-semibold">{money(report.data.outstanding)}</dd>
                </div>
                <div>
                  <dt className="text-muted">สัญญาที่ใช้งาน</dt>
                  <dd className="mt-1 font-semibold">{report.data.activeLeases}</dd>
                </div>
                <div>
                  <dt className="text-muted">เรื่องซ่อมค้าง</dt>
                  <dd className="mt-1 font-semibold">{report.data.openRepairs}</dd>
                </div>
              </dl>
            )
          )}
          <Link to="/admin/reports" className="btn btn-outline mt-5">
            ดูรายงานและบันทึกรายจ่าย
          </Link>
        </section>
      </div>
    </>
  );
};
export default AdminOverview;
