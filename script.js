class SiteApp {
  componentDidMount() {
    this.setupReveals();
    this.setupCounters();
    this.waitForLibs();
    this.setupHeader();
    this.setupFAQ();
    this.setupHovers();
    this.setupHeroSlideshow();
    this.setupLottie();
    // hero failsafe if GSAP never loads
    setTimeout(() => {
      if (!window.gsap) document.querySelectorAll('.hero-eyebrow,.hero-title,.hero-sub,.hero-cta-wrap').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    }, 3500);
  }

  // Reveals via IntersectionObserver — fires on any scroll (incl. programmatic), no lib dependency
  setupReveals() {
    const items = document.querySelectorAll('.js-reveal');
    items.forEach(el => { el.style.transform = 'translateY(40px)'; el.style.transition = 'opacity .9s cubic-bezier(.2,.8,.2,1), transform .9s cubic-bezier(.2,.8,.2,1)'; });
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
    // absolute safety net
    setTimeout(() => items.forEach(el => { if (getComputedStyle(el).opacity === '0') { el.style.opacity = '1'; el.style.transform = 'none'; } }), 4000);
  }

  setupCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!('IntersectionObserver' in window)) { counters.forEach(el => el.textContent = el.getAttribute('data-count')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target; io.unobserve(el);
        const target = parseInt(el.getAttribute('data-count'), 10);
        const start = performance.now(), dur = 1500;
        const tick = (now) => { const p = Math.min(1, (now - start) / dur); const eased = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(eased * target); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => io.observe(el));
  }

  waitForLibs(tries = 0) {
    if (window.gsap && window.ScrollTrigger && window.Swiper) {
      this.initGSAP();
      this.initSwiper();
      this.initLenis();
    } else if (tries < 60) {
      setTimeout(() => this.waitForLibs(tries + 1), 100);
    }
  }

  initLenis() {
    try {
      if (!window.Lenis) return;
      const lenis = new window.Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      lenis.on('scroll', window.ScrollTrigger.update);
    } catch (e) {}
  }

  initGSAP() {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // Hero intro (independent of scroll)
    gsap.set(['.hero-eyebrow', '.hero-title', '.hero-sub', '.hero-cta-wrap'], { opacity: 0, y: 34 });
    gsap.timeline({ delay: .2 })
      .to('.hero-eyebrow', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' })
      .to('.hero-title', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=.5')
      .to('.hero-sub', { opacity: 1, y: 0, duration: .9, ease: 'power3.out' }, '-=.6')
      .to('.hero-cta-wrap', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' }, '-=.55');

    // Hero parallax (cosmetic)
    gsap.to('.hero-bg', { yPercent: 22, ease: 'none', scrollTrigger: { trigger: '.hero-bg', start: 'top top', end: 'bottom top', scrub: true } });

    // Gold thread draw between steps — wide screens only (cosmetic)
    const svg = document.querySelector('.thread-svg');
    const line = svg && svg.querySelector('line');
    if (line && window.innerWidth > 760) {
      svg.style.display = 'block';
      gsap.fromTo(line, { strokeDashoffset: 1000 }, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: svg, start: 'top 80%', end: 'bottom 60%', scrub: 1 }
      });
    }
  }

  initSwiper() {
    try {
      new window.Swiper('.depoimentos-swiper', {
        slidesPerView: 1, spaceBetween: 28, loop: true,
        speed: 650,
        autoplay: { delay: 5500, disableOnInteraction: false },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        pagination: { el: '.swiper-pagination', clickable: true },
        breakpoints: { 760: { slidesPerView: 2 } }
      });
    } catch (e) {}
  }

  setupHeader() {
    const header = document.querySelector('.site-header');
    const claro = document.querySelector('.logo-claro');
    const tinta = document.querySelector('.logo-tinta');
    if (!header) return;
    const onScroll = () => {
      const scrolled = window.scrollY > 60;
      if (scrolled) {
        header.style.background = 'rgba(245,241,234,.96)';
        header.style.boxShadow = '0 1px 0 rgba(20,24,28,.08), 0 8px 30px rgba(16,24,38,.06)';
        header.style.padding = '14px 6vw';
        if (claro) claro.style.opacity = '0';
        if (tinta) tinta.style.opacity = '1';
      } else {
        header.style.background = 'transparent';
        header.style.boxShadow = 'none';
        header.style.padding = '20px 6vw';
        if (claro) claro.style.opacity = '1';
        if (tinta) tinta.style.opacity = '0';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  setupLottie() {
    const el = document.getElementById('lottie-projeto');
    if (!el) return;
    const start = () => {
      if (!window.lottie) return setTimeout(start, 150);
      window.lottie.loadAnimation({ container: el, renderer: 'svg', loop: true, autoplay: true, path: 'assets/anim-projeto.json' });
    };
    start();
  }

  setupHeroSlideshow() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    ['assets/hero-jornada-01.png','assets/hero-jornada-02.png','assets/hero-jornada-03.png'].forEach(src => { const im = new Image(); im.src = src; });
    if (slides.length < 2) return;
    let i = 0;
    setInterval(() => {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 5000);
  }

  setupFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-q');
      const a = item.querySelector('.faq-a');
      const icon = item.querySelector('.faq-icon');
      if (!q || !a) return;
      q.addEventListener('click', () => {
        const open = a.style.maxHeight && a.style.maxHeight !== '0px';
        document.querySelectorAll('.faq-a').forEach(o => o.style.maxHeight = '0px');
        document.querySelectorAll('.faq-icon').forEach(o => { o.style.transform = 'rotate(0deg)'; });
        if (!open) {
          a.style.maxHeight = a.scrollHeight + 'px';
          if (icon) icon.style.transform = 'rotate(45deg)';
        }
      });
    });
  }

  setupHovers() {
    document.querySelectorAll('.cta').forEach(btn => {
      const arrow = btn.querySelector('.arrow');
      btn.addEventListener('mouseenter', () => { btn.style.background = '#d8bd85'; btn.style.transform = 'translateY(-2px)'; if (arrow) arrow.style.transform = 'translateX(6px)'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = '#C9A96A'; btn.style.transform = 'translateY(0)'; if (arrow) arrow.style.transform = 'translateX(0)'; });
    });
    document.querySelectorAll('.hover-zoom').forEach(box => {
      const img = box.querySelector('.zoom-target');
      if (!img) return;
      box.addEventListener('mouseenter', () => img.style.transform = 'scale(1.06)');
      box.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');
    });
    document.querySelectorAll('.card-lift').forEach(card => {
      card.addEventListener('mouseenter', () => { card.style.transform = 'translateY(-6px)'; card.style.boxShadow = '0 20px 50px rgba(16,24,38,.12)'; });
      card.addEventListener('mouseleave', () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = 'none'; });
    });
    const wa = document.querySelector('.wa-float');
    if (wa) {
      wa.addEventListener('mouseenter', () => wa.style.transform = 'scale(1.1)');
      wa.addEventListener('mouseleave', () => wa.style.transform = 'scale(1)');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => { new SiteApp().componentDidMount(); });
