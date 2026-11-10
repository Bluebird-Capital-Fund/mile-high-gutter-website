/** Public review count used in customer-facing UI. */
export const CANONICAL_REVIEW_COUNT_DISPLAY = '200+'
export const CANONICAL_REVIEW_RATING_DISPLAY = '4.8'

/**
 * Always show the public review count so a stale CMS number cannot ship.
 */
export function reviewCountDisplay() {
  return CANONICAL_REVIEW_COUNT_DISPLAY
}
