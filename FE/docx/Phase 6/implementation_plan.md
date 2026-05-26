# Phase 6: Shipments (Xuất kho & Xác nhận nhận hàng) Implementation Plan

Triển khai module quản lý vận đơn (**Shipments Management**), bao gồm các chức năng: hiển thị danh sách vận đơn (phân quyền xem theo Node công tác của người dùng), xem thông tin chi tiết vận đơn kèm lịch sử và sự cố, tạo vận đơn mới (xuất kho chuyển giao hàng hóa giữa các Node), và xác nhận nhận hàng (khấu trừ kho cũ và tự động tăng kho mới).

---

## User Review Required

> [!IMPORTANT]
> **Vai trò thực hiện hành động Tạo vận đơn (Create Shipment):**
> - Nút **"Tạo vận đơn" (Create Shipment)** chỉ hiển thị đối với người dùng thuộc vai trò **Admin**, **Manufacturer**, hoặc **Distributor**.
> - Nếu người dùng là **Admin**: Admin có quyền chọn cả Node xuất (**Source Node**) và Node nhận (**Destination Node**).
> - Nếu là **Manufacturer** hoặc **Distributor**: Node xuất được tự động điền cố định chính là Node làm việc hiện tại của nhân sự (`nodeId`), họ chỉ được phép chọn Node nhận và chọn lô hàng (Batch) đang ở tại Node của họ để xuất đi.

> [!WARNING]
> **Khấu trừ và kiểm tra tồn kho khi tạo vận đơn:**
> - Hệ thống backend đã triển khai kiểm tra tồn kho khả dụng (`quantityAvailable`) của lô hàng tại Node xuất bằng kỹ thuật **Pessimistic Write Lock**.
> - Giao diện chọn lô hàng sẽ hỗ trợ hiển thị lượng hàng khả dụng để nhân viên nhập số lượng xuất kho hợp lệ.

> [!IMPORTANT]
> **Xác nhận nhận hàng (Confirm Receipt):**
> - Nút **"Xác nhận nhận hàng" (Confirm Receipt)** chỉ hiển thị đối với người dùng thuộc Node nhận (**Destination Node**) của vận đơn đó hoặc là **Admin**, và vận đơn phải đang ở trạng thái **IN_TRANSIT**.
> - Khi bấm xác nhận, hệ thống backend sẽ tự động cập nhật trạng thái vận đơn thành **RECEIVED**, cập nhật trạng thái lô hàng thành **RECEIVED**, cập nhật vị trí hiện tại của lô hàng sang Node nhận, tăng số lượng tồn kho tương ứng tại Node nhận và ghi chép mốc sự kiện vào lịch sử hành trình.

---

## Open Questions

Không có câu hỏi mở nào. Các API đầu cuối (`/shipments`, `/shipments/:id`, `/shipments/:id/receive`) đã sẵn sàng hoạt động ở backend.

---

## Proposed Changes

### 1. Types & APIs (Data Layer)

#### [NEW] [shipment.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/shipment.types.ts)
- Khai báo kiểu dữ liệu cho `Shipment`:
  - `id`, `trackingCode`, `batchId`, `sourceNodeId`, `destinationNodeId`, `quantityShipped`, `quantityReceived`, `status`, `createdBy`, `notes`, `shippedAt`, `expectedDeliveryDate`, `actualDeliveryDate`, `createdAt`.
  - Nested relations: `batch`, `sourceNode`, `destinationNode`, `creator`, `receiver`, `issues`.
- Khai báo DTO: `CreateShipmentDto`.

#### [MODIFY] [shipments.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/shipments.api.ts)
- Thay thế các interface cục bộ bằng kiểu dữ liệu import từ [shipment.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/shipment.types.ts).

---

### 2. React Query Hooks (State Management)

