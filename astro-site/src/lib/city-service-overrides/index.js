import { gutterReplacementDenverCo } from './gutter-replacement-denver-co.js'
import { gutterRepairDenverCo } from './gutter-repair-denver-co.js'
import { gutterCleaningDenverCo } from './gutter-cleaning-denver-co.js'
import { gutterMaintenanceDenverCo } from './gutter-maintenance-denver-co.js'
import { gutterInstallationDenverCo } from './gutter-installation-denver-co.js'
import { seamlessGutterDenverCo } from './seamless-gutter-denver-co.js'
import { asStr } from '../sanity-strings.js'

const BY_SLUG = {
  [gutterReplacementDenverCo.slug]: gutterReplacementDenverCo,
  [gutterRepairDenverCo.slug]: gutterRepairDenverCo,
  [gutterCleaningDenverCo.slug]: gutterCleaningDenverCo,
  [gutterMaintenanceDenverCo.slug]: gutterMaintenanceDenverCo,
  [gutterInstallationDenverCo.slug]: gutterInstallationDenverCo,
  [seamlessGutterDenverCo.slug]: seamlessGutterDenverCo,
}

/** Slugs that should always be available even if missing/renamed in Sanity. */
export const cityServiceOverrideSlugs = Object.keys(BY_SLUG)

export function getCityServiceOverride(slug) {
  return BY_SLUG[asStr(slug)] || null
}
