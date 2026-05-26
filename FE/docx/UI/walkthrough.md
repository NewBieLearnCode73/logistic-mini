# System Walkthrough – Phases 6, 7, 8 & 9

Tài liệu này tổng hợp chi tiết kỹ thuật và kết quả triển khai của các module: **Phase 6: Shipments**, **Phase 7: Incidents & Audit Logs**, **Phase 8: Public Scan, Traceability & Network Map**, và **Phase 9: Polish, Reports Export & Mobile Optimization** trên Frontend.

---

## Phase 6: Shipments (Xuất kho & Xác nhận nhận hàng) ✅

### Các thành phần đã triển khai

#### 1. Thành phần dữ liệu (Types) & API
- **Types**: Định nghĩa file [shipment.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/shipment.types.ts) chứa các interface `Shipment`, `ShipmentIssue` và `CreateShipmentDto`.
- **API**: Cập nhật [shipments.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/shipments.api.ts) để sử dụng các interface mới định nghĩa thay vì định nghĩa cục bộ.
- **TanStack Query Hooks**: Tạo [useShipments.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useShipments.ts) quản lý logic truy vấn danh sách, chi tiết vận đơn, tạo vận đơn mới (xuất kho) và xác nhận nhận hàng (receive shipment).

#### 2. Giao diện & Component mới
- [ShipmentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentsPage.tsx): 
  - Hiển thị danh sách vận đơn của người dùng dưới dạng bảng (`DataTable`).
  - Tích hợp bộ lọc theo trạng thái vận đơn.
  - Tích hợp Modal Form cho phép xuất kho/tạo vận đơn mới (được kiểm soát chặt chẽ theo vai trò và gán cố định node xuất đối với Manufacturer/Distributor).
- [ShipmentDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentDetailPage.tsx):
  - Hiển thị chi tiết vận đơn, thông tin lô hàng đi kèm và sơ đồ tuyến đường di chuyển (Node xuất -> Node nhận).
  - Nút **"Xác nhận nhận hàng" (Confirm Receipt)** tự động hiển thị cho nhân sự ở Node nhận hoặc Admin khi vận đơn ở trạng thái `IN_TRANSIT`.
  - Hiển thị danh sách sự cố (Issues) liên kết với vận đơn.

#### 3. Cấu hình hệ thống & Định tuyến
- [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx): Kích hoạt các Route thực tế `/shipments` và `/shipments/:id`.
- **i18n locales**: Bổ dung đầy đủ nhãn dịch thuật Tiếng Anh và Tiếng Việt trong [en.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/en.json) và [vi.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/vi.json).

---

## Phase 7: Incidents & Audit Logs (Sự cố & Nhật ký kiểm toán) ✅

### Các thành phần đã triển khai

#### 1. Thành phần dữ liệu (Types) & API
- **Types**: Định nghĩa file [incident.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/incident.types.ts) và [audit.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/audit.types.ts).
- **API**: Tạo [incidents.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/incidents.api.ts) và [audit.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/audit.api.ts) để gọi các API `/incidents` và `/audit-logs`.
- **TanStack Query Hooks**: Tạo [useIncidents.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useIncidents.ts) (phục vụ lấy danh sách sự cố, báo cáo sự cố, xác nhận lost/found) và [useAudit.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/useAudit.ts) (truy vấn danh sách nhật ký kiểm toán).

#### 2. Giao diện & Component mới
- [IncidentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/incidents/IncidentsPage.tsx):
  - Hiển thị danh sách các báo cáo sự cố toàn hệ thống.
  - Cho phép tạo mới báo cáo sự cố cho vận đơn đang ở trạng thái `IN_TRANSIT`.
  - Thực thi quy tắc **phê duyệt kép (Dual-Signature Rule)** bằng cách kiểm tra `incident.reportedBy === currentUserId` và tự động vô hiệu hóa các nút duyệt hành động (Confirm Lost / Confirm Found) kèm theo cảnh báo tooltip.
- [AuditLogsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/audit/AuditLogsPage.tsx):
  - Hiển thị danh sách nhật ký thay đổi dữ liệu thời gian thực.
  - Hộp thoại xem chi tiết thay đổi nâng cao:
    - **Visual Comparison**: So sánh và highlight rõ ràng trước (`oldValues`) và sau (`newValues`) dưới dạng bảng. Thể hiện các thay đổi bị xóa (đỏ + line-through), thêm mới (xanh lá cây) và sửa đổi (xanh dương + line-through cũ).
    - **Raw JSON Payload**: Hiển thị side-by-side JSON thô giúp quản trị viên kiểm tra cấu trúc dữ liệu thô.

