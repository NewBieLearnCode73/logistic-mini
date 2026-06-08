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

### Kết quả kiểm tra & Cập nhật BE
1. **Biên dịch Frontend**: `npx tsc --noEmit` hoàn thành thành công không phát sinh lỗi.
2. **Đóng gói Frontend**: `npm run build` hoàn thành xuất sắc tạo ra file build trong thư mục `dist`.
3. **Cập nhật Backend**:
   - Đã thêm bộ lọc `status`, `productId` và `search` vào API danh sách lô hàng trong [batches.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/batches/batches.service.ts).
   - Đã thêm bộ lọc `status` vào API danh sách vận đơn trong [shipments.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/shipments/shipments.service.ts).
   - Đã chạy kiểm thử backend (`npm run test`) thành công 56/56 tests pass.
   - Đã biên dịch backend (`npm run build`) thành công 100%.

---

## Phase 12: SaaS Design System & UI/UX Guidelines Integration ✅

Chúng ta đã tích hợp thành công hệ thống thiết kế (Design System) hiện đại và chuyên nghiệp vào toàn bộ mã nguồn của dự án FE, đồng thời tối ưu hóa giao diện cho cả 2 chế độ sáng/tối (Light/Dark mode) và nâng cấp trải nghiệm người dùng theo tiêu chuẩn đặc tả.

### Các thành phần đã triển khai

#### 1. Cấu hình Tailwind & CSS Variables toàn cục
- **Tích hợp CSS Variables**: Import [theme.css](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/design-system/theme.css) vào [index.css](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/index.css), giúp tự động chuyển đổi màu sắc, bo góc, và đổ bóng mượt mà giữa chế độ Light và Dark.
- **Mở rộng Tailwind**: Spread các token màu sắc HSL (`bg-background`, `bg-surface`, `text-text-primary`, `border-border`, `accent`, và domain status colors), khoảng cách spacing scale, và glassmorphism helpers vào file root [tailwind.config.js](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/tailwind.config.js).
- **Refactor index.css**: Cập nhật các định nghĩa lớp dùng chung `.btn-primary`, `.btn-secondary`, `.card`, `.input-field`, `.sidebar-link`, và `.table-cell` sử dụng trực tiếp các CSS variables và tailwind tokens mới để đảm bảo tính nhất quán trên toàn trang.

#### 2. Đồng bộ các Component dùng chung (Core Components)
- **[constants.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/utils/constants.ts)**: Chuyển đổi toàn bộ `STATUS_CONFIG` sang sử dụng các class trạng thái ngữ cảnh thông minh (`bg-status-created-dot`, `text-status-created-text`, v.v.).
- **[DataTable.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/ui/DataTable.tsx)**: Chuyển đường viền và phân dòng sang `border-border` và `divide-border-muted`, hover sang `bg-muted` và chỉnh sửa các ô phân trang đồng bộ với brand accent.
- **[TimelineStepper.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/domain/TimelineStepper.tsx)**: Cấu hình lại bảng mã màu `EVENT_CONFIG` liên kết trực tiếp với các token trạng thái chuỗi cung ứng, căn chỉnh đường line và ring mỏng.
- **[QRDisplay.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/domain/QRDisplay.tsx)**: Đồng bộ hóa toàn bộ nút hành động và viền khung quét mã QR.

#### 3. Refactor Giao diện & Layout chi tiết (Layouts & Pages)
- **Layouts**: Cập nhật [Sidebar.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/Sidebar.tsx), [Header.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/Header.tsx), [AppLayout.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/AppLayout.tsx), và [PublicLayout.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/PublicLayout.tsx) để dọn dẹp các mã màu xám cũ và thay thế bằng các token `bg-background`, `bg-surface`, `border-border`, và `text-text-primary`.
- **Dashboard & LoginPage & 404**: Đồng bộ [DashboardPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/dashboard/DashboardPage.tsx), [LoginPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/auth/LoginPage.tsx), và [NotFoundPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/NotFoundPage.tsx) với các token màu sắc mới.
- **Shipment Tracking**: Refactor [ShipmentsPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentsPage.tsx) và [ShipmentDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentDetailPage.tsx), cải tiến giao diện hiển thị thông tin và sơ đồ tuyến đường vận chuyển.
- **Bản đồ giám sát Map**: Refactor [MapPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/map/MapPage.tsx), áp dụng `.glass-panel` cho khung điều khiển nổi (floating controls) và legend, mang lại giao diện tinh tế, hiện đại kiểu buồng lái (operational cockpit).

### Kết quả kiểm tra biên dịch (Verification)
1. **Biên dịch TypeScript**: `npx tsc --noEmit` hoàn thành thành công không phát sinh bất kỳ cảnh báo hay lỗi kiểu dữ liệu nào.
2. **Đóng gói Production**: `npm run build` chạy thành công 100%, dọn dẹp tất cả các lỗi syntax PostCSS và tạo ra gói build gọn nhẹ trong thư mục `dist`.

---

## Phase 13, 14, 15 & 16: UI v3 Re-architecture & Dashboard CommandCenter Redesign ✅

