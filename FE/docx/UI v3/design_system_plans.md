# 🎨 UI v3 Design System Plans & Glassmorphism Tokens

Tài liệu này quy chuẩn hóa hệ thống Design System v3 của dự án Supply Chain Traceability, hướng tới giao diện cinematic, phân tầng sâu, hỗ trợ Dark Mode ưu tiên (Dark-mode first) nhưng vẫn duy trì tính tương thích hoàn hảo với Light Mode thông qua CSS Custom Properties.

---

## 1. Bảng màu phân tầng sâu (HSL Depth Layering System)

Để tạo ra cảm giác giao diện cao cấp kiểu Vercel và Linear, màu nền và viền được định nghĩa bằng HSL giúp kiểm soát opacity linh hoạt:

### A. Chế độ tối (Dark Mode - Chủ đạo)
- `bg-background` (Màu nền trang): `hsl(240, 10%, 3.9%)` (Zinc-950 đen sâu tối giản).
- `bg-surface` (Màu nền panel cố định): `hsl(240, 10%, 5.9%)` (Zinc-900 đen xám nhẹ).
- `bg-popover` (Màu nền hộp thoại nổi): `hsl(240, 10%, 9.8%)` (Zinc-800 đen sáng).
- `border-border` (Viền phân lớp chính): `hsla(240, 5.9%, 15%, 0.4)` (Zinc-800/40 mỏng).
- `border-border-glow` (Viền phát sáng nhẹ cho tiêu điểm): `hsla(0, 0%, 100%, 0.1)`.

### B. Chế độ sáng (Light Mode)
- `bg-background`: `hsl(240, 5.9%, 98%)` (Zinc-50 trắng xám dịu mắt).
- `bg-surface`: `hsl(0, 0%, 100%)` (Trắng tinh khiết).
- `bg-popover`: `hsl(0, 0%, 100%)`.
- `border-border`: `hsla(240, 5.9%, 90%, 0.5)` (Zinc-200/50 mỏng).
- `border-border-glow`: `hsla(240, 5.9%, 10%, 0.05)`.

---

## 2. Hệ thống Glassmorphism & Shadow 3D (Z-Index Hierarchy)

Chúng ta quy định 4 tầng giao diện ảo (Z-index elevation levels) bằng cách kết hợp bộ lọc mờ nền (`backdrop-filter`) và đổ bóng vật lý:

```
[Level 4: Command Palette / Dialogs]  ──>  backdrop-blur-lg + shadow-2xl + z-[100]
       ▲
[Level 3: Contextual Action Dock]     ──>  backdrop-blur-md + shadow-xl + z-50
       ▲
[Level 2: Floating Workspace Cards]  ──>  border-thin + shadow-sm + hover:shadow-md
       ▲
[Level 1: Telemetry Map / Background] ──>  Flat canvas + z-0
```

- **Lớp Kính Mờ (Glass Preset)**:
  - Lớp kính nổi `.glass-panel`:
    - Light: `background-color: rgba(255, 255, 255, 0.7); border: 1px solid rgba(228, 228, 231, 0.6); backdrop-filter: blur(12px);`
    - Dark: `background-color: rgba(9, 9, 11, 0.7); border: 1px solid rgba(39, 39, 42, 0.4); backdrop-filter: blur(16px);`

- **Hệ thống bóng đổ 3D (Shadow Scales)**:
  - `shadow-saas-sm`: Bóng đổ siêu mỏng sát viền (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`).
  - `shadow-saas-md`: Bóng đổ có độ nhòe rộng (`0 4px 12px -2px rgba(0, 0, 0, 0.12)`).
  - `shadow-saas-lg`: Bóng đổ sâu cho Modals / AI Dock (`0 12px 24px -4px rgba(0, 0, 0, 0.2)`).

---

## 3. Typography & Spacing Scale (Phân bậc tỷ lệ)

### A. Font chữ
- Phông chữ không chân mặc định: `Inter, system-ui, -apple-system, sans-serif`.
- Phông chữ đơn cách (Monospace) cho mã định danh: `SFMono-Regular, Consolas, Courier New, monospace`.

### B. Cỡ chữ (Typography Scale)
- `Page Title (H1)`: `text-xl font-semibold tracking-tight text-text-primary` (`18px` / `1.15`).
- `Section Header (H2)`: `text-[14px] font-medium tracking-tight text-text-primary`.
- `Body Text (Bản tin/Thông số)`: `text-[13px] leading-relaxed text-text-secondary`.
- `Micro Metadata (Labels/Tags)`: `text-[10px] font-semibold uppercase tracking-wider text-text-muted`.

### C. Spacing System (Hệ thống lưới khoảng cách)
- Lưới tiêu chuẩn 4px:
  - `gap-grid`: `24px` (Khoảng cách giữa các widgets/cards chính).
  - `gap-form`: `16px` (Khoảng cách giữa các ô nhập liệu trong form).
  - `pad-card`: `20px` (Padding bên trong card).
  - `margin-page`: `24px` (Lề ngoài trang làm việc).

---

## 4. Animation & Physics Engine (Tương tác động lực học)

Mọi hiệu ứng chuyển động trong UI v3 phải tuân thủ triết lý tối giản của Linear, tránh các hoạt ảnh kéo dài gây mệt mỏi:
- **Thời gian chuyển đổi (Duration)**: Cố định ở mức `150ms` đến `200ms` cho các hành động nhỏ và `300ms` cho đóng/mở AI Dock lớn.
- **Đường cong chuyển động (Easing)**:
  - Hiệu ứng trượt panel: `cubic-bezier(0.16, 1, 0.3, 1)` (Ultra-smooth easeOutExpo).
  - Hiệu ứng hover nút bấm: `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Tương tác vật lý khi di chuột (Hover Physics)**:
  - Các card nổi (`.card-interactive`) khi hover sẽ dịch chuyển nhẹ lên trên 1px (`-translate-y-[1px]`), đồng thời tăng độ sáng viền (`border-border-glow`) và đổ bóng sâu hơn một bậc.
  - Hiệu ứng này tạo phản hồi trực quan sinh động báo hiệu đối tượng có thể tương tác bấm chọn.
