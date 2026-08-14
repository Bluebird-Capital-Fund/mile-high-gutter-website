/**
 * JSON-LD for schema.org HomeAndConstructionBusiness (LocalBusiness).
 * Data from Site settings → Business + Business listings.
 */
import { asStr, mediaUrl } from './sanity-strings.js'

/** Matches astro.config.mjs `site` — absolute URLs for image / @id */
export const CANONICAL_SITE_ORIGIN = 'https://www.milehighgutter.com'

const SQUARE_LOGO_PATH =
  'Media (MHG)/Logo Suite (MHG)/Mile High (Denver Colorado)/Square/(Square — White BG) Mile-High-Gutter.jpg'

/** Cities listed in homepage service-area copy; Denver included once. */
const AREA_SERVED_CITIES = [
  'Denver',
  'Arvada',
  'Aurora',
  'Golden',
  'Parker',
  'Boulder',
  'Brighton',
  'Lakewood',
  'Morrison',
  'Thornton',
  'Lafayette',
  'Littleton',
  'Broomfield',
  'Centennial',
  'Louisville',
  'Westminster',
  'Wheat Ridge',
  'Commerce City',
  'Evergreen',
  'Highlands Ranch',
]

const MONTHS = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
}

/**
 * @param {string} raw
 * @returns {string}
 */
function normalizeSiteUrl(raw) {
  const s = String(raw || '').trim()
  if (!s) return CANONICAL_SITE_ORIGIN
  if (/^https?:\/\//i.test(s)) return s.replace(/\/+$/, '') || CANONICAL_SITE_ORIGIN
  return `${CANONICAL_SITE_ORIGIN.replace(/\/+$/, '')}/${s.replace(/^\/+/, '')}`
}

/**
 * @param {string} path
 * @returns {string}
 */
function absoluteMediaUrl(path) {
  return `${CANONICAL_SITE_ORIGIN.replace(/\/+$/, '')}${mediaUrl(path)}`
}

/**
 * Parse "3300 S Federal Blvd, Englewood, CO 80110" into PostalAddress parts.
 * @param {string} line
 * @returns {Record<string, unknown> | undefined}
 */
function parsePostalAddress(line) {
  const raw = String(line || '').trim()
  if (!raw) return undefined

  const parsed = raw.match(/^(.+),\s*([^,]+),\s*([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/)
  if (parsed) {
    return {
      '@type': 'PostalAddress',
      streetAddress: parsed[1].trim(),
      addressLocality: parsed[2].trim(),
      addressRegion: parsed[3].toUpperCase(),
      postalCode: parsed[4],
      addressCountry: 'US',
    }
  }

  return {
    '@type': 'PostalAddress',
    streetAddress: raw,
    addressCountry: 'US',
  }
}

/**
 * @param {string} raw
 * @returns {string | undefined}
 */
function toIsoDate(raw) {
  const s = String(raw || '').trim()
  if (!s) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  const named = s.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/)
  if (named) {
    const month = MONTHS[named[1].toLowerCase()]
    if (month) return `${named[3]}-${month}-${named[2].padStart(2, '0')}`
  }

  return undefined
}

/**
 * @param {Record<string, unknown>} settings siteSettings merge result
 * @returns {string | null} Serialized JSON-LD or null if no business name
 */
export function buildHomeAndConstructionBusinessJsonLd(settings) {
  const business = settings?.business ?? {}
  const listings = settings?.businessListings ?? {}

  const name = asStr(business.companyName).trim()
  if (!name) return null

  const url = normalizeSiteUrl(asStr(business.websiteUrl))
  const telephone = asStr(business.phoneDisplay).trim() || formatTelForSchema(asStr(business.phoneTel))
  const email = asStr(business.email).trim()
  const description =
    asStr(business.descriptionShort).trim() || asStr(business.descriptionLong).trim()
  const hours = asStr(business.hoursText).trim()

  const logoPath = asStr(business.logoHorizontalBlack) || asStr(business.logoHorizontalWhite)
  const image = logoPath ? absoluteMediaUrl(logoPath) : undefined
  const logo = absoluteMediaUrl(SQUARE_LOGO_PATH)

  const address = parsePostalAddress(asStr(business.addressShort))
  const areaServed = AREA_SERVED_CITIES.map((city) => ({
    '@type': 'City',
    name: city,
    containedInPlace: {
      '@type': 'State',
      name: 'Colorado',
    },
  }))

  const sameAs = [
    asStr(listings.googleMaps),
    asStr(listings.facebook),
    asStr(listings.instagram),
    asStr(listings.twitter),
    asStr(listings.linkedin),
    asStr(listings.yelp),
    asStr(listings.bingPlaces),
  ]
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u))

  const hasMap = asStr(listings.googleMaps).trim()

  /** @type {Record<string, unknown>} */
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${url}#business`,
    name,
    url,
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(description ? { description } : {}),
    logo: { '@type': 'ImageObject', url: logo },
    ...(image ? { image: { '@type': 'ImageObject', url: image } } : {}),
    ...(address ? { address } : {}),
    ...(hasMap ? { hasMap } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    areaServed,
  }

  const foundingDate = toIsoDate(asStr(business.dateOpened))
  if (foundingDate) {
    data.foundingDate = foundingDate
  }

  if (/^24\s*\/\s*7$/i.test(hours)) {
    data.openingHours = 'Mo-Su 00:00-23:59'
    data.openingHoursSpecification = {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    }
  } else if (hours) {
    data.openingHours = hours
  }

  let json = JSON.stringify(data)
  json = json.replace(/</g, '\\u003c')
  return json
}

/**
 * @param {string} tel
 * @returns {string}
 */
function formatTelForSchema(tel) {
  const d = String(tel || '').replace(/\D/g, '')
  if (d.length === 10) return `+1${d}`
  if (d.length === 11 && d.startsWith('1')) return `+${d}`
  return String(tel || '').trim()
}
