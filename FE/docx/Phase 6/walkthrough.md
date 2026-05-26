# Walkthrough – Phase 6: Shipments (Xuất kho & Xác nhận nhận hàng) ✅

Tài liệu này tổng hợp chi tiết kỹ thuật và kết quả triển khai của Phase 6: Shipments trên Frontend.

---

## Các thành phần đã triển khai

### 1. Thành phần dữ liệu (Types) & API
- **Types**: Định nghĩa file [shipment.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/shipment.types.ts) chứa các interface `Shipment`, `ShipmentIssue` và `CreateShipmentDto`.
- **API**: Cập nhật [shipments.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/shipments.api.ts) để sử dụng các interface mới định nghĩa thay vì định nghĩa cục bộ.
- **TanStack Query Hooks**: Tạo [useShipments.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useShipments.ts) quản lý logic truy vấn danh sách, chi tiết vận đơn, tạo vận đơn mới (xuất kho) và xác nhận nhận hàng (receive shipment).

### 2. Giao diện & Component mới
- [ShipmentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentsPage.tsx): 
  - Hiển thị danh sách vận đơn của người dùng dưới dạng bảng (DataTable).
  - Tích hợp bộ lọc theo trạng thái vận đơn.
  - Tích hợp Modal Form cho phép xuất kho/tạo vận đơn mới (được kiểm soát chặt chẽ theo vai trò và gán cố định node xuất đối với Manufacturer/Distributor).
- [ShipmentDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentDetailPage.tsx):
  - Hiển thị chi tiết vận đơn, thông tin lô hàng đi kèm và sơ đồ tuyến đường di chuyển (Node xuất -> Node nhận).
  - Nút **"Xác nhận nhận hàng" (Confirm Receipt)** tự động hiển thị cho nhân sự ở Node nhận hoặc Admin khi vận đơn ở trạng thái `IN_TRANSIT`.
  - Hiển thị danh sách sự cố (Issues) liên kết với vận đơn.

### 3. Cấu hình hệ thống & Định tuyến
- [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx): Kích hoạt các Route thực tế `/shipments` và `/shipments/:id`.
- **i18n locales**: Bổ sung đầy đủ nhãn dịch thuật Tiếng Anh và Tiếng Việt trong [en.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/en.json) và [vi.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/vi.json).

---

## Kết quả kiểm tra (Verification)

### 1. TypeScript Compile Check
Biên dịch thành công mà không gặp bất kỳ lỗi cú pháp hay kiểu dữ liệu nào:
```bash
npx tsc --noEmit
# Thành công: 0 errors
```

### 2. Production Build Check
Chạy build thành công bản bundle FE:
```bash
npm run build
# Thành công
```
