import { Link } from 'react-router-dom';
import { ErrorMessage, Loading } from '../components/Feedback';
import { Status } from '../components/OperationUI';
import { useAuth } from '../context/AuthContext';
import { useApiResource } from '../hooks/useApiResource';
import type { Booking } from '../types/api';
import type { Invoice, Lease } from '../types/operations';
import { bookingStatus, money, roleName, thaiDate } from '../utils/format';

const Profile = () => {
  const { user } = useAuth();
  const leases = useApiResource<Lease[]>('/api/operations/leases', 'โหลดข้อมูลห้องพักไม่ได้');
  const bookings = useApiResource<Booking[]>('/api/bookings/my-bookings', 'โหลดสถานะการเช่าไม่ได้');
  const invoices = useApiResource<Invoice[]>('/api/operations/invoices', 'โหลดใบแจ้งหนี้ไม่ได้');
  const activeLeases = leases.data?.filter((lease) => lease.status === 'ACTIVE') ?? [];
  const latestBooking = bookings.data?.[0];
  const nextInvoice = invoices.data
    ?.filter((invoice) => invoice.status === 'ISSUED')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.id - b.id)[0];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>สวัสดี คุณ{user?.name}</h1>
          <p>ข้อมูลห้องพัก สถานะการเช่า และใบแจ้งหนี้ของคุณ</p>
        </div>
      </div>
      <div className="resident-overview grid items-start gap-7 xl:grid-cols-2">
        <section className="border-y border-line py-5" aria-labelledby="resident-room-heading">
          <h2 id="resident-room-heading" className="text-lg">
            ห้องพักของคุณ
          </h2>
          {leases.loading ? (
            <Loading text="กำลังโหลดข้อมูลห้องพัก…" />
          ) : leases.error ? (
            <ErrorMessage message={leases.error} onRetry={leases.refresh} />
          ) : activeLeases.length ? (
            <ul className="mt-4 space-y-4">
              {activeLeases.map((lease) => (
                <li key={lease.id} className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold text-navy">ห้อง {lease.room.roomNumber}</p>
                    <p className="mt-1 text-sm text-muted">
                      {lease.contractNo} · ค่าเช่า {money(lease.monthlyRent)} / เดือน
                    </p>
                  </div>
                  <Status value={lease.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">ยังไม่มีสัญญาเช่าที่ใช้งานอยู่</p>
          )}
          <Link to="/user/room" className="btn btn-outline mt-5">
            ดูข้อมูลห้องพักและสัญญา
          </Link>
          <div className="mt-5 border-t border-line pt-4">
            <h3 className="text-sm">คำขอเช่าล่าสุด</h3>
            {bookings.loading ? (
              <Loading text="กำลังโหลดสถานะการเช่า…" />
            ) : bookings.error ? (
              <ErrorMessage message={bookings.error} onRetry={bookings.refresh} />
            ) : latestBooking ? (
              <p className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <span>ห้อง {latestBooking.room?.roomNumber}</span>
                <span className={'badge ' + bookingStatus(latestBooking.status).className}>
                  {bookingStatus(latestBooking.status).label}
                </span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">ยังไม่มีคำขอเช่าห้องพัก</p>
            )}
            <Link
              to="/user/bookings"
              className="inline-flex min-h-11 items-center text-sm text-brand underline"
            >
              ติดตามสถานะการเช่า
            </Link>
          </div>
        </section>
        <section className="surface p-5 sm:p-6" aria-labelledby="resident-invoice-heading">
          <h2 id="resident-invoice-heading" className="text-lg">
            ใบแจ้งหนี้ที่ครบกำหนดก่อน
          </h2>
          {invoices.loading ? (
            <Loading text="กำลังโหลดใบแจ้งหนี้…" />
          ) : invoices.error ? (
            <ErrorMessage message={invoices.error} onRetry={invoices.refresh} />
          ) : nextInvoice ? (
            <div className="mt-4">
              <p className="text-sm text-muted">
                {nextInvoice.invoiceNo} · ห้อง {nextInvoice.roomNumberSnapshot}
              </p>
              <p className="resident-amount mt-2 text-3xl font-semibold text-navy">
                {money(nextInvoice.amountDue ?? nextInvoice.totalAmount)}
              </p>
              <p className="mt-2 text-sm">ครบกำหนด {thaiDate(nextInvoice.dueDate)}</p>
              <p className="mt-3 text-xs leading-6 text-muted">
                ยอดตามใบแจ้งหนี้นี้ การแจ้งโอนต้องรอผู้ดูแลตรวจยืนยันรับเงิน
              </p>
              <Link to="/user/payments" className="btn btn-primary mt-5">
                ไปหน้าชำระเงิน
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">ยังไม่มีใบแจ้งหนี้ค้างชำระ</p>
          )}
          <Link
            to="/user/invoices"
            className="mt-2 inline-flex min-h-11 items-center text-sm text-brand underline"
          >
            ดูใบแจ้งหนี้ทั้งหมด
          </Link>
        </section>
      </div>
      <section className="mt-8 border-t border-line pt-5" aria-labelledby="account-heading">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 id="account-heading" className="text-lg">
            ข้อมูลส่วนตัว
          </h2>
          <span className="badge badge-info">{roleName(user?.role)}</span>
        </div>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted">ชื่อและนามสกุล</dt>
            <dd className="mt-1 break-words font-medium">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">อีเมล</dt>
            <dd className="mt-1 break-all font-medium">{user?.email}</dd>
          </div>
        </dl>
        <p className="mt-5 text-xs leading-6 text-muted">
          ข้อมูลจากบัญชีที่เข้าสู่ระบบ การแก้ไขข้อมูลส่วนตัวยังไม่เปิดให้ใช้งาน
        </p>
      </section>
    </>
  );
};
export default Profile;
