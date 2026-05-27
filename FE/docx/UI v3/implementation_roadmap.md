# 📅 UI v3 Implementation Roadmap & Milestones

Tài liệu này xác định lộ trình triển khai chi tiết từng giai đoạn (Implementation Phases) phục vụ việc lập kế hoạch tiến độ cho đội ngũ phát triển.

---

## 1. Lộ trình triển khai tổng quan (High-Level Gantt Chart)

```
Giai đoạn 1: Khởi tạo đặc tả & Docs      ■■ 2 ngày
Giai đoạn 2: Setup Foundation & Tokens   ■■■ 3 ngày
Giai đoạn 3: AppShell & Command Palette  ■■■■ 4 ngày
Giai đoạn 4: Refactor Dashboard & Ops    ■■■■■■ 6 ngày
Giai đoạn 5: Refactor Logistics & Admin  ■■■■■ 5 ngày
Giai đoạn 6: Kiểm thử & Đóng gói         ■■ 2 ngày
```

---

## 2. Chi tiết các cột mốc (Milestones & Deliverables)

### Cột mốc 1: Phê duyệt thiết kế và Kiến trúc (Design Approval)
- **Mục tiêu**: Người dùng hoặc đại diện kỹ thuật phê duyệt tài liệu đặc tả thiết kế UI v3.
- **Sản phẩm bàn giao**: 12 file tài liệu thiết kế tại `FE/docx/UI v3/` đầy đủ cấu trúc.
- **Tiêu chí hoàn thành**: Trả lời toàn bộ các câu hỏi mở trong Implementation Plan.

### Cột mốc 2: Nền tảng thiết kế sẵn sàng (Foundation Ready)
- **Mục tiêu**: Thiết lập xong hệ thống tokens mới và khung xương thư mục.
- **Sản phẩm bàn giao**:
  - `tailwind.config.js` đã mở rộng màu HSL và 3D shadows.
  - `theme.css` cấu hình xong biến variables cho Light/Dark mode.
  - Tạo cấu trúc thư mục rỗng chuẩn tại `src/core/`, `src/features/`, `src/design-system/primitives/`.
- **Tiêu chí hoàn thành**: `npm run build` thành công, không lỗi PostCSS.

### Cột mốc 3: AppShell & Điều hướng hoạt động (Navigation & Shell Ready)
- **Mục tiêu**: Hoàn thành AppShell v3 thích ứng, Sidebar, Header và Command Palette.
- **Sản phẩm bàn giao**:
  - `AppShellV3.tsx` có cấu trúc thích ứng 3/4 cột.
  - `CommandBar.tsx` (Command Palette) hoạt động bằng phím tắt `Ctrl + K`.
  - `AIAssistantDock.tsx` trượt mở bằng phím tắt `Ctrl + A` hoặc header button.
  - Bottom navigation bar hoạt động trên thiết bị di động dưới 768px.
- **Tiêu chí hoàn thành**: Điều hướng giữa các trang hoạt động thông suốt qua cả click chuột và Command Palette.

### Cột mốc 4: Dashboard & Operations Workspace hoàn thành
- **Mục tiêu**: Hoàn thành 2 khu vực quan trọng nhất của ứng dụng.
- **Sản phẩm bàn giao**:
  - Dashboard v3 dạng Command Center (có live activity stream, charts).
  - Operations Workspace (Quản lý Batch, Shipments, Products) tích hợp Drawer Inspector và quick edit.
- **Tiêu chí hoàn thành**: Các chức năng CRUD hoạt động tốt thông qua Drawer và DataTable v3 mới.

### Cột mốc 5: Logistics & Admin Workspace hoàn thành
- **Mục tiêu**: Hoàn thành các trang bản đồ, đội xe, tài xế, quản trị người dùng và nhật ký audit.
- **Sản phẩm bàn giao**:
  - Logistics Page tích hợp bản đồ Leaflet full-size và fleet sidebar.
  - Admin & Settings page dưới dạng các tab điều khiển tập trung.
- **Tiêu chí hoàn thành**: Bản đồ vẽ đúng tuyến đường vận đơn, hiển thị popup đẹp mắt.

### Cột mốc 6: Đóng gói và Bàn giao (Production Ready)
- **Mục tiêu**: Tối ưu hóa hiệu năng và dọn sạch mã nguồn cũ.
- **Sản phẩm bàn giao**:
  - Thư mục `dist/` chứa gói build tĩnh đã tối ưu dung lượng.
  - Xóa toàn bộ file thừa không sử dụng.
- **Tiêu chí hoàn thành**: `npx tsc --noEmit` trả về 0 lỗi. Build time dưới 15 giây.
