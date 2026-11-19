import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Room } from '../types/api';
import { money, roomType } from '../utils/format';
import Button from './Button';
import { downloadCsv } from '../utils/csv';

const RoomTable = ({
  rooms,
  onEdit,
  onToggle,
  onMedia,
  disabled,
}: {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onToggle: (room: Room) => void;
  onMedia: (room: Room) => void;
  disabled: boolean;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const savedPage = location.state?.roomPage;
  const page = Number.isSafeInteger(savedPage) && savedPage >= 0 ? savedPage : 0;
  const setPage = (roomPage: number) =>
    navigate(location.pathname + location.search + location.hash, {
      replace: true,
      state: { ...location.state, roomPage },
      preventScrollReset: true,
    });
  const pages = Math.max(1, Math.ceil(rooms.length / 10)),
    current = Math.min(page, pages - 1);
  return (
    <div>
      <div className="table-toolbar flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 text-sm">
        <p>
          หน้า {current + 1} / {pages} · {rooms.length} ห้อง
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            ก่อนหน้า
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={current === pages - 1}
            onClick={() => setPage(current + 1)}
          >
            ถัดไป
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadCsv(
                ['ห้อง', 'ประเภท', 'ความจุ', 'ค่าเช่า', 'ว่าง', 'เปิดใช้งาน'],
                rooms.map((room) => [
                  room.roomNumber,
                  roomType(room.type),
                  room.capacity,
                  String(room.price),
                  room.isAvailable ? 'ว่าง' : 'ไม่ว่าง',
                  room.isActive ? 'เปิด' : 'ปิด',
                ]),
                'dormify-rooms',
              )
            }
          >
            ส่งออก CSV
          </Button>
        </div>
      </div>
      <p className="px-4 pt-3 text-xs text-muted lg:hidden">เลื่อนตารางไปด้านข้างเพื่อดูข้อมูลทั้งหมด</p>
      <div
        className="table-scroll overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="รายการห้องพัก เลื่อนแนวนอนเพื่อดูคอลัมน์เพิ่มเติม"
      >
        <table className="data-table min-w-[780px]">
          <caption className="sr-only">รายการห้องพักของหอพัก</caption>
          <thead>
            <tr>
              <th scope="col">ห้องพัก</th>
              <th scope="col">ประเภท</th>
              <th scope="col">จำนวนผู้พัก</th>
              <th scope="col" className="numeric-cell">
                ค่าเช่าต่อเดือน
              </th>
              <th scope="col">สถานะ</th>
              <th scope="col">การใช้งาน</th>
              <th scope="col">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {rooms.slice(current * 10, (current + 1) * 10).map((room) => (
              <tr key={room.id}>
                <td>
                  <Link
                    className="font-semibold text-brand underline"
                    to={`/rooms/${room.id}`}
                    state={{ returnTo: '/admin/rooms', roomPage: current }}
                  >
                    ห้อง {room.roomNumber}
                  </Link>
                </td>
                <td>{roomType(room.type)}</td>
                <td>{room.capacity} คน</td>
                <td className="numeric-cell font-medium">{money(room.price)}</td>
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
                      aria-label={`จัดการรูปห้อง ${room.roomNumber}`}
                      onClick={() => onMedia(room)}
                    >
                      รูป/สิ่งอำนวยความสะดวก
                    </Button>
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
    </div>
  );
};
export default RoomTable;
