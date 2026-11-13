import { KeyRound } from 'lucide-react';
import logo from '../assets/dormify-logo.png';
import animation from '../assets/fonts/DORMIFY Dolphin Logo Animation.gif';

const HeroVisual = ({ name = 'หอพัก DORMIFY' }) => (
  <div className="surface overflow-hidden px-5 py-5 text-center sm:px-7">
    <picture className="block">
      <source media="(prefers-reduced-motion: reduce)" srcSet={logo} />
      <img
        src={animation}
        alt={`DORMIFY ยินดีต้อนรับสู่${name}`}
        width="362"
        height="362"
        className="mx-auto aspect-square w-full max-w-[362px] object-contain"
      />
    </picture>
    <p className="flex items-center justify-center gap-2 border-t border-line py-4 text-sm text-muted">
      <KeyRound className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
      เริ่มต้นการพักอาศัยในแบบของคุณ
    </p>
  </div>
);

export default HeroVisual;
