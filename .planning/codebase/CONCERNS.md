# Codebase Concerns

**Analysis Date:** 2026-08-26 (Updated)

## Tech Debt & Improvements

**Unified Movie Service Adapter (`src/services/movie-service.ts`):**
- Đã giải quyết: Tách biệt hoàn toàn UI khỏi API thô của từng nhà cung cấp. UI components chỉ giao tiếp qua `movie-service.ts`.
- Chuyển đổi nguồn chính linh hoạt qua biến môi trường `NEXT_PUBLIC_DEFAULT_SOURCE` (`kkphim` | `ophim` | `nguonc`).

**CORS & Cloudflare WAF Bypass:**
- Đã giải quyết: `src/utils/request.ts` gọi trực tiếp `fetch(fullUrl)` từ Client-side đối với các API có header CORS (`Access-Control-Allow-Origin: *` như `phim.nguonc.com`, `phimapi.com`), sử dụng IP dân cư của người dùng để tránh bị Cloudflare chặn HTTP 403 do IP Datacenter của Vercel.

**Chuẩn hóa hiển thị hình ảnh (Image Orientation):**
- Đã giải quyết: Khắc phục triệt để tình trạng ngược ảnh poster/thumb.
  - `poster_url`: Luôn luôn là ảnh dọc (Portrait 2:3).
  - `thumb_url`: Luôn luôn là ảnh ngang (Landscape 16:9 / Backdrop).
  - Đã cấu hình `remotePatterns` trong `next.config.ts` cho các domain `phimimg.com`, `img.ophim.live`, `ophim1.com`, `phim.nguonc.com`.
  - Loại bỏ hoàn toàn proxy bên thứ ba không ổn định (`wsrv.nl`).

## Performance & Caching

**TanStack Query Invalidation:**
- Đã nâng cấp tiền tố `queryKey` sang `movie-service-v3` để đảm bảo làm mới toàn bộ cache cũ trên trình duyệt người dùng.
- Giảm `staleTime` tìm kiếm xuống 30s để kết quả tìm kiếm luôn cập nhật tức thì.

---

*Concerns audit updated: 2026-08-26*
