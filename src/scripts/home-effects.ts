const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

function bindHeroParallax() {
  const hero = document.getElementById('s0');
  const plate = hero?.querySelector<HTMLElement>('.h-bg-plate');
  const vignette = hero?.querySelector<HTMLElement>('.h-bg-vignette');
  if (!hero || !plate || !vignette) return;

  let ticking = false;

  const update = () => {
    const y = Math.max(0, -hero.getBoundingClientRect().top);
    document.documentElement.style.setProperty('--scroll-y', `${y}px`);
    plate.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    vignette.style.transform = `translate3d(0, ${y * 0.6}px, 0)`;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  plate.classList.add('is-parallax');
  vignette.classList.add('is-parallax');
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

function bindTaglineStagger() {
  const lines = document.querySelectorAll<HTMLElement>('.h-tagline--stagger');
  if (!lines.length) return;

  lines.forEach((line, i) => {
    line.querySelectorAll<HTMLElement>('.hw').forEach((w) => {
      w.style.setProperty('--line', String(i));
    });
  });

  requestAnimationFrame(() => {
    lines.forEach((line) => line.classList.add('is-in'));
  });
}

function bindHeroStats() {
  const stats = document.querySelector('.h-stats');
  if (!stats) return;

  const run = () => {
    stats.querySelectorAll<HTMLElement>('[data-stat]').forEach((el) => {
      if (el.dataset.statDone === '1') return;
      el.dataset.statDone = '1';

      const kind = el.dataset.stat;
      if (kind === 'type') {
        const full = el.dataset.value ?? '';
        if (reduced) {
          el.textContent = full;
          return;
        }
        el.textContent = '';
        let i = 0;
        const tick = () => {
          if (i < full.length) {
            el.textContent += full[i];
            i += 1;
            setTimeout(tick, 60);
          }
        };
        tick();
        return;
      }

      const target = Number(el.dataset.value ?? 0);
      const suffix = el.dataset.suffix ?? '';
      if (reduced) {
        el.textContent = `${target}${suffix}`;
        return;
      }

      const start = performance.now();
      const duration = 1200;

      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const val = Math.round(target * easeOutExpo(t));
        el.textContent = `${val}${suffix}`;
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  };

  if (reduced || typeof IntersectionObserver !== 'function') {
    run();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      run();
      io.disconnect();
    },
    { threshold: 0.35 },
  );
  io.observe(stats);
}

function initHome() {
  if (!document.getElementById('s0')) return;
  bindTaglineStagger();
  if (!reduced) {
    bindHeroParallax();
  }
  bindHeroStats();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHome);
} else {
  initHome();
}

export {};
