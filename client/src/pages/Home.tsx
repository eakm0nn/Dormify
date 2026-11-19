import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Search,
  Wind,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback';
import FilterSidebar from '../components/FilterSidebar';
import HeroVisual from '../components/HeroVisual';
import PropertyCard from '../components/PropertyCard';
import FadeContent from '../components/reactbits/FadeContent';
import { useDormitory } from '../context/DormitoryContext';
import { money } from '../utils/format';
import type { Room, RoomFilters } from '../types/api';

const emptyRooms: Room[] = [];

const initialFilters = { availability: 'all', type: 'all', priceMax: '' };
const Home = () => {
  const { dormitory, loading, error, refresh } = useDormitory();
  const location = useLocation();
  const navigate = useNavigate();
  const savedSearch = location.state?.roomSearch;
  const [query, setQuery] = useState<string>(
    typeof savedSearch?.query === 'string' ? savedSearch.query : '',
  );
  const [filters, setFilters] = useState<RoomFilters>(() => ({
    availability: ['all', 'available', 'occupied'].includes(savedSearch?.filters?.availability)
      ? savedSearch.filters.availability
      : 'all',
    type: ['all', 'AC', 'NON-AC'].includes(savedSearch?.filters?.type)
      ? savedSearch.filters.type
      : 'all',
    priceMax:
      typeof savedSearch?.filters?.priceMax === 'string' ? savedSearch.filters.priceMax : '',
  }));
  const rememberSearch = (nextQuery: string, nextFilters: RoomFilters) =>
    navigate(location.pathname + location.search + location.hash, {
      replace: true,
      state: {
        ...location.state,
        publicNavigation: false,
        roomSearch: { query: nextQuery, filters: nextFilters },
      },
      preventScrollReset: true,
    });
  const rooms = (dormitory?.rooms ?? emptyRooms).filter((room) => room.isActive);
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
    ...(dormitory?.amenities || []).map((label) => ({ label, icon: CheckCircle2 })),
    ...(rooms.some((room) => room.type === 'AC') ? [{ label: 'ห้องพักปรับอากาศ', icon: Wind }] : []),
    ...(rooms.some((room) => room.type === 'NON-AC')
      ? [{ label: 'ห้องพักพัดลม', icon: BedDouble }]
      : []),
  ];
  return (
    <div className="public-home">
      <section className="hero-sky border-b border-line">
        <div className="container-page home-intro grid items-center gap-5 py-6 md:grid-cols-[minmax(0,1fr)_240px] md:gap-12">
          <FadeContent className="hero-copy">
            <p className="mb-3 text-sm font-medium text-muted">{dormitory?.name || 'DORMIFY'}</p>
            <h1 className="home-title">
              ห้องที่ใช่
              <br />
              <span className="text-brand">สำหรับทุกวันของคุณ</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted">
              เลือกห้องและส่งคำขอเช่าผ่านเว็บไซต์ ผู้ดูแลจะตรวจสอบและนัดหมายทำสัญญาภายหลัง
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <Link
                to="/#rooms"
                state={{ ...location.state, publicNavigation: true }}
                className="btn btn-primary"
              >
                เลือกดูห้องพัก
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/#contact"
                state={{ ...location.state, publicNavigation: true }}
                className="home-contact-link inline-flex min-h-11 items-center text-sm text-ink underline"
              >
                ติดต่อหอพัก
              </Link>
            </div>
          </FadeContent>
          <FadeContent className="home-brand w-full" delay={0.08}>
            <HeroVisual name={dormitory?.name || 'หอพัก DORMIFY'} />
          </FadeContent>
        </div>
      </section>
      <section id="rooms" className="container-page py-8 md:py-10">
        <div className="page-heading">
          <div>
            <h2 className="section-title">ห้องพักและค่าเช่า</h2>
            <p>
              {error
                ? 'โหลดข้อมูลห้องพักไม่ได้ กรุณาลองอีกครั้ง'
                : loading || !dormitory
                  ? 'กำลังโหลดห้องพัก…'
                  : lowestPrice === null
                    ? 'รายละเอียดและราคาจะแสดงเมื่อหอพักเผยแพร่ข้อมูล'
                    : `ห้องว่าง ${available.length} ห้อง · ค่าเช่าเริ่มต้น ${money(lowestPrice)} / เดือน`}
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
              onChange={(event) => {
                setQuery(event.target.value);
                rememberSearch(event.target.value, filters);
              }}
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
          <div>
            <FilterSidebar
              filters={filters}
              onChange={(next) => {
                setFilters(next);
                rememberSearch(query, next);
              }}
              onReset={() => {
                setFilters(initialFilters);
                setQuery('');
                rememberSearch('', initialFilters);
              }}
              resultCount={filtered.length}
            />
            <div className="mt-6">
              {filtered.length ? (
                <div className="grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((room) => (
                    <PropertyCard key={room.id} room={room} roomSearch={{ query, filters }} />
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
        <div className="container-page grid gap-7 py-9 md:grid-cols-[1fr_1.4fr] md:gap-14">
          <div>
            <h2 className="section-title">ข้อมูลการอยู่อาศัย</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              ตรวจสอบข้อมูลห้องพักและกฎการอยู่อาศัย ก่อนส่งคำขอเช่า
              ผู้ดูแลจะติดต่อเพื่อนัดหมายและตกลงรายละเอียดสัญญาภายหลัง
            </p>
          </div>
          <div className="facilities-content md:pl-8">
            <h3 className="mb-4 text-lg">สิ่งอำนวยความสะดวก</h3>
            {amenities.length ? (
              <ul className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                {amenities.map(({ label, icon: Icon }) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">ยังไม่มีข้อมูลสิ่งอำนวยความสะดวกเพิ่มเติม</p>
            )}
          </div>
        </div>
      </section>
      <section
        id="rules"
        aria-labelledby="rules-heading"
        className="container-page border-b border-line py-9 md:py-12"
      >
        <div className="grid gap-7 md:grid-cols-[1fr_1.4fr] md:gap-14">
          <div>
            <h2 id="rules-heading" className="section-title">
              ข้อกำหนดการอยู่อาศัย
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              อ่านข้อกำหนดของหอพักก่อนส่งคำขอเช่า และสอบถามผู้ดูแลหากต้องการรายละเอียดเพิ่มเติม
            </p>
          </div>
          <div>
            {loading ? (
              <p role="status" className="text-sm text-muted">
                กำลังโหลดข้อกำหนด…
              </p>
            ) : error ? (
              <ErrorMessage message={error} onRetry={refresh} />
            ) : (
              <p className="whitespace-pre-line text-sm leading-8 text-ink">
                {dormitory?.rules || 'ยังไม่ได้ระบุข้อกำหนดเพิ่มเติม กรุณาสอบถามผู้ดูแลก่อนทำสัญญา'}
              </p>
            )}
          </div>
        </div>
      </section>
      <section id="contact" className="container-page py-9 md:py-12">
        <div className="grid gap-7 md:grid-cols-[1fr_1.4fr] md:gap-14">
          <div>
            <h2 className="section-title">ติดต่อหอพัก</h2>
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
    </div>
  );
};
export default Home;
