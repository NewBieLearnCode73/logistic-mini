# Walkthrough - Phase 7: Incidents & Audit Logs (Sự cố & Nhật ký kiểm toán)

Chúng ta đã hoàn thành việc triển khai **Phase 7: Incidents & Audit Logs** trên Frontend, cung cấp các giao diện quản lý nâng cao cho quản trị viên (**Admin**) với các tính năng chuyên biệt, bảo mật và thiết kế SaaS tinh giản mật độ thông tin cao.

---

## 1. Chức năng đã thực hiện

### A. Quản lý Sự cố (`/incidents`)
- **Hiển thị danh sách Sự cố**: Sử dụng bảng dữ liệu phân trang hiển thị mã sự cố, mã vận đơn, loại sự cố, mức độ ưu tiên, trạng thái, người báo cáo và thời gian xảy ra.
- **Báo cáo Sự cố**:
  - Hộp thoại (Modal) cho phép báo cáo sự cố mới.
  - Chọn các vận đơn đang trong quá trình vận chuyển (`IN_TRANSIT`).
  - Validate dữ liệu đầu vào: Loại sự cố, mức độ ưu tiên và mô tả sự cố bắt buộc có độ dài tối thiểu 20 ký tự.
- **Quy tắc Phê duyệt kép (Dual-Signature Rule)**:
  - Khi Admin hiện tại chính là người tạo báo cáo sự cố, hệ thống sẽ tự động vô hiệu hóa (disabled) nút hành động **Xác nhận mất hàng (Confirm Lost)** và **Xác nhận tìm thấy (Confirm Found)**.
  - Hiển thị tooltip/title cảnh báo: *"Quy tắc phê duyệt kép: Người duyệt giải quyết sự cố phải khác với người báo cáo sự cố ban đầu."* để đảm bảo tính khách quan và an toàn dữ liệu.

### B. Nhật ký Hệ thống (`/audit-logs`)
- **Bảng nhật ký kiểm toán mật độ cao**: Hiển thị chi tiết các thay đổi dữ liệu theo thời gian thực (CREATE, UPDATE, DELETE, LOGIN...) cùng thông tin Actor, IP Address, và Entity ID.
- **Hộp thoại Xem chi tiết thay đổi dữ liệu (JSON Diff Viewer)**:
  - **Tab 1: Visual Comparison**: So sánh cấu trúc thuộc tính trực quan. Tự động so sánh `oldValues` và `newValues`, làm nổi bật các trường bị xóa (màu đỏ gạch ngang), các trường mới được thêm (màu xanh lá cây đậm), và các trường bị sửa đổi (màu xanh dương đậm/gạch ngang dữ liệu cũ). Các trường không đổi được làm mờ nhẹ để tập trung vào thay đổi.
  - **Tab 2: Raw JSON Payload**: Cho phép xem định dạng thô của `oldValues` và `newValues` cạnh nhau cho mục đích debug kỹ thuật chuyên sâu.

### C. Định cấu hình Route & i18n
- **Tích hợp router thực tế**: Đã thay thế các `PlaceholderPage` thành các page component thực tế là `IncidentsPage` và `AuditLogsPage` trong `App.tsx` dưới sự bảo vệ của `RoleGuard allowed={['Admin']}`.
- **Bản địa hóa (i18n)**: Hoàn tất tích hợp đa ngôn ngữ (English / Tiếng Việt) đồng bộ cho toàn bộ giao diện sự cố và nhật ký kiểm toán.

---

## 2. Kết quả kiểm tra (Verification Results)

- **TypeScript Compilation**: Chạy `npx tsc --noEmit` hoàn thành không lỗi.
- **Production Build Bundling**: Chạy `npm run build` biên dịch và tối ưu hóa tài nguyên thành công.

---

## 3. Cấu trúc thư mục các tệp được thêm mới/cập nhật

### Component & Pages
- [NEW] [AuditLogsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/audit/AuditLogsPage.tsx)
- [MODIFY] [IncidentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/incidents/IncidentsPage.tsx)
- [MODIFY] [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx)

### API & Types Layer (đã có sẵn & được verify)
- [incident.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/incident.types.ts)
- [audit.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/audit.types.ts)
- [incidents.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/incidents.api.ts)
- [audit.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/audit.api.ts)
