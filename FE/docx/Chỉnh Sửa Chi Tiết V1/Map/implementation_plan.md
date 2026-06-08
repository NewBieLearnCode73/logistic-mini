# Sửa Lỗi Giật Lag và Hiện Tượng Đường Chim Bay trên Bản Đồ

Tài liệu này mô tả kế hoạch tối ưu hóa hiệu năng bản đồ (loại bỏ giật lag) và sửa đổi cơ chế vẽ đường đi (không vẽ đường chim bay ban đầu) trên trang Bản đồ Admin (`MapPage.tsx`) và trang Tra cứu hành trình (`TracePage.tsx`).

## User Review Required

> [!IMPORTANT]
> **Các thay đổi cốt lõi:**
> 1. **Loại bỏ giật lag**: Tách biệt logic khởi tạo bản đồ (chỉ chạy 1 lần duy nhất khi mount) khỏi logic cập nhật các Marker và Polyline. Thay vì huỷ và tạo lại đối tượng Leaflet `L.map` trên mỗi lần lọc hoặc thay đổi dữ liệu, ta sử dụng `L.layerGroup` và gọi `.clearLayers()` để vẽ lại tức thì.
> 2. **Không hiển thị đường chim bay ban đầu**: Bỏ việc vẽ các đường thẳng nét đứt ngay lập tức. Bản đồ sẽ chỉ vẽ các tuyến đường bộ (Solid Polyline) sau khi API OSRM (hoặc Cache) trả về kết quả thành công. Đường nét đứt fallback chỉ hiển thị nếu cuộc gọi định tuyến thực sự thất bại hoặc bị chặn.
> 3. **Tối ưu hóa căn chỉnh bản đồ (fitBounds/setView)**: Bản đồ chỉ tự động di chuyển tiêu điểm (`setView`) về trọng tâm của các Nodes một lần duy nhất khi dữ liệu được tải lần đầu, giúp người dùng không bị mất vùng quan sát hiện tại khi thay đổi các bộ lọc ở thanh bên.

---

## Proposed Changes

### 1. Admin Map Page

#### [MODIFY] [MapPage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/map/MapPage.tsx)
- Sử dụng `useRef` lưu trữ `markersGroupRef` và `polylinesGroupRef` để quản lý các lớp đối tượng.
- Sử dụng `useEffect` với mảng phụ thuộc rỗng `[]` để khởi tạo bản đồ Leaflet, TileLayer và các Layer Group đúng 1 lần.
- Sử dụng `useEffect` thứ hai phụ thuộc vào `[nodesData, shipmentsData, filterTypes, showShipments]` để xóa các lớp cũ và vẽ lại các Marker/Polyline tương ứng.
- Loại bỏ việc tạo đường thẳng Polyline nét đứt ban đầu. Gọi `fetchOSRMRoute` trước, sau đó chỉ vẽ đường nét liền khi có kết quả. Chỉ vẽ đường nét đứt nếu API thất bại.

### 2. Public Trace Page

#### [MODIFY] [TracePage.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/pages/public/TracePage.tsx)
- Loại bỏ đường thẳng nét đứt được vẽ ngay từ đầu (`pathCoords` fallback).
- Thực hiện `Promise.all` định tuyến tất cả các chặng của lô hàng, sau đó vẽ toàn bộ đường bộ nét liền cùng một lúc.
- Chỉ hiển thị đường nét đứt fallback nếu quá trình gọi API bị lỗi toàn phần.

---

## Verification Plan

### Automated Tests
- Chạy kiểm tra kiểu dữ liệu TypeScript trong thư mục `FE`:
  ```powershell
  npx tsc --noEmit
  ```
- Kiểm tra đóng gói build frontend:
  ```powershell
  npm run build
  ```

### Manual Verification
- **Kiểm tra lag**: Truy cập `/map`, click chọn/bỏ chọn liên tục các nút lọc (Nhà sản xuất, Nhà phân phối, Kho bãi, Cửa hàng). Xác nhận bản đồ phản hồi tức thì không bị nhấp nháy đen hay giật màn hình.
- **Kiểm tra đường chim bay**: Nhấn F5 tải lại trang `/map`. Xác nhận khi mới tải không xuất hiện đường nét đứt bay qua biển/biên giới, mà sau 1-2 giây đường bộ (nét liền) sẽ hiển thị trực tiếp.
- **Kiểm tra TracePage**: Truy cập `/trace/:batchCode`. Xác nhận bản đồ hiển thị đường đi uốn lượn dọc quốc lộ, không vẽ đường thẳng trước rồi mới uốn.
