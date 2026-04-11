# Testing Patterns

**Analysis Date:** 2025-03-08

## Test Framework

**Runner:** Not detected

**Assertion Library:** Not detected

**Run Commands:** None (CLAUDE.md ghi rõ: "No testing framework configured")

**Config:** No `jest.config.*`, `vitest.config.*`, or test script in `package.json`

## Test File Organization

**Location:** Not applicable — không có test file trong repo

**Naming:** N/A

**Structure:** N/A

## Test Structure

**Suite Organization:** N/A

**Patterns:** N/A

## Mocking

**Framework:** Not used

**Patterns:** N/A

**What to Mock:** N/A

**What NOT to Mock:** N/A

## Fixtures and Factories

**Test Data:** Not used

**Location:** N/A

## Coverage

**Requirements:** None enforced

**View Coverage:** N/A

## Test Types

**Unit Tests:** Not present

**Integration Tests:** Not present

**E2E Tests:** Not used

## Recommendations for Future Testing

Nếu bổ sung test sau này, nên:

- **Unit:** Utils (`request`, `mapping`, `local-storage`) và pure functions — dùng Jest hoặc Vitest; mock `fetch` cho `request()`
- **Component:** React Query + component cần wrapper `QueryClientProvider`; mock `useRouter` / `useParams` khi cần
- **Route Handlers:** Test `GET/POST/DELETE` qua `next/server` test helpers hoặc request to local route; mock Supabase client
- **E2E (tùy chọn):** Playwright/Cypress cho luồng login, xem phim, favorite; cần env test hoặc mock Supabase

Đặt test:
- Co-located: `*.test.ts(x)` / `*.spec.ts(x)` cạnh file, hoặc
- Tập trung: e.g. `src/__tests__/` / `tests/` tùy quy ước dự án

---

*Testing analysis: 2025-03-08*
