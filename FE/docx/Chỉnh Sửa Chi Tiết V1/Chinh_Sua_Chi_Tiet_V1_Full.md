# Kế Hoạch Chỉnh Sửa Chi Tiết Hệ Thống Logistics (V1)

Tài liệu này tổng hợp 15 yêu cầu chỉnh sửa từ người dùng, phân tích tác động kỹ thuật và đưa ra lộ trình thực hiện theo từng Phase để kiểm soát chất lượng đầu ra.

---

## 📌 Tổng Quan Các Phase Triển Khai

Để đảm bảo không phá vỡ các luồng nghiệp vụ hiện có và dễ dàng kiểm soát chất lượng, kế hoạch được chia thành 5 Phase:

*   **Phase 1: Nâng Cấp Cấu Trúc Database & Schema (Yêu cầu 3, 10, 12, 13)**
*   **Phase 2: Bản Đồ & Định Tuyến Thực Tế (Yêu cầu 1, 11)**
*   **Phase 3: Cải Tiến Trình Quét QR & Tương Thích Localhost (Yêu cầu 6, 7, 8)**
*   **Phase 4: Tự Động Hóa Cron-Job & Email Cảnh Báo (Yêu cầu 5, 9)**
*   **Phase 5: Sửa Lỗi Nghiệp Vụ Bán Lẻ & Báo Cáo Xuất File (Yêu cầu 4, 14, 15)**

---

## 🛠️ Chi Tiết 15 Yêu Cầu Chỉnh Sửa

### Yêu Cầu 1: Định tuyến đường bộ trên Bản đồ (Map) thay vì đường thẳng
- **Hiện trạng**: Vận đơn đang chạy kết nối giữa 2 điểm bằng đường thẳng chim bay vượt qua biển hoặc biên giới các nước lân cận.
- **Giải pháp**: Tích hợp OSRM API định tuyến giao thông đường bộ, bổ sung cơ chế Memory Cache tại frontend để tránh bị chặn IP do giới hạn tần suất yêu cầu (Rate Limiting).
- **Chi tiết thiết kế**: Xem tài liệu riêng tại [Map/routing_implementation_detail.md](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/docx/Ch%E1%BB%89nh%20S%E1%BB%ADa%20Chi%20Ti%E1%BA%BFt%20V1/Map/routing_implementation_detail.md).

---

### Yêu Cầu 3: Bổ sung đơn giá sản phẩm và tự động tính tổng giá trị lô hàng
- **Hành động ở Backend**:
  - Thêm cột `unit_price` (kiểu `decimal`, mặc định `0`) vào `ProductEntity` trong [product.entity.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/products/entities/product.entity.ts).
  - Cập nhật `CreateProductDto` và `UpdateProductDto` nhận thêm trường `unitPrice` (kiểu `number`).
  - Trong [batches.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/batches/batches.service.ts), khi tạo mới lô hàng, lấy `unitPrice` từ sản phẩm nhân với `quantity` để lưu vào trường `totalValue` của lô hàng.
- **Hành động ở Frontend**:
  - Thêm trường nhập "Đơn giá" vào modal Form thêm mới/chỉnh sửa sản phẩm tại [ProductsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/products/ProductsPage.tsx).
  - Hiển thị cột "Đơn giá" và "Tổng giá trị" trong bảng danh sách lô hàng tại [BatchesPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/batches/BatchesPage.tsx) và trang chi tiết [BatchDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/batches/BatchDetailPage.tsx).

---

### Yêu Cầu 4: Xuất file CSV/PDF theo khoảng thời gian và kèm tổng giá trị
- **Hành động ở Backend**:
  - Cập nhật endpoint `/reports/export` trong [dashboard-system.controller.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/dashboard-system/dashboard-system.controller.ts) để nhận thêm query parameters: `startDate` và `endDate`.
  - Trong `dashboard-system.service.ts`, lọc danh sách lô hàng/vận đơn theo ngày khởi tạo nằm trong khoảng lựa chọn.
  - Bổ sung cột "Tổng giá trị" vào báo cáo xuất CSV và PDF, tính tổng giá trị toàn bộ báo cáo ở chân trang.
