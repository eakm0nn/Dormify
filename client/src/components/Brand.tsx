import { Link } from 'react-router-dom';
import logo from '../assets/dormify-logo.png';

const Brand = ({ compact = false }) => (
  <Link to="/" aria-label="DORMIFY หน้าหลัก" className="inline-flex shrink-0 items-center gap-1">
    <img
      src={logo}
      alt="โลโก้ DORMIFY"
      width="1536"
      height="1024"
      className={compact ? 'h-14 w-[84px] object-contain' : 'h-[76px] w-[114px] object-contain'}
    />
    {!compact && (
      <span className="hidden border-l border-line pl-3 text-xs leading-relaxed text-muted sm:block">
        ห้องที่ใช่
        <br />
        <span className="font-medium text-navy">อยู่สบายในทุกวัน</span>
      </span>
    )}
  </Link>
);
export default Brand;
