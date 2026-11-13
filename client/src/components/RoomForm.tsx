import { Loader2 } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import api from '../services/api';
import { thaiError } from '../utils/errors';
import Button from './Button';
import { ErrorMessage } from './Feedback';
import Input from './Input';

const initialRoom = { roomNumber: '', capacity: '1', price: '', type: 'AC' };
type RoomFormState = typeof initialRoom;
interface RoomFormProps {
  propertyId: number;
  onSaved: (roomNumber: string) => Promise<void>;
}
const RoomForm = ({ propertyId, onSaved }: RoomFormProps) => {
  const [form, setForm] = useState(initialRoom);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const set = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    if (!(name in initialRoom)) return;
    setForm((previous) => ({ ...previous, [name as keyof RoomFormState]: value }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await api.post('/api/properties/rooms', {
        ...form,
        propertyId,
        capacity: Number(form.capacity),
        price: Number(form.price),
      });
      await onSaved(form.roomNumber.trim());
    } catch (error) {
      setSaveError(thaiError(error, 'เพิ่มห้องพักไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={submit} className="surface mb-6 space-y-5 p-6">
      <h2 className="text-lg">เพิ่มห้องพัก</h2>
      {saveError && <ErrorMessage message={saveError} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="เลขห้อง"
          name="roomNumber"
          placeholder="กรอกเลขห้อง"
          value={form.roomNumber}
          onChange={set}
          required
        />
        <Input
          label="ค่าเช่าต่อเดือน (บาท)"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="กรอกค่าเช่ารายเดือน"
          value={form.price}
          onChange={set}
          required
        />
        <Input
          label="จำนวนผู้พักสูงสุด (คน)"
          name="capacity"
          type="number"
          min="1"
          step="1"
          value={form.capacity}
          onChange={set}
          required
        />
        <div>
          <label htmlFor="new-room-type" className="field-label">
            ประเภทห้อง
          </label>
          <select id="new-room-type" className="field" name="type" value={form.type} onChange={set}>
            <option value="AC">ห้องปรับอากาศ</option>
            <option value="NON-AC">ห้องพัดลม</option>
          </select>
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'กำลังบันทึก…' : 'บันทึกห้องพัก'}
      </Button>
    </form>
  );
};
export default RoomForm;
