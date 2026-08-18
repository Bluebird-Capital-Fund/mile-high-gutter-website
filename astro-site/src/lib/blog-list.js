/**
 * Blog index: fetch all posts + pagination helpers (static /blog/ and /blog/page/N/).
 */

export const BLOG_POSTS_PER_PAGE = 9

const LIST_QUERY = `*[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
  "slug": slug.current,
  headline,
  lead,
  publishedAt,
  "metaTitle": meta.title,
  "metaDescription": meta.description,
  "thumb": contentSections[0].imageSrc,
  "thumbAlt": contentSections[0].imageAlt
}`

export async function fetchAllBlogPosts(sanity) {
  try {
    const rows = await sanity.fetch(LIST_QUERY)
    return Array.isArray(rows) ? rows : []
  } catch (err) {
    console.warn('[blog-list] Failed to fetch blog posts.', err)
    return []
  }
}

export function getBlogPagination(totalItems, perPage = BLOG_POSTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / perPage))
  return { totalPages, perPage }
}

export function sliceBlogPage(allPosts, page, perPage = BLOG_POSTS_PER_PAGE) {
  const p = Math.max(1, Math.floor(page) || 1)
  const start = (p - 1) * perPage
  return allPosts.slice(start, start + perPage)
}

export function excerpt(text, maxLen = 160) {
  const t = String(text || '').replace(/\s+/g, ' ').trim()
  if (!t || t.length <= maxLen) return t
  const sliced = t.slice(0, maxLen + 1)
  const lastSpace = sliced.lastIndexOf(' ')
  const cut = lastSpace > 80 ? sliced.slice(0, lastSpace) : t.slice(0, maxLen)
  return `${cut.replace(/[,;:.!?–—-]+$/g, '').trim()}…`
}

export function formatBlogDate(iso) {
  if (!iso || typeof iso !== 'string') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
