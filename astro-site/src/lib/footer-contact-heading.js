/** True when a Sanity footer column heading should show phone / address rows. */
export function isContactFooterColumnHeading(heading) {
  const h = String(heading || '').toLowerCase()
  return h.includes('contact') || h.includes('get in touch') || /\breach us\b/.test(h)
}

/** Google Maps / Business Profile URL from Site settings → Business listings → googleMaps */
export function googleBusinessProfileUrl(settings) {
  const u = settings?.businessListings?.googleMaps
  return typeof u === 'string' && u.trim() ? u.trim() : ''
}
