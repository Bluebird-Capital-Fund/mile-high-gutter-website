import { guttersColoradoSpringsCo } from './gutters-colorado-springs-co.js'
import { guttersFortCollinsCo } from './gutters-fort-collins-co.js'
import { guttersBoulderCo } from './gutters-boulder-co.js'
import { guttersCentennialCo } from './gutters-centennial-co.js'
import { asStr } from '../sanity-strings.js'

const BY_SLUG = {
  [guttersColoradoSpringsCo.slug]: guttersColoradoSpringsCo,
  [guttersFortCollinsCo.slug]: guttersFortCollinsCo,
  [guttersBoulderCo.slug]: guttersBoulderCo,
  [guttersCentennialCo.slug]: guttersCentennialCo,
}

/** Slugs that should always be available even if missing in Sanity. */
export const locationPageOverrideSlugs = Object.keys(BY_SLUG)

export function getLocationPageOverride(slug) {
  return BY_SLUG[asStr(slug)] || null
}
