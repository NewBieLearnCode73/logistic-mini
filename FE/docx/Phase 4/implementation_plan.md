# Phase 4: Users Management Documentation & Description

Module quản lý nhân sự (**Users Management**) chịu trách nhiệm quản lý danh sách tài khoản nhân viên trong hệ thống, phục vụ việc phân quyền (RBAC) và gán địa điểm làm việc (Nodes) tương ứng.

## 1. Luồng Nghiệp Vụ Của Module Users
- **Khởi tạo tài khoản**: Admin nhập Họ tên, Email, Vai trò, và chọn Điểm công tác (chỉ bắt buộc đối với các vai trò Manufacturer, Distributor, Retailer).
- **Mật khẩu tạm thời**: Backend tự sinh mật khẩu ngẫu nhiên và gửi thông tin qua luồng log giả lập email. Giao diện frontend sẽ bắt thông tin này và hiển thị trong một hộp thoại an toàn để Admin có thể sao chép và gửi trực tiếp cho nhân viên.
- **Cập nhật thông tin**: Cho phép thay đổi họ tên, vai trò, hoặc điều chuyển nhân viên sang Điểm công tác khác.
- **Khóa/Kích hoạt tài khoản**: Cho phép Admin ngắt kích hoạt tài khoản của nhân viên nghỉ việc hoặc kích hoạt lại khi cần.
- **Cấp lại mật khẩu**: Đổi mật khẩu của nhân viên thành một mật khẩu ngẫu nhiên mới (chỉ cho phép đối với các vai trò nhân viên tác nghiệp, không áp dụng cho tài khoản Admin).

## 2. API Endpoints Tích Hợp
- `GET /api/v1/users`: Lấy danh sách, hỗ trợ phân trang và bộ lọc `role`, `nodeId`, `isActive`.
- `POST /api/v1/users`: Tạo tài khoản mới, phản hồi trả về dạng:
  ```json
  {
    "message": "Tạo tài khoản nhân sự mới thành công",
    "data": { ... },
    "temporaryPassword": "xxxx"
  }
  ```
- `PUT /api/v1/users/:id`: Chỉnh sửa thông tin nhân viên.
- `PATCH /api/v1/users/:id/toggle-active`: Khóa hoặc kích hoạt lại tài khoản.
- `POST /api/v1/users/:id/reset-password`: Cấp lại mật khẩu mới, phản hồi trả về dạng:
  ```json
  {
    "message": "Cấp lại mật khẩu nhân sự thành công",
    "data": { ... },
    "temporaryPassword": "xxxx"
  }
  ```

## 3. Bản Vẽ Giao Diện (UI Wireframe) & Thành Phần
- **Thanh Công Cụ Trên (Toolbar)**:
  - Nút **"Tạo tài khoản"** ở góc phải mở Modal nhập liệu.
  - Dropdown lọc theo **Vai trò** (Admin, Manufacturer, Distributor, Retailer, Consumer).
  - Dropdown lọc theo **Điểm công tác** (Lấy danh sách từ API `/nodes`).
  - Dropdown lọc theo **Trạng thái** (Tất cả, Hoạt động, Khóa).
- **Bảng Dữ Liệu (DataTable)**:
  - Các cột: Họ và tên, Email, Vai trò, Điểm công tác, Trạng thái (dot badge), Thao tác (Sửa, Khóa/Mở, Đổi mật khẩu).
- **Hộp thoại mật khẩu tạm thời**:
  - Modal hiển thị dòng mật khẩu ngẫu nhiên nổi bật, nút "Sao chép nhanh" và ghi chú bảo mật.
