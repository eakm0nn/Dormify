import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import FadeContent from '../src/components/reactbits/FadeContent';

// A longer test fade makes StrictMode cleanup and motion preferences observable.
export async function checkFadeContent(reduced: boolean) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  let element: HTMLElement | null = null;
  try {
    flushSync(() => {
      root.render(
        <StrictMode>
          <FadeContent duration={5}>
            <button type="button">Motion test</button>
          </FadeContent>
        </StrictMode>,
      );
    });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    element = host.firstElementChild as HTMLElement;
    const opacity = Number(getComputedStyle(element).opacity);
    if (opacity <= 0 || (reduced && opacity !== 1)) {
      throw new Error('Fade hides content or ignores reduced motion');
    }
    if (gsap.isTweening(element) === reduced) {
      throw new Error(
        `Fade activity does not match the motion preference (reduced=${reduced}, opacity=${opacity})`,
      );
    }
    const button = element.querySelector('button');
    button?.focus({ preventScroll: true });
    if (document.activeElement !== button) throw new Error('Fade blocks keyboard focus');
  } finally {
    root.unmount();
    host.remove();
  }
  if (element && (gsap.isTweening(element) || element.style.opacity !== '')) {
    throw new Error('Unmount leaves an active animation or an inline opacity');
  }
  return true;
}

export function heroMotionSettled() {
  const elements = Array.from(document.querySelectorAll('.hero-copy, .home-brand'));
  return (
    elements.length === 2 &&
    elements.every(
      (element) => getComputedStyle(element).opacity === '1' && !gsap.isTweening(element),
    )
  );
}
