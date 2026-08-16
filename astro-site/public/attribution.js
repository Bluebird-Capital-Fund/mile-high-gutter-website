/**
 * Mile High Gutter — first-touch + last-click Ads attribution.
 * Captures gclid/gbraid/wbraid + UTMs on the landing URL, persists 90 days
 * (cookie + localStorage + sessionStorage), copies onto every lead form.
 * Debug: add ?tracking_debug=1
 */
(function (global) {
  'use strict';

  var COOKIE_PREFIX = 'mhg_';
  var COOKIE_DAYS = 90;
  var STORAGE_KEY = 'mhg_attr_v1';
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

  function maxLenFor(key) {
    if (key === 'first_page' || key === 'referrer') return 2000;
    if (key === 'gclid' || key === 'gbraid' || key === 'wbraid') return 500;
    return 200;
  }

  function trimVal(v, max) {
    return String(v == null ? '' : v).trim().slice(0, max);
  }

  function encode(v) {
    try {
      return encodeURIComponent(String(v == null ? '' : v));
    } catch (e) {
      return '';
    }
  }

  function decode(v) {
    try {
      return decodeURIComponent(String(v || ''));
    } catch (e) {
      return String(v || '');
    }
  }

  function cookieDomainSuffix() {
    try {
      var h = String(global.location && global.location.hostname ? global.location.hostname : '');
      if (h === 'milehighgutter.com' || h.slice(-19) === '.milehighgutter.com') {
        return '; domain=.milehighgutter.com';
      }
    } catch (e) {}
    return '';
  }

  function setCookie(name, value, days) {
    try {
      var maxAge = Math.max(0, Math.floor(Number(days || COOKIE_DAYS) * 24 * 60 * 60));
      var cookie =
        name +
        '=' +
        encode(value) +
        '; path=/; max-age=' +
        String(maxAge) +
        '; samesite=lax' +
        cookieDomainSuffix();
      if (global.location && global.location.protocol === 'https:') cookie += '; secure';
      document.cookie = cookie;
    } catch (e) {}
  }

  function getCookie(name) {
    try {
      var raw = document.cookie || '';
      if (!raw) return '';
      var parts = raw.split(';');
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i].trim();
        var eq = p.indexOf('=');
        if (eq < 0) continue;
        if (decode(p.slice(0, eq)) === name) return decode(p.slice(eq + 1));
      }
    } catch (e) {}
    return '';
  }

  function readJsonStore(storage) {
    try {
      var raw = storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function writeJsonStore(storage, obj) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function emptyAttribution() {
    var out = {};
    ALL_KEYS.forEach(function (key) {
      out[key] = '';
    });
    out.first_landing_at = '';
    return out;
  }

  function paramsFromSearch(search) {
    var out = emptyAttribution();
    var qs;
    try {
      qs = new URLSearchParams(search || '');
    } catch (e) {
      return out;
    }
    ATTR_KEYS.forEach(function (key) {
      out[key] = trimVal(qs.get(key), maxLenFor(key));
    });
    return out;
  }

  function paramsFromUrlString(urlStr) {
    var out = emptyAttribution();
    if (!urlStr) return out;
    try {
      var u = new URL(urlStr, (global.location && global.location.href) || undefined);
      return paramsFromSearch(u.search);
    } catch (e) {
      var q = String(urlStr).indexOf('?');
      if (q >= 0) return paramsFromSearch(String(urlStr).slice(q));
      return out;
    }
  }

  function readQueryParams() {
    try {
      return paramsFromSearch(global.location && global.location.search);
    } catch (e) {
      return emptyAttribution();
    }
  }

  function readStoredRaw() {
    var fromLs = readJsonStore(global.localStorage) || {};
    var fromSs = readJsonStore(global.sessionStorage) || {};
    var out = emptyAttribution();
    ALL_KEYS.forEach(function (key) {
      var cookieVal = trimVal(getCookie(COOKIE_PREFIX + key), maxLenFor(key));
      out[key] =
        cookieVal ||
        trimVal(fromLs[key], maxLenFor(key)) ||
        trimVal(fromSs[key], maxLenFor(key)) ||
        '';
    });
    out.first_landing_at =
      trimVal(getCookie(COOKIE_PREFIX + 'first_landing_at'), 40) ||
      trimVal(fromLs.first_landing_at, 40) ||
      trimVal(fromSs.first_landing_at, 40) ||
      '';
    if (!out.first_page) {
      out.first_page = trimVal(getCookie('mhg_first_landing_url'), 2000);
    }
    if (!out.referrer) {
      out.referrer = trimVal(getCookie('mhg_first_referrer'), 2000);
    }
    return out;
  }

  /** Fill empty click IDs / UTMs from the stored first landing URL. */
  function hydrateFromFirstPage(stored) {
    if (!stored || !stored.first_page) return stored;
    var fromFirst = paramsFromUrlString(stored.first_page);
    ATTR_KEYS.forEach(function (key) {
      if (!stored[key] && fromFirst[key]) stored[key] = fromFirst[key];
    });
    return stored;
  }

  function persistObject(stored) {
    ALL_KEYS.forEach(function (key) {
      if (stored[key]) setCookie(COOKIE_PREFIX + key, stored[key], COOKIE_DAYS);
    });
    if (stored.first_page) {
      setCookie('mhg_first_landing_url', stored.first_page, COOKIE_DAYS);
    }
    if (stored.referrer) {
      setCookie('mhg_first_referrer', stored.referrer, COOKIE_DAYS);
    }
    if (stored.first_landing_at) {
      setCookie('mhg_first_landing_at', stored.first_landing_at, COOKIE_DAYS);
    }
    writeJsonStore(global.localStorage, stored);
    writeJsonStore(global.sessionStorage, stored);
    return stored;
  }

  /**
   * Capture from URL → storage. Never overwrite a stored value with empty.
   * New non-empty click IDs / UTMs from the URL win (last paid click).
   * first_page / referrer are first-touch only.
   */
  function captureFromUrl() {
    var fromUrl = readQueryParams();
    var stored = hydrateFromFirstPage(readStoredRaw());

    ATTR_KEYS.forEach(function (key) {
      if (fromUrl[key]) stored[key] = fromUrl[key];
    });

    if (!stored.first_page) {
      var href = typeof global.location.href === 'string' ? global.location.href : '';
      if (href) stored.first_page = href.slice(0, 2000);
    }

    if (!stored.referrer) {
      var ref = typeof document.referrer === 'string' ? document.referrer : '';
      stored.referrer = ref.slice(0, 2000);
    }

    if (!stored.first_landing_at) {
      stored.first_landing_at = new Date().toISOString();
    }

    hydrateFromFirstPage(stored);
    persistObject(stored);
    return stored;
  }

  function getAttribution() {
    return hydrateFromFirstPage(readStoredRaw());
  }

  function ensureHiddenInput(form, name, value) {
    if (!form) return null;
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

  function applyToForm(form) {
    var attr = getAttribution();
    if (!form) return attr;
    ALL_KEYS.forEach(function (key) {
      ensureHiddenInput(form, key, attr[key] || '');
    });
    ensureHiddenInput(form, 'firstLandingUrl', attr.first_page || '');
    ensureHiddenInput(form, 'firstReferrer', attr.referrer || '');
    ensureHiddenInput(form, 'firstLandingAt', attr.first_landing_at || '');
    return attr;
  }

  function applyToAllLeadForms() {
    var forms = document.querySelectorAll('form[data-lead-form]');
    for (var i = 0; i < forms.length; i++) applyToForm(forms[i]);
    return getAttribution();
  }

  function toPayloadFields() {
    var attr = getAttribution();
    var out = {};
    ALL_KEYS.forEach(function (key) {
      out[key] = attr[key] || '';
    });
    out.firstLandingUrl = attr.first_page || '';
    out.firstReferrer = attr.referrer || '';
    out.firstLandingAt = attr.first_landing_at || '';
    return out;
  }

  function pickNonEmpty() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v == null) continue;
      var s = String(v).trim();
      if (s) return s;
    }
    return '';
  }

  /** Merge URL + cookies + storage + form fields for a submit payload. */
  function mergeForSubmit(form) {
    var fromUrl = readQueryParams();
    var stored = captureFromUrl();
    var fd = form ? new FormData(form) : null;
    function fromForm(key) {
      if (!fd) return '';
      var v = fd.get(key);
      return v == null ? '' : String(v);
    }
    var out = {};
    ATTR_KEYS.forEach(function (key) {
      out[key] = trimVal(
        pickNonEmpty(fromUrl[key], stored[key], fromForm(key)),
        maxLenFor(key),
      );
    });
    out.first_page = trimVal(
      pickNonEmpty(stored.first_page, fromForm('first_page'), fromForm('firstLandingUrl')),
      2000,
    );
    out.referrer = trimVal(
      pickNonEmpty(stored.referrer, fromForm('referrer'), fromForm('firstReferrer')),
      2000,
    );
    out.firstLandingUrl = out.first_page;
    out.firstReferrer = out.referrer;
    out.firstLandingAt = trimVal(
      pickNonEmpty(stored.first_landing_at, fromForm('firstLandingAt')),
      40,
    );
    var fromFirst = paramsFromUrlString(out.first_page);
    ATTR_KEYS.forEach(function (key) {
      if (!out[key] && fromFirst[key]) out[key] = fromFirst[key];
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

  function isDebug() {
    try {
      return new URLSearchParams(global.location.search || '').get('tracking_debug') === '1';
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

  function runDebugReport(extra) {
    if (!isDebug()) return;
    var qs = readQueryParams();
    var stored = getAttribution();
    var tel = findPrimaryTel();
    var report = {
      currentUrl: global.location.href,
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
    if (global.console && console.table) console.table(report.formAttributionPayload);
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

  function boot() {
    var attribution = captureFromUrl();
    applyToAllLeadForms();
    if (isDebug()) {
      debugLog('boot', {
        url: global.location.href,
        stored: attribution,
        callRail: callRailScriptLoaded() ? 'yes' : 'no',
      });
      setTimeout(function () {
        applyToAllLeadForms();
        runDebugReport();
      }, 1500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.addEventListener('pageshow', function () {
    captureFromUrl();
    applyToAllLeadForms();
  });

  if (global.MutationObserver && document.documentElement) {
    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        applyToAllLeadForms();
      }, 50);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  global.MhgAttribution = {
    keys: ALL_KEYS.slice(),
    captureFromUrl: captureFromUrl,
    get: getAttribution,
    applyToForm: applyToForm,
    applyToAllLeadForms: applyToAllLeadForms,
    toPayloadFields: toPayloadFields,
    mergeForSubmit: mergeForSubmit,
    isDebug: isDebug,
    runDebugReport: runDebugReport,
    logFormPayloadTable: logFormPayloadTable,
  };
})(typeof window !== 'undefined' ? window : this);
