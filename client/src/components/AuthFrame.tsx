import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/dormify-logo.png';
import Brand from './Brand';

const AuthFrame = ({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) => (
  <main className="min-h-screen bg-soft">
    <div className="container-page flex min-h-screen flex-col py-5">
      <div className="flex items-center justify-between gap-3">
        <Brand />
        <Link to="/" className="nav-link flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
      </div>
      <div className="my-auto grid items-center gap-10 py-8 lg:grid-cols-2 lg:gap-20">
        <section className="hidden max-w-lg lg:block">
          <span className="eyebrow">ยินดีต้อนรับสู่ DORMIFY</span>
          <h2 className="mt-4 text-4xl leading-relaxed">
            เรื่องห้องพัก
            <br />
            <span className="text-brand">ง่ายขึ้นในทุกวัน</span>
          </h2>
          <p className="mt-5 leading-8 text-muted">
            เลือกดูห้องพัก ส่งคำขอเช่า และติดตามสถานะได้จากพื้นที่ส่วนตัวของคุณ
          </p>
          <img
            src={logo}
            alt="โลโก้ DORMIFY"
            width="1536"
            height="1024"
            className="my-3 w-72 object-contain"
          />
          <p className="flex items-center gap-2 text-sm text-muted">
            <CheckCircle2 className="h-5 w-5 text-brand" />
            เริ่มต้นด้วยบัญชีของคุณเอง
          </p>
        </section>
        <section className="surface mx-auto w-full max-w-md p-6 sm:p-9">
          <p className="eyebrow mb-2">DORMIFY</p>
          <h1 className="text-2xl">{title}</h1>
          <p className="mb-7 mt-2 text-sm text-muted">{description}</p>
          {children}
          <div className="mt-7 border-t border-line pt-5 text-center text-sm text-muted">
            {footer}
          </div>
        </section>
      </div>
      <p className="pb-3 text-center text-xs text-muted">DORMIFY · ระบบการเช่าและบริหารจัดการหอพัก</p>
    </div>
  </main>
);
export default AuthFrame;
