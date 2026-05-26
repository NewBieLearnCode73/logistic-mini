# Phase 7: Incidents & Audit Logs (Sự cố & Nhật ký kiểm toán) Implementation Plan

Triển khai module quản lý sự cố và nhật ký kiểm toán dành riêng cho Quản trị viên (**Admin**), bao gồm các chức năng: hiển thị danh sách sự cố và nhật ký kiểm toán hệ thống, báo cáo sự cố vận đơn, xác nhận giải quyết sự cố (Thất lạc/Hao hụt - khôi phục kho nguồn hoặc tìm thấy - chuyển tiếp kho nhận) tuân thủ quy tắc phê duyệt kép, và bảng xem chi tiết thay đổi giá trị (JSON payload) trong nhật ký kiểm toán.

---

## User Review Required

> [!IMPORTANT]
> **Phân quyền truy cập (Admin Only):**
> - Toàn bộ chức năng quản lý sự cố (`/incidents`) và xem nhật ký kiểm toán (`/audit-logs`) được giới hạn cho tài khoản vai trò **Admin**. Các vai trò khác không hiển thị trong Sidebar và bị chặn bởi `RoleGuard`.

> [!WARNING]
> **Quy tắc phê duyệt kép (Dual-Signature Rule) cho Sự cố:**
> - Hành động **"Xác nhận mất hàng" (Confirm Lost)** hoặc **"Xác nhận tìm thấy" (Confirm Found)** sẽ gọi API backend. Backend bắt buộc kiểm tra người thực hiện duyệt giải quyết sự cố phải **khác** với người báo cáo sự cố ban đầu (`incident.reportedBy !== currentUser.userId`).
> - Giao diện sẽ hiển thị ghi chú cảnh báo và disable các nút giải quyết sự cố nếu Admin hiện tại chính là người đã báo cáo sự cố đó.

> [!IMPORTANT]
> **Hộp thoại xem nhật ký thay đổi (JSON diff viewer):**
> - Trong trang Nhật ký kiểm toán (`AuditLogsPage.tsx`), khi nhấp vào cột Actions của một bản ghi, một Modal sẽ mở ra hiển thị so sánh dữ liệu trước (`oldValues`) và sau (`newValues`) dưới dạng JSON định dạng đẹp mắt để dễ dàng kiểm tra lịch sử thao tác dữ liệu.

---

## Open Questions

Không có câu hỏi mở nào. Các API đầu cuối (`/incidents`, `/audit-logs`) đã sẵn sàng hoạt động ở backend.

---

## Proposed Changes

### 1. Types & APIs (Data Layer)

#### [NEW] [incident.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/incident.types.ts)
- Khai báo kiểu dữ liệu cho `IncidentReport`, `ShipmentIssue` và `CreateIncidentDto`.

#### [NEW] [audit.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/audit.types.ts)
- Khai báo kiểu dữ liệu cho `AuditLog` và `ScanLog`.

#### [NEW] [incidents.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/incidents.api.ts)
- Khai báo các hàm gọi API: `getList`, `create`, `confirmLost`, `confirmFound`.

#### [NEW] [audit.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/audit.api.ts)
- Khai báo hàm gọi API lấy danh sách nhật ký kiểm toán: `getList`.

---

### 2. React Query Hooks (State Management)

#### [NEW] [useIncidents.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useIncidents.ts)
- `useIncidentsList(params)`: Query danh sách các báo cáo sự cố.
- `useCreateIncident()`: Mutation báo cáo sự cố vận đơn, làm mới cache `['incidents']` và `['shipments']`.
- `useConfirmLostIncident()`: Mutation xác nhận mất hàng, hoàn kho cũ, làm mới cache `['incidents']`, `['batches']`, `['shipments']`.
- `useConfirmFoundIncident()`: Mutation xác nhận tìm thấy hàng, nhập kho mới, làm mới cache `['incidents']`, `['batches']`, `['shipments']`.

#### [NEW] [useAudit.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useAudit.ts)
- `useAuditLogsList(params)`: Query danh sách nhật ký kiểm toán hệ thống.

---

### 3. Pages & UI Components (Presentation Layer)

#### [NEW] [IncidentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/incidents/IncidentsPage.tsx)
- Hiển thị bảng danh sách các sự cố.
- Cột thao tác: hiển thị nút xác nhận mất/xác nhận tìm thấy. Nếu người dùng hiện tại trùng với người báo cáo, nút sẽ bị disabled kèm theo chú thích quy tắc kép.
- Modal **"Báo cáo sự cố mới"**:
  - Cho phép chọn vận đơn đang vận chuyển (lọc danh sách shipments ở trạng thái `IN_TRANSIT`).
  - Chọn loại sự cố, mức độ ưu tiên và nhập mô tả chi tiết (validate tối thiểu 20 ký tự).

#### [NEW] [AuditLogsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/audit/AuditLogsPage.tsx)
- Hiển thị bảng nhật ký kiểm toán hệ thống với mật độ thông tin cao (dense table).
- Cột Actions hiển thị nút để mở hộp thoại hiển thị so sánh JSON dữ liệu cũ/mới (`oldValues` / `newValues`).

#### [MODIFY] [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx)
- Kích hoạt route `/incidents` và `/audit-logs` trỏ tới các trang thực tế thay vì placeholder.

#### [MODIFY] [en.json] & [vi.json]
- Bổ sung đầy đủ dịch thuật cho các namespaces `incident` và `audit`.

---

## Verification Plan

### Automated Tests
- Kiểm tra lỗi biên dịch TypeScript:
  ```bash
  npx tsc --noEmit
  ```
- Kiểm tra tính tương thích và build thành công dự án FE:
  ```bash
  npm run build
  ```

### Manual Verification
1. **Báo cáo sự cố:**
   - Tạo một vận đơn mới (IN_TRANSIT).
   - Đăng nhập Admin, vào trang Sự cố, báo cáo sự cố cho vận đơn đó (Chọn vận đơn, loại sự cố `MISSING`, mô tả > 20 chữ).
   - Kiểm tra xem vận đơn và lô hàng tương ứng có đổi trạng thái sang `INVESTIGATING` hay không.
2. **Quy tắc phê duyệt kép:**
   - Vẫn là tài khoản Admin vừa báo cáo, kiểm tra xem nút duyệt hành động "Confirm Lost" hoặc "Confirm Found" có bị disabled hay không.
   - Sử dụng một tài khoản Admin khác, truy cập trang Sự cố, kiểm tra xem các nút hành động đã được kích hoạt và cho phép thực thi hay chưa.
3. **Xem chi tiết thay đổi kiểm toán:**
   - Thực hiện cập nhật thông tin một sản phẩm hoặc nhân sự bất kỳ.
   - Đăng nhập Admin, vào trang Nhật ký kiểm toán.
   - Tìm bản ghi tương ứng vừa cập nhật, click xem thay đổi, kiểm tra xem cấu trúc dữ liệu JSON cũ và mới hiển thị trực quan và chính xác.
