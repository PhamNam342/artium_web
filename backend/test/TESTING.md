# Testing Guide — Artium Backend

Hướng dẫn setup và chạy toàn bộ test suite cho backend.

---

## Mục lục

- [Yêu cầu](#yêu-cầu)
- [Setup](#setup)
  - [1. Cài dependencies](#1-cài-dependencies)
  - [2. Khởi động PostgreSQL](#2-khởi-động-postgresql)
  - [3. Tạo test database](#3-tạo-test-database)
  - [4. Cấu hình biến môi trường](#4-cấu-hình-biến-môi-trường)
  - [5. Chạy migration cho test database](#5-chạy-migration-cho-test-database)
- [Chạy test](#chạy-test)
  - [Unit tests](#unit-tests)
  - [E2E tests](#e2e-tests)
  - [Chạy tất cả](#chạy-tất-cả)
- [Cấu trúc thư mục test](#cấu-trúc-thư-mục-test)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## Yêu cầu

| Tool       | Phiên bản tối thiểu | Ghi chú                          |
| ---------- | -------------------- | -------------------------------- |
| Node.js    | 18+                  |                                  |
| npm        | 9+                   |                                  |
| PostgreSQL | 16+                  | Chạy qua Docker hoặc cài native |
| Docker     | 24+                  | Nếu dùng Docker cho Postgres     |

---

## Setup

### 1. Cài dependencies

```bash
cd backend
npm install
```

### 2. Khởi động PostgreSQL

PostgreSQL cần chạy trên `localhost:5432`. Nếu đang dùng Docker container `artium_postgres`:

```bash
# Kiểm tra container đang chạy
docker ps | grep postgres

# Nếu chưa chạy, start lại
docker start artium_postgres
```

### 3. Tạo test database

E2E tests sử dụng database riêng tên **`artium_test`** để không ảnh hưởng dữ liệu development.

```bash
# Tạo database (chạy 1 lần duy nhất)
docker exec artium_postgres psql -U postgres -c "CREATE DATABASE artium_test;"
```

Kiểm tra database đã tồn tại:

```bash
docker exec artium_postgres psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='artium_test';"
```

### 4. Cấu hình biến môi trường

Tạo file `backend/.env.test` từ file mẫu:

```bash
cp .env.test.example .env.test
```

Nội dung file `.env.test`:

```env
# Dedicated database for integration tests.
# ⚠️ KHÔNG BAO GIỜ trỏ đến database development hoặc production.
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_USER=postgres
TEST_DB_PASSWORD=postgres
TEST_DB_NAME=artium_test
```

> **Lưu ý**: Đảm bảo `TEST_DB_PASSWORD` khớp với password của PostgreSQL container.

### 5. Chạy migration cho test database

Migration tạo các bảng cần thiết trong `artium_test`:

```bash
NODE_ENV=test npm run migration:run
```

Kết quả mong đợi: các dòng `Migration ... has been executed successfully.` hoặc `No migrations are pending` (nếu đã chạy trước đó).

> **Lưu ý**: Mỗi khi có migration mới (ví dụ sau khi pull code), cần chạy lại lệnh này.

---

## Chạy test

### Unit tests

Unit tests **không cần database** — tất cả dependencies đều được mock.

```bash
# Chạy tất cả unit tests
npm test

# Chạy tuần tự (debug dễ hơn)
npm test -- --runInBand

# Chạy 1 file cụ thể
npm test -- --runInBand src/modules/artworks/artworks.service.spec.ts

# Chạy với watch mode (tự chạy lại khi code thay đổi)
npm run test:watch

# Chạy với coverage report
npm run test:cov
```

### E2E tests

E2E tests **cần database `artium_test`** đã được migration (xem [Setup](#setup)).

```bash
# Chạy tất cả E2E tests
npm run test:e2e -- --runInBand

# Chạy 1 file E2E cụ thể
npm run test:e2e -- --runInBand test/artworks-top-picks.e2e-spec.ts

# Chạy top-picks E2E (tự động chạy migration trước)
npm run test:top-picks:e2e
```

| Script                   | Migration tự động | Test files                          |
| ------------------------ | :---------------: | ----------------------------------- |
| `npm run test:e2e`       |        ❌         | Tất cả `*.e2e-spec.ts`             |
| `npm run test:top-picks:e2e` |    ✅         | Chỉ `artworks-top-picks.e2e-spec.ts` |

> **Tip**: Nếu gặp lỗi `relation "..." does not exist`, hãy chạy `NODE_ENV=test npm run migration:run` trước.

### Chạy tất cả

```bash
# Unit tests + E2E tests
npm test -- --runInBand && npm run test:e2e -- --runInBand
```

---

## Cấu trúc thư mục test

```
backend/
├── src/
│   ├── **/*.spec.ts              ← Unit tests (cạnh file source)
│   └── ...
├── test/
│   ├── jest-e2e.json             ← Jest config cho tất cả E2E tests
│   ├── jest-top-picks-e2e.json   ← Jest config riêng cho top-picks E2E
│   ├── e2e-helpers.ts            ← Shared utilities cho E2E tests
│   ├── artworks.e2e-spec.ts      ← E2E: Artworks CRUD
│   ├── artworks-top-picks.e2e-spec.ts ← E2E: Artworks top-picks sorting
│   ├── auth-users.e2e-spec.ts    ← E2E: Authentication & Users
│   ├── community.e2e-spec.ts     ← E2E: Likes, Comments, Follows
│   └── orders-notifications.e2e-spec.ts ← E2E: Orders & Notifications
├── .env.test                     ← Biến môi trường cho test database
└── .env.test.example             ← File mẫu
```

---

## Xử lý lỗi thường gặp

### `Entity metadata for X#Y was not found`

**Nguyên nhân**: Entity có relation (`@OneToOne`, `@ManyToOne`, ...) đến entity khác nhưng entity đó chưa được đăng ký trong `entities` array của TypeORM module trong test.

**Cách fix**: Thêm entity bị thiếu vào `entities` trong test module. Ví dụ:

```typescript
TypeOrmModule.forRoot({
  ...getTestDatabaseOptions(),
  entities: [Artwork, ArtworkFolder, ArtworkLike, SellerProfile, Tag, User],
  //         ↑ tất cả entity liên quan đều phải có mặt
});
```

### `relation "..." does not exist`

**Nguyên nhân**: Bảng chưa được tạo trong test database.

**Cách fix**:

```bash
NODE_ENV=test npm run migration:run
```

### `ECONNREFUSED 127.0.0.1:5432`

**Nguyên nhân**: PostgreSQL chưa chạy.

**Cách fix**:

```bash
docker start artium_postgres
```

### `JSONError: Bad escaped character in JSON`

**Nguyên nhân**: File Jest config JSON có ký tự escape không hợp lệ (ví dụ `\.` thay vì `\\.`).

**Cách fix**: Trong JSON string, backslash phải được escape thành `\\`. Ví dụ regex:

```json
{
  "testRegex": "artworks-top-picks\\.e2e-spec\\.ts$"
}
```

### `Exceeded timeout of 5000 ms for a hook`

**Nguyên nhân**: `beforeAll` hook không hoàn thành kịp (thường do lỗi kết nối database kéo dài retry).

**Cách fix**: Kiểm tra lại database connection (xem các lỗi ở trên). Đây thường là hậu quả của lỗi khác, không phải lỗi gốc.

### Jest did not exit

**Nguyên nhân**: Có async operations chưa dọn dẹp (thường do TypeORM retry kết nối).

**Cách fix**: Đảm bảo `afterAll` gọi `await app?.close()` để đóng tất cả connections. Dùng `--detectOpenHandles` để debug:

```bash
npm run test:e2e -- --runInBand --detectOpenHandles test/artworks.e2e-spec.ts
```
