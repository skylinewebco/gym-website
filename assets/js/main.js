/* LEGACY — lightweight interactions. No heavy libraries, no scroll-scrubbing. */
(function () {
  'use strict';
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav__toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.style.overflow = open ? 'hidden' : '';
    });
    document.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () { body.classList.remove('menu-open'); body.style.overflow = ''; });
    });
  }

  /* ---------- Nav solid on scroll (transparent hero pages only) ---------- */
  var nav = document.querySelector('.nav');
  if (nav && !nav.classList.contains('nav--solid')) {
    var onScroll = function () { nav.classList.toggle('is-solid', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal, .reveal-x');
  if ('IntersectionObserver' in window && reveals.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Videos: eager (hero) loads now; others lazy near viewport ----------
     Never download two heavy clips at once; never stall the hero. */
  function safePlay(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  function loadVid(v) {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    var s = document.createElement('source');
    s.src = v.getAttribute('data-src'); s.type = 'video/mp4';
    v.appendChild(s);
    v.addEventListener('ended', function () { try { v.currentTime = 0; } catch (e) {} safePlay(v); });
    v.load(); safePlay(v);
  }
  document.querySelectorAll('video[data-src][data-eager]').forEach(loadVid);
  var lazyVids = document.querySelectorAll('video[data-src]:not([data-eager])');
  if ('IntersectionObserver' in window && lazyVids.length) {
    var lo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { loadVid(e.target); lo.unobserve(e.target); } });
    }, { rootMargin: '500px 0px' });
    lazyVids.forEach(function (v) { lo.observe(v); });
  } else { lazyVids.forEach(loadVid); }

  /* ---------- Pause offscreen videos (battery + smoothness) ---------- */
  var allVids = document.querySelectorAll('video[data-src]');
  if ('IntersectionObserver' in window && allVids.length) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (!v.dataset.loaded) return;
        if (e.isIntersecting) { if (v.paused) safePlay(v); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.12 });
    allVids.forEach(function (v) { vo.observe(v); });
  }

  /* ---------- Count-up stats ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = (target % 1 !== 0) ? 1 : 0;
    var dur = 1400, start = performance.now();
    function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || ''); });
  }

  /* ---------- Subtle parallax (desktop, non-touch, motion-ok only) ---------- */
  var canParallax = !reduce && window.matchMedia('(hover:hover) and (min-width:900px)').matches;
  if (canParallax) {
    var items = [].slice.call(document.querySelectorAll('[data-parallax]'));
    if (items.length) {
      var ticking = false;
      function update() {
        var vh = window.innerHeight;
        items.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
          var offset = ((r.top + r.height / 2) - vh / 2) * speed * -1;
          el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
        });
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      update();
    }
  }

  /* ---------- Contact form (front-end demo) ---------- */
  var form = document.querySelector('#join-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = document.querySelector('.form-success');
      form.reset();
      if (ok) { ok.classList.add('show'); ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }

  /* ---------- Footer year ---------- */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
