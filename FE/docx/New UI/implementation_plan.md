# Supply Chain Traceability Design System & UI Redesign Plan

Chúng ta sẽ phân tích và xây dựng hệ thống thiết kế (Design System) hiện đại chuẩn Enterprise SaaS, lấy cảm hứng từ Linear, Stripe, Vercel, và phong cách tối giản cao cấp (impeccable.style) cho dự án Supply Chain Traceability.

---

## User Review Required

> [!IMPORTANT]
> **Định hướng thiết kế:**
> - Hệ thống màu tối chủ đạo (Dark-mode first) nhưng vẫn tương thích hoàn toàn với Light mode qua CSS variables.
> - Sử dụng hệ màu trung tính Zinc/Slate của Tailwind làm nền, kết hợp với các hiệu ứng kính mờ (glassmorphism), viền mỏng 1px (`border-zinc-200/50` / `border-zinc-800/40`), và đổ bóng sâu mờ (soft shadows) để tạo chiều sâu thị giác.
> - Giữ nguyên toàn bộ logic nghiệp vụ (business logic) và kết nối API hiện tại ở Frontend.

---

## Open Questions

> [!WARNING]
> 1. **Mức độ áp dụng vào Code:** Bạn muốn chúng tôi chỉ tạo các file đặc tả hệ thống thiết kế (`design-tokens.ts`, `theme.css`, `typography.ts`, `spacing.ts`, `ui-guidelines.md` và `tailwind.config.ts`) để bạn xem xét cấu trúc, hay muốn chúng tôi tiến hành cập nhật trực tiếp cấu hình Tailwind và refactor mã nguồn của các components lớn sau khi được phê duyệt?
> 2. **Phong cách hiển thị bản đồ và biểu đồ:** Có cần thay đổi các Marker Leaflet hoặc màu sắc Recharts theo hệ màu thương hiệu (Brand Accent) mới định nghĩa trong design-tokens không?

---

## Proposed Changes

Chúng ta sẽ tạo một thư mục chuyên biệt `FE/src/design-system` để quản lý toàn bộ cấu hình thiết kế mới:

### 1. Foundation & Design Tokens

#### [NEW] [design-tokens.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/design-system/design-tokens.ts)
- Khai báo các đối tượng định nghĩa màu sắc (Zinc, Slate, Brand Accent, Status Colors cho lô hàng và vận đơn), bo góc (Radius System), và đổ bóng (Elevation System) dạng TypeScript constants để có thể tái sử dụng trực tiếp trong Javascript/React.

#### [NEW] [theme.css](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/design-system/theme.css)
- Tệp CSS định nghĩa các biến toàn cục (CSS Custom Properties) cho cả 2 chế độ Light/Dark:
  - Nền trang (`--bg-background`), màu chữ (`--text-foreground`), viền (`--border-muted`).
  - Lớp phủ kính mờ (`--glass-bg`, `--glass-border`, `--glass-blur`).
  - Phân bậc độ ưu tiên và trạng thái sự cố.

#### [NEW] [tailwind.config.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/design-system/tailwind.config.ts)
- File mở rộng cấu hình Tailwind CSS, cấu hình thêm các token màu sắc HSL, khoảng cách (spacing scale), và animation siêu mượt phục vụ micro-interactions.

#### [NEW] [typography.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/design-system/typography.ts)
- Định nghĩa Typography scale chuẩn SaaS (Inter font):
  - Page Title (H1), Section Title (H2), Body Text, Metadata / Code tags.

#### [NEW] [spacing.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/design-system/spacing.ts)
- Hệ thống khoảng cách cố định (grid, form margins, padding) đồng bộ.

#### [NEW] [ui-guidelines.md](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/design-system/ui-guidelines.md)
- Cung cấp cẩm nang hướng dẫn lập trình viên phát triển UI:
  - Cách dùng các classes viền mỏng, glassmorphism, và status badges.
  - Phân tích chi tiết UX của 12 màn hình cốt lõi (Dashboard, Shipment, Fleet, Live Tracking, Maps, v.v.).
  - Các cải tiến UX doanh nghiệp (phím tắt, lọc thông minh, bulk actions).
  - Component Architecture (AppShell, Sidebar, DataTable, LiveMapPanel).
  - Phân tích tính khả thi và ROI của các tính năng AI-style (Contextual actions, predictive logistics).

---

## Verification Plan

### Automated Tests
- Xác minh cú pháp TypeScript và biên dịch toàn bộ dự án FE:
  ```bash
  npx tsc --noEmit
  ```
- Thử nghiệm đóng gói dự án FE để đảm bảo cấu hình CSS mới không làm crash PostCSS/Vite bundler:
  ```bash
  npm run build
  ```

### Manual Verification
- Kiểm tra trực quan cấu trúc thư mục mới được tạo ra tại `FE/src/design-system/`.
