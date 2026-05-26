# Walkthrough – Phase 3: Master Data (Nodes + Products)

Phase 3 đã được triển khai hoàn tất với cấu trúc mã nguồn sạch, phân chia rõ ràng giữa các lớp: Types, API Clients, React Query Hooks, Reusable UI Components và CRUD Pages. Toàn bộ mã nguồn đã vượt qua kiểm tra biên dịch TypeScript (`0 errors`) và build thành công bản bundle cho Production.

---

## Các Thay Đổi Đã Thực Hiện

### 1. Types & API Client (Data Layer)
- **Types**:
  - [node.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/node.types.ts): Khai báo kiểu dữ liệu cho `Node`, `CreateNodeDto`, `UpdateNodeDto` bám sát schema NestJS backend.
  - [product.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/product.types.ts): Khai báo kiểu dữ liệu cho `Product`, `CreateProductDto`, `UpdateProductDto`.
- **API Services**:
  - [nodes.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/nodes.api.ts): Các hàm HTTP client thao tác với `/nodes`. Hàm `getList` được định nghĩa trả về kiểu `PaginatedResponse<Node>` tương ứng với dịch vụ NestJS.
  - [products.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/products.api.ts): Các hàm HTTP client thao tác với `/products`.

### 2. State Management (TanStack Query Hooks)
- [useNodes.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useNodes.ts): 
  - Hook truy vấn `useNodesList` với bộ cache `staleTime = 5 minutes`.
  - Mutation hooks cho các hành động CRUD: `useCreateNode`, `useUpdateNode`, `useDeleteNode`. Tự động invalidate query `['nodes']` để reload bảng và bắt lỗi xung đột phiên bản `409` (Optimistic Locking).
- [useProducts.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useProducts.ts):
  - Hook truy vấn `useProductsList` và chi tiết `useProductDetail`.
  - Mutation hooks cho các hành động CRUD: `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`.

### 3. Reusable UI Components (Presentation Layer)
- [DataTable.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/ui/DataTable.tsx): Component bảng dữ liệu đa năng hỗ trợ generic type `<T>`:
  - Tự động tích hợp thanh tìm kiếm debounced (chờ 300ms giảm tải cho API).
  - Tích hợp bộ chuyển đổi trang (Pagination) và sắp xếp cột (Sorting).
  - Giao diện compact `text-[13px]`, viền mảnh và background đổi màu theo dark/light mode.
- [FormModal.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/ui/FormModal.tsx): Biểu mẫu Popup sử dụng `@headlessui/react` `Dialog` với hiệu ứng mờ backdrop dịu mắt và kích thước tùy chỉnh.
- [ConfirmDialog.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/ui/ConfirmDialog.tsx): Dialog xác nhận thao tác nguy hiểm (ví dụ: Xóa Node hoặc Sản phẩm).
- [EmptyState.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/ui/EmptyState.tsx): Hiển thị hình ảnh minh họa SVG khi danh sách trống.
- [LoadingSkeleton.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/ui/LoadingSkeleton.tsx): Giả lập shimmer loading cho cả bảng và biểu mẫu.

### 4. CRUD Pages & Routing
- [NodesPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/nodes/NodesPage.tsx):
  - Chỉ hiển thị với vai trò **Admin**.
  - Hiển thị đầy đủ thông tin: Tên node, Loại node (i18n), Địa chỉ, Vĩ độ/Kinh độ, Trạng thái (dot indicator).
  - Client-side validation: Tên không để trống, Vĩ độ hợp lệ (-90 đến 90), Kinh độ hợp lệ (-180 đến 180).
- [ProductsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/products/ProductsPage.tsx):
  - Cho phép tất cả các vai trò xem danh sách.
  - Phân quyền động: Chỉ người dùng có vai trò **Admin** mới nhìn thấy nút "Thêm sản phẩm" và các nút sửa/xóa trên từng hàng.
  - Tích hợp bộ lọc danh mục và ô tìm kiếm SKU.
- [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx): Thay thế component placeholder cũ của `/nodes` và `/products` bằng các trang thực tế mới dựng.

---

## Kiểm Tra & Xác Minh (Verification)

### 1. TypeScript Compile Check
Biên dịch không gặp bất kỳ lỗi cú pháp hay kiểu dữ liệu nào:
```bash
npx tsc --noEmit
# Thành công: 0 errors
```

### 2. Production Build Check
Chạy build thành công bundle tĩnh cho FE trong `37.24 giây`:
```bash
npm run build
# Thành công:
# dist/index.html                   0.60 kB
# dist/assets/index-CVLxnIRJ.css   38.41 kB
# dist/assets/index-YeN2kF2U.js   493.31 kB
```
