import React, { useId } from 'react';
import { cn } from '../utils/cn';

const Input = ({
  label,
  className,
  error,
  id,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
}) => {
  const generated = useId();
  const fieldId = id || generated;
  const invalid = (event: React.InvalidEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (input.validity.valueMissing) input.setCustomValidity(`กรุณากรอก${label || 'ข้อมูลช่องนี้'}`);
    else if (input.validity.typeMismatch) input.setCustomValidity('กรุณากรอกข้อมูลให้ถูกต้อง');
    else if (input.validity.tooShort)
      input.setCustomValidity(`กรุณากรอกอย่างน้อย ${props.minLength} ตัวอักษร`);
    else if (
      input.validity.rangeUnderflow ||
      input.validity.rangeOverflow ||
      input.validity.stepMismatch
    )
      input.setCustomValidity('กรุณากรอกค่าที่อยู่ในช่วงที่กำหนด');
  };
  return (
    <div className="min-w-0">
      {label && (
        <label htmlFor={fieldId} className="field-label">
          {label}
          {props.required && (
            <span className="ml-1 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <input
        id={fieldId}
        className={cn('field', className)}
        onInvalid={invalid}
        onInput={(event) => event.currentTarget.setCustomValidity('')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error || hint ? `${fieldId}-help` : undefined}
        {...props}
      />
      {(error || hint) && (
        <p
          id={`${fieldId}-help`}
          className={cn('mt-1.5 text-xs', error ? 'text-red-700' : 'text-muted')}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
};
export default Input;
