import { ArrowUpRight, BedDouble, Users, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Dormitory, Room } from '../types/api';
import { money, roomType } from '../utils/format';

// The filename is retained for compatibility; this card represents a room, not another dormitory.
const PropertyCard = ({ room, property }: { room?: Room; property?: Dormitory }) => {
  const item = room || property?.rooms?.[0];
  if (!item) return null;
  const image = item.images?.[0];
  return (
    <article className="surface group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className="room-art relative flex h-48 items-center justify-center overflow-hidden">
        {image ? (
          <img
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            src={image}
            alt={`ห้อง ${item.roomNumber}`}
          />
        ) : (
          <div className="text-center">
            <BedDouble className="mx-auto h-14 w-14 stroke-[1.2] text-brand/40" />
            <p className="mt-3 text-xs text-muted">ยังไม่มีรูปภาพห้องพัก</p>
          </div>
        )}
        <span
          className={`badge absolute left-4 top-4 ${item.isAvailable ? 'badge-success' : 'badge-neutral'}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${item.isAvailable ? 'bg-green-600' : 'bg-slate-400'}`}
          />
          {item.isAvailable ? 'ห้องว่าง' : 'ไม่ว่าง'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted">{roomType(item.type)}</p>
        <h3 className="mt-1 text-xl">ห้อง {item.roomNumber}</h3>
        <div className="my-4 flex flex-wrap gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            พักได้ {item.capacity} คน
          </span>
          <span className="flex items-center gap-1.5">
            <Wind className="h-4 w-4" />
            {roomType(item.type)}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <div>
            <span className="text-xl font-bold text-brand">{money(item.price)}</span>
            <span className="ml-1 text-xs text-muted">/ เดือน</span>
          </div>
          <Link
            to={`/rooms/${item.id}`}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand"
          >
            ดูรายละเอียด
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};
export default PropertyCard;
