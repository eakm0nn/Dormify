import { BedDouble, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useRef, useState } from 'react';
import { mediaUrl } from '../utils/media';

const PropertyGallery = ({ images = [], name = 'ห้องพัก' }: { images?: string[]; name?: string }) => {
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const dialog = useRef<HTMLDialogElement>(null);
  const usable = images.filter(Boolean).map(mediaUrl);
  const index = usable.length ? current % usable.length : 0;
  const prev = () => setCurrent((value) => (value - 1 + usable.length) % usable.length);
  const next = () => setCurrent((value) => (value + 1) % usable.length);
  if (!usable.length)
    return (
      <div className="room-art flex min-h-64 flex-col items-center justify-center rounded-lg border border-line p-8 text-center">
        <BedDouble className="h-16 w-16 stroke-[1.2] text-brand/40" aria-hidden="true" />
        <p className="mt-4 text-sm text-muted">ยังไม่มีรูปภาพห้องพักนี้</p>
      </div>
    );
  const picture = (
    <img
      src={usable[index]}
      alt={`${name} ภาพที่ ${index + 1}`}
      width="1200"
      height="750"
      fetchPriority="high"
      className="h-full w-full object-contain"
      onError={() => setFailed((value) => ({ ...value, [usable[index]]: true }))}
    />
  );
  return (
    <>
      <div className="surface overflow-hidden">
        <div className="room-art relative flex aspect-[16/10] items-center justify-center">
          {failed[usable[index]] ? (
            <p className="text-sm text-muted">ไม่สามารถแสดงรูปภาพนี้ได้</p>
          ) : (
            picture
          )}
          <button
            className="icon-button absolute right-3 top-3"
            aria-label="ขยายรูปภาพ"
            onClick={() => dialog.current?.showModal()}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          {usable.length > 1 && (
            <>
              <button
                className="icon-button absolute left-3 top-1/2 -translate-y-1/2"
                aria-label="รูปภาพก่อนหน้า"
                onClick={prev}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="icon-button absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="รูปภาพถัดไป"
                onClick={next}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <span className="badge badge-info absolute bottom-3 right-3">
            ภาพที่ {index + 1} / {usable.length}
          </span>
        </div>
        {usable.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {usable.map((source, i) => (
              <button
                key={`${source}-${i}`}
                aria-label={`ดูภาพที่ ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => setCurrent(i)}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === index ? 'border-brand' : 'border-line'}`}
              >
                <img
                  src={source}
                  alt=""
                  width="80"
                  height="56"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      <dialog
        ref={dialog}
        aria-label={`รูปภาพ${name}`}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') prev();
          if (event.key === 'ArrowRight') next();
        }}
        className="!max-w-[94vw] !p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-5">
          <p className="text-sm">
            {name} · ภาพที่ {index + 1}
          </p>
          <button
            className="icon-button"
            aria-label="ปิดรูปภาพ"
            onClick={() => dialog.current?.close()}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-hidden">{picture}</div>
        {usable.length > 1 && (
          <div className="mt-3 flex justify-between">
            <button className="btn btn-outline" onClick={prev}>
              ภาพก่อนหน้า
            </button>
            <button className="btn btn-outline" onClick={next}>
              ภาพถัดไป
            </button>
          </div>
        )}
      </dialog>
    </>
  );
};
export default PropertyGallery;
