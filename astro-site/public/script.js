(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // External http(s) links: always open in a new tab (same-site / relative / # / mailto / tel unchanged)
  (function normalizeExternalLinks() {
    var originHost = window.location.hostname;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || !href.trim()) return;
      var trimmed = href.trim();
      if (trimmed.charAt(0) === '#' || trimmed.charAt(0) === '?') return;
      if (trimmed.indexOf('/') === 0 && trimmed.indexOf('//') !== 0) return;
      if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return;
      if (/^javascript:/i.test(trimmed)) return;
      var url;
      try {
        url = new URL(trimmed, window.location.href);
      } catch (e) {
        return;
      }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.hostname === originHost) return;
      a.setAttribute('target', '_blank');
      var rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      if (rel.indexOf('noopener') === -1) rel.push('noopener');
      if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
      a.setAttribute('rel', rel.join(' '));
    });
  })();

  // Smooth anchor scroll with sticky-header offset
  function getHeaderOffset() {
    var header = document.querySelector('.header');
    return header ? header.offsetHeight : 0;
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      var targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') {
        return;
      }

      var targetEl = document.querySelector(targetId);
      if (!targetEl) {
        return;
      }

      event.preventDefault();
      var offset = getHeaderOffset() + 8;
      var targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  // Section/card entry animations — homepage only (body.home-reveal-animate)
  /* Exclude .hero: applying reveal classes after first paint can trigger CLS on above-the-fold text.
     Exclude .stats-thin and .unique-points: transform-based reveal causes 1px white hairlines between full-bleed sections.
     Exclude .projects-gallery-section: it contains position:fixed lightbox; any ancestor transform breaks fixed positioning. */
  var revealTargets = [];
  if (document.body && document.body.classList.contains('home-reveal-animate')) {
    revealTargets = Array.prototype.slice.call(
      document.querySelectorAll(
        'main > section:not(.hero, .stats-thin, .unique-points, .projects-gallery-section), footer > section, .service-card, .result-item, .testimonial, .team-card, .faq-item'
      )
    );
  }

  if (revealTargets.length) {
    revealTargets.forEach(function (el, index) {
      el.classList.add('reveal-on-scroll');
      el.style.transitionDelay = Math.min((index % 8) * 60, 300) + 'ms';
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach(function (el) {
        el.classList.add('is-visible');
        el.style.transitionDelay = '0ms';
      });
    } else {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      revealTargets.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  var mobileBreakpoint = window.matchMedia('(max-width: 1120px)');

  if (navToggle && nav) {
    navToggle.setAttribute('aria-expanded', 'false');

    function closeMobileNav() {
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-label', 'Open Menu');
      navToggle.setAttribute('aria-expanded', 'false');
      nav.querySelectorAll('[data-nav-dropdown]').forEach(function (dd) {
        dd.classList.remove('is-open');
        var t = dd.querySelector('.nav-dropdown-toggle');
        if (t) {
          t.setAttribute('aria-expanded', 'false');
        }
      });
    }

    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      var isOpen = nav.classList.contains('is-open');
      navToggle.setAttribute('aria-label', isOpen ? 'Close Menu' : 'Open Menu');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Mobile: tap Services / About to expand submenus (desktop uses hover)
    nav.querySelectorAll('[data-nav-dropdown]').forEach(function (dropdown) {
      var toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', function (e) {
        if (!mobileBreakpoint.matches) {
          return;
        }
        e.stopPropagation();
        var opening = !dropdown.classList.contains('is-open');
        nav.querySelectorAll('[data-nav-dropdown]').forEach(function (other) {
          if (other !== dropdown) {
            other.classList.remove('is-open');
            var ot = other.querySelector('.nav-dropdown-toggle');
            if (ot) ot.setAttribute('aria-expanded', 'false');
          }
        });
        dropdown.classList.toggle('is-open', opening);
        toggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
      });
    });

    // Close nav when a link is clicked (for anchor links)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileNav();
      });
    });

    // Close mobile nav when switching to desktop layout
    function handleViewportChange() {
      if (!mobileBreakpoint.matches) {
        closeMobileNav();
      }
    }

    if (mobileBreakpoint.addEventListener) {
      mobileBreakpoint.addEventListener('change', handleViewportChange);
    } else if (mobileBreakpoint.addListener) {
      mobileBreakpoint.addListener(handleViewportChange);
    }

    // Escape key closes the open mobile nav
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMobileNav();
      }
    });
  }

  // Projects carousel controls
  var projectsCarousel = document.getElementById('projects-carousel');
  var prevBtn = document.getElementById('projects-prev');
  var nextBtn = document.getElementById('projects-next');

  if (projectsCarousel && prevBtn && nextBtn) {
    var slides = Array.prototype.slice.call(projectsCarousel.querySelectorAll('.project-slide'));
    var activeIndex = 0;
    var dragStartX = null;
    var dragDeltaX = 0;
    var didDrag = false;
    var suppressNextClick = false;

    function applySliderState() {
      slides.forEach(function (slide) {
        slide.classList.remove('project-prev', 'project-active', 'project-next');
      });

      var prevIndex = (activeIndex - 1 + slides.length) % slides.length;
      var nextIndex = (activeIndex + 1) % slides.length;

      slides[prevIndex].classList.add('project-prev');
      slides[activeIndex].classList.add('project-active');
      slides[nextIndex].classList.add('project-next');
    }

    prevBtn.addEventListener('click', function () {
      activeIndex = (activeIndex - 1 + slides.length) % slides.length;
      applySliderState();
    });

    nextBtn.addEventListener('click', function () {
      activeIndex = (activeIndex + 1) % slides.length;
      applySliderState();
    });

    projectsCarousel.addEventListener('click', function (event) {
      if (suppressNextClick) {
        suppressNextClick = false;
        return;
      }

      var clickedSlide = event.target.closest('.project-slide');
      if (clickedSlide && clickedSlide.classList.contains('project-prev')) {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        applySliderState();
        return;
      }

      if (clickedSlide && clickedSlide.classList.contains('project-next')) {
        activeIndex = (activeIndex + 1) % slides.length;
        applySliderState();
        return;
      }

      // Fallback: click left/right side of carousel to move
      var rect = projectsCarousel.getBoundingClientRect();
      var clickX = event.clientX - rect.left;
      var centerX = rect.width / 2;
      var deadZone = rect.width * 0.18;

      if (clickX < centerX - deadZone) {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        applySliderState();
      } else if (clickX > centerX + deadZone) {
        activeIndex = (activeIndex + 1) % slides.length;
        applySliderState();
      }
    });

    function handleDragStart(clientX) {
      dragStartX = clientX;
      dragDeltaX = 0;
      didDrag = false;
    }

    function handleDragMove(clientX) {
      if (dragStartX === null) {
        return;
      }
      dragDeltaX = clientX - dragStartX;
      if (Math.abs(dragDeltaX) > 30) {
        didDrag = true;
      }
    }

    function handleDragEnd() {
      if (dragStartX === null) {
        return;
      }

      var swipeThreshold = 45;
      if (dragDeltaX <= -swipeThreshold) {
        activeIndex = (activeIndex + 1) % slides.length;
        applySliderState();
        suppressNextClick = true;
      } else if (dragDeltaX >= swipeThreshold) {
        activeIndex = (activeIndex - 1 + slides.length) % slides.length;
        applySliderState();
        suppressNextClick = true;
      }

      dragStartX = null;
      dragDeltaX = 0;
      setTimeout(function () {
        didDrag = false;
      }, 0);
    }

    projectsCarousel.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('dragstart', function (event) {
        event.preventDefault();
      });
    });

    projectsCarousel.addEventListener('pointerdown', function (event) {
      handleDragStart(event.clientX);
      if (projectsCarousel.setPointerCapture) {
        projectsCarousel.setPointerCapture(event.pointerId);
      }
    });

    projectsCarousel.addEventListener('pointermove', function (event) {
      handleDragMove(event.clientX);
    });

    projectsCarousel.addEventListener('pointerup', function () {
      handleDragEnd();
    });

    projectsCarousel.addEventListener('pointercancel', function () {
      handleDragEnd();
    });

    applySliderState();
  }

  // FAQ accordion — JS max-height animation (reliable every toggle; native <details> fights CSS height)
  var faqRoot = document.querySelector('[data-faq-accordion]');
  if (faqRoot) {
    var faqItems = Array.prototype.slice.call(faqRoot.querySelectorAll('.faq-item'));

    function faqOuter(item) {
      return item.querySelector('.faq-answer-outer');
    }
    function faqInner(item) {
      return item.querySelector('.faq-answer');
    }
    function faqBtn(item) {
      return item.querySelector('.faq-summary');
    }

    function faqOpen(item) {
      var outer = faqOuter(item);
      var inner = faqInner(item);
      var btn = faqBtn(item);
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      outer.setAttribute('aria-hidden', 'false');

      if (prefersReducedMotion) {
        outer.style.maxHeight = 'none';
        return;
      }

      outer.style.maxHeight = '0px';
      requestAnimationFrame(function () {
        outer.style.maxHeight = inner.scrollHeight + 'px';
      });

      outer.addEventListener(
        'transitionend',
        function faqOpenEnd(e) {
          if (e.propertyName !== 'max-height') return;
          if (!item.classList.contains('is-open')) return;
          outer.style.maxHeight = 'none';
          outer.removeEventListener('transitionend', faqOpenEnd);
        },
        { once: true }
      );
    }

    function faqClose(item) {
      var outer = faqOuter(item);
      var inner = faqInner(item);
      var btn = faqBtn(item);

      if (!item.classList.contains('is-open')) {
        outer.style.maxHeight = '0px';
        return;
      }

      if (prefersReducedMotion) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        outer.setAttribute('aria-hidden', 'true');
        outer.style.maxHeight = '0px';
        return;
      }

      var h = inner.scrollHeight;
      outer.style.maxHeight = h + 'px';
      requestAnimationFrame(function () {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        outer.setAttribute('aria-hidden', 'true');
        outer.style.maxHeight = '0px';
      });
    }

    faqItems.forEach(function (item) {
      faqOuter(item).style.maxHeight = '0px';
    });

    faqItems.forEach(function (item) {
      faqBtn(item).addEventListener('click', function () {
        if (item.classList.contains('is-open')) {
          faqClose(item);
          return;
        }
        faqItems.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            faqClose(other);
          }
        });
        faqOpen(item);
      });
    });

    var faqResizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(faqResizeTimer);
      faqResizeTimer = setTimeout(function () {
        faqItems.forEach(function (item) {
          if (!item.classList.contains('is-open')) return;
          var outer = faqOuter(item);
          var inner = faqInner(item);
          if (outer.style.maxHeight === 'none') {
            outer.style.maxHeight = inner.scrollHeight + 'px';
            requestAnimationFrame(function () {
              outer.style.maxHeight = 'none';
            });
          }
        });
      }, 150);
    });
  }

  // Hero typed service text: phrases from #homepage-typed-phrases (Sanity → Astro JSON)
  var typedEl = document.getElementById('hero-typed-text');
  var phrases = [];
  var typedCfg = document.getElementById('homepage-typed-phrases');
  var typedFallback =
    typedCfg && typedCfg.getAttribute('data-fallback-phrase')
      ? String(typedCfg.getAttribute('data-fallback-phrase')).trim()
      : '';
  if (typedCfg && typedCfg.textContent) {
    try {
      var parsedPhrases = JSON.parse(typedCfg.textContent);
      if (Array.isArray(parsedPhrases) && parsedPhrases.length) {
        phrases = parsedPhrases;
      }
    } catch (e) { /* ignore invalid JSON */ }
  }
  if (typedEl && !prefersReducedMotion && phrases.length) {
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;

    function runTypeCycle() {
      var currentPhrase = phrases[phraseIndex];

      if (!isDeleting) {
        charIndex += 1;
        typedEl.textContent = currentPhrase.slice(0, charIndex);
        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          setTimeout(runTypeCycle, 900);
          return;
        }
      } else {
        charIndex -= 1;
        typedEl.textContent = currentPhrase.slice(0, Math.max(0, charIndex));
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(runTypeCycle, 220);
          return;
        }
      }

      setTimeout(runTypeCycle, isDeleting ? 40 : 85);
    }

    runTypeCycle();
  } else if (typedEl) {
    typedEl.textContent = phrases[0] || typedFallback || '';
  }

  /** Lead-form phone only (not sitewide NAP): US 10-digit / +1 → NNN-NNN-NNNN. */
  function formatUsPhoneDashes(value) {
    var d = String(value || '').replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') {
      d = d.slice(1);
    }
    if (d.length === 10) {
      return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    }
    return String(value || '').trim();
  }

  /** As user types / pastes: US digits only, max 10 → NNN-NNN-NNNN (partial while typing). */
  function formatPhoneInputLive(el) {
    var d = el.value.replace(/\D/g, '');
    if (d.length >= 11 && d.charAt(0) === '1') {
      d = d.slice(1);
    }
    d = d.slice(0, 10);
    var out = '';
    if (d.length <= 3) {
      out = d;
    } else if (d.length <= 6) {
      out = d.slice(0, 3) + '-' + d.slice(3);
    } else {
      out = d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    }
    el.value = out;
  }

  // Lead forms → POST /api/lead (Zapier on server)
  var formsCfgEl = document.getElementById('site-forms-config');

  function readFormsConfig() {
    var defaults = { submitPath: '/api/lead', recaptchaSiteKey: '', mapboxToken: '' };
    if (!formsCfgEl || !formsCfgEl.textContent) {
      return defaults;
    }
    try {
      var parsed = JSON.parse(formsCfgEl.textContent);
      if (parsed && typeof parsed === 'object') {
        return {
          submitPath: typeof parsed.submitPath === 'string' && parsed.submitPath ? parsed.submitPath : defaults.submitPath,
          recaptchaSiteKey: typeof parsed.recaptchaSiteKey === 'string' ? parsed.recaptchaSiteKey : '',
          mapboxToken: typeof parsed.mapboxToken === 'string' ? parsed.mapboxToken : ''
        };
      }
    } catch (e) {
      /* keep defaults */
    }
    return defaults;
  }

  function setStatus(form, message, kind) {
    var el = form.querySelector('[data-lead-form-status]');
    if (!el) return;
    el.textContent = message || '';
    el.classList.remove('is-error', 'is-success');
    if (kind === 'error') el.classList.add('is-error');
    if (kind === 'success') el.classList.add('is-success');
  }

  function parseDocumentCookies() {
    var out = {};
    var raw = String(document.cookie || '');
    if (!raw) return out;
    raw.split(';').forEach(function (part) {
      var seg = String(part || '').trim();
      if (!seg) return;
      var eq = seg.indexOf('=');
      if (eq <= 0) return;
      var key = decodeURIComponent(seg.slice(0, eq).trim());
      var val = decodeURIComponent(seg.slice(eq + 1).trim());
      out[key] = val;
    });
    return out;
  }

  function setCookie(name, value, days) {
    if (!name) return;
    var maxAge = Math.max(0, Math.floor(Number(days || 90) * 24 * 60 * 60));
    document.cookie =
      encodeURIComponent(name) +
      '=' +
      encodeURIComponent(String(value || '')) +
      '; path=/; max-age=' +
      String(maxAge) +
      '; samesite=lax';
  }

  function getCookie(name) {
    var all = parseDocumentCookies();
    return all[name] || '';
  }

  /** First page in a 90d window: full URL, referrer at that moment, ISO time — first-party signal for Zapier/CRM. */
  function persistFirstTouchIfNeeded() {
    var existing = getCookie('mhg_first_landing_url').trim();
    if (existing) return;
    var href = typeof window.location.href === 'string' ? window.location.href : '';
    if (!href) return;
    setCookie('mhg_first_landing_url', href.slice(0, 2000), 90);
    var ref = typeof document.referrer === 'string' ? document.referrer : '';
    setCookie('mhg_first_referrer', ref.slice(0, 2000), 90);
    setCookie('mhg_first_landing_at', new Date().toISOString(), 90);
  }

  function getPersistedFirstTouch() {
    return {
      firstLandingUrl: getCookie('mhg_first_landing_url').trim().slice(0, 2000),
      firstReferrer: getCookie('mhg_first_referrer').trim().slice(0, 2000),
      firstLandingAt: getCookie('mhg_first_landing_at').trim().slice(0, 40)
    };
  }

  /**
   * Fallback when attribution.js is unavailable: persist UTMs + click IDs in mhg_* cookies (90d).
   * Prefer MhgAttribution when present — it owns first_page/referrer + click-ID replacement rules.
   */
  function getPersistedUtmParams() {
    var keys = [
      'gclid',
      'gbraid',
      'wbraid',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_id',
      'utm_content',
      'utm_term'
    ];
    var qs = new URLSearchParams(window.location.search || '');
    var persisted = {
      gclid: '',
      gbraid: '',
      wbraid: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_id: '',
      utm_content: '',
      utm_term: ''
    };

    keys.forEach(function (key) {
      var maxLen = key === 'gclid' || key === 'gbraid' || key === 'wbraid' ? 500 : 200;
      var fromQuery = (qs.get(key) || '').trim();
      if (fromQuery) {
        persisted[key] = fromQuery.slice(0, maxLen);
        setCookie('mhg_' + key, persisted[key], 90);
        return;
      }
      var fromCookie = getCookie('mhg_' + key).trim();
      if (fromCookie) {
        persisted[key] = fromCookie.slice(0, maxLen);
      }
    });

    return persisted;
  }

  /** Write attribution (click IDs + UTMs + first_page/referrer) into hidden fields on lead forms. */
  function applyUtmHiddenToForm(form, utm) {
    if (!form) return;
    if (window.MhgAttribution && typeof window.MhgAttribution.applyToForm === 'function') {
      window.MhgAttribution.applyToForm(form);
      return;
    }
    utm = utm || getPersistedUtmParams();
    var keys = [
      'gclid',
      'gbraid',
      'wbraid',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_id',
      'utm_content',
      'utm_term',
      'first_page',
      'referrer',
    ];
    keys.forEach(function (key) {
      var el = form.querySelector('input[type="hidden"][name="' + key + '"]');
      if (!el) {
        el = document.createElement('input');
        el.type = 'hidden';
        el.name = key;
        form.appendChild(el);
      }
      var val = utm[key] || '';
      if (!val && (key === 'first_page' || key === 'referrer')) {
        var ft = getPersistedFirstTouch();
        if (key === 'first_page') val = ft.firstLandingUrl || '';
        if (key === 'referrer') val = ft.firstReferrer || '';
      }
      el.value = String(val || '').slice(0, key === 'first_page' || key === 'referrer' ? 2000 : 500);
    });
  }

  function syncUtmToAllLeadForms() {
    if (window.MhgAttribution && typeof window.MhgAttribution.applyToAllLeadForms === 'function') {
      window.MhgAttribution.captureFromUrl();
      window.MhgAttribution.applyToAllLeadForms();
      return;
    }
    var utm = getPersistedUtmParams();
    var forms = document.querySelectorAll('form[data-lead-form]');
    for (var i = 0; i < forms.length; i++) {
      applyUtmHiddenToForm(forms[i], utm);
    }
  }

  syncUtmToAllLeadForms();
  persistFirstTouchIfNeeded();

  function attachUsAddressLookup(form, mapboxToken) {
    if (!mapboxToken) return;
    var addressInput = form.querySelector('input[name="address"], input[name="location"]');
    if (!addressInput) return;
    if (addressInput.getAttribute('data-mhg-address-lookup') === '1') return;
    addressInput.setAttribute('data-mhg-address-lookup', '1');

    var fieldWrap =
      addressInput.closest('.hero-form-field, .contact-form-field') ||
      addressInput.parentElement ||
      form;
    fieldWrap.classList.add('address-autocomplete-wrap');

    if (!addressInput.id) {
      addressInput.id = 'addr-' + Math.random().toString(36).slice(2, 9);
    }

    var menu = document.createElement('div');
    menu.className = 'address-suggest-menu';
    menu.setAttribute('role', 'listbox');
    menu.id = addressInput.id + '-menu';
    menu.hidden = true;
    fieldWrap.appendChild(menu);

    addressInput.setAttribute('autocomplete', 'off');
    addressInput.setAttribute('aria-autocomplete', 'list');
    addressInput.setAttribute('aria-controls', menu.id);
    addressInput.setAttribute('aria-expanded', 'false');

    var pendingController = null;
    var debounceTimer = null;
    var suggestions = [];
    var activeIndex = -1;

    function closeMenu() {
      menu.hidden = true;
      menu.style.maxHeight = '';
      addressInput.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    }

    // One listener per form (not document): avoid N duplicate global handlers when multiple forms exist.
    form.addEventListener(
      'pointerdown',
      function (e) {
        var t = e.target;
        if (!t) return;
        if (fieldWrap.contains(t)) return;
        closeMenu();
      },
      true
    );

    function openMenu() {
      if (!suggestions.length) return closeMenu();
      menu.hidden = false;
      addressInput.setAttribute('aria-expanded', 'true');
      menu.style.maxHeight = '';
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        window.requestAnimationFrame(function () {
          if (menu.hidden) return;
          var rM = menu.getBoundingClientRect();
          var rB = submitBtn.getBoundingClientRect();
          var gap = Math.floor(rB.top - rM.top - 8);
          if (gap > 40 && gap < 400) {
            menu.style.maxHeight = gap + 'px';
          }
        });
      }
    }

    function applySelection(value) {
      addressInput.value = value || '';
      closeMenu();
    }

    function renderMenu() {
      menu.innerHTML = '';
      if (!suggestions.length) {
        closeMenu();
        return;
      }

      suggestions.forEach(function (value, idx) {
        var item = document.createElement('button');
        item.type = 'button';
        item.className = 'address-suggest-item';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');
        if (idx === activeIndex) item.classList.add('is-active');
        item.textContent = value;
        item.addEventListener('mousedown', function (e) {
          e.preventDefault();
        });
        item.addEventListener('click', function () {
          applySelection(value);
        });
        menu.appendChild(item);
      });

      openMenu();
    }

    function setSuggestions(values) {
      suggestions = Array.isArray(values) ? values.slice(0, 6) : [];
      activeIndex = -1;
      renderMenu();
    }

    addressInput.addEventListener('keydown', function (event) {
      if (menu.hidden || !suggestions.length) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
        renderMenu();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        renderMenu();
        return;
      }

      if (event.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          event.preventDefault();
          applySelection(suggestions[activeIndex]);
        }
        return;
      }

      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    addressInput.addEventListener('blur', function () {
      window.setTimeout(closeMenu, 120);
    });

    addressInput.addEventListener('focus', function () {
      if (suggestions.length) openMenu();
    });

    addressInput.addEventListener('input', function () {
      var query = addressInput.value.trim();
      if (query.length < 3) {
        setSuggestions([]);
        if (pendingController) pendingController.abort();
        return;
      }

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(function () {
        if (pendingController) pendingController.abort();
        pendingController = new AbortController();

        var params = new URLSearchParams({
          q: query,
          country: 'US',
          types: 'address',
          limit: '6',
          autocomplete: 'true',
          access_token: mapboxToken
        });

        fetch('https://api.mapbox.com/search/geocode/v6/forward?' + params.toString(), {
          signal: pendingController.signal
        })
          .then(function (res) {
            if (!res.ok) throw new Error('mapbox_lookup_failed');
            return res.json();
          })
          .then(function (data) {
            var features = Array.isArray(data && data.features) ? data.features : [];
            var options = features
              .map(function (f) {
                var p = f && f.properties ? f.properties : {};
                var label = p.full_address || p.place_formatted || p.name_preferred || p.name || '';
                return label ? String(label).trim() : '';
              })
              .filter(Boolean);
            setSuggestions(options);
          })
          .catch(function (err) {
            if (err && err.name === 'AbortError') return;
            setSuggestions([]);
          });
      }, 180);
    });
  }

  function loadRecaptchaApi(siteKey) {
    if (!siteKey) return Promise.resolve();
    if (window.grecaptcha && typeof window.grecaptcha.execute === 'function') return Promise.resolve();
    if (window.__mhgRecaptchaPromise) return window.__mhgRecaptchaPromise;
    window.__mhgRecaptchaPromise = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-recaptcha-api="true"]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(); }, { once: true });
        existing.addEventListener('error', function () { reject(new Error('recaptcha_load_failed')); }, { once: true });
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(siteKey);
      script.async = true;
      script.defer = true;
      script.setAttribute('data-recaptcha-api', 'true');
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('recaptcha_load_failed')); };
      document.head.appendChild(script);
    });
    return window.__mhgRecaptchaPromise;
  }

  function bindLeadForms() {
    var leadFormsNow = Array.prototype.slice.call(document.querySelectorAll('form[data-lead-form]'));
    if (!leadFormsNow.length) return;

    var cfg = readFormsConfig();
    var endpoint = cfg.submitPath.indexOf('/') === 0 ? cfg.submitPath : '/' + cfg.submitPath;
    var recaptchaSiteKey = cfg.recaptchaSiteKey || '';
    var mapboxToken = cfg.mapboxToken || '';

    leadFormsNow.forEach(function (form) {
      if (form.getAttribute('data-mhg-lead-bound') === '1') return;
      form.setAttribute('data-mhg-lead-bound', '1');

      attachUsAddressLookup(form, mapboxToken);
      var phoneInput = form.querySelector('input[name="phone"]');
      if (phoneInput) {
        phoneInput.setAttribute('maxlength', '12');
        phoneInput.setAttribute('autocomplete', 'tel');
        phoneInput.addEventListener('input', function () {
          formatPhoneInputLive(phoneInput);
        });
        phoneInput.addEventListener('blur', function () {
          formatPhoneInputLive(phoneInput);
        });
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Normalize phone before native validity checks (autofill/paste may skip input events).
        var submitPhoneInput = form.querySelector('input[name="phone"]');
        if (submitPhoneInput) {
          formatPhoneInputLive(submitPhoneInput);
        }
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.classList.add('is-busy');

        setStatus(form, 'Sending…', null);

        getPersistedUtmParams();
        if (window.MhgAttribution && typeof window.MhgAttribution.captureFromUrl === 'function') {
          window.MhgAttribution.captureFromUrl();
        }
        applyUtmHiddenToForm(form);
        persistFirstTouchIfNeeded();
        var firstTouch = getPersistedFirstTouch();
        var fd = new FormData(form);
        var firstName = (fd.get('firstName') || '').toString().trim();
        var lastName = (fd.get('lastName') || '').toString().trim();
        var fullName = (firstName + ' ' + lastName).trim();
        var address = (fd.get('address') || fd.get('location') || '').toString().trim();
        var utm = getPersistedUtmParams();
        var attr =
          window.MhgAttribution && typeof window.MhgAttribution.toPayloadFields === 'function'
            ? window.MhgAttribution.toPayloadFields()
            : {};
        var payload = {
          gclid: (fd.get('gclid') || attr.gclid || '').toString().trim().slice(0, 500),
          gbraid: (fd.get('gbraid') || attr.gbraid || '').toString().trim().slice(0, 500),
          wbraid: (fd.get('wbraid') || attr.wbraid || '').toString().trim().slice(0, 500),
          utm_source: (fd.get('utm_source') || attr.utm_source || utm.utm_source || '')
            .toString()
            .trim()
            .slice(0, 200),
          utm_medium: (fd.get('utm_medium') || attr.utm_medium || utm.utm_medium || '')
            .toString()
            .trim()
            .slice(0, 200),
          utm_campaign: (fd.get('utm_campaign') || attr.utm_campaign || utm.utm_campaign || '')
            .toString()
            .trim()
            .slice(0, 200),
          utm_id: (fd.get('utm_id') || attr.utm_id || '').toString().trim().slice(0, 200),
          utm_content: (fd.get('utm_content') || attr.utm_content || utm.utm_content || '')
            .toString()
            .trim()
            .slice(0, 200),
          utm_term: (fd.get('utm_term') || attr.utm_term || utm.utm_term || '')
            .toString()
            .trim()
            .slice(0, 200),
          first_page: (fd.get('first_page') || attr.first_page || firstTouch.firstLandingUrl || '')
            .toString()
            .trim()
            .slice(0, 2000),
          referrer: (fd.get('referrer') || attr.referrer || firstTouch.firstReferrer || '')
            .toString()
            .trim()
            .slice(0, 2000),
          formSource: form.getAttribute('data-lead-form') || 'unknown',
          firstName: firstName,
          lastName: lastName,
          name: fullName,
          email: (fd.get('email') || '').toString().trim(),
          phone: formatUsPhoneDashes((fd.get('phone') || '').toString()),
          address: address,
          location: address,
          message: (fd.get('message') || '').toString().trim(),
          website: (fd.get('website') || '').toString().trim(),
          pageUrl: typeof window.location.href === 'string' ? window.location.href : '',
          firstLandingUrl: firstTouch.firstLandingUrl || (attr.first_page || ''),
          firstReferrer: firstTouch.firstReferrer || (attr.referrer || ''),
          firstLandingAt: firstTouch.firstLandingAt,
          smsMarketingOptIn: fd.get('smsMarketingOptIn') === 'yes'
        };

        if (window.MhgAttribution && typeof window.MhgAttribution.logFormPayloadTable === 'function') {
          window.MhgAttribution.logFormPayloadTable(payload);
        }
        if (window.MhgAttribution && typeof window.MhgAttribution.runDebugReport === 'function') {
          window.MhgAttribution.runDebugReport({ apiAttributionPayload: {
            gclid: payload.gclid,
            gbraid: payload.gbraid,
            wbraid: payload.wbraid,
            utm_source: payload.utm_source,
            utm_medium: payload.utm_medium,
            utm_campaign: payload.utm_campaign,
            utm_id: payload.utm_id,
            utm_content: payload.utm_content,
            utm_term: payload.utm_term,
            first_page: payload.first_page,
            referrer: payload.referrer
          }});
        }

        var runSend = function () {
          fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload)
          })
            .then(function (res) {
              return res.text().then(function (text) {
                var data = {};
                try {
                  data = text ? JSON.parse(text) : {};
                } catch (e) {
                  data = { error: 'bad_response', parseError: true };
                }
                return { ok: res.ok, status: res.status, data: data || {} };
              });
            })
            .then(function (result) {
              if (submitBtn) submitBtn.classList.remove('is-busy');
              if (result.ok && result.data && result.data.ok) {
                setStatus(form, 'Thanks — we received your message and will be in touch soon.', 'success');
                form.reset();
                window.location.assign('/thank-you/');
                return;
              }
              var err = (result.data && result.data.error) || 'submit_failed';
              var zst = result.data && result.data.zapierStatus;
              var msg =
                err === 'server_misconfigured'
                  ? 'This form is not configured yet. Please call us instead.'
                  : err === 'recaptcha_misconfigured'
                    ? 'This form is missing security configuration. Please call us instead.'
                    : err === 'recaptcha_missing' || err === 'recaptcha_failed'
                      ? 'Security check failed. Please refresh the page and try again.'
                      : err === 'recaptcha_low_score'
                        ? 'We could not verify this submission. Please try again or call us.'
                        : err === 'recaptcha_action_mismatch'
                          ? 'Security check mismatch. Please refresh and try again.'
                          : err === 'recaptcha_unreachable'
                            ? 'Could not verify security. Please try again in a moment.'
                            : err === 'missing_sms_consent'
                              ? 'Please confirm SMS consent to submit this form.'
                              : err === 'missing_fields'
                                ? 'Please fill in all required fields.'
                                : err === 'invalid_email'
                                ? 'Please enter a valid email address.'
                                : err === 'upstream_unreachable'
                                  ? 'Could not reach the form service. Please try again or call us.'
                                  : err === 'upstream_error'
                                    ? 'The form service rejected the submission (code ' +
                                      (zst || result.status || '?') +
                                      '). Check the Zapier webhook URL in Vercel, or call us.'
                                    : err === 'bad_response' || result.status === 404
                                      ? 'Form endpoint not found (404). Redeploy the site or check Vercel Root Directory / api folder.'
                                      : 'Something went wrong. Please try again or call us.';
              setStatus(form, msg, 'error');
            })
            .catch(function () {
              if (submitBtn) submitBtn.classList.remove('is-busy');
              setStatus(form, 'Network error. Please check your connection and try again.', 'error');
            });
        };

        var startSend = function () {
          if (!recaptchaSiteKey) {
            runSend();
            return;
          }
          loadRecaptchaApi(recaptchaSiteKey)
            .then(function () {
              if (typeof window.grecaptcha === 'undefined' || !window.grecaptcha.execute) {
                throw new Error('recaptcha_unavailable');
              }
              window.grecaptcha.ready(function () {
                window.grecaptcha
                  .execute(recaptchaSiteKey, { action: 'lead_form' })
                  .then(function (token) {
                    payload.recaptchaToken = token;
                    runSend();
                  })
                  .catch(function () {
                    if (submitBtn) submitBtn.classList.remove('is-busy');
                    setStatus(form, 'Security check failed. Please try again.', 'error');
                  });
              });
            })
            .catch(function () {
              if (submitBtn) submitBtn.classList.remove('is-busy');
              setStatus(form, 'Security check failed to load. Please refresh the page and try again.', 'error');
            });
        };

        startSend();
      });
    });
  }

  bindLeadForms();
  syncUtmToAllLeadForms();

  var cfgPreload = readFormsConfig();
  if (cfgPreload.recaptchaSiteKey) {
    loadRecaptchaApi(cfgPreload.recaptchaSiteKey);
  }

  /** bfcache / soft navigation: run bind again; already-bound forms skip via data-mhg-lead-bound. */
  window.addEventListener('pageshow', function () {
    getPersistedUtmParams();
    syncUtmToAllLeadForms();
    persistFirstTouchIfNeeded();
    bindLeadForms();
    var cfg = readFormsConfig();
    if (cfg.recaptchaSiteKey) {
      loadRecaptchaApi(cfg.recaptchaSiteKey);
    }
  });
})();
