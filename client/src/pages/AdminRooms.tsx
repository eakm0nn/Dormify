import { BedDouble, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import RoomForm from '../components/RoomForm';
import RoomTable from '../components/RoomTable';
import { useDormitory } from '../context/DormitoryContext';

const AdminRooms = () => {
  const { dormitory, loading, error, refresh } = useDormitory();
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const saved = async (roomNumber: string) => {
    setSuccess(`เพิ่มห้อง ${roomNumber} เรียบร้อยแล้ว`);
    setShowForm(false);
    await refresh();
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
          <RoomTable rooms={dormitory.rooms} />
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
            setSuccess('');
          }}
          disabled={!dormitory}
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
      {showForm && dormitory && <RoomForm propertyId={dormitory.id} onSaved={saved} />}
      {content}
      <p className="mt-4 text-xs text-muted">
        การแก้ไขข้อมูลและปิดใช้งานห้องพักยังไม่พัฒนา สถานะห้องเปลี่ยนตามการอนุมัติรายการเช่าในระบบเดิม
      </p>
    </>
  );
};
export default AdminRooms;
