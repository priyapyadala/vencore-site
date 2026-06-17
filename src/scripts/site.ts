const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let revealObserver: IntersectionObserver | null = null;

function bindLoader() {
  const ldr = document.getElementById('ldr');
  if (!ldr) return;
  const hide = () => ldr.classList.add('out');
  if (reduced || window.matchMedia('(max-width: 1023px)').matches) {
    hide();
    return;
  }
  const seen = sessionStorage.getItem('vencore-seen');
  if (seen) { hide(); return; }
  sessionStorage.setItem('vencore-seen', '1');

  const heroImg = document.querySelector<HTMLImageElement>('.h-bg-plate__img, .pg-hero__photo');
  const finish = () => setTimeout(hide, 60);
  if (heroImg?.complete) finish();
  else if (heroImg) heroImg.addEventListener('load', finish, { once: true });
  else if (document.readyState === 'interactive' || document.readyState === 'complete') finish();
  else document.addEventListener('DOMContentLoaded', finish, { once: true });

  window.setTimeout(hide, 1200);
}

function bindHeroVideo() {
  const video = document.querySelector<HTMLVideoElement>('.h-bg-plate__video');
  if (!video || reduced || window.matchMedia('(max-width: 1023px)').matches) return;
  const markReady = () => video.setAttribute('data-ready', 'true');
  if (video.readyState >= 2) markReady();
  else {
    video.addEventListener('canplay', markReady, { once: true });
    video.addEventListener('error', () => video.remove(), { once: true });
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function trackEvent(name: string, params: Record<string, string> = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

function bindReveal(root: ParentNode = document) {
  const els = root.querySelectorAll('.rv:not(.on), .rv-l:not(.on), .rv-r:not(.on)');
  if (!els.length) return;
  if (reduced || typeof IntersectionObserver !== 'function') {
    els.forEach((el) => el.classList.add('on'));
    return;
  }
  const mobileReveal = window.matchMedia('(max-width: 1023px)').matches;
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((en, i) => {
          if (!en.isIntersecting) return;
          setTimeout(() => en.target.classList.add('on'), i * 40);
          revealObserver?.unobserve(en.target);
        });
      },
      {
        threshold: mobileReveal ? 0.08 : 0,
        rootMargin: mobileReveal ? '0px 0px -4% 0px' : '0px 0px -10% 0px',
      },
    );
  }
  els.forEach((el) => {
    if ((el as HTMLElement).dataset.rvBound === '1') return;
    (el as HTMLElement).dataset.rvBound = '1';
    revealObserver?.observe(el);
    setTimeout(() => {
      if (!el.classList.contains('on')) el.classList.add('on');
    }, mobileReveal ? 900 : 2000);
  });
}

