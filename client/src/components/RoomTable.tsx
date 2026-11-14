import { Link } from 'react-router-dom';
import type { Room } from '../types/api';
import { money, roomType } from '../utils/format';
import Button from './Button';

const RoomTable = ({
  rooms,
  onEdit,
  onToggle,
  disabled,
}: {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onToggle: (room: Room) => void;
  disabled: boolean;
}) => (
  <div className="overflow-x-auto">
    <table className="data-table min-w-[780px]">
      <caption className="sr-only">รายการห้องพักของหอพัก</caption>
      <thead>
        <tr>
          <th scope="col">ห้องพัก</th>
          <th scope="col">ประเภท</th>
          <th scope="col">จำนวนผู้พัก</th>
          <th scope="col">ค่าเช่าต่อเดือน</th>
          <th scope="col">สถานะ</th>
          <th scope="col">การใช้งาน</th>
          <th scope="col">ดำเนินการ</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map((room) => (
          <tr key={room.id}>
            <td>
              <Link className="font-semibold text-brand underline" to={`/rooms/${room.id}`}>
                ห้อง {room.roomNumber}
              </Link>
            </td>
            <td>{roomType(room.type)}</td>
            <td>{room.capacity} คน</td>
            <td className="whitespace-nowrap font-medium">{money(room.price)}</td>
            <td>
              <span
                className={`badge whitespace-nowrap ${room.isAvailable ? 'badge-success' : 'badge-neutral'}`}
              >
                {room.isAvailable ? 'ห้องว่าง' : 'ไม่ว่าง'}
              </span>
            </td>
            <td>
              <span
                className={`badge whitespace-nowrap ${room.isActive ? 'badge-info' : 'badge-neutral'}`}
              >
                {room.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
              </span>
            </td>
            <td>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  aria-label={`แก้ไขห้อง ${room.roomNumber}`}
                  onClick={() => onEdit(room)}
                >
                  แก้ไข
                </Button>
                <Button
                  variant={room.isActive ? 'danger' : 'success'}
                  size="sm"
                  disabled={disabled}
                  aria-label={`${room.isActive ? 'ปิด' : 'เปิด'}ใช้งานห้อง ${room.roomNumber}`}
                  onClick={() => onToggle(room)}
                >
                  {room.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export default RoomTable;
