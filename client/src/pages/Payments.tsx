import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApiResource } from '../hooks/useApiResource';
import api from '../services/api';
import type { Deposit, Invoice, InvoicePayment, Lease } from '../types/operations';
import { money, thaiDate } from '../utils/format';
import { thaiError } from '../utils/errors';
import Button from '../components/Button';
import CloseoutTools from '../components/CloseoutTools';
import { ErrorMessage } from '../components/Feedback';
import {
  ConfirmAction,
  Heading,
  OperationForm,
  Status,
  Table,
  stateLabel,
  today,
} from '../components/OperationUI';

const Payments = ({ history = false }: { history?: boolean }) => {
  const { user } = useAuth(),
    isAdmin = user?.role === 'ADMIN';
  const payments = useApiResource<InvoicePayment[]>(
      '/api/operations/payments',
      'โหลดการชำระเงินไม่ได้',
    ),
    invoices = useApiResource<Invoice[]>(history ? null : '/api/operations/invoices', 'โหลดบิลไม่ได้'),
    leases = useApiResource<Lease[]>(history ? null : '/api/operations/leases', 'โหลดสัญญาไม่ได้'),
    deposits = useApiResource<Deposit[]>(
      history ? null : '/api/operations/deposits',
      'โหลดเงินประกันไม่ได้',
    );
  const [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [uploading, setUploading] = useState<number | null>(null);
  const refresh = async () =>
    Promise.all([
      payments.refresh(),
      invoices.refresh(),
      deposits.refresh(),
      leases.refresh(),
    ]).then(() => undefined);
  const upload = async (paymentId: number, file: File | undefined) => {
    if (!file) return;
    setError('');
    setUploading(paymentId);
    try {
      if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 2 * 1024 * 1024)
        throw Error('รับเฉพาะ PNG/JPEG ไม่เกิน 2 MB');
      await api.post('/api/operations/payments/' + paymentId + '/proof', file, {
        headers: { 'Content-Type': file.type },
      });
      setSuccess('แนบหลักฐานแล้ว กรุณารอ Admin ตรวจสอบ');
      await payments.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.message.startsWith('รับเฉพาะ') ? err.message : thaiError(err),
      );
    } finally {
      setUploading(null);
    }
  };
  const download = async (payment: InvoicePayment) => {
    try {
      const result = await api.get<Blob>('/api/operations/payments/' + payment.id + '/proof', {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(result.data),
        link = document.createElement('a');
      link.href = url;
      link.download =
        'payment-' + payment.id + (payment.proof?.mime === 'image/png' ? '.png' : '.jpg');
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(thaiError(err));
    }
  };
  return (
    <>
      <Heading
        title={history ? 'ประวัติการชำระเงิน' : 'การชำระเงินและเงินประกัน'}
        description="ชำระเต็มยอด เงินสดหรือโอนต้องให้ Admin ตรวจรับก่อนถือว่าชำระแล้ว เงินประกันแยกจากรายรับค่าเช่า"
      />
      {error && <ErrorMessage message={error} />}{' '}
      {success && (
        <p role="status" className="notice notice-info mb-5">
          {success}
        </p>
      )}
      {!history && (
        <OperationForm
          title={isAdmin ? 'บันทึกรับเงินสดหรือแจ้งโอน' : 'แจ้งชำระเงินโอนเต็มยอด'}
          initial={{ method: isAdmin ? 'CASH' : 'TRANSFER', paidDate: today() }}
          fields={[
            {
              name: 'invoiceId',
              label: 'ใบแจ้งหนี้ที่ยังไม่ชำระ',
              type: 'select',
              required: true,
              options: invoices.data
                ?.filter((invoice) => invoice.status === 'ISSUED')
                .map((invoice) => ({
                  value: invoice.id,
                  label:
                    invoice.invoiceNo +
                    ' · ' +
                    invoice.tenantNameSnapshot +
                    ' · ' +
                    money(invoice.amountDue ?? invoice.totalAmount),
                })),
            },
            {
              name: 'method',
              label: 'วิธีชำระ',
              type: 'select',
              required: true,
              options: isAdmin
                ? [
                    { value: 'CASH', label: 'เงินสด' },
                    { value: 'TRANSFER', label: 'โอนเงิน' },
                  ]
                : [{ value: 'TRANSFER', label: 'โอนเงิน' }],
            },
            { name: 'paidDate', label: 'วันที่ชำระจริง', type: 'date', required: true },
          ]}
          onSubmit={async (values) => {
            const invoice = invoices.data?.find((item) => String(item.id) === values.invoiceId);
            if (!invoice) throw Error('กรุณาเลือกใบแจ้งหนี้');
            await api.post('/api/operations/payments', {
              ...values,
              amount: invoice.amountDue ?? invoice.totalAmount,
            });
            setSuccess('บันทึกรายการรอตรวจแล้ว หากโอนเงินให้แนบภาพหลักฐานที่รายการด้านล่าง');
            await refresh();
          }}
        >
          <p className="text-sm text-muted">
            ระบบใช้ยอดเต็มตามบิล อัปโหลดสลิปไม่ทำให้บิลเป็นชำระแล้ว และไม่มีค่าปรับล่าช้า
          </p>
        </OperationForm>
      )}
      <Table
        rows={(payments.data ?? []).filter((payment) => !history || payment.status === 'CONFIRMED')}
        loading={payments.loading}
        error={payments.error || (!history ? invoices.error : '')}
        onRetry={refresh}
        columns={[
          { title: 'ใบแจ้งหนี้', render: (row) => row.invoice.invoiceNo },
          {
            title: 'ยอด / วิธี',
            align: 'right',
            render: (row) => (
              <>
                {money(row.amount)}
                <br />
                {stateLabel(row.method)}
              </>
            ),
          },
          { title: 'วันที่', render: (row) => thaiDate(row.paidDate) },
          {
            title: 'สถานะ',
            render: (row) => (
              <>
                <Status value={row.status} />
                {row.reason && <p className="mt-2 text-xs text-red-700">{row.reason}</p>}
              </>
            ),
          },
          {
            title: 'หลักฐาน',
            render: (row) => (
              <div className="space-y-2">
                {row.proof && (
                  <Button variant="outline" size="sm" onClick={() => download(row)}>
                    ดาวน์โหลดหลักฐาน
                  </Button>
                )}
                {!history && row.method === 'TRANSFER' && row.status === 'PENDING' && (
                  <label className="block text-xs">
                    {uploading === row.id ? 'กำลังแนบ…' : 'แนบ PNG/JPEG ไม่เกิน 2 MB'}
                    <input
                      className="field mt-1 max-w-56"
                      type="file"
                      accept="image/png,image/jpeg"
                      disabled={uploading !== null}
                      aria-label={'แนบหลักฐานรายการ ' + row.id}
                      onChange={(event) => {
                        void upload(row.id, event.target.files?.[0]);
                        event.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
            ),
          },
          {
            title: 'ตรวจรับ',
            render: (row) =>
              isAdmin && row.status === 'PENDING' ? (
                <div className="flex flex-wrap gap-2">
                  <ConfirmAction
                    label="ยืนยันรับเงิน"
                    description={
                      'ตรวจหลักฐานและยอด ' + money(row.amount) + ' แล้ว การยืนยันจะปิดยอดบิลจริง'
                    }
                    onConfirm={async () => {
                      await api.post('/api/operations/payments/' + row.id + '/review', {
                        status: 'CONFIRMED',
                      });
                      setSuccess('ยืนยันรับเงินแล้ว');
                      await refresh();
                    }}
                  />
                  <ConfirmAction
                    label="ไม่อนุมัติ"
                    description="ระบุเหตุผลเพื่อให้ผู้เช่าตรวจสอบและส่งรายการใหม่"
                    reason
                    onConfirm={async (reason) => {
                      await api.post('/api/operations/payments/' + row.id + '/review', {
                        status: 'REJECTED',
                        reason,
                      });
                      await refresh();
                    }}
                  />
                </div>
              ) : (
                <span className="text-xs text-muted">
                  {row.status === 'PENDING' ? 'รอ Admin ตรวจ' : 'ตรวจแล้ว'}
                </span>
              ),
          },
        ]}
      />
      {!history && isAdmin && (
        <div className="mt-8">
          <OperationForm
            title="บันทึกรับหรือคืนเงินประกันจริง"
            initial={{ kind: 'RECEIPT', method: 'CASH' }}
            fields={[
              {
                name: 'leaseId',
                label: 'สัญญา',
                type: 'select',
                required: true,
                options: leases.data
                  ?.filter((lease) => lease.status !== 'DRAFT')
                  .map((lease) => ({
                    value: lease.id,
                    label:
                      lease.contractNo +
                      ' · ' +
                      lease.tenant.name +
                      ' · ประกัน ' +
                      money(lease.depositRequired),
                  })),
              },
              {
                name: 'kind',
                label: 'รายการ',
                type: 'select',
                required: true,
                options: [
                  { value: 'RECEIPT', label: 'รับเงินประกันเต็มยอด' },
                  { value: 'REFUND', label: 'คืนเงินประกันหลังจบสัญญา' },
                ],
              },
              {
                name: 'method',
                label: 'วิธีรับหรือคืน',
                type: 'select',
                required: true,
                options: [
                  { value: 'CASH', label: 'เงินสด' },
                  { value: 'TRANSFER', label: 'โอนเงิน' },
                ],
              },
              {
                name: 'amount',
                label: 'จำนวนเงินจริง (บาท)',
                type: 'number',
                min: '0.01',
                step: '0.01',
                required: true,
              },
            ]}
            onSubmit={async (values) => {
              await api.post('/api/operations/deposits', values);
              setSuccess('บันทึกเงินประกันแล้ว แยกจากรายรับค่าเช่า');
              await refresh();
            }}
          >
            <p className="text-sm text-muted">
              รับเต็มยอดตามสัญญา คืนเต็มยอดที่รับจริงหลังจบสัญญา ไม่มีการหักหนี้หรือโอนคืนอัตโนมัติ
            </p>
          </OperationForm>
        </div>
      )}
      {!history && (
        <section className="mt-7">
          <h2 className="mb-4 text-xl">ประวัติเงินประกัน</h2>
          <Table
            rows={deposits.data ?? []}
            loading={deposits.loading}
            error={deposits.error}
            onRetry={deposits.refresh}
            columns={[
              {
                title: 'สัญญา',
                render: (row) =>
                  leases.data?.find((lease) => lease.id === row.leaseId)?.contractNo ??
                  'สัญญา #' + row.leaseId,
              },
              { title: 'รายการ', render: (row) => stateLabel(row.kind) },
              { title: 'จำนวนเงิน', align: 'right', render: (row) => money(row.amount) },
              { title: 'วิธี', render: (row) => stateLabel(row.method) },
              { title: 'วันที่', render: (row) => thaiDate(row.createdAt) },
            ]}
          />
        </section>
      )}
      {!history && <CloseoutTools />}
    </>
  );
};
export default Payments;
