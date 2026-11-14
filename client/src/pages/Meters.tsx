import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Options, Rate, Reading } from '../types/operations';
import { thaiDate } from '../utils/format';
import { Heading, OperationForm, Table, stateLabel, today } from '../components/OperationUI';
const utilities = [
  { value: 'WATER', label: 'น้ำ' },
  { value: 'ELECTRICITY', label: 'ไฟฟ้า' },
];
const Meters = () => {
  const readings = useApiResource<Reading[]>('/api/operations/readings', 'โหลดมิเตอร์ไม่ได้'),
    rates = useApiResource<Rate[]>('/api/operations/rates', 'โหลดอัตราไม่ได้'),
    options = useApiResource<Options>('/api/operations/options', 'โหลดห้องไม่ได้');
  return (
    <>
      <Heading
        title="บันทึกมิเตอร์น้ำและไฟฟ้า"
        description="กรอกเลขมิเตอร์จริงตามวันที่ ระบบใช้ผลต่างต้น–ปลายรอบคำนวณบิล ไม่ประมาณเลขที่ขาด"
      />
      <OperationForm
        title="บันทึกเลขมิเตอร์"
        initial={{ readingDate: today() }}
        fields={[
          {
            name: 'roomId',
            label: 'ห้องพัก',
            type: 'select',
            required: true,
            options: options.data?.rooms.map((room) => ({
              value: room.id,
              label: 'ห้อง ' + room.roomNumber,
            })),
          },
          {
            name: 'utilityType',
            label: 'ประเภทมิเตอร์',
            type: 'select',
            required: true,
            options: utilities,
          },
          { name: 'readingDate', label: 'วันที่อ่านมิเตอร์', type: 'date', required: true },
          {
            name: 'value',
            label: 'เลขมิเตอร์สะสม',
            type: 'number',
            step: '0.001',
            min: '0',
            required: true,
          },
        ]}
        onSubmit={async (values) => {
          await api.post('/api/operations/readings', values);
          await readings.refresh();
        }}
      >
        <p className="text-sm text-muted">
          บันทึกต้นและปลายรอบตามวันเริ่มสัญญา หากเริ่มวันที่ 31 เดือนสั้นใช้วันสุดท้าย เดือนถัดไปกลับวันที่ 31
        </p>
      </OperationForm>
      <Table
        rows={readings.data ?? []}
        loading={readings.loading}
        error={readings.error || options.error}
        onRetry={readings.refresh}
        columns={[
          { title: 'ห้อง', render: (row) => row.room.roomNumber },
          { title: 'ประเภท', render: (row) => stateLabel(row.utilityType) },
          { title: 'วันที่', render: (row) => thaiDate(row.readingDate) },
          { title: 'เลขสะสม', render: (row) => row.value },
        ]}
      />
      <div className="mt-7">
        <OperationForm
          title="เพิ่มอัตราน้ำไฟรุ่นใหม่"
          initial={{ effectiveFrom: today() }}
          fields={[
            {
              name: 'utilityType',
              label: 'ประเภท',
              type: 'select',
              required: true,
              options: utilities,
            },
            {
              name: 'unitPrice',
              label: 'ราคาต่อหน่วยที่ใช้จริง (บาท)',
              type: 'number',
              step: '0.000001',
              min: '0',
              required: true,
            },
            { name: 'effectiveFrom', label: 'มีผลตั้งแต่', type: 'date', required: true },
            { name: 'sourceReference', label: 'ที่มา/เอกสารอ้างอิงอัตราที่ตรวจแล้ว', required: true },
          ]}
          onSubmit={async (values) => {
            await api.post('/api/operations/rates', values);
            await rates.refresh();
          }}
        >
          <p className="notice notice-info">
            ระบุอัตราจริงและที่มาที่เจ้าของตรวจแล้ว
            ระบบไม่ใส่ราคาให้เองและไม่รับรองว่าตัวเลขที่กรอกถูกกฎหมายเพียงเพราะบันทึกได้ อัตราใหม่ไม่แก้บิลเก่า
          </p>
        </OperationForm>
      </div>
      <Table
        rows={rates.data ?? []}
        loading={rates.loading}
        error={rates.error}
        onRetry={rates.refresh}
        columns={[
          { title: 'ประเภท', render: (row) => stateLabel(row.utilityType) },
          { title: 'บาทต่อหน่วย', render: (row) => row.unitPrice },
          { title: 'มีผล', render: (row) => thaiDate(row.effectiveFrom) },
          { title: 'ที่มา', render: (row) => row.sourceReference },
        ]}
      />
    </>
  );
};
export default Meters;
