# HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY DỰ ÁN (LOGISTIC-MINI)

Tài liệu này hướng dẫn chi tiết các bước cài đặt môi trường, cấu hình cơ sở dữ liệu, khởi chạy dự án Backend (NestJS), Frontend (React Vite) và import dữ liệu mẫu để chạy demo hệ thống truy xuất nguồn gốc chuỗi cung ứng **Mini Logistic**.

---

## 1. Yêu Cầu Hệ Thống (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Node.js**: Phiên bản khuyến nghị là **v18.x** hoặc **v20.x** trở lên.
- **npm**: Trình quản lý gói đi kèm khi cài đặt Node.js.
- **PostgreSQL**: Phiên bản **16** (hoặc chạy qua Docker).
- **Docker & Docker Compose** *(Khuyến nghị)*: Giúp khởi tạo nhanh cơ sở dữ liệu PostgreSQL mà không cần cài đặt rườm rà.

---

## 2. Thiết Lập Cơ Sở Dữ Liệu (PostgreSQL Database)

Hệ thống được cấu hình mặc định kết nối tới PostgreSQL qua cổng **5433**. Bạn có thể lựa chọn 1 trong 2 cách thiết lập dưới đây:

### Cách 1: Sử dụng Docker Compose (Nhanh nhất & Khuyên dùng)
Nếu đã cài đặt Docker, bạn chỉ cần mở Terminal/PowerShell tại thư mục `BE` và chạy lệnh sau để khởi tạo container PostgreSQL:

```bash
# Di chuyển vào thư mục backend
cd BE

# Khởi chạy database PostgreSQL trong background
docker-compose up -d
```

*Lưu ý:* File `docker-compose.yml` đã được cấu hình sẵn để khởi tạo database tên `mini_logistic`, tài khoản `admin`/`admin` và ánh xạ cổng **5433** trên máy vật lý vào cổng **5432** của container.

### Cách 2: Cài đặt PostgreSQL thủ công trên máy
Nếu cài đặt trực tiếp PostgreSQL trên hệ điều hành của bạn:
1. Tạo một cơ sở dữ liệu mới tên là: `mini_logistic`.
2. Đảm bảo dịch vụ chạy trên cổng **5433** (hoặc sửa lại biến `DB_PORT` trong file `.env` của Backend thành cổng của bạn, ví dụ: `5432`).
3. Tạo tài khoản người dùng tương ứng với thông tin trong cấu hình `.env` bên dưới.

---

## 3. Hướng Dẫn Cài Đặt & Chạy Backend (BE)

Dự án Backend được xây dựng trên framework **NestJS**.

### Bước 1: Di chuyển vào thư mục BE và cài đặt dependencies
Mở terminal và chạy các lệnh sau:
```bash
cd BE
npm install
```

### Bước 2: Tạo tệp cấu hình môi trường `.env`
Tạo file `.env` nằm trực tiếp trong thư mục `BE/` (nếu chưa có) và sao chép cấu hình mẫu sau:

```env
# Cấu hình kết nối Database
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USERNAME=admin
DB_PASSWORD=admin
DB_DATABASE=mini_logistic
DB_SYNCHRONIZE=true

# Cấu hình bảo mật JWT
JWT_SECRET=super-secret-key-12345
JWT_EXPIRES_IN=24h

# Cho phép kết nối CORS từ Frontend
FRONTEND_URL=http://localhost:5173

# Cấu hình dịch vụ gửi Email qua Brevo (dùng cho tính năng cấp mật khẩu tạm thời)
BREVO_API_KEY=YOUR-BREVO-API-KEY
ADMIN_EMAIL_ADDRESS=YOUR-EMAIL
ADMIN_EMAIL_NAME="YOUR NAME"
```

### Bước 3: Khởi chạy Backend
Khởi chạy dịch vụ ở chế độ nhà phát triển (auto-reload khi thay đổi code):
```bash
npm run start:dev
```

> [!IMPORTANT]
> **Đồng bộ hóa Schema tự động:**
> Trong lần chạy đầu tiên, nhờ cấu hình `DB_SYNCHRONIZE=true`, NestJS cùng với TypeORM sẽ tự động phân tích cấu trúc code để tạo toàn bộ bảng dữ liệu trống trong database `mini_logistic` của PostgreSQL. Bạn **không cần** chạy lệnh DDL tạo bảng thủ công.

---

## 4. Hướng Dẫn Cài Đặt & Chạy Frontend (FE)

Dự án Frontend sử dụng **React**, **Vite** và **TailwindCSS**.

### Bước 1: Di chuyển vào thư mục FE và cài đặt dependencies
Mở một cửa sổ terminal mới và chạy:
```bash
cd FE
npm install
```