#### 3. Cấu hình hệ thống & Định tuyến
- [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx): Kích hoạt route thực tế `/incidents` và `/audit-logs` trỏ tới các trang tương ứng bảo vệ bởi `RoleGuard allowed={['Admin']}`.

---

## Phase 8: Public Scan, Traceability & Network Map ✅

### Các thành phần đã triển khai

#### 1. Thành phần dữ liệu (Types) & API
- **Types**: Định nghĩa file [public.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/public.types.ts) chứa các interface `PublicTraceResponse`, `PublicTraceBatch`, `PublicTraceNode`, `PublicTraceEvent`.
- **API**: Tạo [public.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/public.api.ts) để gọi API `/public/trace/:batchCode`.
- **TanStack Query Hooks**: Tạo [usePublicTrace.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/usePublicTrace.ts) quản lý logic gọi API trace công cộng.

#### 2. Giao diện & Component mới
- [ScanPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/ScanPage.tsx):
  - Giao diện quét QR camera thời gian thực sử dụng trực tiếp thư viện `html5-qrcode` cho độ tương thích cao.
  - Hỗ trợ Sandbox simulator cho phép nhà phát triển nhấp giả lập quét nhanh các lô hàng thực tế trong hệ thống khi đăng nhập.
- [TracePage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/TracePage.tsx):
  - Tự động lấy tọa độ GPS từ trình duyệt (`navigator.geolocation`) gửi lên cùng API trace để hệ thống ghi nhận vị trí quét của người dùng.
  - Hiển thị thông tin Lô hàng, Sản phẩm đã được xác thực chính hãng.
  - Stepper hành trình chi tiết đi kèm bản đồ hành trình Leaflet vẽ Marker xuất xứ, Marker điểm hiện tại và chặng trung chuyển nối nhau bằng Polyline đứt nét.
- [MapPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/map/MapPage.tsx):
  - Bản đồ chuỗi cung ứng Admin toàn màn hình hiển thị toàn bộ node mạng lưới phân biệt theo màu sắc (M: Nhà máy, D: Nhà phân phối, W: Kho bãi, R: Đại lý bán lẻ).
  - Tự động vẽ luồng vận đơn đang vận chuyển (`IN_TRANSIT`, `DELAYED`) bằng đường nét đứt Indigo, nhấp vào xem thông tin vận đơn chi tiết.

#### 3. Cấu hình hệ thống & Định tuyến
- [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx): Kích hoạt các Route thực tế `/scan`, `/trace/:batchCode` và `/map` (bảo vệ bởi `RoleGuard allowed={['Admin']}`). Dọn dẹp hàm `PlaceholderPage` không sử dụng.

---

## Phase 9: Polish, Reports Export & Mobile Optimization ✅

### Các thành phần đã triển khai

#### 1. Xuất báo cáo hệ thống
- **API**: Bổ sung tích hợp API `POST /reports/export` hỗ trợ tải xuống nhị phân (Blob) các loại báo cáo tồn kho (`inventory`), vận đơn (`shipments`), và sự cố (`incidents`).
- **Giao diện Dashboard**:
  - Đối với các tài khoản có thẩm quyền (Admin và Manufacturer), một widget mới tên **"Báo cáo hệ thống"** được hiển thị ngay bên dưới mục KPI.
  - Cho phép người dùng lựa chọn loại báo cáo và định dạng xuất (CSV hoặc PDF).
  - Tải xuống tự nhiên qua thẻ điều hướng HTML5 `<a>` ảo sử dụng URL đối tượng Blob, tự động phân tích tên file trả về từ header `content-disposition` của backend.

#### 2. Tối ưu hóa Responsive di động (Mobile Optimization)
- **Standardized Sidebar Width**: Cập nhật chiều rộng Sidebar đồng bộ về `w-[220px]` (trước đó là `w-[150px]`) để loại bỏ khoảng hụt thiết kế 70px với vùng hiển thị chính `pl-[220px]`.
- **Hamburger Menu**: Trên màn hình di động, Sidebar sẽ tự động ẩn đi và xuất hiện nút Hamburger menu trên Header. Nhấp vào Hamburger menu sẽ trượt thanh Sidebar hiển thị ra ngoài.
- **Backdrop Overlay**: Tự động kích hoạt một lớp phủ màu đen mờ (`bg-black/30`) che phủ vùng nội dung còn lại khi Sidebar mở ra. Người dùng có thể nhấp vào lớp phủ này để đóng Sidebar nhanh chóng.
- **Close-on-navigate**: Tự động đóng Sidebar trên di động khi người dùng nhấp chọn bất kỳ liên kết điều hướng nào.

