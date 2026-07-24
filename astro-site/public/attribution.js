/**
 * Mile High Gutter — Google Ads / CallRail attribution utility.
 * Captures click IDs + UTMs on first page load, persists 90 days, exposes to forms.
 * Debug: add ?tracking_debug=1 to the URL.
 */
(function (global) {
  'use strict';

  var COOKIE_PREFIX = 'mhg_';
  var COOKIE_DAYS = 90;
  var ATTR_KEYS = [
    'gclid',
    'gbraid',
    'wbraid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_id',
    'utm_content',
    'utm_term',
  ];
  var META_KEYS = ['first_page', 'referrer'];
  var ALL_KEYS = ATTR_KEYS.concat(META_KEYS);

  function encode(v) {
    return encodeURIComponent(String(v == null ? '' : v));
  }

  function decode(v) {
    try {
      return decodeURIComponent(String(v || ''));
    } catch (e) {
      return String(v || '');
    }
  }

  function setCookie(name, value, days) {
    var maxAge = Math.max(0, Math.floor(Number(days || COOKIE_DAYS) * 24 * 60 * 60));
    document.cookie =
      encode(name) +
      '=' +
      encode(value) +
      '; path=/; max-age=' +
      String(maxAge) +
      '; samesite=lax';
  }

  function getCookie(name) {
    var raw = document.cookie || '';
    if (!raw) return '';
    var parts = raw.split(';');
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim();
      var eq = p.indexOf('=');
      if (eq < 0) continue;
      if (decode(p.slice(0, eq)) === name) return decode(p.slice(eq + 1));
    }
    return '';
  }

  function isDebug() {
    try {
      return new URLSearchParams(window.location.search || '').get('tracking_debug') === '1';
    } catch (e) {
      return false;
    }
  }

  function debugLog() {
    if (!isDebug() || !global.console) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[MHG attribution]');
    console.log.apply(console, args);
  }

  function readQueryParams() {
    var qs;
    try {
      qs = new URLSearchParams(window.location.search || '');
    } catch (e) {
      qs = new URLSearchParams();
    }
    var out = {};
    ATTR_KEYS.forEach(function (key) {
      out[key] = String(qs.get(key) || '').trim().slice(0, 500);
    });
    return out;
  }

  function readStored() {
    var out = {};
    ATTR_KEYS.forEach(function (key) {
      out[key] = getCookie(COOKIE_PREFIX + key).trim().slice(0, 500);
    });
    out.first_page = getCookie(COOKIE_PREFIX + 'first_page').trim().slice(0, 2000);
    out.referrer = getCookie(COOKIE_PREFIX + 'referrer').trim().slice(0, 2000);
    return out;
  }

  /**
   * Capture from URL → cookies. Never overwrite a stored value with empty.
   * New non-empty click IDs / UTMs from the URL win.
   */
  function captureFromUrl() {
    var fromUrl = readQueryParams();
    var stored = readStored();

    ATTR_KEYS.forEach(function (key) {
      var next = fromUrl[key];
      if (next) {
        setCookie(COOKIE_PREFIX + key, next, COOKIE_DAYS);
        stored[key] = next;
      }
    });

    if (!stored.first_page) {
      var href = typeof window.location.href === 'string' ? window.location.href : '';
      if (href) {
        setCookie(COOKIE_PREFIX + 'first_page', href.slice(0, 2000), COOKIE_DAYS);
        stored.first_page = href.slice(0, 2000);
      }
    }

    if (!stored.referrer) {
      var ref = typeof document.referrer === 'string' ? document.referrer : '';
      setCookie(COOKIE_PREFIX + 'referrer', ref.slice(0, 2000), COOKIE_DAYS);
      stored.referrer = ref.slice(0, 2000);
    }

    // Keep legacy first-touch cookies for older Zapier mappings
    if (!getCookie('mhg_first_landing_url')) {
      setCookie('mhg_first_landing_url', stored.first_page || '', COOKIE_DAYS);
      setCookie('mhg_first_referrer', stored.referrer || '', COOKIE_DAYS);
      setCookie('mhg_first_landing_at', new Date().toISOString(), COOKIE_DAYS);
    }

    // Mirror UTM cookies used by older script paths
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'].forEach(
      function (key) {
        if (stored[key]) setCookie(COOKIE_PREFIX + key, stored[key], COOKIE_DAYS);
      },
    );

    return stored;
  }

  function getAttribution() {
    return readStored();
  }

  function ensureHiddenInput(form, name, value) {
    var el = form.querySelector('input[type="hidden"][name="' + name + '"]');
    if (!el) {
      el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      form.appendChild(el);
    }
    el.value = String(value == null ? '' : value);
    return el;
  }

  /** Populate (or create) hidden attribution fields on a form. */
  function applyToForm(form) {
    if (!form) return getAttribution();
    var attr = getAttribution();
    ALL_KEYS.forEach(function (key) {
      ensureHiddenInput(form, key, attr[key] || '');
    });
    return attr;
  }

  function applyToAllLeadForms() {
    var forms = document.querySelectorAll('form[data-lead-form]');
    var attr = getAttribution();
    for (var i = 0; i < forms.length; i++) {
      applyToForm(forms[i]);
    }
    return attr;
  }

  /** Payload fragment for API JSON (exact field names). */
  function toPayloadFields() {
    var attr = getAttribution();
    var out = {};
    ALL_KEYS.forEach(function (key) {
      out[key] = attr[key] || '';
    });
    return out;
  }

  function callRailScriptLoaded() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('cdn.callrail.com') !== -1 && src.indexOf('swap.js') !== -1) return true;
    }
    return typeof global.CallTrk !== 'undefined' || typeof global.CallRail !== 'undefined';
  }

  function findPrimaryTel() {
    var links = document.querySelectorAll('a[href^="tel:"]');
    if (!links.length) return { found: false, href: '', text: '' };
    var a = links[0];
    return {
      found: true,
      href: a.getAttribute('href') || '',
      text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
    };
  }

  function runDebugReport(extra) {
    if (!isDebug()) return;
    var qs = readQueryParams();
    var stored = getAttribution();
    var tel = findPrimaryTel();
    var report = {
      currentUrl: window.location.href,
      queryParams: qs,
      gclidInUrl: qs.gclid || '',
      gbraidInUrl: qs.gbraid || '',
      wbraidInUrl: qs.wbraid || '',
      storedAttribution: stored,
      originalLandingPage: stored.first_page || '',
      originalReferrer: stored.referrer || '',
      callRailScriptLoaded: callRailScriptLoaded() ? 'yes' : 'no',
      originalPhoneNumberFound: tel.found ? 'yes' : 'no',
      phoneAfterCallRail: tel.href || tel.text || '',
      formFieldsPopulated: document.querySelectorAll('form[data-lead-form] input[name="gclid"]').length
        ? 'yes'
        : 'no',
      formAttributionPayload: toPayloadFields(),
    };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) report[k] = extra[k];
      }
    }
    debugLog('debug report', report);
    if (global.console && console.table) {
      console.table(report.formAttributionPayload);
    }
    return report;
  }

  function logFormPayloadTable(payload) {
    if (!isDebug() || !global.console) return;
    var slice = {};
    ALL_KEYS.forEach(function (key) {
      slice[key] = (payload && payload[key]) || '';
    });
    debugLog('Exact form attribution payload (no PII)');
    if (console.table) console.table(slice);
    else console.log(slice);
  }

  // Boot
  var attribution = captureFromUrl();
  applyToAllLeadForms();

  if (isDebug()) {
    debugLog('boot', {
      url: window.location.href,
      stored: attribution,
      callRail: callRailScriptLoaded() ? 'yes' : 'no',
    });
    // Re-check CallRail / tel after swap.js has had time to run
    setTimeout(function () {
      applyToAllLeadForms();
      runDebugReport();
    }, 1500);
  }

  // Re-apply when new forms appear / after bfcache
  global.addEventListener('pageshow', function () {
    captureFromUrl();
    applyToAllLeadForms();
  });

  global.MhgAttribution = {
    keys: ALL_KEYS.slice(),
    captureFromUrl: captureFromUrl,
    get: getAttribution,
    applyToForm: applyToForm,
    applyToAllLeadForms: applyToAllLeadForms,
    toPayloadFields: toPayloadFields,
    isDebug: isDebug,
    runDebugReport: runDebugReport,
    logFormPayloadTable: logFormPayloadTable,
  };
})(typeof window !== 'undefined' ? window : this);