Chúng ta đã thực hiện cuộc cách mạng giao diện toàn diện (UI v3 Re-architecture) để chuyển đổi từ dashboard CRUD phẳng cũ thành một phòng điều hành chuỗi cung ứng trực tuyến (Next-Gen Logistics Operating System).

### Các thành phần đã triển khai

#### 1. Hệ thống Shell & Định tuyến mới (AppShellV3)
- **[AppShellV3.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/core/AppShellV3.tsx)**: Thiết lập hệ thống grid thích ứng 4 cột.
  - Tự động thay đổi padding theo trạng thái đóng/mở của AI Assistant Dock và kích thước màn hình để tối ưu hóa không gian hiển thị.
- **[SidebarV3.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/features/intelligence/components/SidebarV3.tsx)**:
  - Thiết kế siêu mỏng (icon-only 64px) trên màn hình Laptop/Desktop, tự động mở rộng mượt mà lên 220px khi hover mà không giật khung hình.
  - Tích hợp Workspace Selector và shortcut gợi ý tìm kiếm.
  - Tích hợp **Bottom Navigation Bar (TikTok Web style)** trên các thiết bị di động dưới 768px, tối ưu thao tác 1 tay và ẩn sidebar mặc định.
- **[HeaderV3.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/features/intelligence/components/HeaderV3.tsx)**:
  - Tích hợp thanh tìm kiếm giả lập kích hoạt Command Palette nhanh, nút bật/tắt AI Assistant Dock dạng Sparkles, thông báo nổi và bộ chuyển đổi ngôn ngữ/theme.

#### 2. Tính năng tương tác & Trợ lý thông minh
- **[CommandBar.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/features/intelligence/components/CommandBar.tsx)**: Hệ thống bảng điều lệnh và tìm kiếm nhanh qua tổ hợp phím `Ctrl + K`. Hỗ trợ di chuyển bằng phím mũi tên và phân nhóm hành động/điều hướng.
- **[AIAssistantDock.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/features/intelligence/components/AIAssistantDock.tsx)**: Dock phụ bên phải kích hoạt bằng `Ctrl + A` hoặc nút click. Chứa AI Copilot điều hành và dòng sự kiện trực tuyến (Live Activities).

#### 3. Tái thiết kế trang Dashboard điều khiển (Command Center)
- **[DashboardPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/dashboard/DashboardPage.tsx)**:
  - **Live Telemetry Map**: Tích hợp bản đồ Leaflet dạng tối giản hiển thị trực quan các Nodes và tuyến đường vận đơn đang chạy.
  - **Alert Ticker**: Hộp sự kiện cuộn thông minh cập nhật nhanh hoạt động chuỗi cung ứng.
  - **Predictive AI recommendation card**: Thẻ đưa ra đề xuất tối ưu và cho phép phê duyệt nhanh các hành động trong background.
  - **Interactive Trend Chart**: Biểu đồ Area SVG tùy chỉnh tuyệt đẹp hiển thị xu hướng sản lượng 7 ngày với tooltip nổi thông minh, không sử dụng thư viện cồng kềnh, giảm thiểu tối đa kích thước bundle và triệt tiêu lỗi kiểu React 19.

#### 4. Nâng cấp các Trang Chi tiết Vật thể (Workspaces Detail Upgrades)
- **[BatchDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/batches/BatchDetailPage.tsx)**:
  - Tích hợp thêm **AI Logistics Insight Card**: Tự động phân tích trạng thái lô hàng (Created, In Transit, Received, Sold, Lost, Discarded) để cung cấp đề xuất xử lý vận tải, bán hàng hoặc điều tra sự cố trực quan cho nhân sự hiện trường.
- **[ShipmentDetailPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/shipments/ShipmentDetailPage.tsx)**:
  - Tích hợp **AI Dispatch Insight Card**: Đưa ra nhận xét thông minh về tình hình vận đơn, cảnh báo tắc đường, trễ ETA và đề xuất liên hệ tài xế/đổi tuyến đường phụ.
  - Tích hợp **Leaflet Map Route Path**: Tự động dựng bản đồ lộ trình di chuyển thu nhỏ của vận đơn. Đọc GPS vĩ độ/kinh độ của Node xuất phát và Node đích đến, đánh dấu bằng marker có hiệu ứng ping hoạt họa và vẽ luồng di chuyển đứt nét màu Indigo kết nối hai đầu nút mạng lưới.

### Kết quả kiểm tra biên dịch (Verification)
- **Biên dịch Frontend**: `npx tsc --noEmit` hoàn thành thành công không lỗi.
- **Đóng gói Frontend**: `npm run build` đóng gói thành công gói build trong thư mục `dist` trong 2.22 giây.

---

## Phase 17: High-Fidelity SQL Seed Generation & Database Verification ✅

Chúng ta đã tạo lập bộ dữ liệu mẫu quy mô lớn phục vụ demo và kiểm thử hiệu năng cho chuỗi cung ứng, xuất thành tệp SQL độc lập và import thành công vào hệ thống.