### Bước 2: Tạo tệp cấu hình môi trường `.env`
Tạo file `.env` nằm trực tiếp trong thư mục `FE/` và định nghĩa API kết nối đến Backend:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME="Mini Logistic"
```

### Bước 3: Khởi chạy Frontend
Chạy lệnh phát triển cục bộ:
```bash
npm run dev
```
Sau khi chạy thành công, mở trình duyệt và truy cập: [http://localhost:5173](http://localhost:5173).

---

## 5. Nhập Dữ Liệu Mẫu (Import Seed Data)

Tại thư mục gốc của dự án có tệp `Dataset.sql`. Tệp này chứa dữ liệu mẫu quy mô lớn để chạy demo chuỗi cung ứng, bao gồm: các điểm mạng lưới (Nodes) tại Việt Nam, các sản phẩm xây dựng tiêu chuẩn, tài khoản nhân viên phân vai trò và hàng nghìn bản ghi lịch sử, vận đơn, quét mã để phục vụ test hiệu năng/biểu đồ.

> [!WARNING]
> Chỉ thực hiện import dữ liệu này sau khi dự án Backend đã chạy ít nhất một lần để đảm bảo TypeORM đã sinh đầy đủ cấu trúc bảng trống trong database.

### Cách 1: Sử dụng lệnh CLI (Nếu chạy PostgreSQL bằng Docker)
Mở terminal ở thư mục gốc của dự án và chạy dòng lệnh sau:

```bash
# Đối với Windows PowerShell:
Get-Content "Dataset.sql" | docker exec -i mini-logistic-db psql -U admin -d mini_logistic

# Đối với Linux / macOS / Git Bash:
docker exec -i mini-logistic-db psql -U admin -d mini_logistic < Dataset.sql
```

### Cách 2: Sử dụng công cụ trực quan (DBeaver, pgAdmin, Navicat)
1. Kết nối đến server PostgreSQL của bạn (`localhost:5433`).
2. Mở cơ sở dữ liệu `mini_logistic`.
3. Mở tab **SQL Editor**, kéo thả hoặc copy toàn bộ nội dung file [Dataset.sql](file:///d:/Personal%20Projects/University%20Project/logistic-mini/Dataset.sql) vào trình biên soạn.
4. Nhấn **Execute / Run** để thực thi toàn bộ script.

---

## 6. Danh Sách Tài Khoản Đăng Nhập Demo

Sau khi import thành công dữ liệu từ file `Dataset.sql`, bạn có thể sử dụng các tài khoản demo sau để đăng nhập vào hệ thống tại trang [http://localhost:5173/login](http://localhost:5173/login):

| Vai trò (Role) | Email tài khoản | Mật khẩu mặc định | Ghi chú quyền hạn |
|----------------|----------------|-------------------|-------------------|
| **Admin** | `admin@logistic.com` | `password123` | Quản lý mạng lưới, nhân viên, sự cố, bản đồ và lịch sử audit |
| **Manufacturer** | `mfr_a@logistic.com` | `password123` | Đại diện Nhà máy Hà Tiên - Được quyền tạo lô hàng, xuất báo cáo |
| **Distributor** | `dist_a@logistic.com` | `password123` | Đại diện Trung tâm Đà Nẵng - Quản lý xuất kho & xác nhận nhận hàng |
| **Retailer** | `ret_a@logistic.com` | `password123` | Đại diện Siêu thị Co.opmart Q1 - Xác nhận nhận hàng và thực hiện bán lẻ |

*Mẹo: Trên giao diện trang Đăng nhập, bạn có thể click trực tiếp vào các nút vai trò tương ứng trong phần "Đăng nhập nhanh tài khoản Demo" để hệ thống tự điền thông tin.*

---

## 7. Các Lưu Ý Quan Trọng khi Vận Hành

1. **Quyền truy cập GPS**:
   Trang tra cứu thông tin hành trình (`/trace/:batchCode`) sẽ yêu cầu quyền truy cập định vị (GPS) trên trình duyệt của người dùng để ghi nhận vị trí thực tế của khách hàng khi quét mã. Vui lòng nhấn **Allow (Cho phép)** khi có thông báo yêu cầu.
2. **Cấu hình Email**:
   Dịch vụ tạo tài khoản nhân viên mới sẽ tự động gửi email chứa mật khẩu tạm thời thông qua API của **Brevo**. API key trong mẫu `.env` hiện tại là api key demo hoạt động. Nếu bạn muốn thay đổi, hãy tự đăng ký tài khoản Brevo và cập nhật lại biến `BREVO_API_KEY` trong file `.env` của Backend.
3. **Optimistic Locking**:
   Hệ thống có cấu hình khoá lạc quan (Optimistic Locking) trên các bảng dữ liệu có tần suất thay đổi cao. Nếu có xung đột dữ liệu đồng thời, hệ thống sẽ báo lỗi và yêu cầu tải lại trang để bảo toàn tính toàn vẹn dữ liệu.
