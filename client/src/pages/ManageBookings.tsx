import { CheckCircle2, ClipboardList, Loader2, XCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Button from '../components/Button';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import { useDormitory } from '../context/DormitoryContext';
import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Booking } from '../types/api';
import { thaiError } from '../utils/errors';
import { bookingStatus, thaiDate } from '../utils/format';
import { downloadCsv } from '../utils/csv';

const ManageBookings = () => {
  const { refresh } = useDormitory();
  const {
    data,
    loading,
    error: loadError,
    refresh: load,
  } = useApiResource<Booking[]>('/api/bookings/admin', 'ไม่สามารถโหลดรายการเช่าได้');
  const bookings = data ?? [];
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(bookings.length / 10)),
    current = Math.min(page, pages - 1);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [action, setAction] = useState<{ booking: Booking; status: string } | null>(null);
  const [success, setSuccess] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const confirm = (booking: Booking, status: string) => {
    setAction({ booking, status });
    dialog.current?.showModal();
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!action) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/bookings/${action.booking.id}/status`, { status: action.status });
      setSuccess(
        `บันทึกสถานะรายการ #${action.booking.id} เป็น “${bookingStatus(action.status).label}” แล้ว`,
      );
      await Promise.all([refresh(), load()]);
      dialog.current?.close();
      setAction(null);
    } catch (err) {
      dialog.current?.close();
      setError(thaiError(err, 'เปลี่ยนสถานะไม่สำเร็จ กรุณาลองอีกครั้ง'));
      await Promise.all([refresh(), load()]);
    } finally {
      setUpdating(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>รายการเช่าห้องพัก</h1>
          <p>ตรวจสอบคำขอและยืนยันสถานะการเช่าของผู้ใช้งาน</p>
        </div>
        {!loading && (
          <span className="badge badge-warning">
            รอดำเนินการ {bookings.filter((booking) => booking.status === 'PENDING').length} รายการ
          </span>
        )}
      </div>
      {(error || loadError) && (
        <div className="mb-5">
          <ErrorMessage
            message={error || loadError}
            onRetry={() => {
              setError('');
              void load();
            }}
          />
        </div>
      )}
      {success && (
        <p role="status" className="notice notice-info mb-5">
          {success}
        </p>
      )}
      {loading ? (
        <Loading text="กำลังโหลดรายการเช่า…" />
      ) : !bookings.length && !error ? (
        <section className="surface">
          <EmptyState
            icon={ClipboardList}
            title="ยังไม่มีคำขอเช่า"
            description="คำขอเช่าจากผู้ใช้งานจะแสดงที่นี่เมื่อมีการส่งรายการ"
          />
        </section>
      ) : (
        bookings.length > 0 && (
          <section className="surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table min-w-[700px]">
                <caption className="sr-only">รายการเช่าห้องพัก</caption>
                <thead>
                  <tr>
                    <th scope="col">รายการ / ห้อง</th>
                    <th scope="col">ผู้ส่งคำขอ</th>
                    <th scope="col">ช่วงวันที่ต้องการ</th>
                    <th scope="col">สถานะ</th>
                    <th scope="col">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(current * 10, (current + 1) * 10).map((booking) => {
                    const status = bookingStatus(booking.status);
                    return (
                      <tr key={booking.id}>
                        <td>
                          <span className="text-xs text-muted">#{booking.id}</span>
                          <p className="font-semibold">ห้อง {booking.room?.roomNumber}</p>
                        </td>
                        <td>
                          <p>{booking.user?.name}</p>
                          <p className="break-all text-xs text-muted">{booking.user?.email}</p>
                        </td>
                        <td className="text-xs">
                          <p>{thaiDate(booking.startDate)}</p>
                          <p className="text-muted">ถึง {thaiDate(booking.endDate)}</p>
                        </td>
                        <td>
                          <span className={`badge whitespace-nowrap ${status.className}`}>
                            {status.label}
                          </span>
                          {booking.status === 'CONFIRMED' && booking.holdExpiresAt && (
                            <p className="mt-2 text-xs text-muted">
                              กันถึง{' '}
                              {new Date(booking.holdExpiresAt).toLocaleString('th-TH', {
                                timeZone: 'Asia/Bangkok',
                              })}
                            </p>
                          )}
                        </td>
                        <td>
                          {booking.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => confirm(booking, 'CONFIRMED')}
                                disabled={updating}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                อนุมัติ
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => confirm(booking, 'REJECTED')}
                                disabled={updating}
                              >
                                <XCircle className="h-4 w-4" />
                                ไม่อนุมัติ
                              </Button>
                            </div>
                          ) : booking.status === 'CONFIRMED' ? (
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={updating}
                              onClick={() => confirm(booking, 'CANCELLED')}
                            >
                              ยกเลิกการกันห้อง
                            </Button>
                          ) : (
                            <span className="text-xs text-muted">ดำเนินการแล้ว</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <p>
                  หน้า {current + 1} / {pages} · {bookings.length} รายการ
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current === 0}
                    onClick={() => setPage(current - 1)}
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current === pages - 1}
                    onClick={() => setPage(current + 1)}
                  >
                    ถัดไป
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      downloadCsv(
                        ['รายการ', 'ห้อง', 'ผู้ขอ', 'วันที่เริ่ม', 'วันที่สิ้นสุด', 'สถานะ'],
                        bookings.map((row) => [
                          row.id,
                          row.room.roomNumber,
                          row.user?.name || '',
                          thaiDate(row.startDate),
                          thaiDate(row.endDate),
                          bookingStatus(row.status).label,
                        ]),
                        'dormify-bookings',
                      )
                    }
                  >
                    ส่งออก CSV
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )
      )}
      <dialog
        ref={dialog}
        aria-labelledby="booking-confirm-title"
        onCancel={(event) => {
          if (updating) event.preventDefault();
          else setAction(null);
        }}
      >
        <form onSubmit={submit}>
          <h2 id="booking-confirm-title" className="text-xl">
            ยืนยันการ
            {action?.status === 'CONFIRMED'
              ? 'อนุมัติ'
              : action?.status === 'CANCELLED'
                ? 'ยกเลิก'
                : 'ไม่อนุมัติ'}
            คำขอ
          </h2>
          <p className="mt-3 text-sm text-muted">
            รายการ #{action?.booking.id} ห้อง {action?.booking.room?.roomNumber} ของ{' '}
            {action?.booking.user?.name}
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                dialog.current?.close();
                setAction(null);
              }}
              disabled={updating}
            >
              กลับไปตรวจสอบ
            </Button>
            <Button type="submit" disabled={updating}>
              {updating && <Loader2 className="h-4 w-4 animate-spin" />}
              {updating ? 'กำลังบันทึก…' : 'ยืนยัน'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
};
export default ManageBookings;
