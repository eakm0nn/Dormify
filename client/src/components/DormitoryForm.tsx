import { Loader2 } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../services/api';
import type { Dormitory } from '../types/api';
import { thaiError } from '../utils/errors';
import Button from './Button';
import Input from './Input';
import { ErrorMessage } from './Feedback';

const DormitoryForm = ({
  dormitory,
  onSaved,
  onCancel,
}: {
  dormitory?: Dormitory;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState(() => ({
    name: dormitory?.name ?? '',
    address: dormitory?.address ?? '',
    city: dormitory?.city ?? '',
    rules: dormitory?.rules ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (['name', 'address', 'city', 'rules'].includes(name))
      setForm((previous) => ({ ...previous, [name]: value }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, type: dormitory?.type ?? 'HOSTEL' };
      if (dormitory) await api.put(`/api/properties/${dormitory.id}`, payload);
      else await api.post('/api/properties', payload);
      await onSaved();
    } catch (err) {
      setError(thaiError(err, 'บันทึกข้อมูลหอพักไม่สำเร็จ กรุณาลองอีกครั้ง'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={submit} className="surface max-w-3xl space-y-5 p-6 sm:p-8">
      <h2 className="text-lg">{dormitory ? 'แก้ไขข้อมูลหอพัก' : 'บันทึกข้อมูลหอพักครั้งแรก'}</h2>
      {error && <ErrorMessage message={error} />}
      <fieldset disabled={saving} className="space-y-5">
        <Input
          label="ชื่อหอพัก"
          name="name"
          value={form.name}
          onChange={set}
          maxLength={200}
          required
        />
        <Input
          label="ที่อยู่"
          name="address"
          value={form.address}
          onChange={set}
          maxLength={500}
          required
        />
        <Input
          label="จังหวัด"
          name="city"
          value={form.city}
          onChange={set}
          maxLength={100}
          required
        />
        <div>
          <label htmlFor="dorm-rules" className="field-label">
            ข้อกำหนดการอยู่อาศัย
          </label>
          <textarea
            id="dorm-rules"
            name="rules"
            className="field min-h-32"
            value={form.rules}
            onChange={set}
            maxLength={5000}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'กำลังบันทึก…' : 'บันทึกข้อมูลหอพัก'}
          </Button>
          {dormitory && (
            <Button variant="outline" disabled={saving} onClick={onCancel}>
              ยกเลิกการแก้ไข
            </Button>
          )}
        </div>
      </fieldset>
    </form>
  );
};
export default DormitoryForm;
