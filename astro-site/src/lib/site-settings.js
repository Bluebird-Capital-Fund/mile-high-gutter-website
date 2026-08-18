import { sanity } from './sanity.js'

function normalizeHref(href) {
  if (typeof href !== 'string') return href
  const trimmed = href.trim()
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return href
  }
  if (!trimmed.includes('.html')) return href
  return trimmed.replace(/\.html(?=$|[?#])/g, '/')
}

function normalizeLabel(label) {
  if (typeof label !== 'string') return label
  const v = label.trim().toLowerCase()
  if (v === 'gallery' || v === 'our projects') return 'Projects'
  if (v === 'google reviews') return 'Reviews'
  if (v === 'our team') return 'About Us'
  return label
}

function normalizeProjectsHref(label, href) {
  if (typeof href === 'string' && href.trim().toLowerCase() === '/gallery/') return '/projects/'
  if (typeof label !== 'string') return href
  const v = label.trim().toLowerCase()
  if (v === 'projects' || v === 'our projects' || v === 'gallery') return '/projects/'
  return href
}

function normalizeReviewHref(label, href) {
  if (typeof label !== 'string') return href
  const v = label.trim().toLowerCase()
  if (v === 'reviews' || v === 'google reviews') return '/reviews/'
  return href
}

function normalizeAboutHref(label, href) {
  if (typeof label !== 'string') return href
  const v = label.trim().toLowerCase()
  if (v === 'about us' || v === 'our team') return '/about-us/'
  return href
}

const SERVICES_NAV_ITEM = {
  label: 'Services',
  dropdown: [
    { label: 'Gutter Cleaning', href: '/products-services/gutter-cleaning-denver-co/' },
    { label: 'Gutter Installation', href: '/products-services/gutter-installation-denver-co/' },
    { label: 'Gutter Repair', href: '/products-services/gutter-repair-denver-co/' },
    { label: 'Gutter Guards', href: '/products-services/denver-gutter-guards-co/' },
    { label: 'Downspouts', href: '/products-services/gutter-downspouts-denver-co/' },
    { label: 'Heat Tape', href: '/products-services/snow-ice-solutions-heat-tape-denver-co/' },
  ],
}

const FOOTER_SERVICE_LINKS = [
  { label: 'Gutter Cleaning', href: '/products-services/gutter-cleaning-denver-co/' },
  { label: 'Gutter Installation', href: '/products-services/gutter-installation-denver-co/' },
  { label: 'Gutter Repair', href: '/products-services/gutter-repair-denver-co/' },
  { label: 'Seamless Gutters', href: '/products-services/seamless-gutter-denver-co/' },
  { label: 'Gutter Guards', href: '/products-services/denver-gutter-guards-co/' },
  { label: 'Downspouts', href: '/products-services/gutter-downspouts-denver-co/' },
  { label: 'Heat Tape', href: '/products-services/snow-ice-solutions-heat-tape-denver-co/' },
]

const MATERIALS_NAV_ITEM = {
  label: 'Materials',
  dropdown: [
    { label: 'Copper Gutters', href: '/products-services/copper-gutters-denver-co/' },
    { label: 'Aluminum Gutters', href: '/products-services/aluminum-gutters-denver-co/' },
    { label: 'Steel Gutters', href: '/products-services/steel-gutters-denver-co/' },
  ],
}

function ensureLabeledNavItem(navItems, item, insertAfterLabel) {
  if (!Array.isArray(navItems)) return navItems
  const label = String(item.label || '').trim().toLowerCase()
  const existingIdx = navItems.findIndex(
    (nav) => typeof nav?.label === 'string' && nav.label.trim().toLowerCase() === label,
  )
  if (existingIdx >= 0) {
    const next = navItems.slice()
    next[existingIdx] = { ...next[existingIdx], ...item }
    return next
  }
  const afterIdx =
    typeof insertAfterLabel === 'string'
      ? navItems.findIndex(
          (nav) =>
            typeof nav?.label === 'string' &&
            nav.label.trim().toLowerCase() === insertAfterLabel.trim().toLowerCase(),
        )
      : -1
  const insertAt = afterIdx >= 0 ? afterIdx + 1 : label === 'services' ? 0 : Math.min(1, navItems.length)
  const next = navItems.slice()
  next.splice(insertAt, 0, item)
  return next
}

function normalizeHeader(header) {
  if (!header || typeof header !== 'object') return header
  const mapped = Array.isArray(header.navItems)
    ? header.navItems.map((item) => ({
        ...item,
        label: normalizeLabel(item?.label),
        href: normalizeAboutHref(
          item?.label,
          normalizeReviewHref(item?.label, normalizeProjectsHref(item?.label, normalizeHref(item?.href)))
        ),
        dropdown: Array.isArray(item?.dropdown)
          ? item.dropdown.map((link) => ({
              ...link,
              label: normalizeLabel(link?.label),
              href: normalizeAboutHref(
                link?.label,
                normalizeReviewHref(link?.label, normalizeProjectsHref(link?.label, normalizeHref(link?.href)))
              ),
            }))
          : item?.dropdown,
      }))
    : header.navItems
  const navItems = Array.isArray(mapped)
    ? ensureLabeledNavItem(ensureLabeledNavItem(mapped, SERVICES_NAV_ITEM, null), MATERIALS_NAV_ITEM, 'Services')
    : mapped
  return { ...header, navItems }
}

function isServicesColumn(col) {
  const h = String(col?.heading || '').trim().toLowerCase()
  return h === 'services' || h === 'our services'
}

function normalizeFooterColumns(columns) {
  if (!Array.isArray(columns)) return columns
  const serviceLinks = FOOTER_SERVICE_LINKS.map((link) => ({ ...link }))
  let foundServices = false
  const mapped = columns.map((col) => {
    const servicesCol = isServicesColumn(col)
    if (servicesCol) foundServices = true
    return {
      ...col,
      heading: servicesCol ? 'Services' : col.heading,
      ariaLabel: servicesCol ? col?.ariaLabel || 'Footer Services' : col.ariaLabel,
      links: servicesCol
        ? serviceLinks
        : Array.isArray(col?.links)
          ? col.links.map((link) => ({
              ...link,
              label: normalizeLabel(link?.label),
              href: normalizeAboutHref(
                link?.label,
                normalizeReviewHref(link?.label, normalizeProjectsHref(link?.label, normalizeHref(link?.href)))
              ),
            }))
          : col?.links,
    }
  })
  if (!foundServices) {
    mapped.unshift({
      heading: 'Services',
      ariaLabel: 'Footer Services',
      links: serviceLinks,
    })
  }
  return mapped
}

function normalizeFooterSupport(support) {
  if (!support || typeof support !== 'object') return support
  const links = Array.isArray(support.links)
    ? support.links.map((link) => ({
        ...link,
        label: normalizeLabel(link?.label),
        href: normalizeAboutHref(
          link?.label,
          normalizeReviewHref(link?.label, normalizeProjectsHref(link?.label, normalizeHref(link?.href)))
        ),
      }))
    : support.links
  return { ...support, links }
}

function normalizeFooterEstimate(footerEstimate) {
  if (!footerEstimate || typeof footerEstimate !== 'object') return footerEstimate
  return {
    ...footerEstimate,
    headline: 'Protect Your Property With Better Drainage',
    intro:
      'Tell us about your gutter or drainage needs, and we will recommend a solution focused on reliable performance and long-term value.',
  }
}

function normalizeBusiness(business) {
  if (!business || typeof business !== 'object') return business
  return {
    ...business,
    descriptionShort:
      'Family-owned and serving the Denver metro for 40+ years. Quality gutter and drainage solutions backed by honest recommendations, knowledgeable service, and a free consultation.',
  }
}

function normalizeStatsValues(statsValues) {
  if (!statsValues || typeof statsValues !== 'object') return statsValues
  return {
    ...statsValues,
    statsJobsCompleted: '10,000+',
    whyChooseHomesCount: '10,000+',
  }
}

function hasUpdatedLinks(doc) {
  const navHref = doc?.header?.navItems?.[1]?.href
  const privacyHref = doc?.footerSupport?.links?.[0]?.href
  return typeof navHref === 'string' && navHref.includes('/gallery/') &&
    typeof privacyHref === 'string' && privacyHref.includes('/privacy-policy/')
}

/**
 * Prefer Site settings for the full header; many pages fall back to `homePage.header`.
 * Offer bar (discount %, CTA, etc.) must always use Site settings when present — homePage
 * often has a stale copy and was overriding the live Sanity singleton.
 */
export function mergeHeaderFromSettings(settings, fallbackHeader) {
  const base = settings?.header ?? fallbackHeader ?? {}
  return {
    ...base,
    // Merge field-by-field so a partial `header.offerBar` on site settings still wins
    // (Sanity often sends only changed fields; `??` replaced the whole block with homePage's 10%).
    offerBar:
      settings?.header?.offerBar != null
        ? { ...settings.header.offerBar }
        : fallbackHeader?.offerBar,
  }
}

/** In-process cache for one `astro build` / dev session — avoids duplicate fetches from layouts + pages. */
let siteSettingsCache = null

export async function getSiteSettings() {
  if (siteSettingsCache) {
    return siteSettingsCache
  }
  const docs = await sanity.fetch(`*[_type == "siteSettings"]`)
  const list = Array.isArray(docs) ? docs : []

  /** Only this document id is the canonical promo/header copy source (see import script + Studio). */
  const singletonDoc = list.find((d) => d?._id === 'siteSettingsSingleton')
  const singleton = singletonDoc || list[0] || {}
  const linksSource =
    list.find((d) => d?._id !== singleton?._id && hasUpdatedLinks(d)) ||
    list.find((d) => d?._id !== singleton?._id && Array.isArray(d?.header?.navItems)) ||
    singleton

  // Nav/footer links may come from a second siteSettings doc; offer bar must follow
  // **siteSettingsSingleton** only — never list[0]'s offerBar when that isn't the singleton.
  const rawHeader = linksSource?.header ?? singleton?.header
  const singletonOffer = singletonDoc?.header?.offerBar
  // Use singleton offer bar as the whole object so unset Studio fields do not linger from homePage.
  const mergedHeader =
    rawHeader && singletonOffer != null
      ? {
          ...rawHeader,
          offerBar: { ...singletonOffer },
        }
      : rawHeader

  /**
   * Footer columns: prefer the canonical site settings doc (`singleton`) when it has columns.
   * Otherwise `linksSource` (a second siteSettings doc) was used first — that hid Studio edits
   * on the singleton (e.g. new “Blog” link) when the secondary doc still had old footer columns.
   */
  const footerColumnsRaw =
    Array.isArray(singleton?.footerColumns) && singleton.footerColumns.length > 0
      ? singleton.footerColumns
      : (linksSource?.footerColumns ?? singleton?.footerColumns)

  siteSettingsCache = {
    ...singleton,
    business: normalizeBusiness(singleton?.business ?? linksSource?.business),
    statsValues: normalizeStatsValues(singleton?.statsValues ?? linksSource?.statsValues),
    reviews: singleton?.reviews ?? linksSource?.reviews,
    header: normalizeHeader(mergedHeader ?? singleton?.header) ?? {},
    footerEstimate: normalizeFooterEstimate(
      linksSource?.footerEstimate ?? singleton?.footerEstimate,
    ),
    footerBrand: linksSource?.footerBrand ?? singleton?.footerBrand,
    footerColumns: normalizeFooterColumns(footerColumnsRaw),
    footerSupport: normalizeFooterSupport(linksSource?.footerSupport ?? singleton?.footerSupport),
    forms: singleton?.forms ?? linksSource?.forms,
  }
  return siteSettingsCache
}
