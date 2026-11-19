import logo from '../assets/dormify-logo.png';
import animation from '../assets/fonts/DORMIFY Dolphin Logo Animation.gif';

const HeroVisual = ({ name = 'หอพัก DORMIFY' }) => (
  <figure className="surface hero-brand-panel overflow-hidden p-3 text-center">
    <picture className="block">
      <source media="(prefers-reduced-motion: reduce)" srcSet={logo} />
      <img
        src={animation}
        alt={`DORMIFY ยินดีต้อนรับสู่${name}`}
        width="362"
        height="362"
        fetchPriority="high"
        className="mx-auto aspect-square w-full object-contain"
      />
    </picture>
    <figcaption className="border-t border-line pt-3 text-xs text-muted">{name}</figcaption>
  </figure>
);

export default HeroVisual;