function bindNav() {
  const ham = document.getElementById('ham');
  const links = document.getElementById('navlinks');
  const backdrop = document.getElementById('navbackdrop');
  const nav = document.getElementById('nav');
  if (!ham || !links) return;

  const close = () => {
    ham.setAttribute('aria-expanded', 'false');
    ham.setAttribute('aria-label', 'Open menu');
    ham.classList.remove('open');
    links.classList.remove('open');
    backdrop?.setAttribute('hidden', '');
    document.body.classList.remove('nav-open');
  };

  const open = () => {
    ham.setAttribute('aria-expanded', 'true');
    ham.setAttribute('aria-label', 'Close menu');
    ham.classList.add('open');
    links.classList.add('open');
    backdrop?.removeAttribute('hidden');
    document.body.classList.add('nav-open');
    const first = links.querySelector<HTMLElement>('a, summary, button');
    first?.focus();
  };

  const mobileNav = window.matchMedia('(max-width: 1279px)');

  const focusablesInMenu = () =>
    Array.from(
      links.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.closest('[hidden]'));

  const trapMenuFocus = (e: KeyboardEvent) => {
    if (!links.classList.contains('open') || !mobileNav.matches || e.key !== 'Tab') return;
    const items = focusablesInMenu();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  links.addEventListener('keydown', trapMenuFocus);

  ham.addEventListener('click', () => {
    if (links.classList.contains('open')) close();
    else open();
  });
  backdrop?.addEventListener('click', close);
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      close();
      ham.focus();
    }
  });

  if (nav) {
    const onScroll = () => nav.classList.toggle('nav-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const page = document.body.getAttribute('data-page');
  if (page) {
    document.querySelectorAll('[data-nav]').forEach((el) => {
      const key = el.getAttribute('data-nav');
      el.classList.toggle('active', key === page || (key === 'services' && page === 'services'));
    });
  }
}

function bindProjectFilter() {
  const btns = document.querySelectorAll('.proj-filter-btn');
  const items = document.querySelectorAll('[data-project-category]');
  const countEl = document.getElementById('proj-filter-count');
  const emptyEl = document.getElementById('proj-filter-empty');
  if (!btns.length || !items.length) return;

  const apply = (filter: string) => {
    let visible = 0;
    items.forEach((item) => {
      const cat = item.getAttribute('data-project-category');
      const show = filter === 'all' || cat === filter;
      (item as HTMLElement).style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    if (countEl) {
      countEl.textContent = filter === 'all'
        ? `Showing all ${items.length} projects`
        : `Showing ${visible} project${visible === 1 ? '' : 's'}`;
    }
    if (emptyEl) emptyEl.hidden = visible > 0;
  };

  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter') ?? 'all';
      btns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      apply(filter);
    });
  });

  apply('all');
}

type LightboxItem = { src: string; alt: string };

function bindLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const img = lightbox.querySelector<HTMLImageElement>('.lightbox-img');
  const caption = lightbox.querySelector<HTMLElement>('.lightbox-caption');
  const counter = lightbox.querySelector<HTMLElement>('.lightbox-counter');
  const prev = lightbox.querySelector<HTMLButtonElement>('.lightbox-prev');
  const next = lightbox.querySelector<HTMLButtonElement>('.lightbox-next');
  const closeEls = lightbox.querySelectorAll<HTMLElement>('[data-lightbox-close]');

  let items: LightboxItem[] = [];
  let index = 0;
  let lastFocus: HTMLElement | null = null;
  let touchStartX = 0;

  const render = () => {
    const item = items[index];
    if (!img || !item) return;
    lightbox.classList.remove('is-ready');
    img.src = item.src;
    img.alt = item.alt;
    if (caption) caption.textContent = item.alt;
    if (counter) counter.textContent = `${index + 1} / ${items.length}`;
    if (prev) prev.disabled = items.length <= 1;
    if (next) next.disabled = items.length <= 1;
    const onLoad = () => {
      lightbox.classList.add('is-ready');
      img.removeEventListener('load', onLoad);
    };
    if (img.complete) lightbox.classList.add('is-ready');
    else img.addEventListener('load', onLoad);
  };

  const open = (groupItems: LightboxItem[], startIndex: number, trigger: HTMLElement) => {
    items = groupItems;
    index = startIndex;
    lastFocus = trigger;
    render();
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightbox.querySelector<HTMLButtonElement>('.lightbox-close')?.focus();
  };

  const close = () => {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.classList.remove('is-ready');
    document.body.classList.remove('lightbox-open');
    if (img) img.removeAttribute('src');
    lastFocus?.focus();
    lastFocus = null;
  };

  const step = (delta: number) => {
    if (items.length <= 1) return;
    index = (index + delta + items.length) % items.length;
    render();
  };

  document.querySelectorAll<HTMLElement>('[data-lightbox-group]').forEach((groupEl) => {
    const triggers = groupEl.querySelectorAll<HTMLElement>('[data-lightbox-src]');
    const groupItems = Array.from(triggers).map((t) => ({
      src: t.getAttribute('data-lightbox-src') ?? '',
      alt: t.getAttribute('data-lightbox-alt') ?? '',
    }));

    triggers.forEach((trigger, i) => {
      trigger.addEventListener('click', () => open(groupItems, i, trigger));
    });
  });

  prev?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));
  closeEls.forEach((el) => el.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  lightbox.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0]?.clientX ?? 0;
    },
    { passive: true },
  );

  lightbox.addEventListener(
    'touchend',
    (e) => {
      const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX;
      if (Math.abs(delta) < 48) return;
      step(delta > 0 ? -1 : 1);
    },
    { passive: true },
  );
}

