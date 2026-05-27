# 📱 UI v3 Responsive Plans & Adaptive Grid Strategy

Tài liệu này xác định chiến lược thích ứng giao diện 5 cấp độ (Responsive-First Architecture) giúp hệ điều hành Logistics hiển thị tối ưu trên mọi kích thước thiết bị, từ màn hình phòng điều hành cỡ lớn đến điện thoại thông minh cầm tay.

---

## 1. 5 Cấp độ thích ứng màn hình (5-Tier Adaptation System)

Chúng ta không sử dụng cơ chế responsive xếp chồng truyền thống mà thiết kế các layout thích ứng riêng biệt cho từng phân cấp thiết bị:

### A. Ultrawide Monitors (`min-w-[1920px]`)
- **Bố cục**: 4 Cột hiển thị đồng thời song song:
  - Cột 1: Sidebar mở rộng đầy đủ (220px).
  - Cột 2: Workspace chính (biểu đồ hoặc bảng dữ liệu nén cao).
  - Cột 3: Telemetry Map / Live Incident Feed (chiếm 35% chiều rộng).
  - Cột 4: AI Assistant Dock cố định bên phải (320px).
- **Trải nghiệm**: Không có thanh cuộn ngang, tối đa mật độ dữ liệu (Data density), phục vụ các điều phối viên ngồi tại trung tâm chỉ huy điều hành liên tục.

### B. Laptops & Standard Desktops (`1280px` - `1919px`)
- **Bố cục**: 3 Cột:
  - Cột 1: Sidebar thu hẹp (icon-only 64px, tự động mở rộng 220px khi hover).
  - Cột 2: Workspace chính.
  - Cột 3: AI Assistant Dock / Inspector Panel (có thể thu gọn linh hoạt).
- **Trải nghiệm**: Trượt đóng/mở panel phải bằng nút gạt hoặc phím tắt `Ctrl + A`.

### C. Tablets (`768px` - `1027px`)
- **Bố cục**: 2 Cột:
  - Cột 1: Sidebar thu hẹp hoàn toàn (icon-only 64px, không hover mở rộng để tránh chạm nhầm, vuốt từ cạnh để mở drawer).
  - Cột 2: Workspace chính chiếm toàn bộ chiều rộng còn lại.
- **Trải nghiệm**: AI Assistant Dock và Inspector chuyển thành các Drawer Overlay trượt lên trên khi kích hoạt.

### D. Mobile Landscape (Màn hình ngang di động)
- **Bố cục**: 1 Cột toàn màn hình.
- **Trải nghiệm**: Sidebar ẩn hoàn toàn, thay thế bằng thanh Header tối giản chứa Hamburger menu. Các biểu đồ tự động ẩn bớt lưới tọa độ để tăng vùng hiển thị cột.

### E. Mobile Portrait (Màn hình dọc di động - Dành cho tài xế & thủ kho)
- **Bố cục**: Bottom Navigation Layout (Cảm hứng từ TikTok Web):
  - Ẩn hoàn toàn Sidebar và Header.
  - Tích hợp một thanh **Bottom Navigation Bar** cố định ở cạnh dưới chứa 4 nút chính: Dashboard, Quét QR, Vận đơn, và Đổi mật khẩu/Cá nhân.
  - Vùng dữ liệu chuyển từ dạng bảng (DataTable) sang dạng **Single Card Feed (Thẻ luồng hoạt động đơn)**. Mỗi thẻ hiển thị một mã vận đơn/lô hàng kèm trạng thái nổi bật, hỗ trợ thao tác vuốt dọc để tải thêm.
- **Trải nghiệm**: Thao tác hoàn toàn bằng một ngón tay cái, tối ưu hóa cho công nhân kho đeo găng tay hoặc tài xế đang di chuyển ngoài đường.

---

## 2. Quy tắc chuyển đổi bảng dữ liệu trên thiết bị di động

Để tránh tình trạng cuộn ngang bảng dữ liệu trên màn hình hẹp, DataTable v3 sẽ tự động chuyển đổi cấu trúc hiển thị:

```
[Bố cục Desktop: Nhiều cột]
┌─────────────┬─────────────┬────────────┬─────────────┐
│ Code (Mono) │ Product     │ Qty (Mono) │ Status      │
└─────────────┴─────────────┴────────────┴─────────────┘

                  |
                  v Chuyển đổi tự động khi width < 768px
                  |

[Bố cục Mobile: Adaptive Card Feed]
┌──────────────────────────────────────────────────────┐
│  📦 #BATCH-102948                     [ IN TRANSIT ] │
│  Xi măng Hà Tiên  ·  1,500 Tấn                       │
│  Từ: Nhà máy Bình Điền  ────>  Kho trung chuyển Q2   │
└──────────────────────────────────────────────────────┘
```

- Các thông tin mã định danh (`batchCode`, `trackingCode`) được ưu tiên đưa lên góc trên trái làm tiêu đề.
- Badge trạng thái (`StatusBadge`) nằm ở góc phải.
- Các cột phụ như Người tạo, Ngày tạo, Ghi chú được chuyển vào Drawer chi tiết, hiển thị khi người dùng gõ nhẹ (tap) vào thẻ.

---

## 3. Hoạt ảnh chuyển đổi responsive (Responsive Transitions)

Mọi thay đổi kích thước cửa sổ trình duyệt hoặc thao tác đóng mở Sidebar/AI Dock phải kích hoạt hiệu ứng co giãn lưới mượt mà:
- Sử dụng thuộc tính `transition-all duration-300 ease-in-out` trên các vùng Grid container.
- Không để xảy ra tình trạng giật cục (layout shift) của các biểu đồ Recharts hoặc bản đồ Leaflet. Bản đồ tự động gọi hàm `.invalidateSize()` sau khi panel co giãn để tính toán lại tâm định vị.
