import { SERVICES_HUB_GROUPS } from './services-page-content.js'

const SERVICE_SLUG_LABELS = Object.fromEntries(
  SERVICES_HUB_GROUPS.flatMap((group) =>
    (group.links || []).map((link) => {
      const slug = String(link.href || '')
        .replace(/^\/products-services\//, '')
        .replace(/\/+$/, '')
      return [slug, link.label]
    })
  )
)

const KNOWN_ROOT_SEGMENTS = new Set([
  'about-us',
  'blog',
  'contact-us',
  'faqs',
  'financing',
  'gallery',
  'lp',
  'privacy-policy',
  'products-services',
  'reviews',
  'service-area',
  'services',
  'terms-of-service',
  'thank-you',
])

const SEGMENT_LABELS = {
  faqs: 'FAQs',
  lp: 'LP',
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  const withSlash = pathname.endsWith('/') ? pathname : `${pathname}/`
  return withSlash.replace(/\/{2,}/g, '/')
}

export function titleFromSlug(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function labelForSegment(segment) {
  return SEGMENT_LABELS[segment] || titleFromSlug(segment)
}

export function serviceLabelFromSlug(slug) {
  const key = String(slug || '').replace(/^\/+|\/+$/g, '')
  if (SERVICE_SLUG_LABELS[key]) return SERVICE_SLUG_LABELS[key]
  return titleFromSlug(
    key
      .replace(/-denver-co$/, '')
      .replace(/-co$/, '')
      .replace(/^denver-/, '')
      .replace(/-denver$/, '')
  )
}

export function locationLabelFromSlug(slug) {
  return titleFromSlug(
    String(slug || '')
      .replace(/^gutters-/, '')
      .replace(/-co$/, '')
  )
}

function withTrailingSlash(href) {
  if (!href || href === '/') return '/'
  return href.endsWith('/') ? href : `${href}/`
}

/**
 * Build breadcrumb items for a pathname. Homepage returns an empty list.
 * Does not change or depend on rewritten URLs — labels are derived from existing slugs.
 */
export function buildBreadcrumbItems(pathname) {
  const path = normalizePath(pathname)
  if (path === '/') return []

  const home = { label: 'Home', href: '/' }
  const segments = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean)

  if (segments[0] === 'products-services') {
    if (!segments[1]) {
      return [home, { label: titleFromSlug('products-services'), href: '/products-services/' }]
    }
    return [
      home,
      { label: 'Services', href: '/services/' },
      {
        label: serviceLabelFromSlug(segments[1]),
        href: withTrailingSlash(`/products-services/${segments[1]}`),
      },
    ]
  }

  if (segments.length === 1 && /^gutters-.+-co$/.test(segments[0])) {
    return [
      home,
      { label: 'Service Area', href: '/service-area/' },
      {
        label: locationLabelFromSlug(segments[0]),
        href: withTrailingSlash(`/${segments[0]}`),
      },
    ]
  }

  if (segments[0] === 'blog' && segments[1] === 'page' && segments[2]) {
    return [
      home,
      { label: 'Blog', href: '/blog/' },
      { label: `Page ${segments[2]}`, href: withTrailingSlash(path) },
    ]
  }

  if (segments.length === 1 && !KNOWN_ROOT_SEGMENTS.has(segments[0])) {
    return [
      home,
      { label: 'Blog', href: '/blog/' },
      { label: titleFromSlug(segments[0]), href: withTrailingSlash(`/${segments[0]}`) },
    ]
  }

  const items = [home]
  let href = ''
  for (const segment of segments) {
    href += `/${segment}`
    if (segment === 'lp') continue
    items.push({
      label: labelForSegment(segment),
      href: withTrailingSlash(href),
    })
  }
  return items
}

export function breadcrumbJsonLd(items, origin) {
  const site = String(origin || 'https://www.milehighgutter.com').replace(/\/+$/, '')
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href === '/' ? `${site}/` : `${site}${item.href}`,
    })),
  }).replace(/</g, '\\u003c')
}
