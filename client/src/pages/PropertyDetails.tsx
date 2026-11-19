import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import Input from '../components/Input';
import PropertyGallery from '../components/PropertyGallery';
import { useAuth } from '../context/AuthContext';
import { useDormitory } from '../context/DormitoryContext';
import api from '../services/api';
import type { Dormitory, Room } from '../types/api';
import { thaiError } from '../utils/errors';
import { money, roomType } from '../utils/format';

const RoomReturnLink = ({
  className,
  showArrow = false,
}: {
  className: string;
  showArrow?: boolean;
}) => {
  const { user } = useAuth();
  const { state } = useLocation();
  const returnTo =
    state?.returnTo === '/admin/rooms' && user?.role === 'ADMIN' ? '/admin/rooms' : '/#rooms';
  const returnState =
    returnTo === '/admin/rooms'
      ? {
          roomPage:
            Number.isSafeInteger(state?.roomPage) && state.roomPage >= 0 ? state.roomPage : 0,
        }
      : { roomSearch: state?.roomSearch };
  return (
    <Link to={returnTo} state={returnState} className={className}>
      {showArrow && <ArrowLeft className="h-4 w-4" />}
      {returnTo === '/admin/rooms' ? 'กลับไปจัดการห้องพัก' : 'กลับไปเลือกห้องพัก'}
    </Link>
  );
};

const RoomDetail = ({ room, dormitory }: { room: Room; dormitory: Dormitory }) => {
  const { user } = useAuth();
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!dates.startDate || !dates.endDate || dates.endDate <= dates.startDate) {
      setError('กรุณาระบุวันสิ้นสุดให้อยู่หลังวันเริ่มต้น');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/bookings', { roomId: room.id, ...dates });
      setSuccess(true);
    } catch (err) {
      setError(thaiError(err, 'ส่งคำขอเช่าไม่สำเร็จ กรุณาลองอีกครั้ง'));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-page room-detail py-5 md:py-8">
      <RoomReturnLink
        showArrow
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-brand"
      />
      <div className="room-detail-heading mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl">ห้อง {room.roomNumber}</h1>
            <span className={`badge ${room.isAvailable ? 'badge-success' : 'badge-neutral'}`}>
              {room.isAvailable ? 'ห้องว่าง' : 'ไม่ว่าง'}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0" />
            {dormitory.name} · {dormitory.city}
          </p>
        </div>
        <div className="room-detail-price">
          <p className="text-xs text-muted">ค่าเช่ารายเดือน</p>
          <p className="mt-1 text-3xl font-semibold text-navy">
            {money(room.price)}
            <span className="ml-2 text-sm font-normal text-muted">/ เดือน</span>
          </p>
        </div>
      </div>
      <div className="room-detail-grid grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-9">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <PropertyGallery
            images={room.images || dormitory.images || []}
            name={`ห้อง ${room.roomNumber}`}
          />
        </div>
        <aside
          id="booking-form"
          className="booking-panel surface p-5 sm:p-6 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5 text-brand" aria-hidden="true" />
            ขอเช่าห้องนี้
          </h2>
          {success ? (
            <div role="status">
              <CheckCircle2 className="mb-3 h-8 w-8 text-green-600" />
              <h2 className="text-lg">ส่งคำขอเช่าเรียบร้อยแล้ว</h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                กรุณารอผู้ดูแลตรวจสอบ การส่งคำขอยังไม่ใช่การทำสัญญาหรือยืนยันเข้าพัก
              </p>
              <Link to="/user/bookings" className="btn btn-primary mt-5 w-full">
                ดูสถานะการเช่า
              </Link>
            </div>
          ) : !room.isAvailable ? (
            <p className="notice notice-info">ห้องนี้ไม่ว่างในขณะนี้ กรุณาเลือกห้องอื่น</p>
          ) : !user ? (
            <>
              <p className="mb-4 text-sm leading-7 text-muted">
                เข้าสู่ระบบเพื่อเลือกช่วงวันที่และส่งคำขอเช่าห้องนี้
              </p>
              <Link to="/login" className="btn btn-primary w-full">
                เข้าสู่ระบบเพื่อเช่าห้องนี้
              </Link>
            </>
          ) : user.role !== 'USER' ? (
            <Link to="/admin/rooms" className="btn btn-outline w-full">
              ไปจัดการห้องพัก
            </Link>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && <ErrorMessage message={error} />}
              <Input
                label="วันที่ต้องการเริ่มพัก"
                name="startDate"
                type="date"
                value={dates.startDate}
                onChange={(event) => setDates({ ...dates, startDate: event.target.value })}
                required
              />
              <Input
                label="วันที่ต้องการสิ้นสุดการพัก"
                name="endDate"
                type="date"
                min={dates.startDate || undefined}
                value={dates.endDate}
                onChange={(event) => setDates({ ...dates, endDate: event.target.value })}
                required
              />
              <p className="text-xs leading-6 text-muted">
                ระบุช่วงวันที่เบื้องต้น ผู้ดูแลจะตรวจสอบและตกลงรายละเอียดสัญญากับคุณภายหลัง
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'กำลังส่งคำขอ…' : 'เช่าห้องนี้'}
              </Button>
            </form>
          )}
        </aside>
        <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-2">
          <section className="border-t border-line pt-5">
            <h2 className="text-xl">รายละเอียดห้องพัก</h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-sm text-muted">
                  <BedDouble className="h-4 w-4" aria-hidden="true" />
                  ประเภทห้อง
                </dt>
                <dd className="mt-1 font-medium">{roomType(room.type)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm text-muted">
                  <Users className="h-4 w-4" aria-hidden="true" />
                  จำนวนผู้พัก
                </dt>
                <dd className="mt-1 font-medium">สูงสุด {room.capacity} คน · เช่าทั้งห้อง</dd>
              </div>
            </dl>
            {!!room.amenities?.length && (
              <div className="mt-5">
                <h3 className="text-sm">สิ่งอำนวยความสะดวก</h3>
                <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {room.amenities.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          <section className="border-t border-line pt-5">
            <h2 className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-brand" aria-hidden="true" />
              ข้อกำหนดการอยู่อาศัย
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-8 text-muted">
              {dormitory.rules || 'ยังไม่ได้ระบุข้อกำหนดเพิ่มเติม กรุณาสอบถามผู้ดูแลก่อนทำสัญญา'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
const PropertyDetails = () => {
  const { roomId, id } = useParams();
  const { dormitory, loading, error, refresh } = useDormitory();
  if (loading)
    return (
      <div className="container-page">
        <Loading text="กำลังโหลดรายละเอียดห้องพัก…" />
      </div>
    );
  if (error)
    return (
      <div className="container-page py-8">
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    );
  const room = roomId
    ? dormitory?.rooms?.find((item) => String(item.id) === roomId)
    : dormitory && String(dormitory.id) === id
      ? dormitory.rooms?.[0]
      : null;
  if (!room || !room.isActive || !dormitory)
    return (
      <div className="container-page py-10">
        <div className="surface">
          <EmptyState title="ไม่พบห้องพักนี้" description="ห้องพักอาจยังไม่ได้เผยแพร่ หรือไม่มีอยู่ในหอพักแห่งนี้">
            <RoomReturnLink className="btn btn-primary" />
          </EmptyState>
        </div>
      </div>
    );
  return <RoomDetail key={room.id} room={room} dormitory={dormitory} />;
};
export default PropertyDetails;
