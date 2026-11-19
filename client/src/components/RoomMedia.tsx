import { useState } from 'react';
import type { Room } from '../types/api';
import api from '../services/api';
import { mediaUrl } from '../utils/media';
import { thaiError } from '../utils/errors';
import Button from './Button';
import { ErrorMessage } from './Feedback';
import { ConfirmAction, OperationForm } from './OperationUI';

export const AmenitiesForm = ({
  target,
  initial,
  onSaved,
}: {
  target: string;
  initial: string[];
  onSaved: () => Promise<void>;
}) => (
  <OperationForm
    key={target + JSON.stringify(initial)}
    title="สิ่งอำนวยความสะดวก"
    fields={[
      {
        name: 'amenities',
        label: 'รายการสิ่งอำนวยความสะดวก คนละบรรทัด',
        type: 'textarea',
        maxLength: 2400,
      },
    ]}
    initial={{ amenities: initial.join('\n') }}
    onSubmit={async (values) => {
      await api.put(target + '/amenities', {
        amenities: values.amenities
          .split('\n')
          .map((value) => value.trim())
          .filter(Boolean),
      });
      await onSaved();
    }}
  >
    <p className="text-sm text-muted">ระบุเฉพาะสิ่งที่มีจริง สูงสุด 30 รายการ รายการละไม่เกิน 80 ตัวอักษร</p>
  </OperationForm>
);
export default function RoomMedia({
  room,
  refresh,
  onClose,
}: {
  room: Room;
  refresh: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState('');
  return (
    <section className="mb-6 space-y-5" aria-label={'รูปและสิ่งอำนวยความสะดวกห้อง ' + room.roomNumber}>
      <div className="surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg">รูปห้อง {room.roomNumber}</h2>
          <Button variant="outline" onClick={onClose}>
            ปิดการจัดการรูป
          </Button>
        </div>
        <p className="my-4 text-sm text-muted">
          ภาพนิ่ง PNG/JPEG/WebP ไม่เกิน 5 MB ต่อไฟล์ สูงสุด 8 รูป ระบบลบข้อมูลแฝงของรูปก่อนเผยแพร่
          รูปแรกเป็นภาพหน้าปก
        </p>
        {error && <ErrorMessage message={error} />}
        {success && (
          <p role="status" className="notice notice-info">
            {success}
          </p>
        )}
        <label className="field-label mt-4">
          เพิ่มรูปห้อง
          <input
            aria-label="เพิ่มรูปห้อง"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy || (room.images?.length || 0) >= 8}
            className="field mt-2"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              setError('');
              setSuccess('');
              setBusy(true);
              try {
                if (
                  !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
                  file.size > 5 * 1024 * 1024
                )
                  throw Error('รับเฉพาะ PNG/JPEG/WebP ไม่เกิน 5 MB');
                await api.post('/api/properties/rooms/' + room.id + '/photos', file, {
                  headers: { 'Content-Type': file.type },
                });
                await refresh();
                setSuccess('เพิ่มรูปห้องแล้ว');
              } catch (err) {
                setError(thaiError(err));
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {room.images?.map((source, index) => (
            <div key={source} className="min-w-0 space-y-2">
              <img
                src={mediaUrl(source)}
                alt={'ห้อง ' + room.roomNumber + ' ภาพที่ ' + (index + 1)}
                className="h-36 w-full rounded-xl object-cover"
              />
              <ConfirmAction
                label={'ลบรูปที่ ' + (index + 1)}
                description="ยืนยันลบรูปนี้ออกจากห้อง รูปอื่นและข้อมูลห้องยังอยู่"
                onConfirm={async () => {
                  await api.delete(
                    '/api/properties/rooms/' + room.id + '/photos/' + source.split('/').pop(),
                  );
                  await refresh();
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <AmenitiesForm
        target={'/api/properties/rooms/' + room.id}
        initial={room.amenities || []}
        onSaved={refresh}
      />
    </section>
  );
}
