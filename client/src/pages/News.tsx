import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHistoryResource } from '../hooks/useHistoryResource';
import api from '../services/api';
import type { Announcement, Notification } from '../types/operations';
import { thaiDate } from '../utils/format';
import { thaiError } from '../utils/errors';
import { ErrorMessage } from '../components/Feedback';
import Button from '../components/Button';
import { Heading, OperationForm, Table } from '../components/OperationUI';
const News = () => {
  const { user } = useAuth(),
    isAdmin = user?.role === 'ADMIN';
  const news = useHistoryResource<Announcement>('announcements', 'โหลดข่าวสารไม่ได้'),
    notifications = useHistoryResource<Notification>(
      'notifications',
      'โหลดการแจ้งเตือนไม่ได้',
      '',
      !isAdmin,
    );
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [error, setError] = useState('');
  return (
    <>
      <Heading
        title={isAdmin ? 'ข่าวสารหอพัก' : 'ข่าวสารและการแจ้งเตือน'}
        description="ข่าวสารส่วนกลางและรายการสำคัญเฉพาะบัญชีของคุณ"
      />
      {error && <ErrorMessage message={error} />}
      {isAdmin && (
        <OperationForm
          key={editing?.id ?? 'new'}
          title={editing ? 'แก้ไขข่าวสาร' : 'เผยแพร่ข่าวสาร'}
          initial={{ title: editing?.title ?? '', message: editing?.message ?? '' }}
          fields={[
            { name: 'title', label: 'หัวข้อ', required: true, maxLength: 200 },
            { name: 'message', label: 'ข้อความข่าวสาร', type: 'textarea', required: true },
          ]}
          onCancel={editing ? () => setEditing(null) : undefined}
          onSubmit={async (values) => {
            if (editing) await api.put('/api/operations/announcements/' + editing.id, values);
            else await api.post('/api/operations/announcements', values);
            setEditing(null);
            await news.refresh();
          }}
        />
      )}
      <Table
        rows={news.data ?? []}
        loading={news.loading}
        error={news.error}
        onRetry={news.refresh}
        remote={news.remote}
        columns={[
          {
            title: 'ข่าวสาร',
            render: (row) => (
              <>
                <h2 className="font-semibold">{row.title}</h2>
                <p className="mt-2 whitespace-pre-line">{row.message}</p>
              </>
            ),
          },
          { title: 'เผยแพร่', render: (row) => thaiDate(row.createdAt) },
          {
            title: 'ดำเนินการ',
            render: (row) =>
              isAdmin ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(row)}>
                  แก้ไข
                </Button>
              ) : null,
          },
        ]}
      />
      {!isAdmin && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl">การแจ้งเตือนของฉัน</h2>
          <Table
            rows={notifications.data ?? []}
            loading={notifications.loading}
            error={notifications.error}
            onRetry={notifications.refresh}
            remote={notifications.remote}
            columns={[
              {
                title: 'รายการ',
                render: (row) => (
                  <>
                    <p className="font-semibold">{row.title}</p>
                    <p className="mt-1">{row.message}</p>
                  </>
                ),
              },
              { title: 'วันที่', render: (row) => thaiDate(row.createdAt) },
              {
                title: 'สถานะ',
                render: (row) =>
                  row.readAt ? (
                    'อ่านแล้ว'
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setError('');
                        try {
                          await api.patch('/api/operations/notifications/' + row.id + '/read');
                          await notifications.refresh();
                        } catch (err) {
                          setError(thaiError(err));
                        }
                      }}
                    >
                      ทำเครื่องหมายว่าอ่านแล้ว
                    </Button>
                  ),
              },
            ]}
          />
        </div>
      )}
    </>
  );
};
export default News;
