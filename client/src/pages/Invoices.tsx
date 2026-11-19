import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Invoice, Lease } from '../types/operations';
import { money, thaiDate } from '../utils/format';
import Button from '../components/Button';
import InvoiceTools, { AdjustmentHistory } from '../components/InvoiceTools';
import { Heading, OperationForm, Status, Table, stateLabel } from '../components/OperationUI';
const Invoices = () => {
  const { user } = useAuth(),
    isAdmin = user?.role === 'ADMIN';
  const resource = useApiResource<Invoice[]>('/api/operations/invoices', 'โหลดบิลไม่ได้'),
    leases = useApiResource<Lease[]>(isAdmin ? '/api/operations/leases' : null, 'โหลดสัญญาไม่ได้');
  const [selected, setSelected] = useState<Invoice | null>(null);
  return (
    <>
      <Heading
        title="ใบแจ้งหนี้"
        description="ค่าเช่าล่วงหน้าและค่าน้ำไฟย้อนหลังตามรอบสัญญา เก็บราคาที่ใช้ในบิลเดิม ไม่มีค่าปรับหรือแบ่งชำระ"
      />
      {isAdmin && (
        <OperationForm
          title="ออกบิลรายเดือน"
          fields={[
            {
              name: 'leaseId',
              label: 'สัญญาเช่า',
              type: 'select',
              required: true,
              options: leases.data
                ?.filter((lease) => lease.status !== 'DRAFT')
                .map((lease) => ({
                  value: lease.id,
                  label:
                    lease.contractNo +
                    ' · ห้อง ' +
                    lease.room.roomNumber +
                    ' · ' +
                    lease.tenant.name,
                })),
            },
            {
              name: 'cycleIndex',
              label: 'รอบบิลที่ (เริ่มที่ 1)',
              type: 'number',
              min: '1',
              step: '1',
              required: true,
            },
          ]}
          initial={{ cycleIndex: '1' }}
          onSubmit={async (values) => {
            const result = await api.post<Invoice>('/api/operations/invoices', {
              leaseId: values.leaseId,
              cycleIndex: Number(values.cycleIndex) - 1,
            });
            setSelected(result.data);
            await resource.refresh();
          }}
        >
          <p className="notice notice-info">
            รอบ 1 คือค่าเช่าล่วงหน้าเดือนแรก ยังไม่มีค่าน้ำไฟก่อนเข้าอยู่ รอบ 2
            เป็นต้นไปต้องมีเลขมิเตอร์ต้น–ปลายของเดือนก่อนครบ และอัตราที่มีผล ระบบคำนวณวันรอบจากวันเริ่มสัญญา ออกซ้ำไม่ได้
          </p>
        </OperationForm>
      )}
      <Table
        rows={resource.data ?? []}
        loading={resource.loading}
        error={resource.error || leases.error}
        onRetry={resource.refresh}
        columns={[
          {
            title: 'ใบแจ้งหนี้',
            render: (row) => (
              <>
                <p>{row.invoiceNo}</p>
                <p className="text-xs text-muted">
                  รอบ {row.cycleIndex + 1} · ห้อง {row.roomNumberSnapshot}
                </p>
              </>
            ),
          },
          { title: 'ผู้รับผิดชอบ', render: (row) => row.tenantNameSnapshot },
          {
            title: 'รอบค่าเช่าล่วงหน้า',
            render: (row) => (
              <>
                {thaiDate(row.periodStart)}
                <br />
                {thaiDate(row.periodEnd)}
              </>
            ),
          },
          { title: 'ครบกำหนด', render: (row) => thaiDate(row.dueDate) },
          {
            title: 'ยอดรวม',
            align: 'right',
            render: (row) => money(row.amountDue ?? row.totalAmount),
          },
          { title: 'สถานะ', render: (row) => <Status value={row.status} /> },
          {
            title: 'รายละเอียด',
            render: (row) => (
              <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                เปิดบิล
              </Button>
            ),
          },
        ]}
      />
      {selected && (
        <section className="surface mt-5 p-6">
          <h2 className="text-xl">{selected.invoiceNo}</h2>
          <p className="mt-2 text-sm">
            {selected.tenantNameSnapshot} · ห้อง {selected.roomNumberSnapshot}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="data-table min-w-[500px]">
              <thead>
                <tr>
                  <th>รายการ</th>
                  <th>เลขต้น–ปลาย</th>
                  <th className="numeric-cell">หน่วย</th>
                  <th className="numeric-cell">ราคาต่อหน่วย</th>
                  <th className="numeric-cell">ยอด</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {stateLabel(item.itemType)}
                      {item.periodStart && item.periodEnd && (
                        <p className="text-xs text-muted">
                          {thaiDate(item.periodStart)} – {thaiDate(item.periodEnd)}
                        </p>
                      )}
                      {item.sourceReference && (
                        <p className="text-xs text-muted">{item.sourceReference}</p>
                      )}
                    </td>
                    <td>
                      {item.openingValue !== null
                        ? item.openingValue + ' → ' + item.closingValue
                        : '—'}
                    </td>
                    <td className="numeric-cell">{item.quantity}</td>
                    <td className="numeric-cell">{money(item.unitPrice)}</td>
                    <td className="numeric-cell">{money(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-right text-xl font-bold">รวม {money(selected.totalAmount)}</p>
          <AdjustmentHistory invoice={selected} />
          <Button variant="ghost" onClick={() => setSelected(null)}>
            ปิดรายละเอียด
          </Button>
        </section>
      )}
      {isAdmin && (
        <InvoiceTools
          invoices={resource.data || []}
          refresh={async () => {
            setSelected(null);
            await resource.refresh();
          }}
        />
      )}
    </>
  );
};
export default Invoices;
