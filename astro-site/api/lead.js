/**
 * CANONICAL lead API — Vercel `/api/lead`. After edits, run `npm run sync-api` (copies to `astro-site/api/`).
 *
 * Verifies reCAPTCHA v3, then forwards JSON to Zapier.
 *
 * Env:
 * - ZAPIER_WEBHOOK_URL (required, https)
 * - RECAPTCHA_SECRET_KEY (required) — from Google reCAPTCHA admin
 * - RECAPTCHA_MIN_SCORE (optional, default 0.5) — v3 score threshold
 */

/** Visitor-submitted phone from forms → NNN-NNN-NNNN when US 10 digits. */
function formatUsPhoneDashes(value) {
  const d = String(value || '').replace(/\D/g, '');
  let n = d;
  if (d.length === 11 && d.startsWith('1')) n = d.slice(1);
  if (n.length === 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
  return String(value || '').trim();
}

/** Zapier / CRM often expect a single `querystring`; also used when mapping UTMs from the landing URL. */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];
const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid'];

/**
 * Destination field mapping (documented — do not rename silently):
 * gclid → gclid1 (also keep gclid)
 * gbraid → gbraid
 * wbraid → wbraid
 * utm_source → utm_source
 * utm_medium → lead_medium (also keep utm_medium)
 * utm_campaign → lead_campaign (also keep utm_campaign)
 * utm_term → lead_term (also keep utm_term)
 * utm_content → utm_content
 * utm_id → utm_id
 * first_page → first_page
 * referrer → referrer
 */

function trimAttr(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function trimUtm(value) {
  return trimAttr(value, 200);
}

function utmFromBody(body) {
  const out = {};
  for (const key of UTM_KEYS) {
    out[key] = trimUtm(body[key]);
  }
  return out;
}

function utmFromPageUrl(pageUrl) {
  const out = {};
  for (const key of UTM_KEYS) {
    out[key] = '';
  }
  try {
    const u = new URL(pageUrl);
    for (const key of UTM_KEYS) {
      const v = u.searchParams.get(key);
      if (v) out[key] = trimUtm(v);
    }
  } catch {
    /* invalid URL */
  }
  return out;
}

/** Prefer JSON body from the browser; fall back to `pageUrl` query (e.g. if cookies/JS missed). */
function mergeUtm(body, pageUrl) {
  const fromBody = utmFromBody(body);
  const fromUrl = utmFromPageUrl(pageUrl);
  const merged = {};
  for (const key of UTM_KEYS) {
    merged[key] = fromBody[key] || fromUrl[key] || '';
  }
  return merged;
}

function clickIdsFromPageUrl(pageUrl) {
  const out = { gclid: '', gbraid: '', wbraid: '' };
  try {
    const u = new URL(pageUrl);
    for (const key of CLICK_ID_KEYS) {
      const v = u.searchParams.get(key);
      if (v) out[key] = trimAttr(v, 500);
    }
  } catch {
    /* invalid URL */
  }
  return out;
}

function mergeClickIds(body, pageUrl, firstLandingUrl) {
  const fromUrl = clickIdsFromPageUrl(pageUrl);
  const fromFirst = clickIdsFromPageUrl(firstLandingUrl);
  const out = {};
  for (const key of CLICK_ID_KEYS) {
    out[key] =
      trimAttr(body[key], 500) || fromUrl[key] || fromFirst[key] || '';
  }
  return out;
}

function buildUtmQueryString(utm, clickIds) {
  const params = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const v = utm[key];
    if (v) params.set(key, v);
  }
  for (const key of CLICK_ID_KEYS) {
    const v = clickIds[key];
    if (v) params.set(key, v);
  }
  return params.toString();
}

const RECAPTCHA_ACTION = 'lead_form';

function jsonResponse(data, status, extraHeaders = {}) {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extraHeaders,
    },
  });
}

