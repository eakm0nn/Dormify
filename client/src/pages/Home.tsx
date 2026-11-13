import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Utensils,
  Wind,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import FilterSidebar from '../components/FilterSidebar';
import HeroVisual from '../components/HeroVisual';
import PropertyCard from '../components/PropertyCard';
import { useDormitory } from '../context/DormitoryContext';
import { money } from '../utils/format';
import type { Room } from '../types/api';

const emptyRooms: Room[] = [];

const initialFilters = { availability: 'all', type: 'all', priceMax: '' };
const Home = () => {
  const { dormitory, loading, error, refresh } = useDormitory();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const rooms = dormitory?.rooms ?? emptyRooms;
  const available = rooms.filter((room) => room.isAvailable);
  const filtered = useMemo(
    () =>
      rooms.filter(
        (room) =>
          String(room.roomNumber).toLowerCase().includes(query.trim().toLowerCase()) &&
          (filters.availability === 'all' ||
            room.isAvailable === (filters.availability === 'available')) &&
          (filters.type === 'all' || room.type === filters.type) &&
          (filters.priceMax === '' || Number(room.price) <= Number(filters.priceMax)),
      ),
    [rooms, query, filters],
  );
  const lowestPrice = rooms.length ? Math.min(...rooms.map((room) => Number(room.price))) : null;
  const amenities = [
    ...(rooms.some((room) => room.type === 'AC') ? [{ label: 'ห้องพักปรับอากาศ', icon: Wind }] : []),
    ...(rooms.some((room) => room.type === 'NON-AC')
      ? [{ label: 'ห้องพักพัดลม', icon: BedDouble }]
      : []),
    ...(dormitory?.hasMess ? [{ label: 'บริการอาหาร', icon: Utensils }] : []),
  ];
  return (
    <>
      <section className="hero-sky relative overflow-hidden border-b border-line">
        <div className="hero-grid absolute inset-0 pointer-events-none" />
        <div className="container-page relative grid items-center gap-8 py-12 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div className="fade-in">
            <p className="eyebrow mb-5">
              <span className="h-2 w-2 rounded-full bg-skybrand" />
              ยินดีต้อนรับสู่ {dormitory?.name || 'DORMIFY'}
            </p>
            <h1 className="text-4xl font-bold leading-[1.5] tracking-tight sm:text-5xl">
              ห้องที่ใช่
              <br />
              <span className="text-brand">สำหรับทุกวันของคุณ</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-muted">
              ดูรายละเอียดห้องพัก ราคา และสถานะห้องว่างได้ในที่เดียว เลือกห้องที่เหมาะกับคุณ แล้วส่งคำขอเช่าผ่านเว็บไซต์
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#rooms" className="btn btn-primary">
                เลือกดูห้องพัก
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="btn btn-outline">
                ติดต่อหอพัก
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand" />
                ดูสถานะห้องจากระบบ
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand" />
                ส่งคำขอให้ผู้ดูแลตรวจสอบ
              </span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <HeroVisual name={dormitory?.name || 'หอพัก DORMIFY'} />
            <div className="surface ml-auto mt-4 flex w-fit items-center gap-3 px-5 py-3">
              <span className="section-icon !h-10 !w-10">
                <BedDouble className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted">ห้องว่างขณะนี้</p>
                <p className="font-bold text-navy">
                  {loading || error || !dormitory ? 'กำลังเตรียมข้อมูล' : `${available.length} ห้อง`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="rooms" className="container-page py-14 md:py-20">
        <div className="page-heading">
          <div>
            <p className="eyebrow mb-2">ห้องพักของเรา</p>
            <h2 className="section-title">พื้นที่เล็ก ๆ ที่เป็นตัวคุณ</h2>
            <p>
              {lowestPrice === null
                ? 'รายละเอียดและราคาห้องพักจะแสดงเมื่อหอพักเผยแพร่ข้อมูล'
                : `ค่าเช่าเริ่มต้น ${money(lowestPrice)} ต่อเดือน`}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted" />
            <label className="sr-only" htmlFor="room-search">
              ค้นหาเลขห้อง
            </label>
            <input
              id="room-search"
              className="field !pl-12"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาด้วยเลขห้อง…"
            />
          </div>
        </div>
        {loading ? (
          <Loading text="กำลังโหลดห้องพัก…" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={refresh} />
        ) : !rooms.length ? (
          <div className="surface">
            <EmptyState
              icon={Building2}
              title="ยังไม่มีข้อมูลห้องพัก"
              description="หอพักยังไม่ได้เผยแพร่ข้อมูลห้องพัก กรุณาติดต่อผู้ดูแลเพื่อสอบถามรายละเอียด"
            />
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr]">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={() => {
                setFilters(initialFilters);
                setQuery('');
              }}
              resultCount={filtered.length}
            />
            <div>
              {filtered.length ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((room) => (
                    <PropertyCard key={room.id} room={room} />
                  ))}
                </div>
              ) : (
                <div className="surface">
                  <EmptyState
                    title="ไม่พบห้องตามเงื่อนไข"
                    description="ลองเปลี่ยนเลขห้อง งบประมาณ หรือประเภทห้องที่ต้องการ"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </section>
      <section id="facilities" className="border-y border-line bg-soft">
        <div className="container-page grid gap-8 py-12 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">รู้จักหอพักของเรา</p>
            <h2 className="section-title">รายละเอียดก่อนตัดสินใจ</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              ตรวจสอบข้อมูลห้องพักและกฎการอยู่อาศัย ก่อนส่งคำขอเช่า
              ผู้ดูแลจะติดต่อเพื่อนัดหมายและตกลงรายละเอียดสัญญาภายหลัง
            </p>
          </div>
          <div className="surface p-6">
            <h3 className="mb-4 text-lg">สิ่งอำนวยความสะดวก</h3>
            {amenities.length ? (
              <div className="flex flex-wrap gap-3">
                {amenities.map(({ label, icon: Icon }) => (
                  <span key={label} className="chip">
                    <Icon className="h-4 w-4 text-brand" />
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">ยังไม่มีข้อมูลสิ่งอำนวยความสะดวกเพิ่มเติม</p>
            )}
            {dormitory?.rules && (
              <div className="mt-5 border-t border-line pt-5">
                <h4 className="mb-2 text-sm">ข้อควรทราบในการอยู่อาศัย</h4>
                <p className="whitespace-pre-line text-sm text-muted">{dormitory.rules}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section id="contact" className="container-page py-14">
        <div className="surface grid gap-8 p-6 md:grid-cols-2 md:p-9">
          <div>
            <p className="eyebrow mb-2">ติดต่อเรา</p>
            <h2 className="section-title">มีคำถาม? คุยกับเราได้</h2>
            <p className="mt-3 text-sm text-muted">สอบถามห้องพักและรายละเอียดการเข้าอยู่กับผู้ดูแลหอพัก</p>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand" />
              <div>
                <p className="font-medium">ที่ตั้งหอพัก</p>
                <p className="mt-1 text-muted">
                  {dormitory
                    ? [dormitory.address, dormitory.city].filter(Boolean).join(' ')
                    : 'ยังไม่ได้ระบุที่อยู่หอพัก'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-brand" />
              <div>
                <p className="font-medium">ช่องทางติดต่อ</p>
                {dormitory?.owner?.email ? (
                  <a
                    className="mt-1 block break-all text-brand underline"
                    href={`mailto:${dormitory.owner.email}`}
                  >
                    {dormitory.owner.email}
                  </a>
                ) : (
                  <p className="mt-1 text-muted">ยังไม่ได้ระบุช่องทางติดต่อ</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Home;
