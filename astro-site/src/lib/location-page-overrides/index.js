import { guttersColoradoSpringsCo } from './gutters-colorado-springs-co.js'
import { asStr } from '../sanity-strings.js'

const BY_SLUG = {
  [guttersColoradoSpringsCo.slug]: guttersColoradoSpringsCo,
}

/** Slugs that should always be available even if missing in Sanity. */
export const locationPageOverrideSlugs = Object.keys(BY_SLUG)

export function getLocationPageOverride(slug) {
  return BY_SLUG[asStr(slug)] || null
}
