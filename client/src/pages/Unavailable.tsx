import { ArrowLeft, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

const Unavailable = ({
  title,
  description = 'ส่วนนี้ยังอยู่ระหว่างการพัฒนา ยังไม่สามารถบันทึกหรือดำเนินรายการได้',
}: {
  title: string;
  description?: string;
}) => (
  <>
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>บริการสำหรับผู้พักอาศัยและผู้ดูแลหอพัก</p>
      </div>
      <span className="badge badge-warning">ยังไม่พัฒนา</span>
    </div>
    <section className="surface">
      <div className="empty-state">
        <span className="section-icon">
          <Construction className="h-7 w-7" />
        </span>
        <h2>ส่วนนี้ยังไม่เปิดให้ใช้งาน</h2>
        <p>{description}</p>
        <Link to="/" className="btn btn-outline mt-6">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าเว็บไซต์
        </Link>
      </div>
    </section>
  </>
);
export default Unavailable;
