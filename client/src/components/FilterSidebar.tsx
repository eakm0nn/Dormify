import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
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
}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <aside className="room-filters border-y border-line py-4" aria-label="ตัวกรองห้องพัก">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted" aria-hidden="true" />
          <h3 className="text-sm font-semibold">ตัวกรองห้องพัก</h3>
          <span className="ml-2 text-sm text-muted">พบ {resultCount} ห้อง</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-outline sm:hidden"
            aria-expanded={expanded}
            aria-controls="room-filter-fields"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'ซ่อนตัวกรอง' : 'แสดงตัวกรอง'}
          </button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            ล้างตัวกรอง
          </Button>
        </div>
      </div>
      <div
        id="room-filter-fields"
        className={`${expanded ? 'grid' : 'hidden'} mt-4 gap-4 sm:grid sm:grid-cols-3`}
      >
        <div className="min-w-0">
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
        <div className="min-w-0">
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
        <div className="min-w-0">
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
    </aside>
  );
};
export default FilterSidebar;