#### 3. Bản địa hóa (i18n)
- Thêm toàn bộ các nhãn dịch thuật đa ngôn ngữ Tiếng Anh và Tiếng Việt cho tính năng xuất báo cáo dưới namespace `"reports"`.

---

## Kết quả kiểm tra biên dịch (Verification)

Các module đã được kiểm tra tính tương thích và biên dịch thành công:

1. **TypeScript Compile Check**:
   ```bash
   npx tsc --noEmit
   # Kết quả: 0 errors
   ```

2. **Production Build Bundling Check**:
   ```bash
   npm run build
   # Kết quả:
   # dist/index.html                     0.60 kB │ gzip:   0.40 kB
   # dist/assets/index-C7T7vmvT.css     69.30 kB │ gzip:  15.94 kB
   # dist/assets/index-DLicF9n6.js   1,148.23 kB │ gzip: 334.53 kB
   # ✓ built in 2.03s
   ```

---

## Phase 10: Public Routes Layout, Sidebar Scan & Change Password ✅

### Các thành phần đã triển khai

#### 1. Điều hướng và bảo toàn Layout công khai khi Đăng nhập
- [PublicLayout.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/PublicLayout.tsx): Kiểm tra trạng thái `isAuthenticated` của người dùng. Nếu người dùng đã đăng nhập, hệ thống tự động trả về `<AppLayout />` thay cho Guest Layout tối giản. Nhờ đó, truy cập vào các trang `/scan` và `/trace/:batchCode` sẽ tự động hiển thị thanh Sidebar/Header quản trị mà không làm mất trạng thái.

#### 2. QR Scan link trong Sidebar
- [Sidebar.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/Sidebar.tsx): Import `QrCodeIcon` và bổ sung mục liên kết điều hướng `"Quét mã QR"` (đường dẫn `/scan`) vào menu chuỗi cung ứng cho tất cả các đối tượng người dùng.

#### 3. Chức năng Đổi mật khẩu cho người dùng hiện tại
- **Backend (BE)**:
  - Tạo DTO xác thực [change-password.dto.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/auth/dto/change-password.dto.ts) để kiểm tra đầu vào.
  - Cập nhật [auth.controller.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/auth/auth.controller.ts) bổ sung endpoint `POST /auth/change-password` dưới lớp bảo vệ `JwtAuthGuard`.
  - Cập nhật [users.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/users/users.service.ts) triển khai logic xác thực mật khẩu cũ và mã hóa/lưu mật khẩu mới sử dụng bcrypt.
- **Frontend (FE)**:
  - Thêm phương thức gọi API `changePassword` vào [auth.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/auth.api.ts).
  - Tích hợp nút **"Đổi mật khẩu"** (`KeyIcon`) phía trên nút Đăng xuất ở chân Sidebar. Khi nhấp chọn, một `ChangePasswordModal` (FormModal) sẽ hiển thị yêu cầu nhập Mật khẩu cũ, Mật khẩu mới và Xác nhận mật khẩu mới.
  - Cập nhật các tệp dịch thuật [vi.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/vi.json) và [en.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/en.json) bổ sung bản dịch cho tính năng này.

### Kết quả kiểm tra
1. **Biên dịch Frontend**: `npx tsc --noEmit` hoàn thành thành công không phát sinh lỗi.
2. **Đóng gói Frontend**: `npm run build` hoàn thành xuất sắc tạo ra file build trong thư mục `dist`.
3. **Biên dịch Backend**: `npm run build` hoàn thành thành công không phát sinh lỗi.

---

## Phase 11: Premium UI Redesign (SaaS Style) ✅

Chúng ta đã thiết kế lại toàn bộ giao diện của dự án theo quy chuẩn đặc tả của tài liệu [ui_redesign_specification.md](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/docx/ui_redesign_specification.md), loại bỏ các thành phần rườm rà và hướng tới cảm giác SaaS doanh nghiệp cao cấp (Linear, Vercel & Stripe style).

### Các thành phần đã triển khai

#### 1. Hệ thống Design Tokens & CSS nền tảng
- **[index.css](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/index.css)**:
  - Cấu hình lại màu nền cơ bản của body sang `zinc-50` và màu tối thuần sâu `zinc-950` cho Dark Mode.
  - Thiết kế các nút bấm `.btn-primary` (màu đen đậm tối giản ở light mode, màu trắng tinh khiết ở dark mode) và `.btn-secondary` sử dụng viền xám mỏng.
  - Bo viền `.card` mỏng tối đa (`border-zinc-200/50` / `border-zinc-800/40`) và tăng padding lên `p-6` tạo không gian thoáng đãng.
  - Chuẩn hóa các trường nhập liệu `.input-field` và thanh cuộn mỏng tinh tế.

