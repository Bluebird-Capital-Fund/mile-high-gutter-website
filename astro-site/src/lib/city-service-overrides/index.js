import { gutterReplacementDenverCo } from './gutter-replacement-denver-co.js'
import { asStr } from '../sanity-strings.js'

const BY_SLUG = {
  [gutterReplacementDenverCo.slug]: gutterReplacementDenverCo,
}

export function getCityServiceOverride(slug) {
  return BY_SLUG[asStr(slug)] || null
}
