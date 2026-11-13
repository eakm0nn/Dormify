import { ChevronLeft, ChevronRight, Coffee, Cookie, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import type { MealMenu } from '../types/api';

const days = [
  ['Monday', 'จันทร์'],
  ['Tuesday', 'อังคาร'],
  ['Wednesday', 'พุธ'],
  ['Thursday', 'พฤหัสบดี'],
  ['Friday', 'ศุกร์'],
  ['Saturday', 'เสาร์'],
  ['Sunday', 'อาทิตย์'],
];
const slots: [keyof MealMenu[string], string, typeof Sun][] = [
  ['breakfast', 'อาหารเช้า', Sun],
  ['lunch', 'อาหารกลางวัน', Coffee],
  ['snacks', 'อาหารว่าง', Cookie],
  ['dinner', 'อาหารเย็น', Moon],
];
const MessMenuDisplay = ({ menu = {} }: { menu?: MealMenu }) => {
  const bangkokDay = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Bangkok',
  }).format(new Date());
  const [index, setIndex] = useState(
    Math.max(
      0,
      days.findIndex((day) => day[0] === bangkokDay),
    ),
  );
  const dayMenu = menu[days[index][0]] || {};
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <button
          className="icon-button"
          aria-label="วันก่อนหน้า"
          onClick={() => setIndex((index + 6) % 7)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 gap-2 overflow-x-auto">
          {days.map(([key, label], i) => (
            <button
              key={key}
              className="chip shrink-0"
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              {label}
              {key === bangkokDay ? ' (วันนี้)' : ''}
            </button>
          ))}
        </div>
        <button
          className="icon-button"
          aria-label="วันถัดไป"
          onClick={() => setIndex((index + 1) % 7)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <h3 className="mb-4 text-sm">รายการอาหารวัน{days[index][1]}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {slots.map(([key, label, Icon]) => (
          <div className="rounded-xl border border-line bg-soft p-4" key={key}>
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-brand">
              <Icon className="h-4 w-4" />
              {label}
            </p>
            <p className="text-sm text-muted">{dayMenu[key] || 'ยังไม่มีรายการอาหาร'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default MessMenuDisplay;
