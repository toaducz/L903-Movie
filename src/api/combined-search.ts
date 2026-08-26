// ─────────────────────────────────────────────────────────────────────────────
// combined-search.ts — thin wrapper, delegates to movie-service
// ─────────────────────────────────────────────────────────────────────────────

export type { CombinedSearchResult, MovieItem as CombinedMovie } from '@/types/movie'
export { getCombinedSearch as getSearchCombined } from '@/services/movie-service'
