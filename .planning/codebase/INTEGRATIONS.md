# External Integrations

**Analysis Date:** 2026-08-26 (Updated)

## APIs & External Services

**Movie aggregation (Multi-source):**
- **KKPhim (`https://phimapi.com/`)** — Nguồn phim chính mặc định (`NEXT_PUBLIC_DEFAULT_SOURCE=kkphim`).
  - Cung cấp: Phim mới cập nhật v3, danh sách phim bộ/lẻ/hoạt hình, chi tiết phim + server m3u8, thể loại, quốc gia, năm, tìm kiếm.
  - Ảnh CDN: `https://phimimg.com/` (hỗ trợ `remotePatterns` trong `next.config.ts`).
  - Quy ước ảnh: `poster_url` = ảnh dọc (2:3), `thumb_url` = ảnh ngang (16:9).
  - CORS: Hỗ trợ `Access-Control-Allow-Origin: *` cho phép client gọi trực tiếp.

- **OPhim (`https://ophim1.com/v1/api/`, `https://img.ophim.live/`)** — Nguồn phim phụ trợ.
  - Cung cấp dữ liệu bổ sung và tìm kiếm song song cho `getCombinedSearch`.
  - Ảnh CDN: `https://img.ophim.live/uploads/movies/`.

- **NguonC (`https://phim.nguonc.com/`)** — Nguồn phim phụ trợ độc lập.
  - Route riêng: `/nguonc/home`, `/nguonc/search`, `/nguonc/detail-movie/[slug]`.
  - CORS: Hỗ trợ `Access-Control-Allow-Origin: *` cho phép client gọi trực tiếp, giải quyết triệt để lỗi 403 do Cloudflare WAF chặn IP Datacenter của Vercel.

**Auth & DB:**
- **Supabase** — auth + PostgreSQL
  - Client: `src/lib/supabaseClient.ts` (singleton, `persistSession: false`)
  - Auth: signInWithPassword, cookies `sb-access-token` (7d), `sb-refresh-token` (30d)
  - Bảng: `favorite`, `movie_tracking`, `user_notifications`, `movie_reviews`
  - RPC: `notify_movie_updates` (fan-out notification khi có phim mới)

## Data Storage & Caching

**Caching:**
- TanStack Query (in-memory, client): tiền tố queryKey `movie-service-v3`.
- Watch history: localStorage (30-day TTL, max 50 entries) — `src/utils/local-storage.ts`

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_DEFAULT_SOURCE` — Nguồn phim chính (`kkphim` | `ophim` | `nguonc`, mặc định là `kkphim`).
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service key (cho admin/cron actions).

---

*Integration audit updated: 2026-08-26*
