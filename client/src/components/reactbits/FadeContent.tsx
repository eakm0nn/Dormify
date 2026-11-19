// Adapted from React Bits FadeContent (David Haz):
// https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/FadeContent/FadeContent.tsx
// Mount-only fade; see LICENSE.md for the upstream terms.
import { useLayoutEffect, useRef, type HTMLAttributes } from 'react';
import { gsap } from 'gsap';

interface FadeContentProps extends HTMLAttributes<HTMLDivElement> {
  duration?: number;
  delay?: number;
}

const FadeContent = ({ duration = 0.32, delay = 0, children, ...props }: FadeContentProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        element,
        { opacity: 0.65 },
        {
          opacity: 1,
          duration,
          delay,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(element, { clearProps: 'opacity' });
          },
        },
      );
    });

    // Revert also cancels an in-flight fade when reduced motion is enabled.
    return () => media.revert();
  }, [duration, delay]);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
};

export default FadeContent;
