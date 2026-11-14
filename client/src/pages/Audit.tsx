import { useState } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import type { Audit as Log } from '../types/operations';
import { thaiDate } from '../utils/format';
import { Heading, OperationForm, Table } from '../components/OperationUI';
const labels: Record<string, string> = {
  REGISTER: 'สมัครสมาชิก',
  LOGIN: 'เข้าสู่ระบบ',
  LOGOUT: 'ออกจากระบบ',
  CREATE_ADMIN: 'สร้างบัญชีผู้ดูแล',
  CREATE_PROPERTY: 'เพิ่มข้อมูลหอพัก',
  EDIT_PROPERTY: 'แก้ไขข้อมูลหอพัก',
  CREATE_ROOM: 'เพิ่มห้องพัก',
  SAVE_TENANT: 'บันทึกผู้เช่า',
  SAVE_LEASE: 'บันทึกสัญญา',
  ACTIVATE_LEASE: 'เริ่มใช้สัญญา',
  END_LEASE: 'จบสัญญา',
  CHANGE_POLICY: 'เปลี่ยนนโยบาย',
  CREATE_RATE: 'บันทึกอัตรา',
  RECORD_METER: 'บันทึกมิเตอร์',
  ISSUE_INVOICE: 'ออกบิล',
  SUBMIT_PAYMENT: 'แจ้งชำระเงิน',
  UPLOAD_PROOF: 'แนบหลักฐาน',
  REVIEW_PAYMENT: 'ตรวจรับเงิน',
  DEPOSIT_RECEIPT: 'รับเงินประกัน',
  DEPOSIT_REFUND: 'คืนเงินประกัน',
  CREATE_MAINTENANCE: 'แจ้งซ่อม',
  UPDATE_MAINTENANCE: 'อัปเดตงานซ่อม',
  SAVE_EXPENSE: 'บันทึกรายจ่าย',
  SAVE_ANNOUNCEMENT: 'บันทึกข่าวสาร',
  EXPIRE_BOOKING: 'หมดเวลากันห้อง',
  REQUEST_ROOM: 'ขอเช่าห้อง',
  REVIEW_BOOKING: 'พิจารณาคำขอ',
  EDIT_ROOM: 'แก้ไขห้อง',
  ROOM_SERVICE_STATUS: 'เปิดปิดห้อง',
};
const Audit = () => {
  const [query, setQuery] = useState('');
  const resource = useApiResource<Log[]>('/api/operations/audit' + query, 'โหลดประวัติไม่ได้');
  return (
    <>
      <Heading
        title="ประวัติการใช้งาน"
        description="รายการสำคัญที่เริ่มบันทึกตั้งแต่เปิดฟังก์ชันนี้ ไม่สร้างประวัติย้อนหลัง ไม่มีรหัสผ่าน Token หรือภาพหลักฐานในบันทึก"
      />
      <OperationForm
        title="ค้นหาประวัติ (ล่าสุดไม่เกิน 500 รายการ)"
        fields={[
          { name: 'search', label: 'ชื่อผู้ทำหรือคำค้น' },
          { name: 'from', label: 'ตั้งแต่', type: 'date' },
          { name: 'to', label: 'ถึง', type: 'date' },
        ]}
        onSubmit={async (values) =>
          setQuery('?' + new URLSearchParams(Object.entries(values).filter(([, value]) => value)))
        }
      />
      <Table
        rows={resource.data ?? []}
        loading={resource.loading}
        error={resource.error}
        onRetry={resource.refresh}
        columns={[
          {
            title: 'วันเวลา',
            render: (row) =>
              thaiDate(row.createdAt) +
              ' ' +
              new Intl.DateTimeFormat('th-TH', {
                timeZone: 'Asia/Bangkok',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(row.createdAt)),
          },
          { title: 'ผู้ทำ', render: (row) => row.actorName },
          { title: 'การทำรายการ', render: (row) => labels[row.action] ?? 'การทำรายการ' },
          { title: 'รายละเอียด', render: (row) => row.summary },
          { title: 'อ้างอิง', render: (row) => '#' + (row.entityId ?? '—') },
        ]}
      />
    </>
  );
};
export default Audit;
