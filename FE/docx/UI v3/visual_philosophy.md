# 🎬 UI v3 Visual Philosophy & Cinematic Interaction

Tài liệu này đặc tả ngôn ngữ trực quan (Visual Language) và triết lý chuyển động (Motion/Animation Philosophy) của phiên bản UI v3, hướng đến mục tiêu tạo ra trải nghiệm sống động, sang trọng và đậm chất công nghệ (high-tech feel).

---

## 1. Triết lý thiết kế tối giản cao cấp (impeccable.style)

Hệ thống UI v3 áp dụng triết lý thiết kế **Tối giản nhưng sâu sắc (Layered Minimalism)**:
- **Loại bỏ sự bừa bộn (No visual clutter)**: Loại bỏ các dải màu nền sặc sỡ, các đường viền dày và các mảng đổ bóng đậm của UI cũ. Thay vào đó, sử dụng các đường viền siêu mỏng `1px` với màu Zinc độ tương phản thấp.
- **Tập trung vào Typographic**: Tăng cường kích thước và độ tương phản của chữ tiêu đề kết hợp font chữ monospace cho mã số để tạo độ tin cậy và chính xác của dữ liệu kỹ thuật.
- **Khoảng trắng thở (Generous Whitespace)**: Mỗi panel được bọc bởi padding tối thiểu 20px, khoảng cách giữa các khối là 24px để mắt người điều hành có không gian nghỉ ngơi khi nhìn màn hình trong thời gian dài (8-10 tiếng liên tục).

---

## 2. Cinematic Depth & Layering (Phân lớp chiều sâu điện ảnh)

Để tạo ra cảm giác giao diện có chiều sâu không gian (3D Depth), các lớp giao diện được xếp chồng lên nhau bằng cách sử dụng các lớp kính mờ (Glassmorphism) và đổ bóng mờ góc rộng:
- **Background Layer (Tầng nền)**: Màu đen sâu Zinc-950 (`#09090b`). Không có đổ bóng, đóng vai trò làm nền tĩnh.
- **Card/Surface Layer (Tầng bề mặt)**: Nền Zinc-900 xám nhẹ. Có viền mỏng Zinc-800/40, đổ bóng cực nhỏ (`shadow-sm`).
- **Floating Panel Layer (Tầng bảng nổi)**: Các Drawer trượt hoặc Dropdowns. Sử dụng lớp kính mờ `.glass-panel` để nhìn thấu một phần nội dung phía sau, tăng tính liên kết không gian. Đổ bóng trung bình (`shadow-md`).
- **Command / Dialog Layer (Tầng hộp thoại chỉ huy)**: Hộp thoại tìm kiếm `Ctrl+K`. Nền Zinc-800 đậm màu, viền sáng nhẹ, đổ bóng rất rộng (`shadow-lg`), tạo cảm giác lơ lửng trên cùng của ứng dụng.

---

## 3. Tương tác vật lý khi di chuột (Hover Physics)

Các đối tượng tương tác (nút bấm, thẻ lô hàng, dòng bảng) phải phản hồi chuyển động dựa trên lực tương tác ảo:
- **Card Interactive**:
  - Khi hover: Dịch chuyển lên trên 1px (`translate-y-[-1px]`), viền chuyển sang Zinc-700/60, đổ bóng chuyển từ `shadow-sm` lên `shadow-md`.
  - Khi click (Active): Dịch ngược xuống 0.5px, viền mờ đi để tạo cảm giác phản hồi cơ học (tactile click).
- **Sidebar Links**:
  - Khi hover: Nền chuyển từ trong suốt sang Zinc-900/60, biểu tượng icon dịch chuyển nhẹ sang phải 1px (`translate-x-[1px]`) báo hiệu trạng thái sẵn sàng nhấp chọn.

---

## 4. Hiệu ứng Micro-Transitions (Hoạt ảnh siêu nhỏ)

Tất cả các chuyển động thay đổi giao diện phải diễn ra trong khoảng thời gian siêu ngắn (`150ms` - `250ms`) để đảm bảo hệ thống phản hồi tức thời:
- **Đóng/Mở Drawer**: Trượt mượt mà từ cạnh phải sang trái bằng đường cong `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Loading skeleton pulsing**: Độ mờ (opacity) của khung loading co giãn nhịp nhàng từ 40% sang 80% mỗi 1.5 giây tạo cảm giác hệ thống đang "thở" hoạt động.
- **Incident Alarm Pulsing**: Vòng tròn radar xung quanh các node sự cố trên bản đồ co giãn rộng ra và mờ dần liên tục báo động trạng thái khẩn cấp.
