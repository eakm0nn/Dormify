import { BedDouble, Users, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Dormitory, Room, RoomFilters } from '../types/api';
import { money, roomType } from '../utils/format';
import { mediaUrl } from '../utils/media';

// Retain the legacy filename; each card represents one room.
const PropertyCard = ({
  room,
  property,
  roomSearch,
}: {
  room?: Room;
  property?: Dormitory;
  roomSearch?: { query: string; filters: RoomFilters };
}) => {
  const item = room || property?.rooms?.[0];
  if (!item) return null;
  const image = item.images?.[0];
  return (
    <article className="room-card group flex h-full flex-col">
      <div className="room-art relative flex aspect-[16/10] items-center justify-center overflow-hidden">
        {image ? (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            src={mediaUrl(image)}
            alt={`ห้อง ${item.roomNumber}`}
          />
        ) : (
          <div className="text-center">
            <BedDouble className="mx-auto h-12 w-12 stroke-[1.2] text-brand" aria-hidden="true" />
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
      <div className="flex flex-1 flex-col pb-4 pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-lg">ห้อง {item.roomNumber}</h3>
          <p>
            <span className="text-xl font-semibold text-navy">{money(item.price)}</span>
            <span className="ml-1 text-xs text-muted">/ เดือน</span>
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            พักได้ {item.capacity} คน
          </span>
          <span className="flex items-center gap-1.5">
            <Wind className="h-4 w-4" />
            {roomType(item.type)}
          </span>
        </div>
        <div className="mt-auto pt-2">
          <Link
            to={`/rooms/${item.id}`}
            state={{ returnTo: '/#rooms', roomSearch }}
            className="room-details-link inline-flex min-h-11 items-center text-sm font-semibold text-brand"
          >
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </article>
  );
};
export default PropertyCard;
