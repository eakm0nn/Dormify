import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDormitory } from '../context/DormitoryContext';
import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Lease, Options, Policy } from '../types/operations';
import { money, thaiDate } from '../utils/format';
import Button from '../components/Button';
import LeaseTools from '../components/LeaseTools';
import {
  ConfirmAction,
  Heading,
  OperationForm,
  Status,
  Table,
  type Field,
} from '../components/OperationUI';

const Leases = () => {
  const { user } = useAuth(),
    isAdmin = user?.role === 'ADMIN';
  const { refresh: refreshRooms } = useDormitory();
  const resource = useApiResource<Lease[]>('/api/operations/leases', 'โหลดสัญญาไม่ได้');
  const options = useApiResource<Options>(
    isAdmin ? '/api/operations/options' : null,
    'โหลดข้อมูลประกอบสัญญาไม่ได้',
  );
  const policy = useApiResource<Policy>(
    isAdmin ? '/api/operations/policy' : null,
    'โหลดนโยบายไม่ได้',
  );
  const [editing, setEditing] = useState<Lease | null | undefined>(undefined),
    [selected, setSelected] = useState<Lease | null>(null),
    [success, setSuccess] = useState('');
  const [closingId, setClosingId] = useState<number | null>(null);
  const revisions = useApiResource<
    { id: number; kind: string; reason: string; createdAt: string }[]
  >(selected ? '/api/operations/leases/' + selected.id + '/revisions' : null, 'โหลดประวัติสัญญาไม่ได้');
  const refresh = async () => {
    await Promise.all([resource.refresh(), options.refresh(), refreshRooms()]);
  };
  const fields: Field[] = [
    { name: 'contractNo', label: 'เลขสัญญา', required: true, maxLength: 80 },
    {
      name: 'tenantId',
      label: 'ผู้รับผิดชอบหลัก',
      type: 'select',
      required: true,
      options: options.data?.tenants.map((tenant) => ({ value: tenant.id, label: tenant.name })),
    },
    {
      name: 'roomId',
      label: 'ห้องพัก',
      type: 'select',
      required: true,
      options: options.data?.rooms.map((room) => ({
        value: room.id,
        label: 'ห้อง ' + room.roomNumber + (room.isActive ? '' : ' · ปิดใช้งาน'),
      })),
    },
    {
      name: 'bookingId',
      label: 'คำขอที่อนุมัติ (หากมาจากเว็บ)',
      type: 'select',
      options: options.data?.bookings.map((booking) => ({
        value: booking.id,
        label: '#' + booking.id + ' ห้อง ' + booking.room.roomNumber + ' · ' + booking.user.name,
      })),
    },
    { name: 'startDate', label: 'วันเริ่มสัญญา', type: 'date', required: true },
    { name: 'endDate', label: 'วันสิ้นสุดสัญญา (ถ้ามี)', type: 'date' },
    { name: 'signedDate', label: 'วันลงนามจริง', type: 'date' },
    {
      name: 'monthlyRent',
      label: 'ค่าเช่าตามสัญญาต่อเดือน (บาท)',
      type: 'number',
      min: '0.01',
      step: '0.01',
      required: true,
    },
    {
      name: 'depositRequired',
      label: 'เงินประกันตามสัญญา (ว่าง = คำนวณตามนโยบาย)',
      type: 'number',
      min: '0',
      step: '0.01',
    },
    { name: 'occupants', label: 'ชื่อผู้พักร่วม คนละบรรทัด ไม่รวมผู้รับผิดชอบหลัก', type: 'textarea' },
  ];
  return (
    <>
      <Heading
        title={isAdmin ? 'สัญญาเช่า' : 'สัญญาและข้อมูลห้องพักของฉัน'}
        description="บันทึกสัญญาหลังตกลงและลงนามจริง คำขอเช่าบนเว็บไซต์ยังไม่ใช่สัญญา"
      />
      {success && (
        <p role="status" className="notice notice-info mb-4">
          {success}
        </p>
      )}
      {isAdmin && (
        <>
          <p className="notice notice-info mb-4">
            เงินประกันเริ่มต้น {policy.data?.depositMonths ?? '—'} เดือน และครบกำหนดชำระ{' '}
            {policy.data?.dueDays ?? '—'} วัน เก็บค่าตามสัญญา ไม่เปลี่ยนตามนโยบายใหม่
          </p>
          <Button
            className="mb-5"
            disabled={options.loading || !!options.error}
            onClick={() => setEditing(null)}
          >
            เพิ่มสัญญาฉบับร่าง
          </Button>
        </>
      )}
      {isAdmin && editing !== undefined && (
        <OperationForm
          key={editing?.id ?? 'new'}
          title={editing ? 'แก้ไขฉบับร่าง' : 'สร้างสัญญาฉบับร่าง'}
          fields={fields}
          initial={{
            contractNo: editing?.contractNo ?? '',
            tenantId: String(editing?.tenantId ?? ''),
            roomId: String(editing?.roomId ?? ''),
            bookingId: String(editing?.bookingId ?? ''),
            startDate: editing?.startDate.slice(0, 10) ?? '',
            endDate: editing?.endDate?.slice(0, 10) ?? '',
            signedDate: editing?.signedDate?.slice(0, 10) ?? '',
            monthlyRent: editing?.monthlyRent ?? '',
            depositRequired: editing?.depositRequired ?? '',
            occupants: editing?.occupants.map((person) => person.name).join('\n') ?? '',
          }}
          onCancel={() => setEditing(undefined)}
          onSubmit={async (values) => {
            const body = {
              ...values,
              depositRequired: values.depositRequired || undefined,
              occupants: values.occupants
                .split('\n')
                .map((name) => name.trim())
                .filter(Boolean)
                .map((name) => ({ name })),
            };
            if (editing) await api.put('/api/operations/leases/' + editing.id, body);
            else await api.post('/api/operations/leases', body);
            setEditing(undefined);
            setSuccess('บันทึกสัญญาฉบับร่างแล้ว');
            await refresh();
          }}
        />
      )}
      <Table
        rows={resource.data ?? []}
        loading={resource.loading}
        error={resource.error || options.error}
        onRetry={resource.refresh}
        columns={[
          {
            title: 'สัญญา / ห้อง',
            render: (row) => (
              <>
                <p className="font-semibold">{row.contractNo}</p>
                <p>ห้อง {row.room.roomNumber}</p>
              </>
            ),
          },
          { title: 'ผู้รับผิดชอบ', render: (row) => row.tenant.name },
          {
            title: 'ช่วงสัญญา',
            render: (row) => (
              <>
                {thaiDate(row.startDate)}
                <br />
                {row.endDate ? thaiDate(row.endDate) : 'ไม่กำหนดวันสิ้นสุด'}
              </>
            ),
          },
          {
            title: 'ค่าเช่า / ประกัน',
            align: 'right',
            render: (row) => (
              <>
                {money(row.monthlyRent)} / เดือน
                <br />
                <span className="text-xs text-muted">ประกัน {money(row.depositRequired)}</span>
              </>
            ),
          },
          { title: 'สถานะ', render: (row) => <Status value={row.status} /> },
          {
            title: 'ดำเนินการ',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                  รายละเอียด
                </Button>
                {isAdmin && row.status === 'DRAFT' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setEditing(row)}>
                      แก้ไข
                    </Button>
                    <ConfirmAction
                      label="เริ่มใช้สัญญา"
                      description={'ยืนยันว่า ' + row.contractNo + ' ลงนามจริงแล้ว และเปลี่ยนห้องเป็นมีผู้เช่า'}
                      onConfirm={async () => {
                        await api.post('/api/operations/leases/' + row.id + '/activate');
                        setSuccess('เริ่มใช้สัญญาแล้ว');
                        await refresh();
                      }}
                    />
                  </>
                )}
                {isAdmin && row.status === 'ACTIVE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setClosingId(row.id);
                      document.getElementById('closeout-tools')?.scrollIntoView();
                    }}
                  >
                    ปิดยอดและจบสัญญา
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
      {selected && (
        <section className="surface mt-5 p-6">
          <h2 className="text-xl">สัญญา {selected.contractNo}</h2>
          <p className="mt-3">
            ผู้รับผิดชอบหลัก: {selected.tenant.name} · ห้อง {selected.room.roomNumber}
          </p>
          <p className="mt-2">
            วันลงนาม: {thaiDate(selected.signedDate)} · กำหนดชำระ {selected.dueDaysSnapshot}{' '}
            วันหลังออกบิล
          </p>
          <h3 className="mt-4 font-semibold">ผู้พักร่วม</h3>
          {!!revisions.data?.length && (
            <div className="my-4">
              <h3 className="font-semibold">ประวัติการเปลี่ยนแปลงสัญญา</h3>
              {revisions.data.map((row) => (
                <p key={row.id} className="mt-2 text-sm">
                  {thaiDate(row.createdAt)} ·{' '}
                  {row.kind === 'AMEND' ? 'แก้วันสิ้นสุด' : row.kind === 'RENEW' ? 'ต่ออายุ' : 'ย้ายห้อง'} ·{' '}
                  {row.reason}
                </p>
              ))}
            </div>
          )}
          {selected.occupants.length ? (
            <ul className="mt-2 space-y-1">
              {selected.occupants.map((person) => (
                <li key={person.id}>{person.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">ยังไม่มีผู้พักร่วม</p>
          )}
          <h3 className="mt-4 font-semibold">การรับและคืนประกันจริง</h3>
          {selected.deposits.length ? (
            selected.deposits.map((entry) => (
              <p key={entry.id}>
                {entry.kind === 'RECEIPT' ? 'รับเงิน' : 'คืนเงิน'} {money(entry.amount)} ·{' '}
                {thaiDate(entry.createdAt)}
              </p>
            ))
          ) : (
            <p className="text-muted">ยังไม่มีรายการรับหรือคืนเงินจริง</p>
          )}
          <Button variant="ghost" className="mt-4" onClick={() => setSelected(null)}>
            ปิดรายละเอียด
          </Button>
        </section>
      )}
      {isAdmin && (
        <LeaseTools
          leases={resource.data || []}
          options={options.data}
          refresh={refresh}
          selectedLeaseId={closingId}
        />
      )}
    </>
  );
};
export default Leases;
