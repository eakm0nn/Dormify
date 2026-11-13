import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import React from 'react';
import Button from './Button';

export const Loading = ({ text = 'กำลังโหลดข้อมูล…' }) => (
  <div className="empty-state" role="status">
    <Loader2 className="h-7 w-7 animate-spin text-brand" />
    <p>{text}</p>
  </div>
);
export const ErrorMessage = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div
    role="alert"
    className="notice notice-error flex flex-wrap items-center justify-between gap-3"
  >
    <span className="flex items-start gap-2">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      {message}
    </span>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry}>
        ลองอีกครั้ง
      </Button>
    )}
  </div>
);
export const EmptyState = ({
  title,
  description,
  icon: Icon = Inbox,
  children,
}: {
  title: string;
  description?: string;
  icon?: typeof Inbox;
  children?: React.ReactNode;
}) => (
  <div className="empty-state">
    <span className="section-icon">
      <Icon className="h-6 w-6" />
    </span>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {children && <div className="mt-5">{children}</div>}
  </div>
);
