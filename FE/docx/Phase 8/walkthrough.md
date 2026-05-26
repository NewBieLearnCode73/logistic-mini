# Walkthrough - Phase 8: Public Scan, Traceability & Network Map (Quét QR, Truy xuất nguồn gốc & Bản đồ hệ thống)

Chúng ta đã hoàn thành triển khai **Phase 8: Public Scan, Traceability & Network Map** trên Frontend, cung cấp các giao diện truy vết sản phẩm công cộng và bản đồ phân tích chuỗi cung ứng thông tin mật độ cao cho Admin.

---

## 1. Chức năng đã thực hiện

### A. Trang Quét QR Công Cộng (`/scan`)
- **Quét Camera Thời Gian Thực**: Tích hợp luồng camera quét mã QR sử dụng trực tiếp thư viện `html5-qrcode`. Cho phép người dùng cấp quyền camera và quét trực tiếp nhãn lô hàng. Thiết kế giao diện khung quét kèm tia laser quét chuyển động.
- **Tra cứu thủ công**: Hỗ trợ form nhập mã lô hàng trực tiếp đề phòng trường hợp thiết bị không có camera hoặc trình duyệt chặn quyền.
- **Mô phỏng Sandbox cho Nhà phát triển (Developer Sandbox Simulator)**: Khi quản trị viên hoặc nhân sự đã đăng nhập, một bảng điều khiển Sandbox sẽ xuất hiện ở cuối trang quét, liệt kê các lô hàng thực tế đang có trên hệ thống để người phát triển nhấp nhanh và giả lập luồng quét mà không cần mã QR vật lý.

### B. Trang Truy Xuất Nguồn Gốc Công Cộng (`/trace/:batchCode`)
- **Ghi nhận GPS tự động (Geolocation Tracker)**: Trang web tự động yêu cầu quyền vị trí (`navigator.geolocation`) trước khi truy xuất dữ liệu. Nếu người dùng cấp quyền, tọa độ vị trí quét `lat` và `lng` sẽ được gửi lên API `GET /public/trace/:batchCode` và ghi nhận nhật ký quét (`ScanLog`) vị trí địa lý của lượt quét.
- **Chi tiết Sản phẩm & Xác thực**: Hiển thị tem xác thực sản phẩm chính hãng, thông tin chi tiết về sản phẩm (SKU, phân loại, quy cách, mô tả) và trạng thái lô hàng (đã bán, đang vận chuyển, thất lạc...).
- **Hành trình Stepper dọc**: Hiển thị trực quan từng chặng di chuyển của lô hàng từ nơi sản xuất (Manufacturer), đi qua các chặng trung chuyển (Shipped, Received) cho tới khi đến tay người tiêu dùng.
- **Bản đồ hành trình lô hàng (Journey Route Map)**: Tích hợp bản đồ Leaflet hiển thị các ghim vị trí nơi sản xuất (Marker M), vị trí hiện tại (Marker C) và các chặng trung chuyển, kết nối với nhau bằng đường nét đứt biểu diễn lộ trình địa lý của lô hàng.

### C. Bản đồ mạng lưới Admin (`/map`)
- **Bản đồ toàn màn hình (Fullscreen Network Map)**: Dành riêng cho tài khoản quản trị (Admin), chiếm toàn bộ chiều cao màn hình trực quan hóa toàn bộ mạng lưới logistics.
- **Phân loại địa điểm (Node Markers)**: Biểu diễn tất cả địa điểm trong hệ thống chuỗi cung ứng dưới dạng các điểm tròn màu sắc và ký tự đặc trưng (M: Manufacturer - Xám, D: Distributor - Xanh dương, W: Warehouse - Cam, R: Retailer - Xanh lá).
- **Luồng vận chuyển (Shipment Polylines)**: Vẽ các đường liên kết đứt nét Indigo biểu diễn các vận đơn đang trong quá trình luân chuyển hàng hóa giữa các node (`IN_TRANSIT`, `DELAYED`).
- **Bảng điều khiển lọc (Floating Control Panel)**: Cho phép Admin lọc nhanh hiển thị các loại node mong muốn và bật/tắt hiển thị luồng vận đơn.
- **Popup thông tin chi tiết**: Nhấp vào Marker node hiển thị địa chỉ, phân loại, tọa độ. Nhấp vào đường liên kết vận đơn hiển thị mã vận đơn, tên sản phẩm, số lượng và trạng thái.

---

## 2. Các thay đổi về mã nguồn (Code Changes)

### Frontend (FE)
- [NEW] [ScanPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/ScanPage.tsx)
- [NEW] [TracePage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/TracePage.tsx)
- [NEW] [MapPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/map/MapPage.tsx)
- [NEW] [public.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/public.api.ts)
- [NEW] [public.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/public.types.ts)
- [NEW] [usePublicTrace.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/usePublicTrace.ts)
- [MODIFY] [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx) (Đăng ký router thực tế & dọn dẹp PlaceholderPage)
- [MODIFY] [en.json] & [vi.json] (Bổ sung dịch thuật namespace `map` và `public`)

### Backend (BE)
- [MODIFY] [public-trace.controller.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/audit/public-trace.controller.ts) (Bổ sung tọa độ `latitude` và `longitude` của các địa điểm trung chuyển trong timelineEvents).
