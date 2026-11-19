import { Building2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import DormitoryForm from '../components/DormitoryForm';
import PolicyPanel from '../components/PolicyPanel';
import { AmenitiesForm } from '../components/RoomMedia';
import { ErrorMessage, Loading } from '../components/Feedback';
import { useDormitory } from '../context/DormitoryContext';

const AddProperty = () => {
  const { dormitory, loading, error, refresh } = useDormitory();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const saved = async () => {
    setEditing(false);
    setSuccess(true);
    await refresh();
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>ข้อมูลหอพัก</h1>
          <p>ข้อมูลที่ใช้แสดงบนเว็บไซต์ของหอพักแห่งนี้</p>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : !dormitory || editing ? (
        <DormitoryForm
          key={dormitory?.id ?? 'new'}
          dormitory={dormitory ?? undefined}
          onSaved={saved}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <section className="surface max-w-3xl p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="section-icon">
                <Building2 className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl">{dormitory.name}</h2>
                <span className="badge badge-success mt-1">เผยแพร่แล้ว</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(true);
                setSuccess(false);
              }}
            >
              <Pencil className="h-4 w-4" />
              แก้ไขข้อมูลหอพัก
            </Button>
          </div>
          {success && (
            <p role="status" className="notice notice-info mb-4">
              บันทึกข้อมูลหอพักเรียบร้อยแล้ว
            </p>
          )}
          <dl className="grid gap-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">ที่อยู่</dt>
              <dd className="mt-1">{dormitory.address}</dd>
            </div>
            <div>
              <dt className="text-muted">จังหวัด</dt>
              <dd className="mt-1">{dormitory.city}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">ข้อกำหนดการอยู่อาศัย</dt>
              <dd className="mt-1 whitespace-pre-line">{dormitory.rules || 'ยังไม่ได้ระบุ'}</dd>
            </div>
          </dl>
          <Link to="/admin/rooms" className="btn btn-primary mt-5">
            ไปจัดการห้องพัก
          </Link>
        </section>
      )}
      <PolicyPanel />
      {dormitory && (
        <AmenitiesForm
          target={'/api/properties/' + dormitory.id}
          initial={dormitory.amenities || []}
          onSaved={refresh}
        />
      )}
    </>
  );
};
export default AddProperty;
