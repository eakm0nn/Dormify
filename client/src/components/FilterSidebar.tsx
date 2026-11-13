import { SlidersHorizontal } from 'lucide-react';
import type { RoomFilters } from '../types/api';
import Button from './Button';

const FilterSidebar = ({
  filters,
  onChange,
  onReset,
  resultCount,
}: {
  filters: RoomFilters;
  onChange: (filters: RoomFilters) => void;
  onReset: () => void;
  resultCount: number;
}) => (
  <aside className="surface p-5" aria-label="ตัวกรองห้องพัก">
    <div className="mb-5 flex items-center gap-2">
      <SlidersHorizontal className="h-5 w-5 text-brand" />
      <h3 className="font-semibold">ค้นหาห้องที่เหมาะกับคุณ</h3>
    </div>
    <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
      <div>
        <label htmlFor="room-availability" className="field-label">
          สถานะห้อง
        </label>
        <select
          id="room-availability"
          className="field"
          value={filters.availability}
          onChange={(event) => onChange({ ...filters, availability: event.target.value })}
        >
          <option value="all">ทุกสถานะ</option>
          <option value="available">เฉพาะห้องว่าง</option>
          <option value="occupied">ห้องไม่ว่าง</option>
        </select>
      </div>
      <div>
        <label htmlFor="room-type" className="field-label">
          ประเภทห้อง
        </label>
        <select
          id="room-type"
          className="field"
          value={filters.type}
          onChange={(event) => onChange({ ...filters, type: event.target.value })}
        >
          <option value="all">ทุกประเภท</option>
          <option value="AC">ห้องปรับอากาศ</option>
          <option value="NON-AC">ห้องพัดลม</option>
        </select>
      </div>
      <div>
        <label htmlFor="room-budget" className="field-label">
          งบต่อเดือนไม่เกิน
        </label>
        <input
          id="room-budget"
          className="field"
          type="number"
          min="0"
          step="100"
          placeholder="ไม่จำกัดงบประมาณ"
          value={filters.priceMax}
          onChange={(event) => onChange({ ...filters, priceMax: event.target.value })}
        />
      </div>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
      <span className="text-muted">พบ {resultCount} ห้อง</span>
      <Button variant="ghost" size="sm" onClick={onReset}>
        ล้างตัวกรอง
      </Button>
    </div>
  </aside>
);
export default FilterSidebar;