#### 2. Nâng cấp các Component dùng chung (Core Components)
- **[DataTable.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/ui/DataTable.tsx)**:
  - Thay đổi đường viền bảng và các dòng dữ liệu sử dụng zinc mảnh 1px.
  - Tối ưu hóa hàng tiêu đề bảng với nền xám Zinc nhạt phân cấp rõ ràng và căn lề rộng hơn (`py-3 px-4`).
  - Thiết kế các nút chuyển trang và thanh điều hướng Pagination tối giản.
- **[TimelineStepper.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/domain/TimelineStepper.tsx)**:
  - Chuyển đường kẻ nối các sự kiện dọc sang 1px Zinc mảnh (`bg-zinc-200` / `bg-zinc-800`).
  - Thu nhỏ đường kính các nút sự kiện xuống `h-7 w-7` và icon xuống `h-4 w-4` tạo cấu trúc gọn gàng, ít tạp nhiễu thị giác.
- **[QRDisplay.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/domain/QRDisplay.tsx)**:
  - Bao bọc ảnh mã QR bằng khung chứa màu nền xám dịu (`bg-zinc-50` / `bg-zinc-900/40`) giúp bảo toàn độ tương phản quét mã.

#### 3. Điều chỉnh thiết kế toàn bộ các trang giao diện (Pages Redesign)
- **[DashboardPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/dashboard/DashboardPage.tsx)**:
  - Thay đổi toàn bộ màu chữ, màu viền và màu nền của các thẻ KPI Stat Cards sang Zinc/Slate.
  - Tối ưu hóa bảng thống kê Lô hàng gần đây và Vận đơn gần đây với padding rộng thoáng và viền siêu mảnh.
- **[BatchesPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/batches/BatchesPage.tsx) & [BatchDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/batches/BatchDetailPage.tsx)**:
  - Loại bỏ các màu xám cũ, tối ưu hóa các nhãn chi tiết lô hàng (metadata) dạng chữ in hoa 2xs tracking-wider màu nhạt.
  - Chỉnh sửa khung thông tin chi tiết và modal bán lẻ sang Zinc mỏng 1px.
- **[ShipmentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentsPage.tsx) & [ShipmentDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentDetailPage.tsx)**:
  - Đồng bộ bảng danh sách vận đơn và trang chi tiết với viền mỏng Zinc.
  - Nền các ô phân vùng tuyến đường chuyển sang `bg-zinc-50/50` ở light mode và `bg-zinc-900/10` ở dark mode kèm viền mỏng.
- **[IncidentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/incidents/IncidentsPage.tsx)**:
  - Cấu hình lại màu sắc các nhãn độ ưu tiên (LOW, MEDIUM, HIGH, CRITICAL) với nền mờ độ bão hòa cực thấp nhằm hạn chế visual noise.
- **[AuditLogsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/audit/AuditLogsPage.tsx)**:
  - Đổi màu so sánh Diff Viewer sang các sắc độ màu nhẹ có độ bão hòa cực thấp (đỏ nhạt, xanh lá nhạt, xanh lục nhạt) để giảm thiểu visual noise.
  - Thiết kế các thẻ phân loại hành động (Action Badges) thành dạng viền mỏng, chữ mảnh màu nhẹ thay vì các mảng màu đặc sặc sỡ.
- **[TracePage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/TracePage.tsx) & [ScanPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/ScanPage.tsx)**:
  - Áp dụng các Zinc tokens vào giao diện quét mã QR, các panel điều khiển Sandbox simulator và biểu đồ dòng hành trình.
- **[MapPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/map/MapPage.tsx)**:
  - Thiết kế lại Panel điều khiển và khung chú giải (legend) trên bản đồ nổi sử dụng viền Zinc siêu mỏng, nền mờ backdrop-blur và loại bỏ shadow lớn.
- **[LoginPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/auth/LoginPage.tsx) & [NotFoundPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/NotFoundPage.tsx)**:
  - Chuyển nền trang đăng nhập và trang 404 sang màu zinc dịu mắt, loại bỏ gradient sặc sỡ trên trang 404 và làm nổi bật nút bấm chính Vercel/Stripe style.

### Kết quả kiểm tra
1. **Biên dịch Frontend**: `npx tsc --noEmit` hoàn thành thành công không phát sinh lỗi.
2. **Đóng gói Frontend**: `npm run build` hoàn thành xuất sắc tạo ra file build trong thư mục `dist`.


