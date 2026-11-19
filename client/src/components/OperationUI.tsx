import { isValidElement, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { downloadCsv } from '../utils/csv';
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
  max?: string;
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
      CLOSED: 'รวมในยอดปิดสัญญา',
      CANCELLED: 'ยกเลิกแล้ว',
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
    <form onSubmit={submit} className="operation-form surface mb-6 space-y-5 p-5 sm:p-6">
      <h2 className="border-b border-line pb-3 text-lg">{title}</h2>
      {children}
      {error && <ErrorMessage message={error} />}
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
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
                max={field.max}
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
      <div className="flex flex-wrap gap-3 border-t border-line pt-4">
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
const plainText = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(plainText).filter(Boolean).join(' ');
  if (isValidElement<{ children?: ReactNode; value?: string }>(node)) {
    if (node.type === Status) return stateLabel(node.props.value || '');
    if (node.type === 'button' || node.type === Button || node.type === ConfirmAction) return '';
    return plainText(node.props.children);
  }
  return '';
};
export const Table = <T extends { id: number }>({
  rows,
  columns,
  loading,
  error,
  onRetry,
  remote,
}: {
  rows: T[];
  columns: { title: string; render: (row: T) => ReactNode; align?: 'left' | 'right' }[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  remote?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    exportAll: () => Promise<T[]>;
  };
}) => {
  const [page, setPage] = useState(0),
    [pageSize, setPageSize] = useState(10);
  const size = remote?.pageSize ?? pageSize,
    count = remote?.total ?? rows.length;
  const pages = Math.max(1, Math.ceil(count / size)),
    current = Math.min(remote?.page ?? page, pages - 1);
  const changePage = (value: number) => (remote ? remote.onPageChange(value) : setPage(value));
  const [exporting, setExporting] = useState(false),
    [exportError, setExportError] = useState('');
  return loading ? (
    <Loading />
  ) : error ? (
    <ErrorMessage message={error} onRetry={onRetry} />
  ) : !rows.length ? (
    <section className="surface">
      <EmptyState title="ยังไม่มีรายการ" description="ข้อมูลที่บันทึกจริงจะแสดงในส่วนนี้" />
    </section>
  ) : (
    <div className="table-shell surface overflow-hidden">
      <div className="table-toolbar flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <label className="text-sm">
          แสดงต่อหน้า{' '}
          <select
            aria-label="จำนวนรายการต่อหน้า"
            className="field ml-2 !w-auto"
            value={size}
            onChange={(event) => {
              if (remote) remote.onPageSizeChange(Number(event.target.value));
              else {
                setPageSize(Number(event.target.value));
                setPage(0);
              }
            }}
          >
            {[10, 25, 50].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <Button
          variant="outline"
          size="sm"
          disabled={exporting}
          onClick={async () => {
            setExportError('');
            setExporting(true);
            try {
              const exported = columns.filter(
                (column) => !['ดำเนินการ', 'ตรวจรับ', 'หลักฐาน'].includes(column.title),
              );
              downloadCsv(
                exported.map((column) => column.title),
                (remote ? await remote.exportAll() : rows).map((row) =>
                  exported.map((column) => plainText(column.render(row))),
                ),
              );
            } catch (err) {
              setExportError(thaiError(err));
            } finally {
              setExporting(false);
            }
          }}
        >
          {exporting
            ? 'กำลังส่งออก…'
            : remote
              ? 'ส่งออกประวัติทั้งหมดที่กรอง (CSV)'
              : 'ส่งออกข้อมูลที่โหลด (CSV)'}
        </Button>
      </div>
      {exportError && <ErrorMessage message={exportError} />}
      <p className="px-4 pt-3 text-xs text-muted lg:hidden">เลื่อนตารางไปด้านข้างเพื่อดูข้อมูลทั้งหมด</p>
      <div
        className="table-scroll overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="ตารางข้อมูล เลื่อนแนวนอนเพื่อดูคอลัมน์เพิ่มเติม"
      >
        <table className="data-table min-w-[650px]">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  scope="col"
                  key={column.title}
                  className={column.align === 'right' ? 'numeric-cell' : undefined}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(remote ? rows : rows.slice(current * size, (current + 1) * size)).map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td
                    key={column.title}
                    className={column.align === 'right' ? 'numeric-cell' : undefined}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm">
        <p>
          หน้า {current + 1} / {pages} · ทั้งหมด {count} รายการ
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 0}
            onClick={() => changePage(current - 1)}
          >
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={current === pages - 1}
            onClick={() => changePage(current + 1)}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  );
};
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
