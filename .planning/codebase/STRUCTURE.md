# Codebase Structure

**Analysis Date:** 2026-08-26 (Updated)

## Directory Layout

```
L903-Movie/
├── src/
│   ├── api/              # Low-level API queryOptions + types (KKPhim, OPhim, NguonC)
│   ├── app/              # App Router: layouts, pages, API routes
│   │   ├── api/          # Route Handlers: proxy, auth, favorite, review, notifications, recommendations
│   │   ├── auth-provider.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── provider.tsx
│   │   ├── detail-movie/[slug]/
│   │   ├── search/, list-movie/, all-movie/, login/, profile/, nguonc/, ophim/, kkphim/
│   │   └── error.tsx, not-found.tsx
│   ├── component/        # Reusable UI (navbar, footer, player, sections, item, status, pagination, filter, …)
│   │   ├── sections/     # hero, series-row, movies-row, anime-row, continue-watching, mood
│   │   ├── item/         # movie-item, movie-rank-item, profile-movie-items
│   │   └── player/       # custom-player (video.js, hls quality, subtitles)
│   ├── lib/              # Supabase client, auth-helper (server)
│   ├── page/             # Page-level client components (search-result, movie-list, all-movie, …)
│   ├── services/         # Unified Movie Service Adapter (movie-service.ts)
│   ├── types/            # Unified movie types (MovieItem, MovieDetail, MovieSource, ...) & declarations
│   └── utils/            # request (direct + proxy fallback), env, mapping, common, local-storage
├── public/               # Static assets
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── .prettierrc.js
└── package.json
```

## Directory Purposes

**`src/services/`:**
- Purpose: Tầng Unified Adapter kết nối UI với các nguồn phim (KKPhim, OPhim, NguonC).
- Key files: `src/services/movie-service.ts`

**`src/types/`:**
- Purpose: Khai báo types chung cho toàn hệ thống (`MovieItem`, `MovieDetail`, `MovieListResult`, `CombinedSearchResult`, `MovieSource`).
- Key files: `src/types/movie.ts`

**`src/api/`:**
- Purpose: Tầng gọi API mức thấp (low-level) riêng cho từng nguồn
- Subfolders: `kkphim/`, `ophim/`, `nguonc/`

**`src/app/`:**
- Purpose: Routes (pages + layouts) và BFF (api/)
- Key files: `src/app/page.tsx` (Trang chủ), `src/app/detail-movie/[slug]/page.tsx`, `src/app/api/proxy/route.ts`

**`src/component/`:**
- Purpose: Component UI tái sử dụng
- Subfolders: `sections/`, `item/`, `player/`, `layout/`, `interactive/`, `filter/`, `status/`

**`src/utils/`:**
- Purpose: HTTP client (`request.ts`), hằng số môi trường (`env.ts`), xử lý ảnh và mapping (`common.ts`, `mapping.ts`), localStorage (`local-storage.ts`).

---

*Structure analysis updated: 2026-08-26*
