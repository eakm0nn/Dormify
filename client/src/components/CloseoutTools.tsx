import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Lease } from '../types/operations';
import { money, thaiDate } from '../utils/format';
import { ConfirmAction, OperationForm, Table, today } from './OperationUI';
interface Totals {
  details?: {
    adjustmentTotal: string;
    allocation?: {
      adjustmentId: number;
      itemType: string;
      original: string;
      applied: string;
      usedDays?: number;
      cycleDays?: number;
      requiresManual?: boolean;
      manual?: boolean;
      reason?: string;
      reference?: string;
    }[];
  };
  rentDue: string;
  utilitiesDue: string;
  previouslyPaid: string;
  balance: string;
}
interface Closeout extends Totals {
  id: number;
  checkoutDate: string;
  settledAt: string | null;
  method: string | null;
  reason: string;
  lease: { contractNo: string; room: { roomNumber: string } };
}
export default function CloseoutTools({
  leases = [],
  refresh,
  selectedLeaseId,
}: {
  leases?: Lease[];
  refresh?: () => Promise<void>;
  selectedLeaseId?: number | null;
}) {
  const { user } = useAuth(),
    admin = user?.role === 'ADMIN';
  const resource = useApiResource<Closeout[]>('/api/operations/closeouts', 'โหลดรายการปิดยอดไม่ได้');
  const [preview, setPreview] = useState<Totals | null>(null),
    [values, setValues] = useState<Record<string, string> | null>(null);
  const [utilityAdjustments, setUtilityAdjustments] = useState<
    { adjustmentId: number; amount: string; reason: string; reference: string }[]
  >([]);
  const pending = preview?.details?.allocation?.filter((row) => row.requiresManual) || [];
  const saved = async () => {
    await resource.refresh();
    await refresh?.();
  };
  return (
    <section className="mt-8 space-y-5" id="closeout-tools">
      <h2 className="text-xl">ยอดปิดสัญญาและคืนค่าเช่าชำระเกิน</h2>
      {admin && leases.length > 0 && (
        <OperationForm
          title="ตรวจยอดก่อนจบสัญญา"
          initial={{ checkoutDate: today(), leaseId: String(selectedLeaseId || '') }}
          fields={[
            {
              name: 'leaseId',
              label: 'สัญญาที่จะปิดยอด',
              type: 'select',
              required: true,
              options: leases
                .filter((lease) => lease.status !== 'DRAFT')
                .map((lease) => ({
                  value: lease.id,
                  label: lease.contractNo + ' · ห้อง ' + lease.room.roomNumber,
                })),
            },
            {
              name: 'checkoutDate',
              label: 'วันย้ายออก (ไม่คิดค่าเช่าวันนี้)',
              type: 'date',
              required: true,
            },
            { name: 'reason', label: 'เหตุผล/รายละเอียดสิ้นสุดสัญญา', required: true },
          ]}
          onSubmit={async (form) => {
            setPreview(null);
            setValues(null);
            setUtilityAdjustments([]);
            const result = await api.post<Totals>(
              '/api/operations/leases/' + form.leaseId + '/closeout-preview',
              form,
            );
            setPreview(result.data);
            setValues(form);
          }}
        >
          <p className="notice notice-info">
            คิดค่าเช่ารวมวันเริ่มและไม่รวมวันย้ายออก หารตามจำนวนวันจริงในแต่ละรอบ
            ต้องมีมิเตอร์ถึงวันย้ายออกและทุกวันเปลี่ยนอัตรา เงินประกันแยกต่างหาก
          </p>
        </OperationForm>
      )}
      {preview && values && (
        <div className="surface space-y-3 p-5">
          <h3>ตรวจยอดวันที่ {thaiDate(values.checkoutDate)}</h3>
          {pending.length > 0 && (
            <p className="notice notice-info">
              ยอดนี้ยังไม่สมบูรณ์ กรุณาระบุยอดปรับน้ำไฟตามหลักฐานมิเตอร์แล้วคำนวณตัวอย่างใหม่
            </p>
          )}
          <p>
            ค่าเช่าตามวันจริง {money(preview.rentDue)} · น้ำไฟ {money(preview.utilitiesDue)} ·
            เงินรับสุทธิเดิม {money(preview.previouslyPaid)}
          </p>
          <p>ปรับยอดตามบิล {money(preview.details?.adjustmentTotal || '0')}</p>
          {preview.details?.allocation?.map((row) => (
            <p key={row.adjustmentId} className="text-sm text-muted">
              {row.itemType === 'RENT'
                ? 'ส่วนปรับค่าเช่า'
                : row.itemType === 'WATER'
                  ? 'ส่วนปรับค่าน้ำ'
                  : 'ส่วนปรับค่าไฟ'}
              {' · ยอดเดิม ' + money(row.original) + ' · ใช้จริง ' + money(row.applied)}
              {row.usedDays !== undefined && ` (${row.usedDays}/${row.cycleDays} วัน)`}
              {row.manual && <span>{' · ' + row.reason + ' · หลักฐาน: ' + row.reference}</span>}
            </p>
          ))}
          <p className="font-semibold">
            {Number(preview.balance) < 0 ? 'ต้องคืนผู้เช่า' : 'ต้องรับเพิ่ม'}{' '}
            {money(Math.abs(Number(preview.balance)))}
          </p>
          {pending.length > 0 ? (
            <OperationForm
              title="จัดสรรยอดปรับน้ำไฟตามหลักฐานมิเตอร์"
              fields={pending.flatMap((row) => [
                {
                  name: 'amount-' + row.adjustmentId,
                  label: `#${row.adjustmentId} ${row.itemType === 'WATER' ? 'ค่าน้ำ' : 'ค่าไฟ'} · ${Number(row.original) < 0 ? 'ยอดลด' : 'ยอดเพิ่ม'}ที่ใช้จริง (บาท ไม่เกิน ${Math.abs(Number(row.original))})`,
                  type: 'number' as const,
                  min: '0',
                  max: String(Math.abs(Number(row.original))),
                  step: '0.01',
                  required: true,
                },
                {
                  name: 'reason-' + row.adjustmentId,
                  label: `#${row.adjustmentId} เหตุผลการจัดสรร`,
                  required: true,
                },
                {
                  name: 'reference-' + row.adjustmentId,
                  label: `#${row.adjustmentId} อ้างอิงหลักฐานมิเตอร์ (วันและเลขที่อ่าน/เอกสาร)`,
                  required: true,
                },
              ])}
              onSubmit={async (form) => {
                const selected = pending.map((row) => ({
                  adjustmentId: row.adjustmentId,
                  amount: form['amount-' + row.adjustmentId],
                  reason: form['reason-' + row.adjustmentId],
                  reference: form['reference-' + row.adjustmentId],
                }));
                const result = await api.post<Totals>(
                  '/api/operations/leases/' + values.leaseId + '/closeout-preview',
                  { ...values, utilityAdjustments: selected },
                );
                setUtilityAdjustments(selected);
                setPreview(result.data);
              }}
            />
          ) : (
            <ConfirmAction
              label="ยืนยันปิดยอดและจบสัญญา"
              description="ตรวจยอดและวันย้ายออกถูกต้องแล้ว บิลเดิมจะเก็บไว้และห้องจะกลับเป็นว่าง การรับหรือคืนเงินจริงต้องบันทึกแยก"
              onConfirm={async () => {
                await api.post('/api/operations/leases/' + values.leaseId + '/closeout', {
                  ...values,
                  expectedBalance: preview.balance,
                  utilityAdjustments,
                });
                setPreview(null);
                setValues(null);
                setUtilityAdjustments([]);
                await saved();
              }}
            />
          )}
        </div>
      )}
      <Table
        rows={resource.data || []}
        loading={resource.loading}
        error={resource.error}
        onRetry={resource.refresh}
        columns={[
          {
            title: 'สัญญา/วันย้ายออก',
            render: (row) => (
              <>
                {row.lease.contractNo}
                <br />
                {thaiDate(row.checkoutDate)}
              </>
            ),
          },
          {
            title: 'ค่าเช่า/น้ำไฟ',
            render: (row) => (
              <>
                {money(row.rentDue)} / {money(row.utilitiesDue)}
              </>
            ),
          },
          { title: 'เงินรับเดิมสุทธิ', render: (row) => money(row.previouslyPaid) },
          {
            title: 'ส่วนปรับยอดที่ใช้จริง',
            render: (row) =>
              row.details?.allocation?.length
                ? row.details.allocation.map((item) => (
                    <p key={item.adjustmentId}>
                      {'#' +
                        item.adjustmentId +
                        ' เดิม ' +
                        money(item.original) +
                        ' · ใช้ ' +
                        money(item.applied)}
                      {item.manual && (
                        <span>{' · ' + item.reason + ' · หลักฐาน: ' + item.reference}</span>
                      )}
                      {item.usedDays !== undefined
                        ? ` (${item.usedDays}/${item.cycleDays} วัน)`
                        : ''}
                    </p>
                  ))
                : 'ไม่มีส่วนปรับยอด',
          },
          {
            title: 'ยอดปิดสัญญา',
            render: (row) =>
              (Number(row.balance) < 0 ? 'คืนผู้เช่า ' : 'รับเพิ่ม ') +
              money(Math.abs(Number(row.balance))),
          },
          {
            title: 'สถานะ',
            render: (row) =>
              Number(row.balance) === 0
                ? 'ไม่มียอดรับหรือคืน'
                : row.settledAt
                  ? 'รับ/คืนเงินจริงแล้ว · ' + thaiDate(row.settledAt)
                  : 'รอรับ/คืนเงินจริง',
          },
          { title: 'เหตุผล', render: (row) => row.reason },
        ]}
      />
      {admin && (
        <OperationForm
          title="บันทึกรับหรือคืนเงินจริงตามยอดปิดสัญญา"
          initial={{ method: 'CASH' }}
          fields={[
            {
              name: 'closeoutId',
              label: 'รายการที่ยังไม่รับหรือคืนเงิน',
              type: 'select',
              required: true,
              options: resource.data
                ?.filter((row) => !row.settledAt)
                .map((row) => ({
                  value: row.id,
                  label:
                    row.lease.contractNo +
                    (Number(row.balance) < 0 ? ' · คืน ' : ' · รับ ') +
                    money(Math.abs(Number(row.balance))),
                })),
            },
            {
              name: 'method',
              label: 'วิธีรับ/คืน',
              type: 'select',
              required: true,
              options: [
                { value: 'CASH', label: 'เงินสด' },
                { value: 'TRANSFER', label: 'โอนเงิน' },
              ],
            },
            {
              name: 'amount',
              label: 'จำนวนเงินจริงเต็มยอด (บาท)',
              type: 'number',
              min: '0.01',
              step: '0.01',
              required: true,
            },
          ]}
          onSubmit={async (form) => {
            await api.post('/api/operations/closeouts/' + form.closeoutId + '/settle', form);
            await saved();
          }}
        />
      )}
    </section>
  );
}
