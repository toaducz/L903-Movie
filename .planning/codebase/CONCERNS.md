# Codebase Concerns

**Analysis Date:** 2025-03-08

## Tech Debt

**API route imports:**
- Issue: Route Handlers dùng relative path (e.g. `../../../lib/supabaseClient`) thay vì alias `@/lib/...`
- Files: `src/app/api/auth/login/route.ts`, `src/app/api/favorite/route.ts`, …
- Impact: Dễ lỗi khi đổi cấu trúc thư mục; khó đọc
- Fix approach: Dùng `@/lib/supabaseClient`, `@/lib/auth-helper` trong toàn bộ `src/app/api/` (đảm bảo `tsconfig` paths áp dụng cho API routes)

**request() return null:**
- Issue: `src/utils/request.ts` trả về `T | null` khi fetch hoặc JSON parse lỗi; nhiều caller có thể không kiểm tra null
- Files: `src/utils/request.ts`; mọi nơi gọi `request()` (trong api/* queryFn)
- Impact: Runtime có thể dùng data null → lỗi khi render (e.g. `data.items` undefined)
- Fix approach: Luôn kiểm tra `data != null` trước khi dùng; hoặc throw trong queryFn và để TanStack Query set isError; hoặc chuẩn hóa response shape (e.g. `{ ok, data?, error? }`)

**Session setup repeated:**
- Issue: Mỗi Route Handler favorite/auth đều gọi `getSession(req)` (setSession từ cookie) trước khi getUserId
- Files: `src/app/api/favorite/route.ts`, `src/app/api/favorite/check/route.ts`
- Impact: Trùng code; nếu đổi cách set session phải sửa nhiều chỗ
- Fix approach: Tạo helper `withAuth(req, handler)` hoặc middleware trả về user_id và gọi handler(user_id); hoặc đặt setSession trong `getUserId`/auth-helper

## Known Bugs

- None explicitly documented trong code (không có TODO/FIXME trong `src/`)

## Security Considerations

**Proxy open redirect:**
- Area: `src/app/api/proxy/route.ts` nhận `url` từ query, fetch trực tiếp
- Risk: Có thể bị lợi dụng để proxy tới URL nội bộ (SSRF) hoặc trang độc hại nếu không whitelist
- Current mitigation: Chỉ dùng proxy từ client với URL đã biết (kkphim, nguonc) trong `request()`
- Recommendations: Whitelist host (phimapi.com, phim.nguonc.com) trong proxy; từ chối url không nằm trong whitelist

**Cookies:**
- Auth cookies đã httpOnly, secure trong production, path `/` — hợp lý
- Không lưu token vào localStorage (đúng theo CLAUDE)

**CSP:**
- Một số header CSP trong `next.config.ts` bị comment; chỉ X-Frame-Options, X-XSS-Protection, HSTS đang bật
- Có thể bật CSP chặt hơn khi đã ổn định nguồn script/style

## Performance Bottlenecks

**Player init:**
- Problem: `custom-player.tsx` load dynamic import (videojs-contrib-quality-levels, videojs-hls-quality-selector) mỗi lần mount player
- Files: `src/component/player/custom-player.tsx`
- Cause: Plugin đăng ký một lần (`__hlsQualityRegistered`) nhưng vẫn phải async import lần đầu
- Improvement path: Preload plugin ở layout hoặc lazy load trang xem phim để không block home

**Home page nhiều query:**
- Problem: Trang chủ chạy nhiều useQuery song song (update, phim-bo, phim-le, hoat-hinh)
- Files: `src/app/page.tsx`
- Cause: Nhiều request đồng thời; có thể chấp nhận nếu TanStack Query cache tốt
- Improvement path: Cân nhắc prefetch hoặc combine API nếu backend hỗ trợ; giữ hiện tại nếu đủ nhanh

## Fragile Areas

**Custom player:**
- Files: `src/component/player/custom-player.tsx`
- Why fragile: Logic dày (keyboard, fullscreen, orientation lock, ad region detect, HLS quality); phụ thuộc video.js internal (VHS, tech); type cast `as unknown as VHSTech`
- Safe modification: Tách handler (keyboard, fullscreen, ad skip) ra hook hoặc util; giữ type trong `src/types/` cho plugin
- Test coverage: Không có test; thay đổi dễ gây lỗi phát lại trên nhiều trình duyệt

**Mapping layer:**
- Files: `src/utils/mapping.ts` — map giữa API KKPhim/NguonC và format dùng trong app
- Why fragile: Nếu API bên ngoài đổi structure (field, nested object) mapping dễ vỡ
- Safe modification: Định nghĩa type rõ cho response từng nguồn; có thể thêm runtime check (Zod) khi cần ổn định

## Scaling Limits

**Proxy:**
- Current: Mọi request phim đi qua Next.js proxy → một server Vercel
- Limit: Rate limit hoặc timeout từ phimapi.com/nguonc; giới hạn concurrent của serverless
- Scaling path: Cache proxy response (CDN/Vercel Edge); hoặc backend riêng proxy + cache

**Supabase:**
- Favorites và auth phụ thuộc Supabase; plan free có giới hạn request/DB size
- Scaling: Nâng plan; tối ưu query (index, limit page size)

## Dependencies at Risk

- Không thấy dependency deprecated nghiêm trọng; `videojs-hls-quality-selector` là package community nhỏ — theo dõi compatibility với video.js 8.x khi nâng version

## Missing Critical Features

- **Test suite:** Không có test; refactor hoặc thêm tính năng dễ gây regression
- **Validation:** Body/query trong API không validate bằng schema (Zod/Vali); thiếu slug hoặc type sai có thể đưa lỗi xuống Supabase hoặc trả 500 không rõ

## Test Coverage Gaps

**Untested area:** Toàn bộ ứng dụng
- What's not tested: request(), mapping, auth flow, favorite CRUD, proxy, player logic, pages
- Files: `src/utils/request.ts`, `src/lib/auth-helper.ts`, `src/app/api/**/*.ts`, `src/component/player/custom-player.tsx`, `src/utils/mapping.ts`, toàn bộ `src/app/**/page.tsx`
- Risk: Lỗi CORS, cookie, Supabase, hoặc API thay đổi khó phát hiện
- Priority: High cho core (auth, favorite, proxy); Medium cho player và mapping

---

*Concerns audit: 2025-03-08*
