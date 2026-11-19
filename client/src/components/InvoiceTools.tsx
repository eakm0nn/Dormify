import { useState } from 'react';
import api from '../services/api';
import type { Invoice } from '../types/operations';
import { money, thaiDate } from '../utils/format';
import { ConfirmAction, OperationForm } from './OperationUI';
export default function InvoiceTools({
  invoices,
  refresh,
}: {
  invoices: Invoice[];
  refresh: () => Promise<void>;
}) {
  const [result, setResult] = useState('');
  return (
    <div className="mt-7 space-y-5">
      <OperationForm
        title="ปรับยอดหรือออกใบลดหนี้"
        initial={{ direction: 'CREDIT', itemType: 'RENT' }}
        fields={[
          {
            name: 'itemType',
            label: 'ค่าใช้จ่ายที่ปรับ',
            type: 'select',
            required: true,
            options: [
              { value: 'RENT', label: 'ค่าเช่า (เฉลี่ยตามวันอยู่จริงเมื่อย้ายออก)' },
              { value: 'WATER', label: 'ค่าน้ำ' },
              { value: 'ELECTRICITY', label: 'ค่าไฟฟ้า' },
            ],
          },
          {
            name: 'invoiceId',
            label: 'บิลที่จะปรับ',
            type: 'select',
            required: true,
            options: invoices
              .filter((row) => ['ISSUED', 'PAID'].includes(row.status))
              .map((row) => ({
                value: row.id,
                label:
                  row.invoiceNo +
                  ' · ' +
                  row.tenantNameSnapshot +
                  ' · ' +
                  money(row.amountDue ?? row.totalAmount),
              })),
          },
          {
            name: 'direction',
            label: 'ประเภทการปรับ',
            type: 'select',
            required: true,
            options: [
              { value: 'CREDIT', label: 'ลดหนี้' },
              { value: 'DEBIT', label: 'เพิ่มยอด (เฉพาะบิลยังไม่ชำระ)' },
            ],
          },
          {
            name: 'amount',
            label: 'ยอดที่ปรับ (บาท)',
            type: 'number',
            min: '0.01',
            step: '0.01',
            required: true,
          },
          { name: 'reason', label: 'เหตุผลและเอกสารอ้างอิง', required: true },
        ]}
        onSubmit={async (values) => {
          await api.post('/api/operations/invoices/' + values.invoiceId + '/adjustments', values);
          setResult('บันทึกปรับยอดแล้ว บิลเดิมและอัตราเดิมยังอยู่');
          await refresh();
        }}
      >
        <p className="text-sm text-muted">
          ต้องตรวจรายการชำระที่รอตรวจก่อน บิลที่ชำระแล้วลดหนี้ได้และต้องบันทึกคืนเงินจริงแยก
          ส่วนสัญญาปิดยอดแล้วใช้ยอดปิดสัญญา
        </p>
      </OperationForm>
      {result && (
        <p role="status" className="notice notice-info">
          {result}
        </p>
      )}
      {invoices.flatMap((invoice) =>
        (invoice.adjustments || [])
          .filter(
            (row) =>
              Number(row.amount) < 0 &&
              !row.refundedAt &&
              row.refundEligible === true &&
              invoice.settlement,
          )
          .map((row) => (
            <section key={row.id} className="surface space-y-3 p-5">
              <h3>คืนเงินใบลดหนี้ {invoice.invoiceNo}</h3>
              <p>
                {row.reason} · {money(Math.abs(Number(row.amount)))}
              </p>
              {(['CASH', 'TRANSFER'] as const).map((method) => (
                <ConfirmAction
                  key={method}
                  label={method === 'CASH' ? 'ยืนยันคืนเงินสด' : 'ยืนยันโอนคืน'}
                  description="ยืนยันเมื่อคืนเงินจริงให้ผู้เช่าแล้วเท่านั้น ระบบบันทึกคืนเงินครั้งเดียวและปรับรายงานตามเงินจริง"
                  onConfirm={async () => {
                    await api.post('/api/operations/adjustments/' + row.id + '/refund', { method });
                    await refresh();
                  }}
                />
              ))}
            </section>
          )),
      )}
      <OperationForm
        title="ออกบิลที่ถึงรอบทันที"
        fields={[]}
        onSubmit={async () => {
          const response = await api.post<{
            issued: unknown[];
            waiting: { reason: string; contractNo: string }[];
          }>('/api/operations/billing-runs');
          setResult(
            'ออกบิล ' +
              response.data.issued.length +
              ' รายการ' +
              (response.data.waiting.length
                ? ' · รอข้อมูล: ' +
                  response.data.waiting.map((row) => row.contractNo + ' ' + row.reason).join(' / ')
                : ''),
          );
          await refresh();
        }}
      >
        <p className="text-sm text-muted">
          ออกเฉพาะรอบที่ถึงวันและยังไม่เคยออก หากมิเตอร์ไม่ครบจะรอข้อมูล เปิดทำงานอัตโนมัติทุกนาทีได้ในนโยบายหอพัก
        </p>
      </OperationForm>
    </div>
  );
}
export function AdjustmentHistory({ invoice }: { invoice: Invoice }) {
  return (
    <div className="mt-4 space-y-2">
      {invoice.adjustments?.map((row) => (
        <p key={row.id}>
          ปรับยอด {money(row.amount)} · {row.reason}
          {row.refundedAt ? ' · คืนเงินจริง ' + thaiDate(row.refundedAt) : ''}
        </p>
      ))}
      <p className="font-bold">ยอดหลังปรับ {money(invoice.amountDue ?? invoice.totalAmount)}</p>
    </div>
  );
}
