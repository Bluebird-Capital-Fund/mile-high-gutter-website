/**
 * Rotating hero typed lines for /lp/* pages (see public/script.js hero typewriter).
 * @param {'gutter-repair' | 'gutters' | 'gutter-installation' | 'gutter-guards'} slug
 * @returns {string[]}
 */
export function getLpHeroTypedPhrases(slug) {
  const map = {
    'gutter-repair': [
      'Sagging gutters pulling away from the fascia',
      'Leaks at seams, corners, and end caps',
      'Overflow and spillover in heavy rain',
      'Loose hangers and improper slope',
      'Hail, wind, and storm damage',
      'Water staining siding or foundation',
    ],
    gutters: [
      'Full-service Denver gutters',
      'Install, repair, cleaning, and guards',
      'Fast scheduling across the metro',
      'Clean job sites and careful workmanship',
      'Systems built for Colorado weather',
      'Residential and commercial projects',
    ],
    'gutter-installation': [
      'Seamless gutters cut to fit your roofline',
      'Correct pitch and secure fastening',
      'Downspouts placed for real drainage',
      'Colors and profiles that match your home',
      'New builds and existing homes',
      'Professional install, minimal disruption',
    ],
    'gutter-guards': [
      'Gutters clogged with leaves and needles',
      'Overflow from pine and seed debris',
      'Less time on a ladder every year',
      'Heavy rain that bypasses blocked runs',
      'Protection from pests and nesting',
      'Low-maintenance water management',
    ],
  }
  return map[slug] ?? []
}