- **Hành động ở Frontend**:
  - Bổ sung bộ chọn khoảng thời gian (Từ ngày - Đến ngày) tại widget xuất báo cáo trong [DashboardPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/dashboard/DashboardPage.tsx).

---

### Yêu Cầu 5: Admin tạo User mới tự động gửi email mật khẩu tạm thời & ghi Nhật ký
- **Hành động ở Backend**:
  - Triển khai `MailService` sử dụng thư viện `nodemailer` cấu hình SMTP hoặc gửi HTTP request qua API của Brevo.
  - Trong [users.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/users/users.service.ts), sau khi tạo tài khoản nhân sự thành công, gọi `MailService.sendTemporaryPassword(email, temporaryPassword)`.
  - Ghi hoạt động vào `audit_logs` gồm: ID quản trị viên tạo, đối tượng bị tác động (User mới), nội dung hành động, và thời điểm.

---

### Yêu Cầu 6 & 8: Tối ưu trình quét QR Webcam trên Localhost
- **Hành động ở Backend**:
  - Thay đổi địa chỉ sinh mã QR trong [batches.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/batches/batches.service.ts) từ đường dẫn tuyệt đối `https://mini-logistic.com/public/trace/:batchCode` thành liên kết localhost trực tiếp `http://localhost:5173/trace/:batchCode` để tương thích môi trường phát triển local.
- **Hành động ở Frontend**:
  - Trong [ScanPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/ScanPage.tsx), tại hàm callback khi nhận diện mã QR:
    - Nếu chuỗi quét được là một đường link (chứa `http` hoặc `https`), thực hiện trích xuất phần đuôi (ví dụ: `BCH-20260607-80975218`) bằng lệnh `url.substring(url.lastIndexOf('/') + 1)` và tự động chuyển hướng người dùng tới `/trace/:batchCode` trên localhost.
    - Điều này giúp hệ thống tương thích cả mã QR cũ lẫn mã QR mới tạo trên localhost.

---

### Yêu Cầu 7: Bổ sung nút Quét QR ngoài màn hình Đăng nhập
- **Hành động ở Frontend**:
  - Trong [LoginPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/auth/LoginPage.tsx), thêm một nút phụ hoặc liên kết nổi bật dưới biểu mẫu: "Tra cứu hành trình lô hàng công khai (Quét QR)".
  - Nút này dẫn trực tiếp tới tuyến đường công khai `/scan`.

---

### Yêu Cầu 9: Cron-job tự động chuyển DELAYED, tạo sự cố và gửi email về cho Admin
- **Hành động ở Backend**:
  - Trong cron-job [incidents.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/incidents/incidents.service.ts):
    - Cập nhật cả `shipment.status = ShipmentStatus.DELAYED` bên cạnh việc cập nhật trạng thái lô hàng.
    - Tự động tạo mới một bản ghi sự cố (`IncidentReportEntity`) với mã sự cố tự sinh `INC-YYYYMMDD-xxxx`, mức độ nghiêm trọng `HIGH`, loại sự cố `OVERDUE` để hiển thị trên Dashboard Admin.
    - Gọi `MailService` gửi email tự động tới hòm thư Admin thông báo lô hàng bị trễ hạn giao quá 48 giờ để kịp thời xử lý.

---

### Yêu Cầu 10: Xóa điểm mạng lưới (Soft-delete Node)
- **Hành động ở Backend**:
  - Khi xóa node trong [nodes.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/nodes/nodes.service.ts):
    - Đặt `node.isActive = false` để vô hiệu hóa liên kết mới.
    - Thực hiện soft delete (`deletedAt = NOW()`) thông qua TypeORM. Kiểm tra nếu tổng lượng hàng tồn tại node lớn hơn 0 thì từ chối hành động.

