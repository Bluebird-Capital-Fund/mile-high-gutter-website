/** Cities We Serve — used on homepage, service pages, and location pages. */
export const SERVICE_AREA_INTRO =
  'We serve residential and commercial properties throughout the Denver metro, including gutters in Colorado Springs, Fort Collins, Boulder, Centennial, Thornton, Littleton, Arvada, Highlands Ranch, Castle Rock, Broomfield, Lafayette, Brighton, Westminster, Englewood, Aurora, and Lakewood.'

/** Homepage-only: same intro with an internal link on "gutters in Colorado Springs". */
export const SERVICE_AREA_INTRO_HOME_HTML = SERVICE_AREA_INTRO.replace(
  'gutters in Colorado Springs',
  '<a href="/gutters-colorado-springs-co/">gutters in Colorado Springs</a>',
)

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
