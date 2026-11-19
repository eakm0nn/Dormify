import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Policy } from '../types/operations';
import { ErrorMessage, Loading } from './Feedback';
import { OperationForm } from './OperationUI';
const PolicyPanel = () => {
  const resource = useApiResource<Policy>('/api/operations/policy', 'โหลดนโยบายไม่ได้');
  return resource.loading ? (
    <Loading />
  ) : resource.error ? (
    <ErrorMessage message={resource.error} onRetry={resource.refresh} />
  ) : resource.data ? (
    <OperationForm
      key={resource.data.id}
      title="นโยบายเช่าสำหรับรายการใหม่"
      initial={{
        holdHours: String(resource.data.holdHours),
        depositMonths: String(resource.data.depositMonths),
        dueDays: String(resource.data.dueDays),
        autoBilling: resource.data.autoBilling ? 'true' : 'false',
      }}
      fields={[
        {
          name: 'autoBilling',
          label: 'ออกบิลอัตโนมัติเมื่อถึงรอบและข้อมูลครบ',
          type: 'select',
          required: true,
          options: [
            { value: 'false', label: 'ปิด' },
            { value: 'true', label: 'เปิด (Backend ต้องทำงานอยู่)' },
          ],
        },
        {
          name: 'holdHours',
          label: 'ระยะกันห้องหลังอนุมัติ (ชั่วโมง)',
          type: 'number',
          min: '1',
          step: '1',
          required: true,
        },
        {
          name: 'depositMonths',
          label: 'เงินประกันเริ่มต้น (จำนวนเดือนค่าเช่า)',
          type: 'number',
          min: '0',
          step: '1',
          required: true,
        },
        {
          name: 'dueDays',
          label: 'กำหนดชำระหลังออกบิล (วัน)',
          type: 'number',
          min: '0',
          step: '1',
          required: true,
        },
      ]}
      onSubmit={async (values) => {
        await api.post(
          '/api/operations/policy',
          Object.fromEntries(
            Object.entries(values).map(([key, value]) => [
              key,
              key === 'autoBilling' ? value === 'true' : Number(value),
            ]),
          ),
        );
        await resource.refresh();
      }}
    >
      <p className="notice notice-info">
        ค่าเริ่มต้นคือกันห้อง 72 ชั่วโมง / ประกัน 1 เดือน / ชำระใน 5 วัน การเปลี่ยนมีผลกับรายการใหม่ ระยะกันห้อง
        สัญญาและบิลเดิมไม่เปลี่ยนย้อนหลัง
      </p>
    </OperationForm>
  ) : null;
};
export default PolicyPanel;
