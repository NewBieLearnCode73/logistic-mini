# 🧠 UI v3 UX Decisions & Interaction Design

Tài liệu này ghi lại các quyết định thiết kế trải nghiệm người dùng (UX Decisions) của phiên bản UI v3, giải thích lý do tại sao chúng ta thay thế các mẫu tương tác (Interaction patterns) cũ và cách thức triển khai mới.

---

## 1. Drawer-over-Modal (Thay thế Modal bằng Bảng trượt)

### Quyết định
- Thay thế 80% các hộp thoại modal dạng popup bật giữa màn hình bằng các **Inspector Drawers** trượt từ cạnh phải sang.

### Lý do
- **Tránh mất ngữ cảnh (Context preservation)**: Modal truyền thống che phủ vùng trung tâm màn hình, bắt người dùng dừng việc đọc bảng dữ liệu phía sau. Drawer trượt sang cho phép người dùng vẫn đọc được các thông tin liên quan của bảng dữ liệu bên trái trong khi đang sửa đổi hoặc điền thông tin bên phải.
- **Tiêu chuẩn thiết kế SaaS**: Linear sử dụng drawer trượt để chỉnh sửa thuộc tính của Issues, Stripe sử dụng drawer để hiển thị chi tiết thanh toán của khách hàng.

---

## 2. Keyboard-First Navigation (Điều hành không cần chuột)

### Quyết định
- Triển khai bộ phím tắt và khả năng điều hướng danh sách hoàn toàn bằng bàn phím.

### Cơ chế hoạt động
- **Phím `/`**: Focus nhanh vào ô tìm kiếm chính trên bảng.
- **Tổ hợp `Ctrl + K` (hoặc `Cmd + K`)**: Bật Command Palette.
- **Phím `Esc`**: Đóng nhanh bất kỳ Drawer, Modal hoặc Command Palette nào đang mở.
- **Arrow Keys (`Up` / `Down`) & `Enter`**: Di chuyển qua lại giữa các dòng bảng dữ liệu. Bấm `Enter` để mở drawer chi tiết của dòng đang chọn.

---

## 3. Cổng tìm kiếm thông minh (Command Palette Indexing)

### Quyết định
- Command Palette không chỉ là menu điều hướng mà là công cụ tra cứu thực thể chuỗi cung ứng trực tiếp.

### Phạm vi tìm kiếm
- **Navigation**: Nhảy nhanh tới các trang: `/dashboard`, `/batches`, `/shipments`, `/map`, `/incidents`.
- **Quick Action**: "Tạo lô hàng mới", "Xuất kho", "Báo cáo sự cố".
- **Realtime Database query**: Nhập mã số (e.g. `B-102`) sẽ gọi nhanh API tìm kiếm lô hàng/vận đơn tương ứng và hiển thị nút "Xem chi tiết" ngay trên kết quả search.

---

## 4. Trải nghiệm quét mã tại hiện trường (Field Scanning Feedback)

### Quyết định
- Trang quét QR camera (`/scan`) phải tích hợp phản hồi xúc giác và âm thanh đa tầng (haptic & audio feedback).

### Cơ chế
- **Quét thành công (Success)**: Phát một tiếng bip ngắn, tần số cao (`1000Hz, 50ms`) kết hợp hiệu ứng chớp xanh lá cây viền camera và rung nhẹ thiết bị (nếu chạy trên Android/iOS WebView). Tự động mở drawer thông tin hành trình lô hàng.
- **Quét thất bại/Lỗi (Fail/Error)**: Phát tiếng âm trầm (`200Hz, 150ms`) kết hợp chớp đỏ viền camera và hiển thị thông điệp lỗi rõ ràng kèm mã lỗi.
- **Sandbox Simulator**: Cho phép chọn nhanh mã lô hàng mẫu có sẵn trong dropdown để giả lập quét thành công, phục vụ kiểm thử nhanh trên máy tính phát triển (không có camera hoặc mã vạch thực).
