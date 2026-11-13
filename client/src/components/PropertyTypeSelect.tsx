import React from 'react';

const PropertyTypeSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}) => (
  <div>
    <label htmlFor="dorm-type" className="field-label">
      ประเภทที่พัก
    </label>
    <select id="dorm-type" className="field" name="type" value={value} onChange={onChange}>
      <option value="HOSTEL">หอพัก</option>
      <option value="PG">ห้องพักพร้อมบริการอาหาร</option>
      <option value="FLAT">อพาร์ตเมนต์</option>
    </select>
  </div>
);
export default PropertyTypeSelect;
