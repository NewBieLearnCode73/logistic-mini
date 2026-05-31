# Hướng Dẫn Thiết Lập & Khởi Tạo Dữ Liệu Database (PostgreSQL)

Tài liệu này hướng dẫn chi tiết cách cấu hình, tạo mới cơ sở dữ liệu và chạy tập lệnh SQL để chèn các dữ liệu nền ban đầu (Roles & Admin accounts) cho dự án **Mini-Logistic**.

---

## 1. Cấu Hình Biến Môi Trường

Kiểm tra và cấu hình các thông số kết nối cơ sở dữ liệu trong file `.env` ở thư mục gốc của Backend (`/BE/.env`):

```ini
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=admin       # Thay đổi theo username Postgres của bạn
DB_PASSWORD=admin       # Thay đổi theo password Postgres của bạn
DB_DATABASE=mini_logistic  # Tên database muốn tạo/kết nối
DB_SYNCHRONIZE=true
JWT_SECRET=super-secret-key-12345
JWT_EXPIRES_IN=24h
```

---

## 2. Tạo Cơ Sở Dữ Liệu (Create Database)

Nếu bạn vừa mới cài đặt PostgreSQL hoặc chưa tạo database có tên trùng với `DB_DATABASE` trong file `.env` (ví dụ `mini_logistic` hoặc `logistic-mini`), hãy mở terminal của bạn hoặc bất kỳ công cụ quản lý cơ sở dữ liệu nào (pgAdmin, DBeaver, TablePlus,...) và chạy lệnh:

```sql
CREATE DATABASE mini_logistic;
```
*(Nếu bạn cấu hình `DB_DATABASE=logistic-mini`, hãy thay đổi câu lệnh tương ứng thành `CREATE DATABASE "logistic-mini";`)*

---

## 3. Khởi Chạy Ứng Dụng Để Tự Động Tạo Bảng

Hệ thống sử dụng TypeORM với cấu hình `DB_SYNCHRONIZE=true` (trong môi trường phát triển). Vì vậy, bạn chỉ cần khởi chạy ứng dụng lần đầu, TypeORM sẽ tự động quét qua các Entities và tạo đầy đủ cấu trúc các bảng trong cơ sở dữ liệu cho bạn.

Chạy lệnh sau tại thư mục `/BE`:

```bash
npm run start:dev
```

---

## 4. Chạy Script SQL Khởi Tạo Dữ Liệu (Seed Data)

Sau khi các bảng đã được sinh ra thành công, bạn kết nối vào cơ sở dữ liệu và chạy đoạn mã SQL dưới đây để thêm **5 vai trò (Roles) mặc định** và **2 tài khoản Admin quản trị ban đầu**:

```sql
-- ==========================================
-- 1. CHÈN VAI TRÒ (ROLES) MẶC ĐỊNH
-- ==========================================
INSERT INTO roles (id, name, description, created_at)
VALUES 
  ('d3000000-0000-0000-0000-000000000001', 'Admin', 'Quyền quản trị tối cao của hệ thống chuỗi cung ứng', NOW()),
  ('d3000000-0000-0000-0000-000000000002', 'Manufacturer', 'Quyền dành cho nhà máy sản xuất và đóng gói lô sản phẩm', NOW()),
  ('d3000000-0000-0000-0000-000000000003', 'Distributor', 'Quyền của trung tâm/nhà phân phối vận tải logistics', NOW()),
  ('d3000000-0000-0000-0000-000000000004', 'Retailer', 'Quyền bán lẻ trực tiếp tới tay người tiêu dùng cuối', NOW()),
  ('d3000000-0000-0000-0000-000000000005', 'Consumer', 'Quyền của khách hàng cuối cùng để truy vết sản phẩm', NOW())
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- ==========================================
-- 2. CHÈN 2 TÀI KHOẢN ADMIN BAN ĐẦU (MẬT KHẨU: password123)
-- ==========================================
INSERT INTO users (id, email, password_hash, full_name, node_id, is_active, version, created_at, updated_at)
VALUES 
  (
    'a3000000-0000-0000-0000-000000000001', 
    'admin1@logistic.com', 
    '$2b$12$B9npDBXVW/zuYUenstGeX.UnUgDv.ISdQ7b7mmksXGzE8Ms7wrO6i', 
    'Nguyễn Văn A (Admin 1)', 
    NULL, 
    true, 
    1, 
    NOW(), 
    NOW()
  ),
  (
    'a3000000-0000-0000-0000-000000000002', 
    'admin2@logistic.com', 
    '$2b$12$B9npDBXVW/zuYUenstGeX.UnUgDv.ISdQ7b7mmksXGzE8Ms7wrO6i', 
    'Trần Thị B (Admin 2)', 
    NULL, 
    true, 
    1, 
    NOW(), 
    NOW()
  )
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 3. LIÊN KẾT TÀI KHOẢN VỚI VAI TRÒ ADMIN
-- ==========================================
INSERT INTO users_roles (user_id, role_id, assigned_at)
VALUES 
  ('a3000000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000001', NOW()),
  ('a3000000-0000-0000-0000-000000000002', 'd3000000-0000-0000-0000-000000000001', NOW())
ON CONFLICT (user_id, role_id) DO NOTHING;
```

---

## 5. Danh Sách Tài Khoản Dùng Thử Sau Khi Chạy Script

Sau khi chạy xong tập lệnh trên, bạn có thể sử dụng các tài khoản quản trị sau để bắt đầu kiểm thử:

*   **Tài khoản Admin 1**:
    *   **Email**: `admin1@logistic.com`
    *   **Password**: `password123`
*   **Tài khoản Admin 2**:
    *   **Email**: `admin2@logistic.com`
    *   **Password**: `password123`

---

## 6. Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### Lỗi: `error: database "..." does not exist`
*   **Nguyên nhân**: Database khai báo trong biến `DB_DATABASE` của file `.env` chưa được khởi tạo trong Postgres Server của bạn.
*   **Cách khắc phục**: Kết nối vào Postgres của bạn (ví dụ bằng DBeaver hoặc terminal `psql -U postgres`) và tạo database mong muốn bằng lệnh `CREATE DATABASE <tên_database>;`.

### Lỗi: `relation "roles" does not exist` khi chạy script SQL
*   **Nguyên nhân**: Bạn chạy script SQL trước khi NestJS khởi tạo bảng.
*   **Cách khắc phục**: Khởi chạy ứng dụng NestJS một lần bằng `npm run start:dev` để TypeORM tự tạo bảng trước, sau đó mới chạy script SQL để nạp dữ liệu.