async function verifyRecaptchaV3(token, secret, remoteIp) {
  const params = new URLSearchParams();
  params.set('secret', secret);
  params.set('response', token);
  if (remoteIp) params.set('remoteip', remoteIp);
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) return { ok: false, reason: 'verify_http' };
  const data = await res.json();
  if (!data.success) return { ok: false, reason: 'verify_failed', raw: data };
  if (data.action && data.action !== RECAPTCHA_ACTION) {
    return { ok: false, reason: 'action_mismatch', raw: data };
  }
  const score = typeof data.score === 'number' ? data.score : 0;
  const min = Number.parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
  const threshold = Number.isFinite(min) ? min : 0.5;
  if (score < threshold) return { ok: false, reason: 'low_score', score, raw: data };
  return { ok: true, score, raw: data };
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405, {
        Allow: 'POST, OPTIONS',
      });
    }

    const webhook = (process.env.ZAPIER_WEBHOOK_URL || '').trim();
    if (!webhook || !/^https:\/\//i.test(webhook)) {
      return jsonResponse({ ok: false, error: 'server_misconfigured' }, 503);
    }

    const recaptchaSecret = (process.env.RECAPTCHA_SECRET_KEY || '').trim();
    if (!recaptchaSecret) {
      return jsonResponse({ ok: false, error: 'recaptcha_misconfigured' }, 503);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
    }

    if (!body || typeof body !== 'object') {
      return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
    }

    const hp = body.website != null ? String(body.website).trim() : '';
    if (hp.length > 0) {
      return jsonResponse({ ok: true }, 200);
    }

    const recaptchaToken = String(body.recaptchaToken || '').trim();
    if (!recaptchaToken) {
      return jsonResponse({ ok: false, error: 'recaptcha_missing' }, 400);
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const remoteIp = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;
    let verify;
    try {
      verify = await verifyRecaptchaV3(recaptchaToken, recaptchaSecret, remoteIp);
    } catch {
      return jsonResponse({ ok: false, error: 'recaptcha_unreachable' }, 502);
    }
    if (!verify.ok) {
      const err =
        verify.reason === 'low_score'
          ? 'recaptcha_low_score'
          : verify.reason === 'action_mismatch'
            ? 'recaptcha_action_mismatch'
            : 'recaptcha_failed';
      return jsonResponse({ ok: false, error: err }, 400);
    }

    const firstName = String(body.firstName || '').trim().slice(0, 200);
    const lastName = String(body.lastName || '').trim().slice(0, 200);
    const fallbackName = String(body.name || '').trim();
    const name = `${firstName} ${lastName}`.trim() || fallbackName.slice(0, 500);
    const email = String(body.email || '').trim().slice(0, 320);
    const phone = formatUsPhoneDashes(body.phone || '').slice(0, 80);
    const address = String(body.address || body.location || '').trim().slice(0, 250);
    const message = String(body.message || '').trim().slice(0, 5000);
    const formSource = String(body.formSource || 'unknown').trim().slice(0, 80);
    const pageUrl = String(body.pageUrl || '').trim().slice(0, 2000);
    const firstLandingUrl = String(body.firstLandingUrl || body.first_page || '')
      .trim()
      .slice(0, 2000);
    const firstReferrer = String(body.firstReferrer || body.referrer || '')
      .trim()
      .slice(0, 2000);
    const firstLandingAt = String(body.firstLandingAt || '').trim().slice(0, 40);
    const first_page = String(body.first_page || firstLandingUrl || '').trim().slice(0, 2000);
    const referrer = String(body.referrer || firstReferrer || '').trim().slice(0, 2000);
    const utm = mergeUtm(body, pageUrl || firstLandingUrl);
    const clickIds = mergeClickIds(body, pageUrl, firstLandingUrl);
    const querystring = buildUtmQueryString(utm, clickIds);

    const rawSms = body.smsMarketingOptIn;
    const smsMarketingOptIn =
      rawSms === true ||
      rawSms === 'yes' ||
      rawSms === 'true' ||
      (typeof rawSms === 'string' && rawSms.toLowerCase() === 'on');
    if (!smsMarketingOptIn) {
      return jsonResponse({ ok: false, error: 'missing_sms_consent' }, 400);
    }

    if (!name || !email || !phone) {
      return jsonResponse({ ok: false, error: 'missing_fields' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'invalid_email' }, 400);
    }

    const payload = {
      formSource,
      name,
      firstName,
      lastName,
      email,
      phone,
      address,
      location: address,
      message,
      submittedAt: new Date().toISOString(),
      pageUrl,
      firstLandingUrl: firstLandingUrl || first_page,
      firstReferrer: firstReferrer || referrer,
      firstLandingAt,
      // Exact attribution fields (browser names)
      gclid: clickIds.gclid,
      gbraid: clickIds.gbraid,
      wbraid: clickIds.wbraid,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_id: utm.utm_id,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
      first_page,
      referrer,
      // Destination / CRM aliases (documented mappings)
      gclid1: clickIds.gclid,
      lead_medium: utm.utm_medium,
      lead_campaign: utm.utm_campaign,
      lead_term: utm.utm_term,
      querystring,
      smsMarketingOptIn: true,
    };

    let zRes;
    try {
      zRes = await fetch(webhook, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'MHG-Lead-Form/1.0 (Vercel)',
        },
        body: JSON.stringify(payload),
      });
    } catch {
      return jsonResponse({ ok: false, error: 'upstream_unreachable' }, 502);
    }

    if (!zRes.ok) {
      return jsonResponse(
        {
          ok: false,
          error: 'upstream_error',
          zapierStatus: zRes.status,
        },
        502
      );
    }

    return jsonResponse({ ok: true }, 200);
  },
};
