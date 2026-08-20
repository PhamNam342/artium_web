# Artium Backend - Setup & Guidelines

Tài liệu này hướng dẫn chi tiết cách thức dự án NestJS được cấu trúc, setup hạ tầng và cách chạy.

## 1. Cấu trúc thư mục (Architecture)

```text
artium_web/
├── docker-compose.yml       # Khởi chạy các dịch vụ phụ thuộc (Redis)
├── .github/workflows/ci.yml # Cấu hình GitHub Actions (CI/CD pipeline)
└── backend/
    ├── .env                 # Biến môi trường kết nối DB, Redis, v.v.
    ├── Dockerfile           # Kịch bản đóng gói ứng dụng để đưa lên Cloud
    ├── src/
    │   ├── config/          # Cấu hình độc lập (VD: typeorm.config.ts)
    │   ├── database/        # Các thao tác về database (entities, migrations)
    │   ├── app.module.ts    # Nơi khởi tạo DB, Cache và ghép nối các module
    │   ├── main.ts          # Điểm vào của HTTP Server
    │   └── seed.ts          # Điểm vào của hệ thống Seeder (chạy qua CLI)
```

## 2. Các Công nghệ & Hạ tầng sử dụng
- **PostgreSQL**: Được sử dụng làm cơ sở dữ liệu chính thông qua TypeORM. (Lưu ý: Không dùng `synchronize: true` trên môi trường thực tế, phải dùng Migration).
- **Redis**: Chạy qua Docker. Dùng để làm hệ thống Cache tạm thời (ví dụ: Lưu mã OTP hết hạn sau 5 phút).
- **TypeORM**: Object-Relational Mapper.
- **Seeder**: Sử dụng công cụ Context của NestJS (file `seed.ts`) để gọi thẳng các class/service chèn dữ liệu gốc.
- **GitHub Actions**: Tự động kiểm tra lỗi (Linting) và đóng gói Docker Image khi code được push lên nhánh `main`.

## 3. Hướng dẫn chạy dự án (Local)

### Bước 1: Khởi động Redis
Đảm bảo bạn đã cài Docker. Từ thư mục gốc (`artium_web`), chạy lệnh:
```bash
docker-compose up -d
```
Lệnh này sẽ kéo Redis về và chạy ngầm ở cổng `6379`.

### Bước 2: Cài đặt Dependencies & Cấu hình
Di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```
Sau đó đảm bảo bạn đã điền thông tin Database PostgreSQL của bạn vào file `backend/.env`.

### Bước 3: Tạo Bảng (Migrations)
Vì chúng ta đã tắt `synchronize`, hãy dùng script migration để tạo bảng `users`:
```bash
# Tạo file migration dựa trên entity hiện tại
npm run migration:generate

# Đẩy schema từ file migration vào database
npm run migration:run
```

### Bước 4: Chạy Seeder tạo tài khoản Admin
Đổ dữ liệu mẫu (ví dụ: tài khoản Admin mặc định) vào DB:
```bash
npm run seed
```

### Bước 5: Chạy HTTP Server
Bật server để nhận API request:
```bash
npm run start:dev
```
Server sẽ chạy ở `http://localhost:3000`.

## 4. Quy trình Deploy lên Cloud
Nhờ có `Dockerfile` và `ci.yml`, quy trình deploy rất đơn giản:
1. Bạn push code lên GitHub. GitHub Actions sẽ tự động Build Docker Image (kiểm tra ở mục Actions trên Github repo).
2. Trỏ hệ thống server của bạn (Render, Railway, VPS, EC2,...) tới Image đó. Cung cấp cho server các biến `.env` môi trường thực tế (Postgres Cloud, Redis Cloud).
3. Server sẽ tự động start thông qua lệnh `node dist/main`.
## Luồng hoạt động
```text
REGISTER
────────────────────────────────────────────

POST /auth/register/initiate
        │
        ├── check email tồn tại
        ├── hash password
        ├── generate OTP
        ├── Redis Cache:
        │      otp:{email} → OTP
        │      pwd:{email} → hashed password
        │      TTL = 5 phút
        │
        └── gửi OTP qua email

POST /auth/register/complete
        │
        ├── lấy otp:{email}
        ├── kiểm tra OTP
        ├── lấy pwd:{email}
        ├── tạo User
        ├── xóa OTP + password khỏi Redis
        └── generate JWT
                  │
                  └── trả access_token


LOGIN EMAIL/PASSWORD
────────────────────────────────────────────

POST /auth/login
        │
        ├── tìm User bằng email
        ├── bcrypt.compare()
        └── generate JWT
                  │
                  └── trả access_token


LOGIN GOOGLE
────────────────────────────────────────────

POST /auth/google
        │
        ├── verify Google ID token
        ├── lấy email + googleId
        ├── tìm user
        ├── nếu chưa có → tạo user
        └── generate JWT
                  │
                  └── trả access_token


LOGOUT
────────────────────────────────────────────

POST /auth/logout
Authorization: Bearer <JWT>
        │
        ▼
JwtAuthGuard
        │
        ▼
JwtStrategy
        │
        ├── verify JWT signature
        ├── check expiration
        └── check Redis revoked:{jti}
        │
        ▼
AuthService.logout()
        │
        └── Redis:
             auth:revoked:{jti}
                  TTL = thời gian còn lại của JWT
```
