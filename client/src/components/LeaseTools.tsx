import type { Lease, Options } from '../types/operations';
import api from '../services/api';
import CloseoutTools from './CloseoutTools';
import { OperationForm } from './OperationUI';
export default function LeaseTools({
  leases,
  options,
  refresh,
  selectedLeaseId,
}: {
  leases: Lease[];
  options: Options | null;
  refresh: () => Promise<void>;
  selectedLeaseId?: number | null;
}) {
  const sources = leases
    .filter((lease) => lease.status !== 'DRAFT')
    .map((lease) => ({
      value: lease.id,
      label: lease.contractNo + ' · ห้อง ' + lease.room.roomNumber,
    }));
  return (
    <div className="mt-8 space-y-6">
      <CloseoutTools
        key={selectedLeaseId || 'default'}
        leases={leases}
        refresh={refresh}
        selectedLeaseId={selectedLeaseId}
      />
      <OperationForm
        title="แก้วันสิ้นสุดสัญญาที่ใช้งาน พร้อมประวัติ"
        fields={[
          {
            name: 'leaseId',
            label: 'สัญญาใช้งาน',
            type: 'select',
            required: true,
            options: leases
              .filter((lease) => lease.status === 'ACTIVE')
              .map((lease) => ({ value: lease.id, label: lease.contractNo })),
          },
          { name: 'endDate', label: 'วันสิ้นสุดใหม่ (ว่าง = ไม่กำหนด)', type: 'date' },
          { name: 'reason', label: 'เหตุผลและรายละเอียดที่ตกลงกับผู้เช่า', required: true },
        ]}
        onSubmit={async (form) => {
          await api.post('/api/operations/leases/' + form.leaseId + '/amend', form);
          await refresh();
        }}
      >
        <p className="text-sm text-muted">
          ไม่แก้ราคาหรือผู้รับผิดชอบในสัญญาที่ลงนามแล้ว หากเปลี่ยนราคา ต่ออายุ หรือย้ายห้อง ให้สร้างสัญญาฉบับถัดไปแยก
        </p>
      </OperationForm>
      <OperationForm
        title="เตรียมสัญญาต่ออายุหรือย้ายห้อง"
        initial={{ kind: 'RENEW' }}
        fields={[
          { name: 'leaseId', label: 'สัญญาต้นทาง', type: 'select', required: true, options: sources },
          {
            name: 'kind',
            label: 'ประเภทสัญญาถัดไป',
            type: 'select',
            required: true,
            options: [
              { value: 'RENEW', label: 'ต่ออายุห้องเดิม' },
              { value: 'MOVE', label: 'ย้ายห้อง' },
            ],
          },
          {
            name: 'roomId',
            label: 'ห้องใหม่ (กรณีย้ายห้อง)',
            type: 'select',
            options: options?.rooms
              .filter((room) => room.isActive)
              .map((room) => ({ value: room.id, label: room.roomNumber })),
          },
          { name: 'contractNo', label: 'เลขสัญญาใหม่', required: true },
          { name: 'startDate', label: 'วันเริ่มสัญญาใหม่', type: 'date', required: true },
          { name: 'endDate', label: 'วันสิ้นสุดใหม่', type: 'date' },
          { name: 'signedDate', label: 'วันลงนามใหม่', type: 'date' },
          {
            name: 'monthlyRent',
            label: 'ค่าเช่าสัญญาใหม่ (บาท)',
            type: 'number',
            min: '0.01',
            step: '0.01',
            required: true,
          },
          { name: 'reason', label: 'รายละเอียดการต่ออายุหรือย้ายห้อง', required: true },
        ]}
        onSubmit={async (form) => {
          await api.post('/api/operations/leases/' + form.leaseId + '/successor', form);
          await refresh();
        }}
      >
        <p className="notice notice-info">
          สร้างร่างใหม่โดยเก็บสัญญาเดิม ต้องปิดยอดสัญญาเดิมก่อนเริ่มใช้ฉบับใหม่
          เงินประกันเก่ารับคืนและบันทึกรับใหม่แยกตามเงินจริง ไม่ย้ายให้เอง
        </p>
      </OperationForm>
    </div>
  );
}
