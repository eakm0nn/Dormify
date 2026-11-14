import { useState } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Options, Tenant } from '../types/operations';
import Button from '../components/Button';
import { Heading, OperationForm, Table } from '../components/OperationUI';

const Tenants = () => {
  const resource = useApiResource<Tenant[]>('/api/operations/tenants', 'โหลดทะเบียนผู้เช่าไม่ได้');
  const options = useApiResource<Options>('/api/operations/options', 'โหลดบัญชีผู้ใช้ไม่ได้');
  const [editing, setEditing] = useState<Tenant | null | undefined>(undefined),
    [success, setSuccess] = useState('');
  return (
    <>
      <Heading
        title="จัดการผู้เช่า"
        description="ผูกทะเบียนผู้เช่ากับบัญชี User ก่อนบันทึกสัญญา ผู้รับผิดชอบหลักมีหนึ่งคนต่อสัญญา"
      />
      {success && (
        <p role="status" className="notice notice-info mb-5">
          {success}
        </p>
      )}
      <Button
        className="mb-5"
        disabled={options.loading || !!options.error}
        onClick={() => setEditing(null)}
      >
        เพิ่มผู้เช่า
      </Button>
      {editing !== undefined && (
        <OperationForm
          key={editing?.id ?? 'new'}
          title={editing ? 'แก้ไขทะเบียนผู้เช่า' : 'เพิ่มทะเบียนผู้เช่า'}
          initial={{
            userId: String(editing?.userId ?? ''),
            name: editing?.name ?? '',
            phone: editing?.phone ?? '',
            address: editing?.address ?? '',
          }}
          fields={[
            {
              name: 'userId',
              label: 'บัญชี User',
              type: 'select',
              required: true,
              options: options.data?.users.map((user) => ({
                value: user.id,
                label: user.name + ' · ' + user.email,
              })),
            },
            { name: 'name', label: 'ชื่อและนามสกุล', required: true, maxLength: 100 },
            { name: 'phone', label: 'เบอร์โทรศัพท์', maxLength: 30 },
            { name: 'address', label: 'ที่อยู่', type: 'textarea', maxLength: 500 },
          ]}
          onCancel={() => setEditing(undefined)}
          onSubmit={async (values) => {
            if (editing) await api.put('/api/operations/tenants/' + editing.id, values);
            else await api.post('/api/operations/tenants', values);
            setEditing(undefined);
            setSuccess('บันทึกทะเบียนผู้เช่าแล้ว');
            await Promise.all([resource.refresh(), options.refresh()]);
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
            title: 'ผู้เช่า',
            render: (row) => (
              <>
                <p className="font-semibold">{row.name}</p>
                <p className="text-xs text-muted">{row.phone || 'ยังไม่ระบุเบอร์โทร'}</p>
              </>
            ),
          },
          { title: 'ที่อยู่', render: (row) => row.address || 'ยังไม่ระบุ' },
          {
            title: 'สัญญา',
            render: (row) => row.leases?.map((lease) => lease.contractNo).join(', ') || 'ยังไม่มีสัญญา',
          },
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
export default Tenants;
