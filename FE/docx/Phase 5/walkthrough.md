# Walkthrough – Phase 5: Batches & QR Code Lifecycle

Trang quản lý lô hàng (**Batches Management**) và các thành phần liên kết mã QR cùng Timeline Stepper đã được tích hợp hoàn tất vào dự án.

## 1. Các Thành Phần Đã Triển Khai
- **Kiểu dữ liệu**: [batch.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/batch.types.ts) định nghĩa các interface `Batch`, `BatchQrCode`, `TimelineEvent` phục vụ kiểm soát dữ liệu.
- **Client & Hook**: Cập nhật [batches.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/batches.api.ts) và tạo [useBatches.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useBatches.ts) tích hợp truy vấn danh sách, chi tiết, timeline và các mutation tạo/bán hàng/regenerate QR.
- **Timeline Stepper**: [TimelineStepper.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/domain/TimelineStepper.tsx) hiển thị biểu đồ dọc các mốc dịch chuyển của lô hàng (CREATED, SOLD, IN_TRANSIT, RECEIVED, v.v.).
- **QR Display**: [QRDisplay.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/domain/QRDisplay.tsx) hiển thị ảnh QR, hỗ trợ tải PNG và in nhãn dán tối ưu bằng hộp thoại in của trình duyệt.
- **Trang chi tiết & Danh sách**:
  - [BatchesPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/batches/BatchesPage.tsx): Xem danh sách phân trang có RLS, tạo lô hàng mới.
  - [BatchDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/batches/BatchDetailPage.tsx): Xem chi tiết lô hàng, timeline và thực hiện bán lẻ sản phẩm (khấu trừ trực tiếp từ kho cửa hàng).
- **Routing**: Cấu hình route `/batches` và `/batches/:id` trong [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx).

## 2. Kết Quả Kiểm Tra
- Đạt `0 errors` khi chạy kiểm tra biên dịch kiểu dữ liệu `npx tsc --noEmit`.
- Dự án build thành công bản đóng gói production (`npm run build`) trong `1.31s`.
