import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Lease, Maintenance as Request } from '../types/operations';
import { thaiDate } from '../utils/format';
import Button from '../components/Button';
import { Heading, OperationForm, Status, Table } from '../components/OperationUI';
const Maintenance = () => {
  const { user } = useAuth();
  const resource = useApiResource<Request[]>('/api/operations/maintenance', 'โหลดเรื่องแจ้งซ่อมไม่ได้'),
    leases = useApiResource<Lease[]>('/api/operations/leases', 'โหลดสัญญาไม่ได้');
  const [selected, setSelected] = useState<Request | null>(null),
    [success, setSuccess] = useState('');
  return (
    <>
      <Heading
        title="แจ้งซ่อมและติดตามงาน"
        description="แจ้งปัญหาของห้องในสัญญาที่ใช้งานอยู่ และติดตามสถานะจากผู้ดูแล"
      />
      {success && (
        <p role="status" className="notice notice-info mb-4">
          {success}
        </p>
      )}
      <OperationForm
        title="แจ้งปัญหาห้องพัก"
        fields={[
          {
            name: 'leaseId',
            label: 'ห้องและสัญญา',
            type: 'select',
            required: true,
            options: leases.data
              ?.filter((lease) => lease.status === 'ACTIVE')
              .map((lease) => ({
                value: lease.id,
                label: 'ห้อง ' + lease.room.roomNumber + ' · ' + lease.contractNo,
              })),
          },
          { name: 'title', label: 'เรื่อง', required: true, maxLength: 200 },
          { name: 'description', label: 'รายละเอียดปัญหา', type: 'textarea', required: true },
        ]}
        onSubmit={async (values) => {
          await api.post('/api/operations/maintenance', values);
          setSuccess('ส่งเรื่องแจ้งซ่อมแล้ว');
          await resource.refresh();
        }}
      />
      <Table
        rows={resource.data ?? []}
        loading={resource.loading}
        error={resource.error || leases.error}
        onRetry={resource.refresh}
        columns={[
          {
            title: 'เรื่อง / ห้อง',
            render: (row) => (
              <>
                <p className="font-semibold">{row.title}</p>
                <p className="text-xs text-muted">
                  ห้อง {row.room.roomNumber} · {row.lease.contractNo}
                </p>
              </>
            ),
          },
          {
            title: 'รายละเอียด',
            render: (row) => <p className="whitespace-pre-line">{row.description}</p>,
          },
          { title: 'แจ้งเมื่อ', render: (row) => thaiDate(row.createdAt) },
          { title: 'สถานะ', render: (row) => <Status value={row.status} /> },
          { title: 'ผลดำเนินการ', render: (row) => row.resolution || 'รอดำเนินการ' },
          {
            title: 'ดำเนินการ',
            render: (row) =>
              user?.role === 'ADMIN' && row.status !== 'RESOLVED' ? (
                <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                  อัปเดตงาน
                </Button>
              ) : null,
          },
        ]}
      />
      {selected && (
        <div className="mt-5">
          <OperationForm
            key={selected.id}
            title={'อัปเดตงาน: ' + selected.title}
            initial={{ status: 'IN_PROGRESS', resolution: selected.resolution ?? '' }}
            fields={[
              {
                name: 'status',
                label: 'สถานะ',
                type: 'select',
                required: true,
                options: [
                  { value: 'IN_PROGRESS', label: 'กำลังดำเนินการ' },
                  { value: 'RESOLVED', label: 'ซ่อมเสร็จแล้ว' },
                ],
              },
              {
                name: 'resolution',
                label: 'รายละเอียดการดำเนินการ (ต้องระบุเมื่อปิดงาน)',
                type: 'textarea',
                maxLength: 1000,
              },
            ]}
            onCancel={() => setSelected(null)}
            onSubmit={async (values) => {
              await api.put('/api/operations/maintenance/' + selected.id, values);
              setSelected(null);
              setSuccess('อัปเดตงานแล้ว');
              await resource.refresh();
            }}
          />
        </div>
      )}
    </>
  );
};
export default Maintenance;
