# Phase 9: Polish, Reports Export & Geolocation/Mobile Optimization Plan

Tối ưu hóa hệ thống hoàn thiện (Polish), bao gồm:
1. **Xuất báo cáo hệ thống (Reports Export)**: Triển khai gọi API `POST /reports/export` với body `{ reportType, format }`, tải về dưới dạng tệp Blob nhị phân (`responseType: 'blob'`) hỗ trợ cả hai định dạng CSV và PDF cho các dữ liệu `inventory`, `shipments`, và `incidents` (dành cho Admin và Manufacturer).
2. **Hỗ trợ giao diện di động (Mobile Responsiveness)**: Tối ưu hóa thanh điều hướng Sidebar và Header. Sidebar sẽ ẩn trên thiết bị di động và hiển thị thông qua nút Hamburger menu trên Header kèm lớp phủ mờ (Overlay) đóng/mở mượt mà.
3. **Bản dịch bổ sung**: Thêm dịch thuật tiếng Anh và tiếng Việt cho phần xuất báo cáo (`reports`).

---

## User Review Required

> [!IMPORTANT]
> **Widget Xuất báo cáo (Dashboard Reports Widget):**
> - Chúng ta sẽ tạo một phân mục mới **"Báo cáo hệ thống" (System Reports)** hiển thị trực tiếp trên trang chủ Dashboard dưới dạng một Card/Widget chỉ hiển thị cho các tài khoản có quyền (Admin và Manufacturer).
> - Widget sẽ cho phép chọn loại báo cáo (Tồn kho, Vận đơn, Sự cố) và định dạng xuất (CSV hoặc PDF) và gọi API tải trực tiếp về trình duyệt.

> [!WARNING]
> **Mobile Hamburger Navigation:**
> - Cấu trúc Sidebar hiện tại đang cố định `w-[150px]` và layout có `pl-[220px]` (có khoảng hụt 70px). Chúng ta sẽ chuẩn hóa độ rộng Sidebar về `w-[220px]` khớp với layout.
> - Trên các màn hình nhỏ (`lg` trở xuống), Sidebar sẽ mặc định ẩn đi (`-translate-x-full`) và Header sẽ hiển thị nút Hamburger (`Bars3Icon`). Nhấp vào nút Hamburger sẽ trượt Sidebar ra ngoài và kích hoạt lớp phủ đen mờ (`bg-black/30`) che phần còn lại của trang. Nhấp vào lớp phủ hoặc một mục link điều hướng sẽ tự động đóng Sidebar.

---

## Open Questions

Không có câu hỏi mở nào.

---

## Proposed Changes

### 1. Types & APIs (Data Layer)

#### [MODIFY] [dashboard.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/dashboard.api.ts)
- Bổ sung hàm xuất báo cáo:
  ```typescript
  exportReport: (data: { reportType: 'inventory' | 'shipments' | 'incidents'; format: 'csv' | 'pdf' }) =>
    api.post('/reports/export', data, { responseType: 'blob' })
  ```

---

### 2. Layout & Components (Mobile Optimization)

#### [MODIFY] [AppLayout.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/AppLayout.tsx)
- Thêm state `isSidebarOpen: boolean`.
- Truyền tham số điều khiển vào `Sidebar` và `Header`.
- Thêm lớp phủ mờ (Overlay overlay) trên màn hình mobile.
- Đổi padding từ cố định `pl-[220px]` thành responsive `lg:pl-[220px]`.

#### [MODIFY] [Header.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/Header.tsx)
- Thêm prop `onMenuClick: () => void`.
- Hiển thị nút Hamburger `Bars3Icon` trên màn hình nhỏ (ẩn trên `lg`).

#### [MODIFY] [Sidebar.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/Sidebar.tsx)
- Nhận prop `isOpen: boolean` và `onClose: () => void`.
- Thay đổi class aside sang responsive: `w-[220px]` cố định, dịch chuyển `lg:translate-x-0` và trượt `${isOpen ? 'translate-x-0' : '-translate-x-full'}` trên mobile.
- Gọi hàm `onClose` khi click vào bất kỳ Link điều hướng nào trên thiết bị di động.

---

### 3. Pages & Widgets (Presentation Layer)

#### [MODIFY] [DashboardPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/dashboard/DashboardPage.tsx)
- Kiểm tra quyền: `const canExport = role === 'Admin' || role === 'Manufacturer'`.
- Nếu `canExport` thỏa mãn, render widget xuất báo cáo:
  - Dropdown chọn Report Type (Tồn kho, Vận đơn, Sự cố).
  - Nút bấm tải về CSV hoặc PDF.
  - Xử lý tạo và tải file Blob tải xuống tự nhiên qua thẻ `<a>` ảo mà không cần thư viện bên thứ ba.

#### [MODIFY] [en.json] & [vi.json]
- Bổ sung namespace `"reports"` đầy đủ dịch thuật cho việc xuất dữ liệu.

---

## Verification Plan

### Automated Tests
- Kiểm tra lỗi biên dịch TypeScript:
  ```bash
  npx tsc --noEmit
  ```
- Kiểm tra bundling production:
  ```bash
  npm run build
  ```

### Manual Verification
1. **Xuất báo cáo (Dashboard):**
   - Đăng nhập tài khoản `Admin` hoặc `Manufacturer`, kiểm tra xem widget "System Reports" có hiển thị trên Dashboard không.
   - Chọn loại báo cáo `Tồn kho`, định dạng `CSV`, bấm Export và kiểm tra xem tệp `report_inventory.csv` có được tải về thành công và mở ra có dữ liệu không.
   - Làm tương tự với định dạng `PDF` và các báo cáo `Vận đơn`, `Sự cố`.
   - Đăng nhập tài khoản `Distributor` hoặc `Retailer`, kiểm tra để chắc chắn widget xuất báo cáo hoàn toàn ẩn đi (do không đủ thẩm quyền).
2. **Mobile Responsive Navigation:**
   - Thu hẹp kích thước trình duyệt hoặc bật mô phỏng Responsive di động (width < 1024px).
   - Xác nhận Sidebar tự động ẩn và Header xuất hiện nút Hamburger menu.
   - Bấm vào nút Hamburger, xác nhận Sidebar trượt ra mượt mà và xuất hiện lớp phủ mờ che phần màn hình chính.
   - Bấm vào lớp phủ hoặc nhấp vào một link điều hướng, xác nhận Sidebar tự động đóng lại.
