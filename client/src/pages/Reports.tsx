import { useState } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Expense, Report } from '../types/operations';
import { money, thaiDate } from '../utils/format';
import Button from '../components/Button';
import { ErrorMessage } from '../components/Feedback';
import { Heading, OperationForm, Table } from '../components/OperationUI';
const Reports = () => {
  const [query, setQuery] = useState(''),
    [editing, setEditing] = useState<Expense | null>(null);
  const report = useApiResource<Report>('/api/operations/reports' + query, 'โหลดรายงานไม่ได้'),
    expenses = useApiResource<Expense[]>('/api/operations/expenses', 'โหลดรายจ่ายไม่ได้');
  return (
    <>
      <Heading
        title="รายงานและสถิติ"
        description="รายรับนับเฉพาะเงินที่ Admin ยืนยันแล้ว แยกเงินประกันออกจากรายรับค่าเช่าและรายจ่ายดำเนินงาน"
      />
      <OperationForm
        title="ช่วงวันที่รายรับ–รายจ่าย"
        fields={[
          { name: 'from', label: 'ตั้งแต่', type: 'date' },
          { name: 'to', label: 'ถึง', type: 'date' },
        ]}
        onSubmit={async (values) =>
          setQuery('?' + new URLSearchParams(Object.entries(values).filter(([, value]) => value)))
        }
      />
      {report.error && <ErrorMessage message={report.error} onRetry={report.refresh} />}
      {report.data && (
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ['รายรับยืนยันแล้ว', money(report.data.receipts)],
            ['รายจ่ายดำเนินงาน', money(report.data.expenses)],
            ['ส่วนต่างดำเนินงาน', money(report.data.operatingBalance)],
            ['รับเงินประกันในช่วง', money(report.data.depositReceived)],
            ['คืนเงินประกันในช่วง', money(report.data.depositRefunded)],
            ['ยอดบิลค้างทั้งหมด', money(report.data.outstanding)],
            ['ห้องทั้งหมด', report.data.totalRooms],
            ['ห้องเปิดและว่าง', report.data.vacantRooms],
            ['สัญญาใช้งาน', report.data.activeLeases],
            ['เรื่องซ่อมค้าง', report.data.openRepairs],
          ].map(([label, value]) => (
            <section className="surface p-5" key={String(label)}>
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 text-xl font-bold text-brand">{value}</p>
            </section>
          ))}
        </div>
      )}
      <OperationForm
        key={editing?.id ?? 'new'}
        title={editing ? 'แก้ไขรายจ่าย' : 'บันทึกรายจ่ายจริง'}
        initial={{
          description: editing?.description ?? '',
          category: editing?.category ?? '',
          amount: editing?.amount ?? '',
          expenseDate: editing?.expenseDate.slice(0, 10) ?? '',
        }}
        fields={[
          { name: 'description', label: 'รายละเอียดรายจ่าย', required: true },
          { name: 'category', label: 'หมวดรายจ่าย', required: true, maxLength: 100 },
          {
            name: 'amount',
            label: 'จำนวนเงิน (บาท)',
            type: 'number',
            min: '0.01',
            step: '0.01',
            required: true,
          },
          { name: 'expenseDate', label: 'วันที่จ่ายจริง', type: 'date', required: true },
        ]}
        onCancel={editing ? () => setEditing(null) : undefined}
        onSubmit={async (values) => {
          if (editing) await api.put('/api/operations/expenses/' + editing.id, values);
          else await api.post('/api/operations/expenses', values);
          setEditing(null);
          await Promise.all([expenses.refresh(), report.refresh()]);
        }}
      />
      <Table
        rows={expenses.data ?? []}
        loading={expenses.loading}
        error={expenses.error}
        onRetry={expenses.refresh}
        columns={[
          { title: 'วันที่จ่าย', render: (row) => thaiDate(row.expenseDate) },
          { title: 'หมวด', render: (row) => row.category },
          { title: 'รายการ', render: (row) => row.description },
          { title: 'จำนวนเงิน', render: (row) => money(row.amount) },
          {
            title: 'ดำเนินการ',
            render: (row) => (
              <Button variant="outline" size="sm" onClick={() => setEditing(row)}>
                แก้ไข
              </Button>
            ),
          },
        ]}
      />
    </>
  );
};
export default Reports;
