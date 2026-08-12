import { gutterReplacementDenverCo } from './gutter-replacement-denver-co.js'
import { gutterRepairDenverCo } from './gutter-repair-denver-co.js'
import { gutterCleaningDenverCo } from './gutter-cleaning-denver-co.js'
import { asStr } from '../sanity-strings.js'

const BY_SLUG = {
  [gutterReplacementDenverCo.slug]: gutterReplacementDenverCo,
  [gutterRepairDenverCo.slug]: gutterRepairDenverCo,
  [gutterCleaningDenverCo.slug]: gutterCleaningDenverCo,
}

export function getCityServiceOverride(slug) {
  return BY_SLUG[asStr(slug)] || null
}
