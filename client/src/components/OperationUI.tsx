import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { thaiError } from '../utils/errors';
import Button from './Button';
import Input from './Input';
import { EmptyState, ErrorMessage, Loading } from './Feedback';

export interface Field {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'textarea' | 'select';
  required?: boolean;
  options?: { value: string | number; label: string }[];
  step?: string;
  min?: string;
  maxLength?: number;
  hint?: string;
}
export const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
export const stateLabel = (status: string) =>
  (
    ({
      DRAFT: 'ฉบับร่าง',
      ACTIVE: 'ใช้งานอยู่',
      ENDED: 'สิ้นสุดแล้ว',
      PENDING: 'รอตรวจสอบ',
      CONFIRMED: 'ยืนยันแล้ว',
      REJECTED: 'ไม่อนุมัติ',
      ISSUED: 'รอชำระ',
      PAID: 'ชำระแล้ว',
      OPEN: 'รับเรื่องแล้ว',
      IN_PROGRESS: 'กำลังดำเนินการ',
      RESOLVED: 'เสร็จแล้ว',
      RECEIPT: 'รับประกัน',
      REFUND: 'คืนประกัน',
      CASH: 'เงินสด',
      TRANSFER: 'โอนเงิน',
      WATER: 'น้ำ',
      ELECTRICITY: 'ไฟฟ้า',
      RENT: 'ค่าเช่า',
    }) as Record<string, string>
  )[status] || status;
export const Status = ({ value }: { value: string }) => (
  <span
    className={`badge whitespace-nowrap ${['ACTIVE', 'PAID', 'CONFIRMED', 'RESOLVED'].includes(value) ? 'badge-success' : ['ENDED', 'REJECTED'].includes(value) ? 'badge-neutral' : 'badge-warning'}`}
  >
    {stateLabel(value)}
  </span>
);
export const Heading = ({ title, description }: { title: string; description: string }) => (
  <div className="page-heading">
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  </div>
);
export const OperationForm = ({
  title,
  fields,
  initial = {},
  onSubmit,
  onCancel,
  children,
}: {
  title: string;
  fields: Field[];
  initial?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
  children?: ReactNode;
}) => {
  const formId = useId();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, initial[field.name] ?? ''])),
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit(values);
    } catch (err) {
      setError(thaiError(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="surface mb-6 space-y-4 p-5 sm:p-6">
      <h2 className="text-lg">{title}</h2>
      {children}
      {error && <ErrorMessage message={error} />}
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            {field.type === 'select' ? (
              <>
                <label htmlFor={`${formId}-${field.name}`} className="field-label">
                  {field.label}
                </label>
                <select
                  id={`${formId}-${field.name}`}
                  name={field.name}
                  className="field"
                  value={values[field.name]}
                  required={field.required}
                  onInvalid={(event) =>
                    event.currentTarget.setCustomValidity('กรุณาเลือก' + field.label)
                  }
                  onInput={(event) => event.currentTarget.setCustomValidity('')}
                  onChange={(event) => {
                    event.currentTarget.setCustomValidity('');
                    setValues({ ...values, [field.name]: event.target.value });
                  }}
                >
                  <option value="">เลือก{field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </>
            ) : field.type === 'textarea' ? (
              <>
                <label htmlFor={`${formId}-${field.name}`} className="field-label">
                  {field.label}
                </label>
                <textarea
                  id={`${formId}-${field.name}`}
                  name={field.name}
                  className="field min-h-24"
                  value={values[field.name]}
                  maxLength={field.maxLength ?? 5000}
                  required={field.required}
                  onInvalid={(event) =>
                    event.currentTarget.setCustomValidity('กรุณากรอก' + field.label)
                  }
                  onInput={(event) => event.currentTarget.setCustomValidity('')}
                  onChange={(event) => {
                    event.currentTarget.setCustomValidity('');
                    setValues({ ...values, [field.name]: event.target.value });
                  }}
                />
              </>
            ) : (
              <Input
                label={field.label}
                name={field.name}
                type={field.type ?? 'text'}
                value={values[field.name]}
                step={field.step}
                min={field.min}
                maxLength={field.maxLength ?? 500}
                hint={field.hint}
                required={field.required}
                onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
              />
            )}
          </div>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'กำลังบันทึก…' : 'บันทึก'}
        </Button>
        {onCancel && (
          <Button variant="outline" disabled={busy} onClick={onCancel}>
            ยกเลิก
          </Button>
        )}
      </div>
    </form>
  );
};
export const Table = <T extends { id: number }>({
  rows,
  columns,
  loading,
  error,
  onRetry,
}: {
  rows: T[];
  columns: { title: string; render: (row: T) => ReactNode }[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}) =>
  loading ? (
    <Loading />
  ) : error ? (
    <ErrorMessage message={error} onRetry={onRetry} />
  ) : !rows.length ? (
    <section className="surface">
      <EmptyState title="ยังไม่มีรายการ" description="ข้อมูลที่บันทึกจริงจะแสดงในส่วนนี้" />
    </section>
  ) : (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table min-w-[650px]">
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column.title}>
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.title}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
export const ConfirmAction = ({
  label,
  description,
  onConfirm,
  reason = false,
}: {
  label: string;
  description: string;
  onConfirm: (reason: string) => Promise<void>;
  reason?: boolean;
}) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [note, setNote] = useState('');
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setError('');
          dialog.current?.showModal();
        }}
      >
        {label}
      </Button>
      <dialog
        ref={dialog}
        aria-label={label}
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError('');
            try {
              await onConfirm(note);
              dialog.current?.close();
            } catch (err) {
              setError(thaiError(err));
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2 className="text-xl">ยืนยัน{label}</h2>
          <p className="text-sm text-muted">{description}</p>
          {reason && (
            <Input
              label="เหตุผล"
              value={note}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              required
            />
          )}
          {error && <ErrorMessage message={error} />}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" disabled={busy} onClick={() => dialog.current?.close()}>
              กลับไปตรวจสอบ
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'กำลังบันทึก…' : 'ยืนยัน'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
};
