import { useEffect, useRef } from 'react';

/**
 * EffectsLayer - global ambient effects:
 *  1. Cursor glow: a soft radial light that follows the pointer.
 *  2. 3D tilt: delegated mousemove on every .glass-card tilts it
 *     toward the cursor (transform = GPU only, no layout thrash).
 *
 * Mounted once at the app root so it covers peserta + admin layouts.
 * Respects prefers-reduced-motion and disables on touch devices.
 */
export default function EffectsLayer() {
  const glowRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    const glow = glowRef.current;
    if (!glow) return;

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;

    const moveGlow = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          glow.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
          raf = 0;
        });
      }
    };

    const onCardMove = (e) => {
      const card = e.currentTarget;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * 8;
      const ry = (px - 0.5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    };

    const onCardLeave = (e) => {
      e.currentTarget.style.transform = '';
    };

    const cards = () => document.querySelectorAll('.glass-card:not(.no-tilt)');

    const attach = () => cards().forEach((c) => {
      c.addEventListener('mousemove', onCardMove);
      c.addEventListener('mouseleave', onCardLeave);
    });
    const detach = () => cards().forEach((c) => {
      c.removeEventListener('mousemove', onCardMove);
      c.removeEventListener('mouseleave', onCardLeave);
    });

    window.addEventListener('mousemove', moveGlow, { passive: true });
    attach();

    const mo = new MutationObserver(() => { detach(); attach(); });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveGlow);
      detach();
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}