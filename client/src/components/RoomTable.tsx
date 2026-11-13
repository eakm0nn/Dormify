import { Link } from 'react-router-dom';
import type { Room } from '../types/api';
import { money, roomType } from '../utils/format';

const RoomTable = ({ rooms }: { rooms: Room[] }) => (
  <div className="overflow-x-auto">
    <table className="data-table">
      <caption className="sr-only">รายการห้องพักของหอพัก</caption>
      <thead>
        <tr>
          <th scope="col">ห้องพัก</th>
          <th scope="col">ประเภท</th>
          <th scope="col">จำนวนผู้พัก</th>
          <th scope="col">ค่าเช่าต่อเดือน</th>
          <th scope="col">สถานะ</th>
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
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export default RoomTable;
