import { BedDouble, Plus, X } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import RoomForm from '../components/RoomForm';
import RoomTable from '../components/RoomTable';
import RoomMedia from '../components/RoomMedia';
import { useDormitory } from '../context/DormitoryContext';
import api from '../services/api';
import type { Room } from '../types/api';
import { thaiError } from '../utils/errors';

const AdminRooms = () => {
  const { dormitory, loading, error, refresh } = useDormitory();
  const [showForm, setShowForm] = useState(false);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const mediaRoom = dormitory?.rooms.find((room) => room.id === mediaId);
  const [success, setSuccess] = useState('');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [statusRoom, setStatusRoom] = useState<Room | null>(null);
  const [statusError, setStatusError] = useState('');
  const [updating, setUpdating] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const saved = async (roomNumber: string) => {
    setSuccess(`${editingRoom ? 'แก้ไข' : 'เพิ่ม'}ห้อง ${roomNumber} เรียบร้อยแล้ว`);
    setShowForm(false);
    await refresh();
  };
  const edit = (room: Room) => {
    setEditingRoom(room);
    setShowForm(true);
    setSuccess('');
  };
  const toggle = (room: Room) => {
    setStatusRoom(room);
    setStatusError('');
    setSuccess('');
    dialog.current?.showModal();
  };
  const changeStatus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!statusRoom) return;
    setUpdating(true);
    setStatusError('');
    try {
      await api.patch(`/api/properties/rooms/${statusRoom.id}/status`, {
        isActive: !statusRoom.isActive,
      });
      setSuccess(
        `${statusRoom.isActive ? 'ปิด' : 'เปิด'}ใช้งานห้อง ${statusRoom.roomNumber} เรียบร้อยแล้ว`,
      );
      dialog.current?.close();
      setStatusRoom(null);
      await refresh();
    } catch (error) {
      setStatusError(thaiError(error, 'เปลี่ยนสถานะห้องไม่สำเร็จ'));
    } finally {
      setUpdating(false);
    }
  };
  let content;
  if (loading) content = <Loading />;
  else if (error) content = <ErrorMessage message={error} onRetry={refresh} />;
  else if (!dormitory) {
    content = (
      <div className="surface">
        <EmptyState icon={BedDouble} title="ยังไม่มีข้อมูลหอพัก" description="บันทึกข้อมูลหอพักก่อนเริ่มเพิ่มห้องพัก">
          <Link to="/admin/dormitory" className="btn btn-primary">
            บันทึกข้อมูลหอพัก
          </Link>
        </EmptyState>
      </div>
    );
  } else {
    content = (
      <div className="surface overflow-hidden">
        {dormitory.rooms.length ? (
          <RoomTable
            rooms={dormitory.rooms}
            onEdit={edit}
            onToggle={toggle}
            onMedia={(room) => setMediaId(room.id)}
            disabled={updating || showForm}
          />
        ) : (
          <EmptyState
            icon={BedDouble}
            title="ยังไม่มีห้องพัก"
            description="กดเพิ่มห้องพักเพื่อบันทึกห้องแรกของหอพัก"
          />
        )}
      </div>
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>จัดการห้องพัก</h1>
          <p>ดูรายการห้องพัก ราคา และสถานะ พร้อมเพิ่มห้องใหม่</p>
        </div>
        <Button
          onClick={() => {
            setShowForm((open) => !open);
            setEditingRoom(null);
            setSuccess('');
          }}
          disabled={!dormitory || updating}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'ปิดแบบฟอร์ม' : 'เพิ่มห้องพัก'}
        </Button>
      </div>
      {success && (
        <p role="status" className="notice notice-info mb-5">
          {success}
        </p>
      )}
      {showForm && dormitory && (
        <RoomForm
          key={editingRoom?.id ?? 'new'}
          propertyId={dormitory.id}
          room={editingRoom ?? undefined}
          onSaved={saved}
          onCancel={() => setShowForm(false)}
        />
      )}
      {mediaRoom && (
        <RoomMedia room={mediaRoom} refresh={refresh} onClose={() => setMediaId(null)} />
      )}
      {content}
      <p className="mt-4 text-xs text-muted">
        การปิดใช้งานไม่ลบห้องหรือประวัติคำขอ และไม่เปลี่ยนสถานะถูกจอง ห้องปิดจะไม่แสดงให้เลือกเช่า
      </p>
      <dialog
        ref={dialog}
        aria-labelledby="room-status-title"
        onCancel={(event) => {
          if (updating) event.preventDefault();
          else setStatusRoom(null);
        }}
      >
        <form onSubmit={changeStatus} className="space-y-5">
          <h2 id="room-status-title" className="text-xl">
            ยืนยัน{statusRoom?.isActive ? 'ปิด' : 'เปิด'}ใช้งานห้อง {statusRoom?.roomNumber}
          </h2>
          <p className="text-sm text-muted">
            {statusRoom?.isActive
              ? 'ห้องจะไม่แสดงให้เลือกเช่า และจะปิดได้เมื่อไม่มีคำขอรอดำเนินการหรืออนุมัติแล้ว ประวัติเดิมยังคงอยู่'
              : 'ห้องจะกลับมาแสดงบนเว็บไซต์ โดยสถานะว่างหรือถูกจองยังคงเดิม'}
          </p>
          {statusError && <ErrorMessage message={statusError} />}
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="outline"
              disabled={updating}
              onClick={() => {
                dialog.current?.close();
                setStatusRoom(null);
              }}
            >
              กลับไปตรวจสอบ
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? 'กำลังบันทึก…' : 'ยืนยัน'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
};
export default AdminRooms;
