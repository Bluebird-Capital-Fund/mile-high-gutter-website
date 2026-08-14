/** Cities We Serve list — used on homepage, service pages, and location pages. */
export const SERVICE_AREA_CITIES = [
  { name: 'Colorado Springs', href: '/gutters-colorado-springs-co/' },
  { name: 'Fort Collins', href: '/gutters-fort-collins-co/' },
  { name: 'Boulder', href: '/gutters-boulder-co/' },
  { name: 'Centennial', href: '/gutters-centennial-co/' },
  { name: 'Thornton', href: '/gutters-thornton-co/' },
  { name: 'Littleton', href: '/gutters-littleton-co/' },
  { name: 'Arvada', href: '/gutters-arvada-co/' },
  { name: 'Highlands Ranch', href: '/gutters-highlands-ranch-co/' },
  { name: 'Castle Rock', href: '/gutters-castle-rock-co/' },
  { name: 'Broomfield', href: '/gutters-broomfield-co/' },
  { name: 'Lafayette', href: '/gutters-lafayette-co/' },
  { name: 'Brighton', href: '/gutters-brighton-co/' },
  { name: 'Westminster', href: '/gutters-westminster-co/' },
  { name: 'Englewood', href: '/gutters-englewood-co/' },
  { name: 'Aurora', href: '/gutters-aurora-co/' },
  { name: 'Lakewood', href: '/gutters-lakewood-co/' },
]

/**
 * @param {Record<string, unknown> | null | undefined} serviceArea
 */
export function withServiceAreaCities(serviceArea) {
  return {
    ...(serviceArea || {}),
    cities: SERVICE_AREA_CITIES,
  }
}
