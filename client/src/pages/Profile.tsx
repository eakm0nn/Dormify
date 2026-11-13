import { Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleName } from '../utils/format';

const Profile = () => {
  const { user } = useAuth();
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow mb-2">ยินดีต้อนรับกลับมา</p>
          <h1>สวัสดี คุณ{user?.name}</h1>
          <p>ดูข้อมูลบัญชีและเข้าถึงบริการสำหรับผู้พักอาศัย</p>
        </div>
      </div>
      <section className="surface max-w-3xl overflow-hidden">
        <div className="flex items-center gap-4 border-b border-line bg-soft p-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-semibold text-brand">
            {user?.name?.charAt(0)}
          </span>
          <div>
            <h2 className="text-xl">ข้อมูลส่วนตัว</h2>
            <span className="badge badge-info mt-1">{roleName(user?.role)}</span>
          </div>
        </div>
        <dl className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <dt className="mb-2 flex items-center gap-2 text-sm text-muted">
              <UserRound className="h-4 w-4" />
              ชื่อและนามสกุล
            </dt>
            <dd className="font-medium">{user?.name}</dd>
          </div>
          <div>
            <dt className="mb-2 flex items-center gap-2 text-sm text-muted">
              <Mail className="h-4 w-4" />
              อีเมล
            </dt>
            <dd className="break-all font-medium">{user?.email}</dd>
          </div>
        </dl>
        <div className="mx-6 mb-6 flex gap-3 rounded-xl bg-soft p-4 text-sm text-muted">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          ข้อมูลนี้อ้างอิงจากบัญชีที่คุณเข้าสู่ระบบ การแก้ไขข้อมูลส่วนตัวยังไม่เปิดให้ใช้งาน
        </div>
      </section>
    </>
  );
};
export default Profile;