#### [NEW] [useShipments.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useShipments.ts)
- `useShipmentsList(params)`: Query danh sách các vận đơn có phân trang và bộ lọc status.
- `useShipmentDetail(id)`: Query lấy chi tiết một vận đơn cụ thể.
- `useCreateShipment()`: Mutation xuất kho/tạo vận đơn mới, đồng thời làm mới cache `['shipments']` và `['batches']`.
- `useReceiveShipment()`: Mutation xác nhận đã nhận hàng tại node đích, làm mới cache `['shipments', id]`, `['batches']`, và `['dashboard', 'stats']`.

---

### 3. Pages & UI Components (Presentation Layer)

#### [NEW] [ShipmentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentsPage.tsx)
- Hiển thị danh sách các vận đơn liên quan tới Node làm việc của người dùng (Admin xem toàn bộ).
- Tích hợp DataTable hỗ trợ tìm kiếm và lọc theo trạng thái vận đơn.
- Hộp thoại **"Tạo vận đơn mới"** (Create Shipment Modal):
  - Form chọn Lô hàng (Batch) xuất đi (sử dụng danh sách từ API `/batches` chỉ hiển thị các lô hàng hiện diện tại Node xuất có tồn kho > 0).
  - Chọn Node nhận (Destination Node) từ danh sách active nodes (loại trừ Node xuất).
  - Nhập số lượng cần xuất, ngày dự kiến giao và ghi chú.
  - Tích hợp kiểm tra và hiển thị các cảnh báo validation đầy đủ.

#### [NEW] [ShipmentDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentDetailPage.tsx)
- Trang chi tiết vận đơn tại route `/shipments/:id`.
- Bố cục chia 2 cột:
  - Cột trái:
    - Khung chi tiết Vận đơn (Mã vận đơn, Trạng thái, Ngày đi/dự kiến đến/thực tế đến, Người tạo/Người ký nhận, Ghi chú).
    - Khung chi tiết Lô hàng & Sản phẩm liên đới (Mã lô hàng, Sản phẩm, SKU, Số lượng xuất).
    - Khung thông tin tuyến đường (Node xuất -> Node nhận kèm địa chỉ tương ứng).
  - Cột phải:
    - Bảng điều khiển hành động: Nút **"Xác nhận nhận hàng" (Confirm Receipt)** nổi bật chỉ hiển thị cho nhân sự ở Node nhận hoặc Admin khi vận đơn ở trạng thái `IN_TRANSIT`.
    - Hiển thị danh sách các Sự cố (Issues) liên kết nếu có.

#### [MODIFY] [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx)
- Đăng ký import và thay thế router placeholder `/shipments` và `/shipments/:id` bằng các trang thực tế mới xây dựng.

#### [MODIFY] [en.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/en.json) & [vi.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/vi.json)
- Bổ dung đầy đủ các nhãn, thông báo và các khóa ngôn ngữ liên quan tới vận đơn.

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
1. **Tạo vận đơn (Manufacturer hoặc Distributor):**
   - Đăng nhập bằng tài khoản Manufacturer, tạo lô hàng mới.
   - Chuyển sang danh sách Vận đơn, bấm "Tạo vận đơn mới", chọn lô hàng vừa tạo, chọn một Distributor làm Node nhận, điền thông tin và bấm gửi.
   - Xác nhận lô hàng đó được trừ số lượng khả dụng ở kho nguồn, và vận đơn ở trạng thái **Đang vận chuyển (IN_TRANSIT)**.
2. **Xem chi tiết vận đơn:**
   - Xem thông tin tuyến đường đi từ Node nguồn đến Node nhận hiển thị chính xác.
3. **Xác nhận nhận hàng (Distributor):**
   - Đăng nhập bằng tài khoản Distributor thuộc Node nhận đó.
   - Truy cập vào chi tiết vận đơn, bấm nút "Xác nhận nhận hàng".
   - Xác nhận trạng thái vận đơn chuyển sang **Đã nhận (RECEIVED)** và lô hàng hiển thị có tồn kho tương ứng ở Node nhận.
