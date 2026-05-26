# Phase 8: Public Scan, Traceability & Network Map Implementation Plan

Triển khai các trang công cộng dành cho người tiêu dùng và trang bản đồ hệ thống dành cho Quản trị viên (Admin), bao gồm:
1. **Trang quét mã QR (ScanPage)**: Cho phép sử dụng camera quét QR của thiết bị hoặc nhập thủ công mã lô hàng để truy xuất nguồn gốc.
2. **Trang truy xuất nguồn gốc (TracePage)**: Hiển thị thông tin chi tiết về lô hàng, sản phẩm, hành trình (Timeline Stepper) và bản đồ hành trình Leaflet hiển thị các chặng di chuyển của lô hàng. Tích hợp tính năng ghi nhận tọa độ GPS của thiết bị khi quét.
3. **Bản đồ mạng lưới (MapPage)**: Dành riêng cho Admin, hiển thị bản đồ toàn màn hình chứa tất cả các node trong mạng lưới chuỗi cung ứng và vẽ các kết nối (tuyến đường) của các vận đơn đang trong quá trình vận chuyển (`IN_TRANSIT`, `DELAYED`).

---

## User Review Required

> [!IMPORTANT]
> **Thư viện cài đặt mới:**
> - Triển khai bản đồ bằng thư viện **Leaflet** bản gốc (`npm install leaflet` và `@types/leaflet`). Để đảm bảo tương thích tuyệt đối với React 19 mà không bị lỗi peer dependency, chúng ta sẽ khởi tạo Leaflet trực tiếp bằng Javascript/React `ref` thay vì dùng các thư viện wrapper như `react-leaflet`.
> - Triển khai quét QR bằng thư viện **html5-qrcode** (`npm install html5-qrcode`), là giải pháp mã nguồn mở ổn định và hỗ trợ tùy biến tốt nhất trên thiết bị di động.

> [!WARNING]
> **Ghi nhận tọa độ quét GPS (Geolocation Tracker):**
> - Khi truy cập `/trace/:batchCode`, trang web sẽ yêu cầu quyền truy cập GPS của trình duyệt (`navigator.geolocation`).
> - Nếu người dùng đồng ý, tọa độ `lat` và `lng` sẽ được gửi kèm trong API request `GET /public/trace/:batchCode` để backend tự động ghi nhận nhật ký quét (`ScanLog`) chính xác vị trí địa lý của người tiêu dùng.
> - Nếu người dùng từ chối, hệ thống vẫn cho phép xem hành trình bình thường (với tọa độ gửi đi là `null`).

> [!TIP]
> **Giao diện Bản đồ & Điểm đánh dấu (Custom Markers):**
> - Thay vì dùng bong bóng mặc định của Leaflet (dễ bị lỗi tải ảnh trong môi trường bundler như Vite), chúng ta sẽ tạo các điểm đánh dấu (Markers) bằng HTML/SVG tùy chỉnh (`L.divIcon`) được định dạng màu sắc tinh giản theo bộ nhận diện của hệ thống:
>   - **Manufacturer**: Biểu tượng Nhà máy (Màu xám/đen).
>   - **Distributor**: Biểu tượng Kho hàng (Màu xanh dương).
>   - **Retailer**: Biểu tượng Cửa hàng (Màu xanh lá cây).
>   - **Active Shipments (Vận đơn)**: Vẽ các đường đứt nét có hướng (hoặc hiệu ứng chuyển động nét đứt) kết nối giữa các node để thể hiện hướng đi của lô hàng.

---

## Open Questions

Không có câu hỏi mở nào. Các API cần thiết đã sẵn sàng hoạt động ở cả backend và frontend.

---

## Proposed Changes

### 1. Types & APIs (Data Layer)

#### [NEW] [public.types.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/types/public.types.ts)
- Khai báo các interface tương ứng với response của API truy xuất công cộng:
  ```typescript
  export interface PublicTraceBatch {
    batchCode: string;
    manufactureDate: string;
    expiryDate: string;
    status: string;
    product: {
      name: string;
      sku: string;
      unit: string;
      description: string | null;
      category: string;
    } | null;
    originNode: PublicTraceNode | null;
    currentNode: PublicTraceNode | null;
  }

  export interface PublicTraceNode {
    name: string;
    nodeType: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  }

  export interface PublicTraceEvent {
    eventType: string;
    notes: string | null;
    occurredAt: string;
    node: {
      name: string;
      nodeType: string;
      address: string | null;
    } | null;
    actor: {
      fullName: string;
    } | null;
  }

  export interface PublicTraceResponse {
    batch: PublicTraceBatch;
    timelineEvents: PublicTraceEvent[];
  }
  ```

#### [NEW] [public.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/public.api.ts)
- Hàm gọi API truy xuất nguồn gốc công cộng:
  - `getTrace(batchCode: string, coords?: { lat?: number; lng?: number })`: Trỏ tới `GET /public/trace/:batchCode` kèm tham số tọa độ nếu có.

---

### 2. State Management (Queries)

#### [NEW] [usePublicTrace.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/hooks/queries/usePublicTrace.ts)
- `usePublicTraceQuery(batchCode, coords)`: React Query hook để fetch dữ liệu truy xuất công cộng.