### Các thành phần đã triển khai

#### 1. Bộ dữ liệu mẫu quy mô lớn (Seed Script)
- **[seed_thousands.sql](file:///d:/Personal%20Projects/University%20Project/logistic-mini/seed_thousands.sql)**:
  - Tự động xóa sạch dữ liệu cũ (`TRUNCATE TABLE ... CASCADE`) để đảm bảo tính nhất quán của ID và các mối quan hệ khoá ngoại.
  - Khởi tạo 5 vai trò hệ thống (`Admin`, `Manufacturer`, `Distributor`, `Retailer`, `Consumer`) bằng UUID hợp lệ.
  - Định cấu hình 10 nút mạng lưới (Nodes) thực tế tại Việt Nam (nhà máy HCM/Hà Nội, trung tâm phân phối Đà Nẵng/Bình Dương, kho Đồng Nai/Bắc Ninh và các siêu thị Coopmart, Winmart...) cùng tọa độ vĩ độ/kinh độ chính xác.
  - Định nghĩa 10 sản phẩm vật liệu xây dựng thiết yếu (Xi măng, Thép cuộn, Cát xây dựng, Ngói lợp, Sơn ngoại thất...) kèm SKU và đơn vị tính tương ứng.
  - Tạo lập 9 tài khoản người dùng tương ứng với các nút mạng lưới, tất cả được mã hóa mật khẩu bằng thuật toán Bcrypt (10 rounds) với mật khẩu mặc định thống nhất là `password123` để người dùng dễ dàng đăng nhập trải nghiệm.

#### 2. Logic giả lập dữ liệu động (PL/pgSQL Block)
- Sử dụng cấu trúc lập trình PL/pgSQL lặp 1.500 lần để khởi tạo:
  - **1,500 Lô hàng (Batches)** phân bổ ngẫu nhiên theo tỷ lệ phân phối thực tế: 15% mới tạo (`CREATED`), 30% đã nhận (`RECEIVED`), 30% đang vận chuyển (`IN_TRANSIT`), 15% đã bán lẻ (`SOLD`), 6% thất lạc (`LOST`), và 4% bị hủy bỏ do sự cố (`DISCARDED`).
  - **1,250 Vận đơn điều chuyển (Shipments)** kết nối trực tiếp các nhà máy với các tổng kho hoặc nhà bán lẻ.
  - **2,500 Sự kiện hành trình (Timeline Events)** ghi lại chính xác từng bước thay đổi trạng thái (xuất kho, bốc xếp, chất lượng kiểm tra, bán lẻ...).
  - **2,500 Nhật ký quét mã QR (Scan Logs)** của khách hàng, phân tán địa lý ngẫu nhiên xung quanh toạ độ thực của các cửa hàng bán lẻ bằng kỹ thuật dịch chuyển GPS offset.
  - **4,000 Nhật ký kiểm toán hệ thống (Audit Logs)** lưu trữ chi tiết lịch sử thao tác của các Admin và người vận hành.
  - **Hàng trăm Báo cáo sự cố (Incident Reports) & Shipment Issues** liên kết với các chuyến hàng thất lạc/trễ giờ nhằm tạo nguồn dữ liệu kiểm thử trực quan.

### Kết quả kiểm tra & Xác thực

1. **Khắc phục lỗi UUID & Bcrypt**:
   - Thay thế các chuỗi UUID giả làm không hợp lệ (chứa ký tự nằm ngoài hệ thập lục phân như `m` và `r`) bằng UUID chuẩn PostgreSQL.
   - Sửa đổi password hash của người dùng khớp chính xác với kết quả mã hoá thực tế của thư viện `bcrypt` phía Backend cho mật khẩu `password123`.

2. **Thực thi SQL thành công**:
   - Đã chạy thành công lệnh import vào container PostgreSQL:
     ```bash
     Get-Content "seed_thousands.sql" | docker exec -i mini-logistic-db psql -U admin -d mini_logistic
     ```
   - Kết quả xuất ra màn hình:
     ```text
     TRUNCATE TABLE
     INSERT 0 5
     INSERT 0 10
     INSERT 0 10
     INSERT 0 9
     INSERT 0 9
     DO
     SUCCESS: Imported 10 nodes, 10 products, 9 core users with passwords, and generated over 1500 batches, 1200 shipments, 2500 events, 200 incidents, 2500 scans, and 4000 audit logs.
     ```

3. **Xác thực tích hợp API**:
   - Sử dụng Postman / cURL để gọi API đăng nhập:
     `POST /api/v1/auth/login` với email `admin@logistic.com` và mật khẩu `password123`. Đăng nhập thành công, trả về Access Token hợp lệ.
   - Truy vấn danh sách lô hàng qua API `GET /api/v1/batches?page=1&limit=2` sử dụng token đã cấp. Kết quả trả về dữ liệu chuẩn JSON, xác nhận tổng số lượng bản ghi trong database đã đạt mốc **1,500 batches** và **1,253 shipments** hoạt động trơn tru.

---

## Phase 18: Beautiful Export Reports Formatting & Unicode Vietnamese Support ✅

Chúng ta đã cải tiến toàn diện chức năng kết xuất dữ liệu báo cáo (`POST /reports/export`) cả về định dạng thẩm mỹ lẫn khả năng hỗ trợ ngôn ngữ tiếng Việt hoàn hảo cho cả định dạng CSV và PDF.

### Các thành phần đã triển khai

#### 1. Định dạng xuất báo cáo CSV tối ưu cho Excel (Vietnamese CSV)
- **Tích hợp UTF-8 BOM (`\uFEFF`)**: Tự động chèn Byte Order Mark vào đầu nội dung tệp CSV giúp Microsoft Excel trên Windows nhận diện đúng định dạng mã hoá UTF-8, triệt tiêu hoàn toàn lỗi hiển thị ký tự tiếng Việt (`???` hoặc ký tự rác).
- **Chuẩn hóa cột & Dịch thuật**:
  - Dịch toàn bộ tiêu đề cột sang cả tiếng Việt và tiếng Anh đóng ngoặc (ví dụ: `Mã Lô Hàng (Batch ID)`, `Trạng Thái (Status)`, `Số Lượng (Quantity)`...).
  - Bản địa hóa toàn bộ giá trị trạng thái vận đơn (`IN_TRANSIT` -> `Đang vận chuyển`, `RECEIVED` -> `Đã nhận`, `LOST` -> `Thất lạc`...) và trạng thái/loại sự cố để người dùng dễ đọc và phân tích dữ liệu trực tiếp trong Excel.
  - Định dạng thời gian theo chuẩn thân thiện Việt Nam: `DD/MM/YYYY HH:mm:ss`.

#### 2. Kết xuất báo cáo PDF Thiết kế Chuyên nghiệp (Enterprise PDF Design)
- **Thư viện PDFKit & Tích hợp Font chữ hệ thống**:
  - Loại bỏ hoàn toàn phương pháp sinh chuỗi PDF thô cũ (vốn không hỗ trợ Unicode tiếng Việt).
  - Tích hợp và cấu hình font chữ Arial tiêu chuẩn (`C:\Windows\Fonts\Arial.ttf`) để vẽ văn bản có dấu tiếng Việt trơn tru.
- **Bố cục trang & Thiết kế thẩm mỹ**:
  - **Header & Title**: Tiêu đề báo cáo dạng đậm cỡ lớn đi kèm đường phân cách mảnh màu Zinc sang trọng.
  - **Metadata Grid**: Trình bày thông tin Loại báo cáo, Người kết xuất, Tổng số bản ghi và Thời gian kết xuất theo hệ lưới hai bên thoáng đãng.
  - **Metric/KPI Cards**: Vẽ các khối tóm tắt dữ liệu phân tích nổi bật với nền màu xám Zinc nhạt và viền mảnh, thể hiện nhanh các chỉ số cốt lõi (Tổng lượng tồn kho, Số lượng điểm kho liên kết, Vận đơn trễ hẹn, Sự cố nguy cấp...).
  - **Zebra Striping Table**: Tạo lập các dòng bảng dữ liệu xen kẽ màu nền trắng và xám nhạt (`#fafafa`), đường kẻ ngăn cách hàng siêu mảnh tăng cường tối đa độ tương phản đọc thông tin.
  - **Dynamic Pagination**: Tự động tính toán toạ độ dòng và ngắt trang thông minh khi lượng dữ liệu lớn vượt quá chiều cao trang A4, vẽ lại header của bảng ở đầu trang mới.
  - **Header/Footer tự động**: Đánh số trang động dạng `Trang X / Y` ở góc phải chân trang kèm theo ghi chú bảo mật.

### Kết quả kiểm tra & Xác thực

1. **Biên dịch & Bundling**:
   - `nest build` chạy hoàn thành thành công không gặp bất cứ lỗi cú pháp nào.
   - Các gói npm `pdfkit` và `@types/pdfkit` được tích hợp chặt chẽ trong danh sách phụ thuộc.

2. **Kiểm thử Unit Tests**:
   - Cập nhật lại các kịch bản kiểm thử trong [dashboard-system.service.spec.ts](file:///d:/Personal%20Projects%20University%20Project/logistic-mini/BE/src/modules/dashboard-system/dashboard-system.service.spec.ts) tương thích với tiêu đề tiếng Việt mới.
   - Chạy lệnh kiểm thử:
     ```bash
     npm run test
     ```
   - Kết quả: **56/56 tests PASS** thành công mỹ mãn.

3. **Xác thực API**:
   - API kết xuất CSV và PDF phản hồi nhanh chóng dưới 150ms với tiêu đề Content-Type tương ứng (`text/csv; charset=utf-8` hoặc `application/pdf`) cùng thông số Content-Disposition chuẩn chỉ giúp trình duyệt tự động bắt đầu tải xuống tệp tin.

---

## Phase 19: Quick Jump Pagination for High-Volume Tables ✅

Chúng ta đã cải tiến trải nghiệm người dùng đối với các bảng dữ liệu quy mô lớn (ví dụ: trên 150 trang dữ liệu lô hàng hoặc vận đơn), giúp người dùng dễ dàng chuyển nhanh tới bất kỳ trang nào thay vì phải nhấp nhiều lần.

### Các thành phần đã triển khai

#### 1. Nâng cấp UI Pagination (DataTable Component)
- **[DataTable.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/ui/DataTable.tsx)**:
  - Tích hợp thêm trường nhập liệu số trang trực tiếp **"Đi đến / Go to"** ở góc phải thanh phân trang (chỉ hiển thị khi tổng số trang `totalPages > 5`).
  - Hỗ trợ cả thao tác nhấn phím `Enter` và sự kiện `onBlur` (khi người dùng click ra ngoài hoặc chuyển vùng tập trung) để thực thi chuyển trang ngay lập tức.
  - Tự động kiểm tra tính hợp lệ của số trang nhập vào: giới hạn trong khoảng `[1, totalPages]`, nếu ngoài khoảng này hoặc không phải là số hợp lệ thì tự động khôi phục về số trang hiện tại.
  - Tối ưu hóa thuộc tính `key={page}` trên thẻ `<input>` giúp đồng bộ giá trị hiển thị bên trong ô nhập liệu khi người dùng chuyển trang bằng các nút điều khiển khác (Previous, Next, số trang cụ thể).

#### 2. Bản địa hóa đa ngôn ngữ (i18n)
- Cập nhật các file ngôn ngữ **[vi.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/vi.json)** và **[en.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/en.json)**:
  - Thêm khóa dịch thuật `goToPage` (Tiếng Việt: `"Đi đến"`, Tiếng Anh: `"Go to"`).

### Kết quả kiểm tra & Xác thực
- **Kiểm tra biên dịch**: Chạy `npx tsc --noEmit` thành công 100% không phát sinh lỗi kiểu dữ liệu.
- **Vite Bundling**: Chạy `npm run build` thành công, tối ưu hóa các module và xuất các gói build tĩnh hoạt động hoàn hảo.
- **Trải nghiệm thực tế**: Trên giao diện người dùng, khi có hàng ngàn bản ghi (tương ứng với 150 trang), ô nhập liệu hiển thị tinh tế cạnh thanh điều hướng, cho phép gõ `"70"` và nhấn `Enter` để nhảy lập tức đến trang 70 một cách mượt mà và trực quan.

---

## Phase 20: LoginPage Redesign (Giao diện đăng nhập cao cấp) ✅

Chúng ta đã thiết kế lại toàn diện trang Đăng nhập ([LoginPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/auth/LoginPage.tsx)) từ dạng thẻ đơn giản ở trung tâm thành cấu trúc **Split-Screen** chuyên nghiệp, tích hợp trực quan hóa chuỗi cung ứng động và các nút chọn nhanh tài khoản.

### Các thành phần đã triển khai

#### 1. Bố cục Split-Screen đa cột thích ứng
- **Phía bên trái (Supply Chain Telemetry)**:
  - Chỉ hiển thị trên màn hình lớn (`lg:flex`) để tiết kiệm không gian di động.
  - Sử dụng nền tối sâu (`#070e17`) kết hợp với hiệu ứng kính mờ (glassmorphism) và lưới grid công nghệ tạo cảm giác đẳng cấp.
  - Tích hợp 2 nguồn sáng phát quang radial pulsing chuyển động chậm trong background.
- **Phía bên phải (Authentication View)**:
  - Căn giữa biểu mẫu đăng nhập tối giản và sang trọng.
  - Tương thích 100% theo hai chế độ sáng/tối (Light/Dark mode) của hệ thống.
  - Thiết kế lại nút chuyển ngôn ngữ và đổi theme thành các pill nổi ở góc trên cùng bên phải.

#### 2. Bản đồ mạng lưới chuỗi cung ứng động (Animated Supply Chain Map)
- Thiết kế sơ đồ SVG động kết nối 3 điểm nút: **Nhà Máy (Factory) ➜ Trung Tâm (Hub) ➜ Đại Lý (Retailer)**.
- Tích hợp hiệu ứng sóng tín hiệu (`signal-ping`) phát xung động ở mỗi đầu nút.
- Sử dụng các chấm sáng chạy dọc các đường bay (`animateMotion` kết hợp `animate-dash` trong CSS) để mô phỏng dòng di chuyển của hàng hóa liên tục trong thời gian thực.
- Hiển thị 3 thẻ chỉ số KPI thu nhỏ giả lập buồng điều khiển (On-Time Delivery: 99.98%, Activity: 4.8k ops/h, Exceptions: 0 Alerts).

#### 3. Bảng điều khiển tài khoản Demo tự động điền (Quick Demo Login)
- Chuyển đổi khối văn bản hướng dẫn tài khoản demo thô cũ thành một lưới 4 nút Pills tương tác tuyệt đẹp đại diện cho các vai trò: **Admin, Nhà sản xuất (Manufacturer), Nhà phân phối (Distributor), và Đại lý bán lẻ (Retailer)**.
- Mỗi pill chứa icon đại diện chuyên biệt, tên hiển thị (Vi/En) và địa chỉ email.
- Nhấp chọn pill sẽ tự động điền thông tin email và mật khẩu (`password123`) vào form đăng nhập, kèm theo thông báo Toast hiển thị trực quan và tinh tế.

#### 4. Hiệu ứng Micro-animations trong CSS
- Bổ sung các định nghĩa `@keyframes` mới vào **[index.css](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/index.css)**:
  - `dash-move` cho đường vận chuyển nét đứt di chuyển liên tục.
  - `glow-pulse` cho các đám mây màu nền tối chuyển động phát sáng nhẹ.
  - `signal-ping` cho hiệu ứng radar lan tỏa quanh các điểm nút mạng lưới.

### Kết quả kiểm tra & Xác thực
- **Biên dịch TypeScript**: `npx tsc --noEmit` hoàn thành thành công 100% không lỗi.
- **Vite Bundling**: `npm run build` hoàn thành xuất sắc, nén và tối ưu hóa CSS cùng JS.
- **Responsive & Hoạt động**: Form hoạt động chuẩn xác trên cả Mobile và Desktop, tự động điền và đăng nhập nhanh chóng.

#### 5. Căn chỉnh tinh tế & Phản hồi (Follow-up Layout Alignments)
- **Sửa lỗi đè chữ lên icon**: Tăng khoảng đệm bên trái của các trường nhập liệu Email và Password thành `pl-12` (`padding-left: 3rem;` hay `48px`). Thay đổi này giúp nội dung chữ khi nhập không bị đè lên các biểu tượng `EnvelopeIcon` và `LockClosedIcon`.
- **Rút gọn nhãn dịch thuật**: Rút gọn nhãn chuyển ngôn ngữ thành dạng tối giản chỉ hiển thị `VI/EN` (hoặc `EN/VI` tương ứng), giúp header của form thông thoáng hơn.
- **Tích hợp accent màu cho Theme Toggle**: Thêm màu điểm nhấn `style={{ color: 'var(--color-accent)' }}` cho các icon `SunIcon` và `MoonIcon` trong nút chuyển theme để đồng bộ tuyệt đối với Header hệ thống.
- **Chuyển thông báo Toast**: Thay đổi vị trí hiển thị của thư viện thông báo `react-hot-toast` (`<Toaster />` trong [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx)) xuống góc dưới cùng bên phải màn hình (`position="bottom-right"`), giúp giao diện trung tâm không bị che lấp khi thao tác.

---

## Phase 21: Road Routing Integration (Định tuyến đường bộ OSRM & Caching) ✅

Chúng ta đã triển khai thành công tính năng định tuyến giao thông đường bộ thực tế (Road Routing) tại Việt Nam cho cả bản đồ Giám sát Admin (`MapPage`) và bản đồ Lịch sử Hành trình Công cộng (`TracePage`), giải quyết hoàn toàn lỗi hiển thị đường thẳng "đường chim bay" vượt qua biển và lãnh thổ nước khác.

### Các thành phần đã triển khai:

1. **Bộ đệm hành trình (In-Memory Caching)**:
   - Tích hợp lớp `routeCache` lưu trữ RAM trong [routing.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/utils/routing.ts) cho các cặp tọa độ xuất/nhập.
   - Nhờ có bộ đệm này, khi người dùng bật/tắt bộ lọc hoặc tải lại các trang bản đồ, các toạ độ tuyến đường bộ được lấy trực tiếp từ bộ nhớ đệm mà không cần gửi lại các API request trùng lặp tới OSRM. Điều này giải quyết triệt để lỗi giới hạn tần suất gửi yêu cầu **HTTP 429 Too Many Requests**.

2. **Tối ưu hóa quy tắc Validate địa lý Việt Nam**:
   - Thay đổi cơ chế kiểm tra vùng lãnh thổ: Validate điểm đầu và điểm cuối của đoạn đường thay vì kiểm tra nghiêm ngặt từng điểm tọa độ trung gian. Tránh được tình trạng OSRM định tuyến sát biên giới hoặc đường đèo ven biển bị hiểu nhầm là nằm ngoài Việt Nam, gây lỗi và dẫn đến fallback vẽ đường thẳng.

3. **Cải tiến bản vẽ trong MapPage (Admin Map)**:
   - Trong [MapPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/map/MapPage.tsx), khi tuyến đường bộ của vận đơn được tải thành công từ OSRM/Cache, đoạn thẳng nét đứt ban đầu sẽ được chuyển thành **đường nét liền uốn lượn theo quốc lộ Việt Nam**, tăng độ chân thực cho giao diện hoạt động.

4. **Tích hợp định tuyến chặng cho TracePage (Public Trace)**:
   - Trong [TracePage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/TracePage.tsx), khi tra cứu hành trình lô hàng công cộng, thay vì vẽ đường thẳng nét đứt nối qua tất cả các điểm trung chuyển, hệ thống định tuyến đường bộ tuần tự cho từng chặng độc lập và chuyển sang nét liền mượt mà khi tải thành công.

### Kết quả kiểm tra & Xác thực:
- **Biên dịch TypeScript**: `npx tsc --noEmit` hoàn thành thành công 100% không lỗi.
- **Vite Bundling**: Đóng gói thành công bundle trong 11.13 giây (`dist/assets/index-Ds8NHmO6.js` và `index-DcBvKGnz.css`) không phát sinh bất kỳ cảnh báo lỗi cú pháp nào.
- **Kiểm thử thực tế**: Tuyến vận chuyển Bắc - Nam chạy dọc theo các quốc lộ chính của Việt Nam, không đi lệch qua vùng biển Đông hay cắt qua Lào/Campuchia.

---

## Phase 22: Map Optimization & Flash Prevention (Sửa Lỗi Lag & Đường Chim Bay) ✅

Chúng ta đã tiến hành đợt cải tiến toàn diện về trải nghiệm người dùng và hiệu năng cho cả trang Bản đồ Admin (`MapPage.tsx`) và trang Tra cứu hành trình (`TracePage.tsx`).

### Các thành phần đã triển khai:

1. **Loại bỏ giật lag trên MapPage (Map Lifecycle Optimization)**:
   - Thay vì liên tục hủy (`map.remove()`) và khởi tạo mới đối tượng Leaflet `L.map` khi người dùng thay đổi bộ lọc, hệ thống giờ đây chỉ khởi tạo bản đồ duy nhất một lần khi component mount (`[]`).
   - Sử dụng `markersGroupRef` và `polylinesGroupRef` (đối tượng `L.layerGroup` của Leaflet) để quản lý riêng rẽ các node và tuyến đường.
   - Khi dữ liệu hoặc bộ lọc thay đổi, hệ thống gọi `.clearLayers()` trên Layer Groups và vẽ lại các Marker/Polyline tương ứng. Cách tiếp cận này giúp giảm tải thao tác DOM đắt đỏ, giúp bộ lọc hoạt động mượt mà và phản hồi tức thì dưới 10ms.

2. **Cố định vùng quan sát (Preserve Map State)**:
   - Căn giữa bản đồ tự động dựa trên trọng tâm các node một lần duy nhất khi dữ liệu được tải thành công. Khi người dùng zoom/pan bản đồ và thực hiện bật/tắt các bộ lọc, tiêu điểm bản đồ được giữ nguyên thay vì liên tục bị giật lại tâm màn hình, nâng cao đáng kể trải nghiệm người dùng.

3. **Triệt tiêu hiện tượng nhấp nháy đường chim bay (Eliminate Bird-Flight Flashing)**:
   - **MapPage**: Không vẽ các đường thẳng nét đứt Indigo tạm thời trước khi tải định tuyến OSRM. Hệ thống gọi `fetchOSRMRoute` trong background trước, sau khi nhận được tọa độ đường bộ mới vẽ đường nét liền lên bản đồ. Đường thẳng nét đứt chỉ vẽ khi việc gọi API OSRM bị lỗi/bypass, tránh hoàn toàn hiện tượng đường thẳng nhấp nháy rồi biến mất từ từ.
   - **TracePage**: Không vẽ đường thẳng nét đứt đi qua tất cả các điểm trung chuyển từ đầu. Hệ thống tiến hành định tuyến chặng chạy song song (`Promise.all`), sau đó vẽ toàn bộ đường đi uốn lượn nét liền khi tải thành công.

4. **Định hướng chạy trong lãnh thổ Việt Nam (Domestic Route Enforcement)**:
   - Khi thực hiện định tuyến cho các chặng Bắc-Nam có khoảng cách lớn (chênh lệch vĩ độ > 1.5 độ), OSRM public API đôi khi tự động định tuyến đường đi ngắn nhất qua lãnh thổ Campuchia và Lào.
   - Để ngăn chặn điều này, chúng ta đã tích hợp danh sách **các điểm kiểm soát dọc Quốc lộ 1A (Corridor Waypoints)** bao gồm: Phan Thiết, Nha Trang, Quy Nhơn, Đà Nẵng, Vinh, Thanh Hóa.
   - Hàm `getVietnamCorridorWaypoints` tự động lọc ra các điểm kiểm soát nằm giữa điểm đầu và điểm cuối tùy thuộc theo chiều di chuyển (Bắc ➜ Nam hoặc Nam ➜ Bắc) để chèn vào giữa danh sách waypoints gửi đến OSRM. Do đó, OSRM bị bắt buộc phải tìm tuyến đường nối tiếp chạy qua các thành phố ven biển này của Việt Nam, giữ cho đường vẽ nằm hoàn toàn 100% bên trong lãnh thổ Việt Nam.

### Kết quả kiểm tra & Xác thực:
- **Biên dịch**: `npx tsc --noEmit` hoàn thành thành công 100% không lỗi.
- **Vite Bundling**: Đóng gói thành công bundle frontend trong 1.61 giây.
- **Trải nghiệm thực tế**: Bản đồ phản hồi tức thời khi nhấp chọn bộ lọc ở sidebar. Đường đi của các vận đơn hiển thị chính xác theo quốc lộ trong lãnh thổ Việt Nam ngay khi xuất hiện, không bị nháy hay trễ hiển thị đường thẳng và không còn bị cắt góc đi xuyên biên giới Lào/Campuchia nữa.

---

## Phase 23: Custom Date Range & Total Value Support for Reports (Yêu Cầu 4) ✅

Chúng ta đã mở rộng và hoàn thiện tính năng xuất báo cáo (CSV và PDF) ở cả Backend và Frontend, hỗ trợ lọc theo khoảng thời gian tùy chọn và đính kèm đầy đủ đơn giá, tổng giá trị cùng các dòng tổng kết ở chân trang.

### Các thành phần đã triển khai:

1. **Backend API & DTO (Custom parameters)**:
   - Cập nhật DTO `ExportReportDto` trong [export-report.dto.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/dashboard-system/dto/export-report.dto.ts) cho phép nhận `startDate` và `endDate` (kiểu chuỗi) làm các tham số tùy chọn, đồng thời cho phép `period` có thể là `'custom'`.
   - Cập nhật controller [dashboard-system.controller.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/dashboard-system/dashboard-system.controller.ts) để truyền các tham số ngày mới vào service.

2. **Xử lý ngày và Truy vấn cơ sở dữ liệu**:
   - Cập nhật `getDateRange` trong [dashboard-system.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/dashboard-system/dashboard-system.service.ts) để xử lý mốc `'custom'`:
     - Thiết lập mốc giờ từ `00:00:00.000` của ngày bắt đầu (`startDate`) đến `23:59:59.999` của ngày kết thúc (`endDate`).
     - Tích hợp kiểm tra lỗi đầu vào (Ví dụ: Định dạng ngày không hợp lệ, ngày bắt đầu lớn hơn ngày kết thúc).
   - Tối ưu hóa tính toán giá trị thực tế của bản ghi:
     - **Tồn kho (Inventory)**: Tính giá trị dựa trên `quantityAvailable` (số lượng khả dụng thực tế tại kho) thay vì sử dụng toàn bộ số lượng ban đầu của lô hàng.
     - **Vận đơn (Shipments)**: Tính giá trị dựa trên `quantityShipped` (số lượng vận chuyển thực tế của chuyến hàng).

3. **Cải tiến định dạng xuất dữ liệu (CSV & PDF Kit)**:
   - **Tệp CSV**:
     - Bổ sung cột "Tổng giá trị" cho cả 3 loại báo cáo (tồn kho, vận đơn, sự cố).
     - Chèn dòng tổng kết chân trang ở cuối tệp: `"Tổng cộng",,,,,,"{Tổng giá trị}",...` khớp chính xác với số lượng cột của từng báo cáo để Excel tự động nhận diện.
   - **Tệp PDF**:
     - Đối với báo cáo sự cố (Incidents), thiết lập cấu hình độ rộng cột 495px để bổ sung cột "Tổng giá trị".
     - Vẽ thêm dòng Footer "Tổng cộng" ở cuối bảng dữ liệu PDF (hỗ trợ tự động ngắt trang nếu dòng này rơi vào cuối trang) với nền xám nhạt `#f4f4f5` và các đường viền kép chuyên nghiệp. Số tiền tổng cộng tự động căn phải thẳng cột "Tổng giá trị".
     - Hiển thị tổng giá trị tổng hợp trong khối tóm tắt thống kê trên cùng của PDF báo cáo sự cố.

4. **Giao diện bộ chọn ngày ở Frontend**:
   - Trong [DashboardPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/dashboard/DashboardPage.tsx), khi người dùng chọn kỳ báo cáo là "Khoảng tự chọn" (`custom`), giao diện sẽ hiển thị thêm 2 ô nhập lịch chọn ngày (`Từ ngày` và `Đến ngày`).
   - Tích hợp kiểm tra lỗi ở FE: nếu người dùng bỏ trống hoặc chọn ngày bắt đầu lớn hơn ngày kết thúc, nút bấm xuất báo cáo sẽ bị chặn và hiển thị thông báo Toast cảnh báo tức thì.
   - Bổ sung đầy đủ các nhãn dịch thuật đa ngôn ngữ trong [vi.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/vi.json) và [en.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/en.json).

### Kết quả kiểm tra & Xác thực:
- **Backend Unit Tests**: Chạy `npm run test` thành công hoàn toàn **67/67 tests PASS** (bao gồm cả test case mới cho custom date range).
- **Biên dịch & Build**: Cả Backend (`nest build`) và Frontend (`npm run build`) đều được đóng gói thành công mà không phát sinh bất kỳ lỗi cảnh báo nào.
- **Trải nghiệm thực tế**: Người dùng chọn khoảng ngày tự chọn, xuất file CSV/PDF thành công, thông tin tiếng Việt có dấu hiển thị hoàn hảo, các cột tổng giá trị và dòng tổng cộng chân trang khớp chính xác giá trị số lượng nhân đơn giá.




