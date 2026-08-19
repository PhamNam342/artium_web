# Backend PR Checklist

> Checklist dùng để self-review Backend trước khi tạo Pull Request.

## 1. Controller

-   [ ] Không xử lý business logic trực tiếp trong Controller.
    -   Controller chủ yếu định tuyến, nhận request và gọi Service.
    -   Business logic cần đưa xuống Service.
-   [ ] Controller chỉ nên nhận `params`, `query`, `body`, gọi Service
    và trả response.
-   [ ] Nếu có nhiều logic format response, cân nhắc dùng Interceptor.
-   [ ] Không tạo/push Controller hoặc Service chưa được implement. Khi
    xử lý logic thì mới thêm.

## 2. Service & i18n

-   [ ] Business logic phải nằm trong Service.
-   [ ] Nếu project đã cấu hình i18n, các message trả về client phải có
    i18n.
-   [ ] Tránh lặp `I18nContext.current()!.t(...)`; nên tách thành
    utility `t(key, options)` để code gọn và thống nhất.
-   [ ] Kiểm tra các logic `findOne`, `findMany`, `create`, `update`,
    `delete` có xử lý đầy đủ trường hợp lỗi.

## 3. DTO & Validation

### Request DTO

-   [ ] `CreateDTO` phải có validation.
-   [ ] `UpdateDTO` phải có validation.
-   [ ] Config `ValidationPipe` với `whitelist` trong `main.ts`.
-   [ ] Không cho client gửi các field không mong muốn.

### Response DTO

-   [ ] Tạo `ResponseDTO` để format thuộc tính response.
-   [ ] Các API `findOne`, `findMany`, `create`, `update` cần
    ResponseDTO phù hợp.
-   [ ] Chỉ trả về các field client cần.
-   [ ] Không trả trực tiếp toàn bộ Entity nếu không cần.
-   [ ] Custom/transform field trong ResponseDTO nếu cần.

## 4. Attachments / File Upload

-   [ ] Sau khi có bảng `attachments`, kiểm tra và loại bỏ field `image`
    bị dư ở Entity/bảng khác nếu không còn cần.
-   [ ] Khi trả file từ `attachments`, trả về full URL có domain.
    -   Đúng: `https://example.com/uploads/avatar.jpg`
    -   Tránh: `/uploads/avatar.jpg`
-   [ ] Khi cập nhật file mới, xử lý soft delete attachment cũ nếu cần.
    -   Mục đích: sau này có thể chạy job định kỳ để xóa file không còn
        sử dụng và clean disk.
-   [ ] Đưa các option/config dùng chung của File Interceptor vào
    `utils` hoặc config riêng.
-   [ ] Thêm `public/uploads/` vào `.gitignore`.
-   [ ] Không push các file upload/data local lên Git.

## 5. Transaction

-   [ ] Với logic `create/update/delete` có từ 2 thao tác ghi DB trở
    lên, phải xem xét sử dụng transaction.
-   [ ] Các thao tác cần tính gồm `INSERT`, `UPDATE`, `DELETE`,
    `SOFT DELETE`.
-   [ ] Đảm bảo nếu một thao tác thất bại thì dữ liệu không bị lưu ở
    trạng thái dở dang.

## 6. Query & Performance

-   [ ] Các API `findMany`, list, multiple... phải kiểm tra N+1 Query.
-   [ ] Xem SQL logs ở môi trường development khi implement.
-   [ ] Nếu có query lặp lại theo từng record, kiểm tra lại cách load
    relation/query.
-   [ ] Cân nhắc `relations`, `JOIN`, `QueryBuilder` hoặc batch query
    tùy trường hợp.

## 7. TypeORM & Migration

### Generate Migration

-   [ ] Ưu tiên dùng TypeORM để auto-generate migration dựa trên thay
    đổi giữa Entity và Database schema.
-   [ ] Sau khi thay đổi Entity, generate migration và review file được
    tạo.
-   [ ] Luôn kiểm tra `up()` và `down()` trước khi chạy migration.
-   [ ] Không chạy migration auto-generated một cách mù quáng.

### Migration Consistency

-   [ ] Migration phải đồng bộ với Entity.
-   [ ] Không để trường hợp migration chưa từng tạo bảng/column nhưng
    migration sau đã `DROP`.
-   [ ] Kiểm tra thứ tự migration.
-   [ ] Kiểm tra migration có phụ thuộc vào migration chưa được merge
    hay không.

### Khi Migration Bị Lệch

1.  Reset database development/local về rỗng.
2.  Apply toàn bộ migration đã được merge.
3.  Kiểm tra database schema.
4.  Generate lại migration dựa trên Entity hiện tại.
5.  Review migration vừa generate.
6.  Chạy migration.
7.  Kiểm tra lại database.

> Không áp dụng việc reset database này cho production.

## 8. Git / Pull Request

### Trước khi tạo PR

-   [ ] Cập nhật code mới nhất từ `main`.
-   [ ] Không commit file upload local, file tạm, data local hoặc file
    không liên quan.
-   [ ] Chạy lint.
-   [ ] Chạy build.
-   [ ] Test API liên quan.
-   [ ] Kiểm tra migration.

### PR phụ thuộc PR trước

Nếu PR hiện tại được phát triển dựa trên PR trước chưa merge:

-   [ ] Gom các commit của PR hiện tại thành 1 commit nếu team yêu cầu
    để dễ review.
-   [ ] Có thể giữ commit của các PR trước + 1 commit của PR hiện tại.

Ví dụ:

``` text
commit PR 1
commit PR 2
commit PR 3  ← commit của PR hiện tại
```

-   [ ] Sau khi PR trước được merge, rebase branch của PR tiếp theo lên
    `main` mới nhất.

``` bash
git checkout main
git pull origin main

git checkout feature/current
git rebase main
```

-   [ ] Sau rebase, kiểm tra lại conflict, migration, build, lint và
    API.

## 9. Final Self-Review

-   [ ] Controller không chứa business logic.
-   [ ] Business logic nằm trong Service.
-   [ ] Message trả client có i18n.
-   [ ] Create/Update DTO có validation.
-   [ ] `ValidationPipe` có `whitelist`.
-   [ ] API có ResponseDTO phù hợp.
-   [ ] Không expose field không cần thiết.
-   [ ] File/attachment trả về full URL.
-   [ ] Attachment cũ được soft delete khi cần.
-   [ ] `public/uploads/` nằm trong `.gitignore`.
-   [ ] Logic có từ 2 DB write operations trở lên đã dùng/xem xét
    transaction.
-   [ ] `findMany` không bị N+1 Query.
-   [ ] Đã kiểm tra SQL logs khi cần.
-   [ ] Entity và Migration đồng bộ.
-   [ ] Migration được generate bằng TypeORM khi phù hợp.
-   [ ] Đã review `up()` / `down()` của migration.
-   [ ] Branch đã cập nhật/rebase từ `main`.
-   [ ] Commit history sạch, dễ review.
-   [ ] Không push code chưa implement.
-   [ ] Lint pass.
-   [ ] Build pass.
-   [ ] API đã được test.
