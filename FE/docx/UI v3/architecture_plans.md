# 🏗️ UI v3 Architecture Plans & Folder Structure

Tài liệu này đặc tả kiến trúc kỹ thuật mới cho Frontend UI v3 của hệ thống Logistics. Toàn bộ cấu trúc được thiết kế lại theo mô hình **Feature-Driven (Hướng tính năng)** và xây dựng hệ thống AppShell thích ứng đa tầng.

---

## 1. Kiến trúc thư mục mới (Feature-Driven Structure)

Chúng ta loại bỏ cấu trúc phân loại kỹ thuật đơn giản của v2 (tất cả trang nén vào `pages/`, tất cả component nén vào `components/`) để chuyển sang kiến trúc Hướng tính năng (Feature-Driven Architecture) chuẩn doanh nghiệp:

```
FE/src/
├── core/                         # Core Shell & Routing
│     ├── App.tsx                 # Khởi chạy ứng dụng & Routes v3
│     ├── main.tsx                # Entrypoint
│     ├── index.css               # CSS nền tảng & Animation variables
│     ├── AppShellV3.tsx          # App Shell điều phối lưới thích ứng
│     └── PublicShellV3.tsx       # Shell cho khách vãng lai (Scan/Trace)
│
├── design-system/                # Design System & Primitives
│     ├── theme.css               # Khai báo CSS variables Light/Dark
│     ├── tailwind.config.ts      # Cấu hình Tailwind extend
│     ├── design-tokens.ts        # TS Constants màu sắc, spacing
│     └── primitives/             # Các UI Primitives cơ bản (Vercel style)
│           ├── Button.tsx
│           ├── Input.tsx
│           ├── Dialog.tsx
│           ├── Badge.tsx
│           └── Card.tsx
│
├── features/                     # Các Workspace nghiệp vụ lớn
│     ├── command-center/         # Dashboard & Live Activity Ticker
│     ├── operations/             # Quản lý hàng hóa (Batches, Shipments, Products)
│     ├── logistics/              # Điều phối vận tải (Fleet, Drivers, Live Maps)
│     ├── intelligence/           # AI Assistant Dock, Command Palette
│     ├── audit/                  # Nhật ký audit logs & Admin tools
│     └── user-profile/           # Đổi mật khẩu, Settings cá nhân
│
├── stores/                       # Zustand Global States
│     ├── authStore.ts
│     ├── themeStore.ts
│     └── uiStore.ts              # Quản lý trạng thái mở/đóng AI Dock, Command Palette
│
└── shared/                       # Các hooks và hàm tiện ích dùng chung
      ├── api/                    # Axios clients & Interceptors
      ├── hooks/                  # Global hooks (useGeolocation, useDebounce)
      ├── i18n/                   # Đa ngôn ngữ (en/vi translations)
      └── utils/                  # Hàm format tiền tệ, ngày tháng
```

---

## 2. Thiết kế AppShell v3 (Adaptive Layout Shell)

AppShell mới đóng vai trò điều phối bố cục màn hình dựa trên kích thước thiết bị và vai trò người dùng:

```
┌─────────────────────────────────────────────────────────────┐
│                       Top Header Bar                        │
├──────┬──────────────────────────────────────────────┬───────┤
│  S   │                                              │   A   │
│  i   │                 Main Content                 │   I   │
│  d   │                   Workspace                  │       │
│  e   │                                              │   D   │
│  b   │                                              │   o   │
│  a   │                                              │   c   │
│  r   │                                              │   k   │
└──────┴──────────────────────────────────────────────┴───────┘
```

- **Sidebar (Trái)**: Mặc định thu hẹp ở dạng icon-only (64px) để tối đa hóa không gian làm việc của bảng và bản đồ. Khi di chuột qua, sidebar tự động bung rộng ra 220px với hiệu ứng trượt êm ái.
- **Top Header**: Chứa thanh Command Search Bar (nhấp để mở Command Palette), công cụ chuyển đổi ngôn ngữ/chế độ tối, biểu tượng Notification nổi, và nút bật/tắt nhanh AI Assistant Dock.
- **AI Assistant Dock (Phải)**: Rộng 320px, có thể thu gọn hoàn toàn vào cạnh phải màn hình. Dock này chứa giao diện trò chuyện thời gian thực và danh sách thông báo sự cố được AI phân tích.
- **Workspace chính (Giữa)**: Bố cục lưới linh hoạt tự động co giãn.

---

## 3. Kiến trúc luồng trạng thái (State & Data Flow)

- **Zustand State (`uiStore`)**: Quản lý trạng thái mở/đóng của các bảng panel nổi:
  - `commandPaletteOpen: boolean` (Trigger bằng `Ctrl + K` hoặc bấm vào Header search)
  - `aiDockOpen: boolean` (Trigger bằng `Ctrl + A` hoặc bấm nút AI trên header)
  - `sidebarExpanded: boolean` (Trigger bằng hover hoặc nút gim cố định)
  - `activeBatchIdForInspection: string | null` (Quản lý drawer xem nhanh thông tin lô hàng mà không cần nhảy trang)

- **TanStack Query (React Query)**: 
  - Tích hợp tính năng tự động polling ở background (mỗi 15 giây đối với live telemetry và dashboard statistics) để đảm bảo dữ liệu trên Command Center luôn trực quan và chính xác.
  - Sử dụng các hooks tập trung đặt ngay trong từng feature folder (ví dụ: `features/operations/hooks/useBatches.ts`) để bảo toàn tính độc lập của module.
