# Kế hoạch triển khai: Gửi email mật khẩu tạm thời khi Admin tạo User mới & Ghi nhật ký (Yêu Cầu 5)

Kế hoạch này tích hợp dịch vụ gửi email Brevo (Sendinblue) để tự động gửi mật khẩu tạm thời cho nhân sự mới khi Admin tạo tài khoản. Đồng thời, cải tiến Audit Log Interceptor để ghi nhận chính xác mã định danh ID của tài khoản nhân sự mới vừa được tạo.

## User Review Required

> [!IMPORTANT]
> **Cấu hình biến môi trường (Environment Variables):**
> Admin cần cấu hình 3 biến môi trường mới vào tệp `.env` của Backend để tích hợp thành công Brevo API:
> - `BREVO_API_KEY`: API Key đã được cấp bởi Brevo.
> - `ADMIN_EMAIL_ADDRESS`: Địa chỉ email người gửi (`thang.huynhduc.learning@gmail.com`).
> - `ADMIN_EMAIL_NAME`: Tên hiển thị người gửi (`Anh Thắng Đẹp Trai`).

## Open Questions

> [!NOTE]
> Không có câu hỏi mở. API Key và thông tin cấu hình người gửi đã được người dùng cung cấp đầy đủ trong yêu cầu.

---

## Proposed Changes

### 1. Backend (BE)

#### [NEW] [mail.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/mail/mail.service.ts)
- Khởi tạo class `MailService` sử dụng API Client `@getbrevo/brevo` để thực hiện gửi Transactional Email.
- Thiết kế phương thức `sendTemporaryPassword(toEmail: string, temporaryPassword: string)` tạo cấu trúc thư điện tử HTML chuyên nghiệp, chứa thông tin tài khoản và mật khẩu tạm thời.
- Tích hợp try-catch và Logger để ghi log lỗi thay vì ném ngoại lệ làm gián đoạn luồng nghiệp vụ tạo tài khoản nếu việc gửi email thất bại.

#### [NEW] [mail.module.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/mail/mail.module.ts)
- Định nghĩa NestJS Module `MailModule` đóng gói `MailService` và xuất (`export`) ra ngoài để các module khác có thể import sử dụng.

#### [MODIFY] [users.module.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/users/users.module.ts)
- Import `MailModule` vào danh sách `imports` của `UsersModule`.

#### [MODIFY] [users.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/users/users.service.ts)
- Inject `MailService` vào constructor của `UsersService`.
- Sau khi lưu đối tượng user mới thành công trong phương thức `create`, gọi `await this.mailService.sendTemporaryPassword(savedUser.email, temporaryPassword)` để kích hoạt tiến trình gửi thư điện tử.

#### [MODIFY] [audit-log.interceptor.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/common/interceptors/audit-log.interceptor.ts)
- Nâng cấp logic gán `entityId`:
  ```typescript
  auditLog.entityId = entityId || responseBody?.id || responseBody?.data?.id || null;
  ```
  Nhằm bắt chính xác ID của thực thể được tạo từ các API endpoints trả về kết quả dạng bọc ngoài `{ message, data }` (như endpoint `POST /api/v1/users`).

#### [MODIFY] [.env](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/.env)
- Thêm các cấu hình API Key Brevo và thông tin người gửi vào cuối tệp tin.

---

## Verification Plan

### Automated Tests
- Chạy kiểm thử toàn bộ test suite để đảm bảo không phá vỡ logic cũ:
  ```powershell
  npm run test
  ```
- Kiểm tra biên dịch dự án:
  ```powershell
  npm run build
  ```

### Manual Verification
- Đăng nhập với tài khoản Admin.
- Truy cập mục quản lý tài khoản và thực hiện tạo một tài khoản nhân sự mới (ví dụ: gửi tới một hòm thư email kiểm thử của bạn).
- Xác minh:
  1. Hòm thư nhận được email chào mừng và mật khẩu tạm thời từ "Anh Thắng Đẹp Trai" gửi qua hệ thống Brevo.
  2. Truy cập bảng quản lý Audit Logs để xem dòng nhật ký hành động tạo tài khoản: ghi nhận chính xác ID của Admin thực hiện, ID của User mới và nội dung `newValues` chứa đầy đủ thông tin chi tiết.