---

### 3. Pages & UI Components (Presentation Layer)

#### [NEW] [ScanPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/ScanPage.tsx)
- Giao diện quét QR công cộng:
  - Vùng quét camera sử dụng `html5-qrcode` tích hợp. Tự động xử lý cấp quyền camera và hiển thị luồng video quét.
  - Form nhập mã lô hàng thủ công ở phía dưới để đề phòng thiết bị không hỗ trợ camera hoặc trình duyệt chặn quyền camera.
  - **Mock Sandbox Simulator**: Thêm bảng điều khiển giả lập dành riêng cho môi trường phát triển (Development), cho phép chọn nhanh các mã lô hàng hiện có trong hệ thống để test luồng quét mà không cần thiết bị vật lý.

#### [NEW] [TracePage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/TracePage.tsx)
- Giao diện chi tiết hành trình công cộng:
  - Tự động gọi API `navigator.geolocation` để xin tọa độ của người dùng trước khi gửi request API trace.
  - Hiển thị thông tin Sản phẩm & Lô hàng (Manufacture Date, Expiry Date, Origin, Current Location).
  - Hiển thị **Journey Timeline** dọc: danh sách các chặng dừng chân cùng thời gian, trạng thái, ghi chú và người thực hiện.
  - Tích hợp **Journey Map (Bản đồ hành trình)** Leaflet: hiển thị trực quan lộ trình di chuyển của lô hàng từ node sản xuất đi qua các kho trung chuyển và tới đích. Vẽ một đường nối (`Polyline`) kết nối các chặng để người tiêu dùng dễ dàng hình dung hành trình sản phẩm.

#### [NEW] [MapPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/map/MapPage.tsx)
- Giao diện bản đồ mạng lưới Admin (Fullscreen):
  - Hiển thị bản đồ Leaflet chiếm trọn khung hình.
  - Vẽ điểm đánh dấu (Marker) cho tất cả các node trong hệ thống chuỗi cung ứng dựa trên tọa độ thực tế thu thập từ `/nodes`. Phân biệt màu sắc/icon theo loại node (Manufacturer, Distributor, Retailer, Warehouse).
  - Tải danh sách vận đơn (`/shipments`) và vẽ các đoạn nối (`Polyline` dạng mũi tên hướng hoặc nét đứt hoạt họa) giữa các node đại diện cho các vận đơn đang trên đường vận chuyển.
  - Nhấp vào node hiển thị Popup thông tin node và danh sách hàng hiện có (nếu có dữ liệu). Nhấp vào đường vẽ vận đơn hiển thị Popup mã vận đơn, thông tin sản phẩm và số lượng đang vận chuyển.

#### [MODIFY] [App.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/App.tsx)
- Cấu hình các route thực tế:
  - `/scan` trỏ tới `ScanPage`.
  - `/trace/:batchCode` trỏ tới `TracePage`.
  - `/map` trỏ tới `MapPage` (Bảo vệ bởi `RoleGuard allowed={['Admin']}`).

#### [MODIFY] [en.json] & [vi.json]
- Bổ sung đầy đủ các nhãn dịch thuật cần thiết cho bản đồ mạng lưới và trang truy xuất nguồn gốc.

---

## Verification Plan

### Automated Tests
- Kiểm tra lỗi biên dịch TypeScript:
  ```bash
  npx tsc --noEmit
  ```
- Kiểm tra đóng gói bundle:
  ```bash
  npm run build
  ```

### Manual Verification
1. **Quét QR:**
   - Truy cập `/scan`, kiểm tra yêu cầu quyền camera và khung quét video.
   - Nhập thủ công một mã lô hàng hợp lệ (ví dụ: `BATCH001`), nhấn nút truy vết để kiểm tra chuyển trang.
   - Sử dụng Mock Sandbox Simulator chọn lô hàng, hệ thống tự động điều hướng sang trang `/trace/:batchCode`.
2. **Truy xuất nguồn gốc & GPS:**
   - Truy cập `/trace/:batchCode`, xác nhận yêu cầu GPS từ trình duyệt.
   - Kiểm tra thông tin hiển thị sản phẩm, timeline các chặng di chuyển có khớp với dữ liệu lô hàng không.
   - Kiểm tra Bản đồ hành trình có vẽ đúng các Marker tọa độ của chặng sản xuất và chặng hiện tại không.
   - Đăng nhập tài khoản Admin, vào trang `Audit Logs` (`/audit-logs`) để xác nhận một bản ghi `ScanLog` đã được tạo kèm theo chính xác tọa độ GPS, IP Address và User Agent vừa thực hiện quét.
3. **Bản đồ chuỗi cung ứng (Admin Only):**
   - Đăng nhập tài khoản Admin, truy cập `/map`.
   - Xác nhận tất cả các Marker node hiển thị đúng tọa độ địa lý.
   - Xác nhận các đường nối vận chuyển (active shipments) được vẽ chính xác từ kho nguồn đến kho đích của vận đơn đang ở trạng thái `IN_TRANSIT`.
   - Nhấp vào Marker và đường nối để kiểm tra nội dung Popup thông tin chi tiết.
