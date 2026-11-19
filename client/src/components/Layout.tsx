import { ArrowUpRight, ChevronRight, LogOut, Menu, UserRound, X } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from 'react-router-dom';
import { adminMenus, userMenus } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import { useDormitory } from '../context/DormitoryContext';
import { thaiError } from '../utils/errors';
import { roleName } from '../utils/format';
import Brand from './Brand';
import { Loading } from './Feedback';

const Layout = () => {
  const { user, logout } = useAuth();
  const { dormitory, loading: dormitoryLoading } = useDormitory();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname, hash, key } = location;
  const navigationType = useNavigationType();
  const publicScroll = useRef<{ pathname: string; hash: string; key: string } | null>(null);
  const homeState = {
    ...(pathname === '/' ? location.state : { roomSearch: location.state?.roomSearch }),
    publicNavigation: true,
  };
  const workspace = pathname.startsWith('/admin') || pathname.startsWith('/user');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigationTrigger = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(workspace ? '(max-width: 1023px)' : '(max-width: 1279px)').matches,
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const menus = user?.role === 'ADMIN' ? adminMenus : userMenus;
  const menuGroups = [...new Set(menus.map((menu) => menu.group))];
  const active = menus.find((menu) => menu.to === pathname);
  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : '/user';
  const closeMobile = () => setMobileOpen(false);
  useEffect(() => {
    const media = window.matchMedia(workspace ? '(max-width: 1023px)' : '(max-width: 1279px)');
    const update = () => {
      setIsMobile(media.matches);
      setMobileOpen(false);
    };
    update();
    media.addEventListener('change', update);
    const onEscape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        navigationTrigger.current?.getAttribute('aria-expanded') === 'true'
      ) {
        setMobileOpen(false);
        navigationTrigger.current.focus();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('keydown', onEscape);
    };
  }, [workspace]);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, hash]);
  useEffect(() => {
    const previous = publicScroll.current;
    if (pathname !== '/') {
      publicScroll.current = { pathname, hash, key };
      return;
    }
    if (dormitoryLoading) return;
    if (previous?.key === key && previous.pathname === pathname && previous.hash === hash) return;
    publicScroll.current = { pathname, hash, key };
    // Keep cross-page restoration and filter edits; section history follows its anchors.
    if (
      navigationType === 'REPLACE' &&
      previous?.pathname === '/' &&
      previous.hash === hash &&
      !location.state?.publicNavigation
    )
      return;
    if (navigationType === 'POP' && !hash && previous?.pathname !== '/') return;
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start', behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname, hash, key, navigationType, dormitoryLoading, location.state?.publicNavigation]);
  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError('');
    const result = await logout();
    setLoggingOut(false);
    if (result.success) {
      closeMobile();
      navigate('/login');
    } else setLogoutError(thaiError(result.error, 'ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง'));
  };
  const accountControls = (
    <>
      {user ? (
        <>
          <Link to={dashboardPath} onClick={closeMobile} className="btn btn-outline !px-3">
            <UserRound className="h-4 w-4" />
            <span className="max-w-28 truncate">{user.name}</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="icon-button"
            aria-label="ออกจากระบบ"
            title="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMobile} className="btn btn-ghost">
            เข้าสู่ระบบ
          </Link>
          <Link to="/register" onClick={closeMobile} className="btn btn-primary">
            สมัครสมาชิก
          </Link>
        </>
      )}
    </>
  );
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:p-4 focus:text-brand"
      >
        ข้ามไปเนื้อหาหลัก
      </a>
      <header className="site-header sticky top-0 z-40 border-b border-line bg-white">
        <div
          className={`${workspace ? 'px-4 sm:px-6' : 'container-page'} flex h-20 items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-2">
            {workspace && (
              <button
                ref={navigationTrigger}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="icon-button lg:hidden"
                aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                aria-expanded={mobileOpen}
                aria-controls="workspace-navigation"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
            <Brand compact={workspace} />
            {workspace && (
              <span className="hidden text-sm text-muted sm:inline">พื้นที่{roleName(user?.role)}</span>
            )}
          </div>
          {!workspace && (
            <nav aria-label="เมนูหลัก" className="hidden items-center gap-2 xl:flex">
              <Link to="/" state={homeState} className="nav-link">
                หน้าหลัก
              </Link>
              <Link to="/#rooms" state={homeState} className="nav-link">
                ห้องพัก
              </Link>
              <Link to="/#facilities" state={homeState} className="nav-link">
                สิ่งอำนวยความสะดวก
              </Link>
              <Link to="/#rules" state={homeState} className="nav-link">
                ข้อกำหนดการอยู่อาศัย
              </Link>
              <Link to="/#contact" state={homeState} className="nav-link">
                ติดต่อเรา
              </Link>
            </nav>
          )}
          <div className="flex items-center gap-2">
            {workspace && (
              <Link to="/" className="nav-link hidden items-center gap-1 sm:flex">
                ดูหน้าเว็บไซต์
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
            <div className="hidden items-center gap-2 sm:flex">{accountControls}</div>
            {!workspace && (
              <button
                ref={navigationTrigger}
                className="icon-button xl:hidden"
                aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                aria-expanded={mobileOpen}
                aria-controls="public-mobile-navigation"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
        {!workspace && mobileOpen && (
          <nav
            id="public-mobile-navigation"
            aria-label="เมนูบนมือถือ"
            className="space-y-2 border-t border-line bg-white p-5 xl:hidden"
          >
            <Link to="/#rooms" state={homeState} onClick={closeMobile} className="sidebar-link">
              ห้องพัก
            </Link>
            <Link
              to="/#facilities"
              state={homeState}
              onClick={closeMobile}
              className="sidebar-link"
            >
              สิ่งอำนวยความสะดวก
            </Link>
            <Link to="/#rules" state={homeState} onClick={closeMobile} className="sidebar-link">
              ข้อกำหนดการอยู่อาศัย
            </Link>
            <Link to="/#contact" state={homeState} onClick={closeMobile} className="sidebar-link">
              ติดต่อเรา
            </Link>
            <div className="flex flex-wrap gap-2 border-t border-line pt-3">{accountControls}</div>
          </nav>
        )}
      </header>
      {logoutError && (
        <p className="notice notice-error mx-5 mt-3" role="alert">
          {logoutError}
        </p>
      )}
      {workspace ? (
        <div className="workspace-shell min-h-[calc(100vh-80px)] bg-white">
          {mobileOpen && (
            <button
              className="fixed inset-x-0 bottom-0 top-20 z-30 bg-navy/25 lg:hidden"
              aria-label="ปิดเมนูด้านข้าง"
              onClick={closeMobile}
            />
          )}
          <aside
            id="workspace-navigation"
            className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} workspace-sidebar fixed bottom-0 left-0 top-20 z-30 flex w-[270px] flex-col border-r border-line bg-white transition-transform lg:translate-x-0`}
            aria-label="เมนูส่วนตัว"
            inert={!mobileOpen && isMobile ? '' : undefined}
          >
            <div className="sidebar-identity border-b border-line p-5">
              <p className="text-xs text-muted">
                {user?.role === 'ADMIN' ? 'ระบบบริหารหอพัก' : 'พื้นที่ส่วนตัวของคุณ'}
              </p>
              <p className="mt-1 truncate font-semibold text-navy">
                {dormitory?.name || 'DORMIFY'}
              </p>
            </div>
            <nav
              className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3"
              aria-label="เมนูส่วนตัวตามหมวดหมู่"
            >
              {menuGroups.map((group) => (
                <div key={group || 'overview'}>
                  {group && (
                    <h2 className="sidebar-group-label mb-1 px-3 text-xs font-medium text-muted">
                      {group}
                    </h2>
                  )}
                  <div className="space-y-1">
                    {menus
                      .filter((menu) => menu.group === group)
                      .map(({ to, label, icon: Icon, ready, end }) => (
                        <NavLink
                          key={to}
                          to={to}
                          end={end}
                          onClick={closeMobile}
                          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{label}</span>
                          {!ready && (
                            <span className="shrink-0 text-[10px] text-muted">ยังไม่พัฒนา</span>
                          )}
                        </NavLink>
                      ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="space-y-2 border-t border-line p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft font-semibold text-brand">
                  {user?.name?.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted">{roleName(user?.role)}</p>
                </div>
              </div>
              <button className="sidebar-link w-full" onClick={handleLogout} disabled={loggingOut}>
                <LogOut className="h-4 w-4" />
                {loggingOut ? 'กำลังออกจากระบบ…' : 'ออกจากระบบ'}
              </button>
              <Link className="sidebar-link" onClick={closeMobile} to="/">
                <ArrowUpRight className="h-4 w-4" />
                กลับหน้าเว็บไซต์
              </Link>
            </div>
          </aside>
          <main
            id="main-content"
            className="workspace-content min-w-0 px-5 py-7 sm:px-8 lg:ml-[270px] lg:px-10"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-6 flex items-center gap-2 text-xs text-muted">
                <span>{roleName(user?.role)}</span>
                <ChevronRight className="h-3 w-3" />
                <span>{active?.label || 'ข้อมูลของคุณ'}</span>
              </div>
              <Suspense fallback={<Loading />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      ) : (
        <>
          <main id="main-content">
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </main>
          <footer className="border-t border-line bg-soft/60">
            <div className="container-page grid gap-8 py-9 sm:grid-cols-[1fr_auto]">
              <div>
                <Brand />
                <p className="mt-3 max-w-md text-sm text-muted">
                  เลือกห้องพัก ตรวจสอบรายละเอียด และติดตามคำขอเช่าของคุณในที่เดียว
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-6 py-4 text-sm text-muted">
                <Link to="/#rooms" state={homeState} className="hover:text-brand">
                  ห้องพัก
                </Link>
                <Link to="/#contact" state={homeState} className="hover:text-brand">
                  ติดต่อเรา
                </Link>
                <Link to="/#rules" state={homeState} className="hover:text-brand">
                  ข้อกำหนดการอยู่อาศัย
                </Link>
                <Link to={user ? dashboardPath : '/login'} className="hover:text-brand">
                  พื้นที่ส่วนตัว
                </Link>
              </div>
            </div>
            <div className="container-page border-t border-line py-5 text-xs text-muted">
              © {new Date().getFullYear() + 543} DORMIFY · ระบบการเช่าและบริหารจัดการหอพัก
            </div>
          </footer>
        </>
      )}
    </div>
  );
};
export default Layout;