---

### Yêu Cầu 11: Xem hàng tồn kho của từng loại sản phẩm tại Node từ Bản đồ
- **Hành động ở Frontend**:
  - Cập nhật hàm gọi danh sách node trong [MapPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/map/MapPage.tsx) truyền tham số `includeInventory: true`.
  - Phân tích danh sách tồn kho trả về (`node.inventories`), nhóm theo tên sản phẩm và tính tổng số lượng tồn kho khả dụng để hiển thị dạng bảng trực quan bên trong Popup khi click vào Marker của Node đó.

---

### Yêu Cầu 12: Soft-delete cho Product giữ lại lịch sử hành trình
- **Hành động ở Backend**:
  - Thay vì xóa cứng dòng sản phẩm làm mất liên kết lịch sử lô hàng, khi thực hiện xóa sản phẩm trong [products.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/products/products.service.ts), chúng ta thiết lập `product.isActive = false` (ngưng hoạt động) để loại bỏ khỏi danh mục tạo lô hàng mới.
  - Sử dụng cơ chế TypeORM soft-delete kết hợp tham số `{ withDeleted: true }` trong các query liên quan tới hiển thị chi tiết hành trình cũ để đảm bảo tên sản phẩm đã xóa vẫn hiển thị đầy đủ trong lịch sử.

---

### Yêu Cầu 13: Middleware kiểm tra người dùng bị vô hiệu hóa (Active Check)
- **Hành động ở Backend**:
  - Trong [jwt.strategy.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/auth/strategies/jwt.strategy.ts), tại hàm xác thực `validate(payload)`:
    - Tải thông tin người dùng từ cơ sở dữ liệu.
    - Kiểm tra thuộc tính `user.isActive`. Nếu `isActive === false`, ném lỗi `UnauthorizedException` ngay lập tức để thu hồi phiên làm việc, bất kể token JWT đó còn hạn hay không.

---

### Yêu Cầu 14: Sửa lỗi bán sản phẩm tại Retailer nhưng số lượng lô hàng không thay đổi
- **Hành động ở Backend**:
  - Do Distributor và Retailer quản lý kho hàng cục bộ, danh sách lô hàng của họ trên UI thực chất phải hiển thị lượng tồn kho tại Node đó (`InventoryEntity.quantityAvailable`) chứ không phải tổng số lượng gốc ban đầu của lô hàng (`BatchEntity.quantity`).
  - Trong [batches.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/batches/batches.service.ts), tại hàm `findAll`:
    - Khi vai trò của user đăng nhập là Distributor hoặc Retailer, thực hiện join bảng `InventoryEntity` và bản xạ đè giá trị `batch.quantity` bằng `inv.quantityAvailable`. Điều này giúp đồng bộ ngay lập tức số lượng lô hàng hiển thị trên UI sau khi bán lẻ thành công.

---

### Yêu Cầu 15: Giải thích luồng nghiệp vụ khi báo mất Shipment
- **Hành động Nghiệp Vụ / Logic**:
  - Khi Admin 2 thực hiện phê duyệt sự cố báo mất vận đơn (`LOSS_CONFIRMED`):
    - Hệ thống tự động thực hiện **Rollback tồn kho** (`LOSS_ROLLBACK`): Chuyển lượng hàng hóa đang nằm trong vận đơn thất lạc quay trở lại **kho khả dụng của Node nguồn (Source Node)** (vì hàng chưa được giao tới đích).
    - Sau khi hoàn trả về kho nguồn, nếu hàng hóa này thực tế đã bị hư hỏng hoặc mất mát hoàn toàn ngoài thực địa, nhân sự tại kho nguồn sẽ làm thủ tục điều chỉnh hao hụt (`DAMAGE_WRITE_OFF` hoặc `CORRECTION`) để trừ lượng tồn kho này ra khỏi kho vật lý, lưu vết chi tiết người thực hiện viết báo cáo hao hụt.
