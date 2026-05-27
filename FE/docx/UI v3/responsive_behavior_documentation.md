# 📱 UI v3 Responsive Behavior & Mobile Viewport Specification

Tài liệu này hướng dẫn chi tiết cách lập trình viên kiểm soát lớp hiển thị (Layout engine) để đáp ứng chính xác hành vi responsive 5 cấp độ của phiên bản UI v3.

---

## 1. Cơ chế co giãn lưới dựa trên Tailwind Breakpoints

Chúng ta sử dụng các tiền tố breakpoint chuẩn của Tailwind để điều phối lưới làm việc:

| Breakpoint | Kích thước | Bố cục Layout Shell | Trạng thái Panel phụ |
| :--- | :--- | :--- | :--- |
| **Default** | `< 768px` | Mobile Portrait (Bottom Nav) | Ẩn toàn bộ Sidebar/Dock, chuyển sang Drawers |
| **md** | `768px` - `1023px`| Tablet Layout (Side Icon bar) | Sidebar icon-only, AI Dock chuyển thành Drawer |
| **lg** | `1024px` - `1279px`| Laptop Standard (Side Icon + Main) | AI Dock ẩn mặc định, mở dạng Overlapping Panel |
| **xl** | `1280px` - `1535px`| Desktop Pro (Side Expanded + Main) | AI Dock hiển thị song song ở góc phải |
| **2xl** | `>= 1536px` | Ultrawide Command (Full 4 columns) | Tất cả các panel phụ cố định hiển thị cùng lúc |

---

## 2. Lập trình thanh điều hướng di động (Bottom Navigation Engine)

Trên các thiết bị di động (màn hình dọc dưới 768px), hệ thống định tuyến sẽ kích hoạt Bottom Nav bar:
- **CSS classes**:
  ```html
  <nav class="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-surface/85 backdrop-blur-lg md:hidden">
    <div class="flex h-full items-center justify-around">
      <!-- Nút điều hướng chạm lớn -->
    </div>
  </nav>
  ```
- **Kích thước mục tiêu chạm (Touch Target)**: 
  - Đảm bảo mỗi biểu tượng trên Bottom Nav có khoảng đệm tối thiểu `px-4 py-2` để tránh bấm nhầm.
  - Sử dụng hiệu ứng phản hồi xúc giác nhẹ (Scale down 95% khi nhấn chuột/chạm).

---

## 3. Drawers trượt di động (Mobile Slide-up Sheets)

Thay vì trượt từ bên phải sang (như trên Desktop), các Drawer chi tiết (Inspector) trên thiết bị di động sẽ trượt từ **dưới lên trên (Bottom Slide-up Sheets)** để thuận tiện cho thao tác vuốt bằng một ngón tay cái:

- **Bố cục di động**:
  ```
  ┌──────────────────────────────────────────┐
  │                                          │
  │     [Vùng nền mờ mờ - Tap để đóng]       │
  │                                          │
  ├──────────────────────────────────────────┤
  │ ====== [Thanh kéo màu xám mỏng]          │
  │ 📦 CHI TIẾT LÔ HÀNG                      │
  │ Mã số: B-102948                          │
  │ Sản phẩm: Xi măng Hà Tiên                │
  │ Số lượng: 1,500 Tấn                      │
  │                                          │
  │ [Xác nhận giao hàng]  [Báo cáo sự cố]    │
  └──────────────────────────────────────────┘
  ```
- **Hoạt ảnh**:
  - Trượt lên từ tọa độ `translate-y-full` đến `translate-y-0` sử dụng thuộc tính `transition-transform duration-300 ease-out`.
  - Tích hợp một thanh kéo ngang nhỏ ở đỉnh drawer (`w-12 h-1 bg-border rounded-full mx-auto my-2`) tạo điểm định vị trực quan báo hiệu có thể kéo xuống để đóng.

---

## 4. Tối ưu hóa Bản đồ động trên màn hình di động

Trên di động, bản đồ chuỗi cung ứng được thu nhỏ lại thành một thẻ widget có thể nhấn mở rộng:
- Bản đồ trên di động mặc định vô hiệu hóa tính năng cuộn bằng 1 ngón tay (`dragging: false`, `tap: false`) để người dùng có thể cuộn trang dọc bình thường mà không bị kẹt ngón tay trên bản đồ.
- Bản đồ cung cấp một nút bấm **"Mở rộng bản đồ" (Expand Map)** toàn màn hình. Khi nhấp chọn sẽ kích hoạt chế độ toàn màn hình có thể thu phóng bằng 2 ngón tay (pinch-to-zoom).