function bindSvcRowTouch() {
  if (!window.matchMedia('(hover: none)').matches) return;
  // Enables :active on iOS Safari for link elements
  document.addEventListener('touchstart', () => {}, { passive: true });

  document.querySelectorAll<HTMLElement>('.svc-row').forEach((row) => {
    const press = () => row.classList.add('is-pressed');
    const release = () => row.classList.remove('is-pressed');

    row.addEventListener('touchstart', press, { passive: true });
    row.addEventListener('touchend', release, { passive: true });
    row.addEventListener('touchcancel', release, { passive: true });
    row.addEventListener('blur', release);
    row.addEventListener(
      'touchmove',
      (e) => {
        const touch = e.touches[0];
        if (!touch) return;
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && !row.contains(target)) release();
      },
      { passive: true },
    );
  });
}

function bindMarquee() {
  const mq = document.querySelector('.mq-t');
  if (!mq || (mq as HTMLElement).dataset.mqTripled === '1') return;
  const original = mq.innerHTML;
  mq.innerHTML = original + original + original;
  (mq as HTMLElement).dataset.mqTripled = '1';
}

function bindScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar || reduced) return;

  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const scale = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${scale})`;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

function bindMagneticCursor() {
  const dot = document.getElementById('cursor-dot');
  if (!dot || reduced) return;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx;
  let cy = my;
  let raf = 0;

  const lerp = 0.12;
  const targets = new Set<Element>();

  const tick = () => {
    cx += (mx - cx) * lerp;
    cy += (my - cy) * lerp;
    dot.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%) scale(${targets.size ? 1.6 : 1})`;
    raf = requestAnimationFrame(tick);
  };

  const onMove = (e: MouseEvent) => {
    mx = e.clientX;
    my = e.clientY;
    if (!dot.classList.contains('is-active')) {
      dot.classList.add('is-active');
      dot.style.willChange = 'transform';
      if (!raf) raf = requestAnimationFrame(tick);
    }
  };

  const onLeave = () => {
    dot.classList.remove('is-active', 'is-hover');
    targets.clear();
    cancelAnimationFrame(raf);
    raf = 0;
    dot.style.willChange = '';
  };

  document.querySelectorAll('.btn-solid, .pc2, .insight-editorial__item, .svc-row').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      targets.add(el);
      dot.classList.add('is-hover');
    });
    el.addEventListener('mouseleave', () => {
      targets.delete(el);
      if (!targets.size) dot.classList.remove('is-hover');
    });
  });

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', onLeave);
}

function bindConversionTracking() {
  document.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"], a[href*="whatsapp"]').forEach((el) => {
    el.addEventListener('click', () => trackEvent('whatsapp_click', { link_url: el.href }));
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]').forEach((el) => {
    el.addEventListener('click', () => trackEvent('phone_click', { link_url: el.href }));
  });
  document.querySelectorAll<HTMLAnchorElement>('[data-analytics="whatsapp_click"]').forEach((el) => {
    el.addEventListener('click', () => trackEvent('whatsapp_click', { link_url: el.href }));
  });
  document.querySelectorAll<HTMLAnchorElement>('[data-analytics="enquire_click"]').forEach((el) => {
    el.addEventListener('click', () => trackEvent('enquire_click', { link_url: el.href }));
  });
}

function init() {
  document.documentElement.classList.remove('no-js');
  bindLoader();
  bindNav();
  bindReveal();
  bindSvcRowTouch();
  bindProjectFilter();
  bindLightbox();
  bindMarquee();
  bindConversionTracking();
  bindHeroVideo();
  if (!reduced) {
    bindScrollProgress();
    bindMagneticCursor();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
