import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Heart,
  Loader2,
  MapPin,
  Share2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import Input from '../components/Input';
import MessMenuDisplay from '../components/MessMenuDisplay';
import PropertyGallery from '../components/PropertyGallery';
import ReviewSection from '../components/ReviewSection';
import { useAuth } from '../context/AuthContext';
import { useDormitory } from '../context/DormitoryContext';
import api from '../services/api';
import type { Dormitory, Room } from '../types/api';
import { thaiError } from '../utils/errors';
import { money, roomType } from '../utils/format';

const RoomDetail = ({ room, dormitory }: { room: Room; dormitory: Dormitory }) => {
  const { user } = useAuth();
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
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
  const share = async () => {
    try {
      if (navigator.share)
        await navigator.share({ title: `ห้อง ${room.roomNumber} · DORMIFY`, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        setShareMessage('คัดลอกลิงก์ห้องพักแล้ว');
      }
    } catch (err) {
      if (!(err instanceof Error) || err.name !== 'AbortError')
        setShareMessage('ไม่สามารถแชร์ลิงก์ได้ กรุณาคัดลอกจากแถบที่อยู่');
    }
  };
  return (
    <div className="container-page py-8 md:py-12">
      <Link
        to="/#rooms"
        className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปเลือกห้องพัก
      </Link>
      <div className="page-heading">
        <div>
          <span className={`badge mb-3 ${room.isAvailable ? 'badge-success' : 'badge-neutral'}`}>
            {room.isAvailable ? 'ห้องว่าง' : 'ไม่ว่าง'}
          </span>
          <h1>ห้อง {room.roomNumber}</h1>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {dormitory.name} · {dormitory.city}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`icon-button ${saved ? '!border-brand !text-brand' : ''}`}
            aria-label={saved ? 'เลิกบันทึกห้องไว้ดูในหน้านี้' : 'บันทึกห้องไว้ดูในหน้านี้'}
            aria-pressed={saved}
            onClick={() => setSaved(!saved)}
          >
            <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
          </button>
          <button className="icon-button" aria-label="แชร์ห้องพัก" onClick={share}>
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      {shareMessage && (
        <p className="notice notice-info mb-5" role="status">
          {shareMessage}
        </p>
      )}
      <div className="grid items-start gap-7 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <PropertyGallery
            images={room.images || dormitory.images || []}
            name={`ห้อง ${room.roomNumber}`}
          />
          <section className="surface p-6">
            <h2 className="text-xl">รายละเอียดห้องพัก</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl bg-soft p-4">
                <BedDouble className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-xs text-muted">ประเภทห้อง</p>
                  <p className="text-sm font-medium">{roomType(room.type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-soft p-4">
                <Users className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-xs text-muted">จำนวนผู้พัก</p>
                  <p className="text-sm font-medium">สูงสุด {room.capacity} คน · เช่าทั้งห้อง</p>
                </div>
              </div>
            </div>
          </section>
          <section className="surface p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-brand" />
              ข้อกำหนดการอยู่อาศัย
            </h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-8 text-muted">
              {dormitory.rules || 'ยังไม่ได้ระบุข้อกำหนดเพิ่มเติม กรุณาสอบถามผู้ดูแลก่อนทำสัญญา'}
            </p>
          </section>
          {dormitory.hasMess && dormitory.messMenu && (
            <section className="surface p-6">
              <h2 className="mb-5 text-lg">รายการอาหารประจำสัปดาห์</h2>
              <MessMenuDisplay menu={dormitory.messMenu} />
            </section>
          )}
          <section className="surface p-6">
            <h2 className="mb-5 text-lg">ความคิดเห็นเกี่ยวกับหอพัก</h2>
            <ReviewSection reviews={dormitory.reviews || []} />
          </section>
        </div>
        <aside id="booking-form" className="surface p-6 lg:sticky lg:top-28">
          <p className="text-sm text-muted">ค่าเช่ารายเดือน</p>
          <p className="mt-1 text-3xl font-bold text-brand">
            {money(room.price)}
            <span className="ml-1 text-sm font-normal text-muted">/ เดือน</span>
          </p>
          <div className="my-5 border-t border-line" />
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
              <h2 className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-brand" />
                ส่งคำขอเช่าห้องนี้
              </h2>
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
            <Link to="/#rooms" className="btn btn-primary">
              กลับไปเลือกห้องพัก
            </Link>
          </EmptyState>
        </div>
      </div>
    );
  return <RoomDetail key={room.id} room={room} dormitory={dormitory} />;
};
export default PropertyDetails;
