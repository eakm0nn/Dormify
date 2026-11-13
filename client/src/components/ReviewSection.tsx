import { MessageSquare, Star } from 'lucide-react';
import type { Review } from '../types/api';
import { thaiDate } from '../utils/format';

export const StarDisplay = ({ value }: { value: number }) => (
  <span className="inline-flex gap-1" aria-label={`คะแนน ${value} จาก 5`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
      />
    ))}
  </span>
);
const ReviewSection = ({ reviews = [] }: { reviews?: Review[] }) => (
  <div>
    <div className="notice notice-info mb-4 flex gap-3">
      <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
      <p>การส่งความคิดเห็นผ่านระบบยังไม่พัฒนา จึงยังไม่เปิดรับหรือบันทึกรีวิว</p>
    </div>
    {reviews.length ? (
      <div className="space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm">{review.studentName || review.name || 'ผู้ใช้งาน'}</h3>
              <StarDisplay value={review.rating} />
            </div>
            <p className="mt-2 text-xs text-muted">{thaiDate(review.date)}</p>
            <p className="mt-3 text-sm leading-7">{review.text}</p>
          </article>
        ))}
      </div>
    ) : (
      <p className="py-3 text-sm text-muted">ยังไม่มีความคิดเห็นที่เผยแพร่</p>
    )}
  </div>
);
export default ReviewSection;
