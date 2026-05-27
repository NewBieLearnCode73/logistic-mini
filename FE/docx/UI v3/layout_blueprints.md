# 🗺️ UI v3 Layout Blueprints & Grid Blueprints

Tài liệu này phác thảo sơ đồ bố cục lưới và sơ đồ vị trí các panel của giao diện người dùng v3 trên các loại màn hình khác nhau.

---

## 1. Màn hình điều khiển tổng hợp - Ultrawide Command Center Grid
*(Độ phân giải từ 1920px trở lên, hiển thị 4 phân vùng song song)*

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Workspace Selector  │  🔍 Search bar (Ctrl+K)       [VI/EN] [Dark/Light]  🔔 Notification  🤖 AI │
├────────────────────────────┴───────────────────────────────────────────────────────────────────────────┤
│ 📊 CMD  │ ┌──────────────────────────────────────┐ ┌────────────────────────┐ ┌──────────────────────┐ │
│ 📦 Ope  │ │ CARD 1: Live Map Dashboard           │ │ CARD 3: Alert Ticker   │ │ DOCK: AI Assistant   │ │
│ 🚚 Log  │ │ (Leaflet Map container)              │ │                        │ │                      │ │
│ ⚙️ Adm  │ │ - Node markers with incident ping    │ │ - Warning: Delay B-102 │ │ "Hello Operator!     │ │
│         │ │ - Active shipment flow lines         │ │ - Incident reported    │ │ Batch #942 has weather │ │
│         │ │                                      │ │ - System health: 100%  │ │ delay. Suggest route │ │
│         │ ├──────────────────────────────────────┤ └────────────────────────┤ change."             │ │
│         │ │ CARD 2: Daily Operations Chart       │ │ CARD 4: Quick Actions  │ │                      │ │
│         │ │ (Recharts Area style)                │ │ [Create Batch] [Ship]  │ │ [Apply Suggested Route]│ │
│         │ │                                      │ │ [Report Incident]      │ │                      │ │
│         │ └──────────────────────────────────────┘ └────────────────────────┘ └──────────────────────┘ │
└─────────┴──────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Sidebar**: Thu nhỏ dạng icon hoặc cố định 220px.
- **Card 1 (Main Content)**: Chiếm 55% chiều rộng. Bản đồ chiếm tỉ lệ 3:2 so với biểu đồ bên dưới.
- **Card 3 (Alerts) & Card 4 (Quick Actions)**: Cột thông tin phụ bên phải map, rộng 25%.
- **Dock (AI Assistant)**: Cố định hoàn toàn ở cạnh phải màn hình, rộng 20%.

---

## 2. Màn hình làm việc chuẩn - Laptop / Desktop Layout
*(Độ phân giải từ 1280px đến 1919px)*

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Command Search (Ctrl+K)                           [VI/EN] [Dark/Light] 🤖 │
├─────┬────────────────────────────────────────────────────────────────────────┤
│ 📊  │ ┌────────────────────────────────────────────────────────────────────┐ │
│ 📦  │ │ PAGE WORKSPACE (e.g. Batches List DataTable)                       │ │
│ 🚚  │ │                                                                    │ │
│ ⚙️  │ │ [Search...] [Filters v]                       [Bulk Action: Ship v]│ │
│     │ │ ┌────────────────────────────────────────────────────────────────┐ │ │
│     │ │ │ Code        │ Product       │ Qty   │ Status     │ Actions     │ │ │
│     │ │ ├─────────────┼───────────────┼───────┼────────────┼─────────────┤ │ │
│     │ │ │ B-94282     │ Cement        │ 500   │ IN_TRANSIT │ [Edit] [>]  │ │ │
│     │ │ └─────────────┴───────────────┴───────┴────────────┴─────────────┘ │ │
│     │ └────────────────────────────────────────────────────────────────────┘ │
└─────┴────────────────────────────────────────────────────────────────────────┘
```

- **Sidebar**: Icon-only (64px) để nén tối đa bảng dữ liệu. Tự động trượt mở rộng ra 220px đè lên nội dung khi di chuột vào.
- **Main workspace**: Co giãn tự động chiếm 100% chiều rộng.
- **AI Dock / Detail Inspector**: Mặc định ẩn đi. Khi nhấp chọn nút chi tiết `[>]` trên dòng bảng -> Mở **Inspector Drawer** trượt từ phải sang che phủ một phần ba màn hình để chỉnh sửa nhanh mà không cần nhảy trang.

---

## 3. Giao diện di động - Mobile Portrait Bottom Navigation
*(Độ phân giải dưới 768px, tối ưu thao tác 1 tay)*

```
┌──────────────────────────────────────────┐
│ 📦 Batch List            [🔍 Filter]     │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │  📦 B-102948          [ IN TRANSIT ] │ │
│ │  Xi măng Hà Tiên  ·  1,500 Tấn        │ │
│ │  Manufacturer ────> Warehouse A      │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │  📦 B-102949             [ RECEIVED ]│ │
│ │  Cát Thạch Anh  ·  800 kg            │ │
│ │  Distributor ────> Retailer B        │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │  📊 Dashboard  📷 Scan  🚚 Ship  ⚙️ Key│ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

- **Bottom Navigation**: Cố định hoàn toàn ở đáy màn hình. Các nút có diện tích nhấn (touch target) tối thiểu 44x44px.
- **Main View**: Bảng dữ liệu tự động biến đổi thành thẻ luồng hoạt động đơn.
- **Scan QR**: Nhấp vào biểu tượng Camera ở đáy màn hình sẽ mở Drawer camera toàn màn hình để quét nhanh mã vạch.
