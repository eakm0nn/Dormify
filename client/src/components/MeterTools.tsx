import { useHistoryResource } from '../hooks/useHistoryResource';
import api from '../services/api';
import type { Options, Reading } from '../types/operations';
import { OperationForm, Table, stateLabel, today } from './OperationUI';
import { thaiDate } from '../utils/format';
type Change = {
  id: number;
  kind: string;
  reason: string;
  createdAt: string;
  room: { roomNumber: string };
  before: { rawValue?: string | null; value?: string; oldClosing?: string };
  after: { rawValue?: string | null; value?: string };
};
export default function MeterTools({
  readings,
  options,
  refresh,
}: {
  readings: Reading[];
  options: Options | null;
  refresh: () => Promise<void>;
}) {
  const history = useHistoryResource<Change>('meter-changes', 'โหลดประวัติมิเตอร์ไม่ได้');
  const saved = async () => {
    await refresh();
    await history.refresh();
  };
  return (
    <div className="mt-7 space-y-6">
      <OperationForm
        title="แก้เลขมิเตอร์ที่ยังไม่ออกบิล"
        fields={[
          {
            name: 'readingId',
            label: 'จุดอ่านที่ต้องแก้',
            type: 'select',
            required: true,
            options: readings.map((row) => ({
              value: row.id,
              label:
                row.room.roomNumber +
                ' · ' +
                stateLabel(row.utilityType) +
                ' · ' +
                thaiDate(row.readingDate) +
                ' · ' +
                (row.rawValue ?? row.value),
            })),
          },
          {
            name: 'value',
            label: 'เลขหน้าปัดที่ถูกต้อง',
            type: 'number',
            min: '0',
            step: '0.001',
            required: true,
          },
          { name: 'reason', label: 'เหตุผลการแก้', required: true },
        ]}
        onSubmit={async (values) => {
          await api.put('/api/operations/readings/' + values.readingId, values);
          await saved();
        }}
      >
        <p className="text-sm text-muted">
          เก็บเลขก่อนแก้และเหตุผลเสมอ หากมีบิลครอบคลุมจุดนี้แล้ว ต้องปรับยอดบิลแยกแทนการแก้เลขย้อนหลัง
        </p>
      </OperationForm>
      <OperationForm
        title="บันทึกเปลี่ยนมิเตอร์"
        initial={{ readingDate: today() }}
        fields={[
          {
            name: 'roomId',
            label: 'ห้องที่เปลี่ยนมิเตอร์',
            type: 'select',
            required: true,
            options: options?.rooms.map((room) => ({ value: room.id, label: room.roomNumber })),
          },
          {
            name: 'utilityType',
            label: 'ประเภท',
            type: 'select',
            required: true,
            options: [
              { value: 'WATER', label: 'น้ำ' },
              { value: 'ELECTRICITY', label: 'ไฟฟ้า' },
            ],
          },
          { name: 'readingDate', label: 'วันเปลี่ยนมิเตอร์', type: 'date', required: true },
          {
            name: 'oldClosing',
            label: 'เลขปิดมิเตอร์เดิม',
            type: 'number',
            min: '0',
            step: '0.001',
            required: true,
          },
          {
            name: 'newOpening',
            label: 'เลขเริ่มมิเตอร์ใหม่',
            type: 'number',
            min: '0',
            step: '0.001',
            required: true,
          },
          { name: 'reason', label: 'เหตุผล/รายละเอียดมิเตอร์ใหม่', required: true },
        ]}
        onSubmit={async (values) => {
          await api.post('/api/operations/meter-replacements', values);
          await saved();
        }}
      >
        <p className="text-sm text-muted">
          วันเปลี่ยนต้องอยู่หลังจุดล่าสุด ระบบต่อหน่วยสะสมให้ การอ่านครั้งต่อไปกรอกเลขหน้าปัดของเครื่องใหม่ตามจริง
        </p>
      </OperationForm>
      <h2 className="text-xl">ประวัติแก้ไขและเปลี่ยนมิเตอร์</h2>
      <Table
        rows={history.data || []}
        loading={history.loading}
        error={history.error}
        onRetry={history.refresh}
        remote={history.remote}
        columns={[
          { title: 'ห้อง', render: (row) => row.room.roomNumber },
          {
            title: 'รายการ',
            render: (row) => (row.kind === 'CORRECTION' ? 'แก้ไขเลข' : 'เปลี่ยนมิเตอร์'),
          },
          { title: 'เหตุผล', render: (row) => row.reason },
          {
            title: 'เลขก่อน–หลัง',
            render: (row) =>
              (row.before.rawValue ?? row.before.value ?? row.before.oldClosing ?? '—') +
              ' → ' +
              (row.after.rawValue ?? row.after.value ?? '—'),
          },
          { title: 'วันที่บันทึก', render: (row) => thaiDate(row.createdAt) },
        ]}
      />
    </div>
  );
}
