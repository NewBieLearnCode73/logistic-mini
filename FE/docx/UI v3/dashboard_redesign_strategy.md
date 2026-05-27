# 📊 UI v3 Dashboard Command Center Redesign Strategy

Tài liệu này đặc tả chiến lược tái thiết kế màn hình Dashboard (Trang tổng quan) từ một dạng bảng thông tin hành chính tĩnh (Static Admin Layout) thành một **Phòng Điều Hành Chuỗi Cung Ứng Trực Tuyến (AI-Native Operational Command Center)**.

---

## 1. Mục tiêu tái cấu trúc Dashboard

Màn hình Dashboard mới đóng vai trò là "Bộ não" của toàn hệ thống, tích hợp thông tin liên tục từ thiết bị cảm biến hiện trường, lịch trình vận tải và phân tích dự báo sự cố của AI.

### Thay đổi bố cục chính
- **Cũ**: 3 Stat cards phẳng nằm ngang phía trên, 2 bảng danh sách phẳng nằm dưới.
- **Mới**: Hệ thống lưới không gian (Spatial Grid Layout) tích hợp 4 cụm tính năng tương tác trực tiếp:
  1. **Live Telemetry Map (Bản đồ giám sát trực tiếp)**: Đặt ở vị trí trung tâm, chiếm 60% diện tích chiều ngang màn hình.
  2. **Real-time Alert Ticker (Dòng cảnh báo sự cố khẩn cấp)**: Sidebar bên phải bản đồ, hiển thị liên tục các hoạt động mới phát sinh.
  3. **Interactive Trend Widget (Biểu đồ xu hướng tương tác)**: Đáy Dashboard, hiển thị lưu lượng hàng lưu kho và tiến độ vận đơn.
  4. **AI recommendation Card (Thẻ đề xuất hành động thông minh)**: Gợi ý các tác vụ khẩn cấp cần phê duyệt ngay.

---

## 2. Chi tiết 4 khu vực chức năng trên Dashboard

### A. Live Telemetry Map Widget
- **Visual**: Bản đồ Leaflet dạng dark-mode (hoặc tối giản xám) chiếm vị trí tiêu điểm.
- **Data**: Hiển thị vị trí của tất cả các kho bãi (Nodes) và phương tiện di chuyển (Shipments).
- **Interactive**: Nhấp trực tiếp vào Marker của node để hiển thị popup chứa danh sách tồn kho khả dụng nhanh. Nhấp chọn tuyến đường đứt nét để hiển thị mã vận chuyển và nút điều hướng xem chi tiết.

### B. Real-time Activity Ticker (Alert & Event Stream)
- **Visual**: Một bảng cuộn dọc hẹp với các dòng sự kiện có biểu tượng nhỏ phân biệt theo màu (xanh lá cho nhận hàng, cam cho sự cố, xanh dương cho xuất kho).
- **Data**: Đọc dữ liệu từ WebSocket hoặc polling 15 giây từ API Audit Logs.
- **Interactive**: Hover vào sự kiện hiển thị nút xem nhanh, click sẽ mở thẳng Inspector Drawer thông tin liên quan (lô hàng/vận đơn) đè lên bên phải Dashboard mà không làm tải lại trang.

### C. Predictive AI Recommendation Deck
- **Visual**: Card nổi viền phát sáng mờ (`border-accent/30`).
- **Data**: AI phân tích danh sách Incidents mở và Shipments trễ hạn.
- **Giao diện ví dụ**:
  ```
  ┌──────────────────────────────────────────────────────────┐
  │ 🤖 AI PILOT RECOMMENDATION                               │
  │ Vận đơn #TRK-8342 quá hạn 4 tiếng do thời tiết xấu tại Q2. │
  │ [✓ Phê duyệt chuyển tuyến phụ]   [⚠ Báo cáo sự cố khẩn]   │
  └──────────────────────────────────────────────────────────┘
  ```
- **Interactive**: Bấm nút phê duyệt sẽ tự động kích hoạt API tương ứng trong background và thông báo thành công tức thì.

### D. Interactive KPI Trend Charts
- **Visual**: Biểu đồ Area/Bar của Recharts sử dụng màu accent trắng (dark mode) hoặc xanh chàm (light mode), loại bỏ tất cả các đường lưới tọa độ nền để tạo cảm giác tối giản.
- **Interactive**: Di chuột hiển thị tooltip tùy chỉnh mờ mượt, nhấp vào một cột mốc ngày tự động lọc lại danh sách Recent Batches/Shipments ở bảng phụ theo ngày đó.
