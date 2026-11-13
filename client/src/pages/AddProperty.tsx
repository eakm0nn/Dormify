import { Building2, CheckCircle2, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { ErrorMessage, Loading } from '../components/Feedback';
import Input from '../components/Input';
import PropertyTypeSelect from '../components/PropertyTypeSelect';
import { useDormitory } from '../context/DormitoryContext';
import api from '../services/api';
import { thaiError } from '../utils/errors';

const AddProperty = () => {
  const { dormitory, loading: fetching, error: loadError, refresh } = useDormitory();
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    type: 'HOSTEL',
    rules: '',
    hasMess: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const set = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/api/properties', form);
      setSuccess(true);
      await refresh();
    } catch (err) {
      setError(thaiError(err, 'บันทึกข้อมูลหอพักไม่สำเร็จ กรุณาลองอีกครั้ง'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>ข้อมูลหอพัก</h1>
          <p>ข้อมูลที่ใช้แสดงบนเว็บไซต์ของหอพักแห่งนี้</p>
        </div>
      </div>
      {fetching ? (
        <Loading />
      ) : loadError ? (
        <ErrorMessage message={loadError} onRetry={refresh} />
      ) : dormitory ? (
        <section className="surface max-w-3xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="section-icon">
              <Building2 className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl">{dormitory.name}</h2>
              <span className="badge badge-success mt-1">เผยแพร่แล้ว</span>
            </div>
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
          <p className="notice notice-info mt-6">การแก้ไขข้อมูลหอพักหลังบันทึกยังไม่พัฒนา</p>
          <Link to="/admin/rooms" className="btn btn-primary mt-5">
            ไปจัดการห้องพัก
          </Link>
        </section>
      ) : (
        <form onSubmit={submit} className="surface max-w-3xl space-y-5 p-6 sm:p-8">
          {error && <ErrorMessage message={error} />}
          <p className="notice notice-info">บันทึกข้อมูลหอพักครั้งแรกเพื่อเริ่มแสดงห้องพักบนเว็บไซต์</p>
          <Input
            label="ชื่อหอพัก"
            name="name"
            placeholder="กรอกชื่อหอพัก"
            value={form.name}
            onChange={set}
            required
          />
          <Input
            label="ที่อยู่"
            name="address"
            placeholder="เลขที่ ถนน ตำบล และอำเภอ"
            value={form.address}
            onChange={set}
            required
          />
          <Input
            label="จังหวัด"
            name="city"
            placeholder="กรอกจังหวัดที่ตั้งหอพัก"
            value={form.city}
            onChange={set}
            required
          />
          <PropertyTypeSelect value={form.type} onChange={set} />
          <div>
            <label htmlFor="dorm-rules" className="field-label">
              ข้อกำหนดการอยู่อาศัย
            </label>
            <textarea
              id="dorm-rules"
              name="rules"
              className="field min-h-32"
              placeholder="ข้อมูลที่ผู้พักอาศัยควรทราบ"
              value={form.rules}
              onChange={set}
            />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand"
              checked={form.hasMess}
              onChange={(event) => setForm({ ...form, hasMess: event.target.checked })}
            />
            มีบริการอาหารภายในหอพัก
          </label>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังบันทึก…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                บันทึกข้อมูลหอพัก
              </>
            )}
          </Button>
        </form>
      )}
    </>
  );
};
export default AddProperty;
