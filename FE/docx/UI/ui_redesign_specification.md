# 🎨 Premium UI/UX Redesign Specification: Enterprise Logistics SaaS

Tài liệu này chứa các quy tắc thiết kế, mã nguồn mẫu, cấu trúc khoảng cách, và hướng dẫn chi tiết từng trang giúp AI đọc hiểu và thiết kế lại toàn bộ giao diện dự án **Mini Logistics & Traceability System** đạt tiêu chuẩn SaaS cao cấp (Premium Enterprise SaaS).

---

## 📌 Thiết Kế Chủ Đạo: Linear, Vercel & Stripe Style
- **Aesthetic**: Hiện đại, tối giản, độ tương phản cao, tập trung vào dữ liệu.
- **Tránh xa**: Tránh màu sắc lòe loẹt, gradient đậm màu, bóng đổ (shadow) quá dày, các đường viền quá rõ hoặc các biểu tượng sặc sỡ kiểu dashboard miễn phí.
- **Không gian (Whitespace)**: Giao diện cần "thở" bằng các tỷ lệ căn lề rộng rãi, phân bậc nội dung có chủ đích rõ ràng.

---

## 1. Hệ Thống Token Thiết Kế (Design Tokens)

### 🎨 Bảng Màu (Muted & Premium Palette)
Sử dụng nhóm màu Zinc/Slate trung tính làm nền tảng để tạo chiều sâu cho cả hai chế độ sáng/tối.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        zinc: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b', // Pure dark background
        },
        brand: {
          light: '#18181b', // Dark Gray / Charcoal for light mode primary
          dark:  '#ffffff', // Pure White for dark mode primary
          accent: '#4f46e5', // Deep Indigo (hạn chế dùng, chỉ dùng cho tiêu điểm cực kỳ quan trọng)
        }
      }
    }
  }
}
```

### 📐 Hệ Thống Khoảng Cách & Định Vị (Spacing System)
Áp dụng quy tắc khoảng cách cố định để tạo nhịp điệu thị giác (visual rhythm) đồng bộ:

| Token | Class | Kích thước | Ứng dụng thực tế |
| :--- | :--- | :--- | :--- |
| **Grid** | `gap-6` | 24px | Khoảng cách giữa các Widgets chính trên Dashboard / Grids |
| **Form** | `gap-4` | 16px | Khoảng cách giữa các trường nhập liệu trong Form |
| **Card Padding** | `p-6` | 24px | Padding bên trong các thẻ thông tin quan trọng |
| **Page Margin** | `space-y-6` | 24px | Khoảng cách dọc giữa các section lớn trên trang |
| **Table Spacing** | `py-3 px-4` | 12px x 16px | Padding cho Header và Body Cell của bảng dữ liệu |
| **Section Gap** | `mb-8` | 32px | Khoảng cách từ Page Header xuống vùng dữ liệu |

---

## 2. Quy Chuẩn Typography (Typography Scale)

Sử dụng phông chữ **Inter** hoặc **Outfit** làm mặc định. Hạn chế sử dụng kiểu chữ đậm cho toàn bộ chữ thường.

- **Page Title (H1)**: `text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50`
- **Section Title (H2)**: `text-[16px] font-medium tracking-tight text-zinc-800 dark:text-zinc-100`
- **Card Title (H3)**: `text-[14px] font-medium text-zinc-900 dark:text-zinc-50`
- **Body Text**: `text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400`
- **Metadata / Sub-labels**: `text-2xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500`
- **Unique Identifiers (Batch Code, ID)**: `text-xs font-mono font-medium text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded`

---

## 3. Cải Tiến Bảng Dữ Liệu (Premium Tables)

Bảng dữ liệu trong Logistics cần độ nén thông tin cao nhưng vẫn dễ đọc. Cấm sử dụng viền dày hoặc các thẻ trạng thái (badge) quá sặc sỡ.

```tsx
// DataTable Row & Styling Standard
export default function TableDemo() {
  return (
    <div className="overflow-x-auto border border-zinc-200/50 bg-white dark:border-zinc-800/40 dark:bg-zinc-950 rounded-lg">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-200/50 bg-zinc-50/50 dark:border-zinc-800/40 dark:bg-zinc-900/10">
            <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Mã Lô Hàng</th>
            <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Sản Phẩm</th>
            <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Trạng Thái</th>
            <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-right">Hành Động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/40">
          <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors">
            <td className="px-4 py-3 font-mono text-xs font-medium text-zinc-900 dark:text-zinc-100">BCH-XM-102</td>
            <td className="px-4 py-3 text-[13px] text-zinc-650 dark:text-zinc-350">Xi măng PCB40</td>
            <td className="px-4 py-3">
              {/* Premium Status Badge: Chỉ dùng chấm tròn màu kết hợp text nhẹ */}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Đã nhận
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-150">Chi tiết</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

---

## 4. Blueprints Làm Lại Giao Diện Cho Từng Trang

### 🏠 Trang Chủ (Dashboard)
- **KPI Cards**: Loại bỏ bóng đổ đổ bóng sâu. Sử dụng bố cục gọn nhẹ với chỉ số lớn màu đen/trắng, nhãn màu xám mờ và một viền mỏng phân tách. Tránh hiển thị các icon tròn to đầy màu sắc (ví dụ: vòng tròn xanh chứa xe tải).
- **Charts (Biểu đồ Recharts)**:
  - Loại bỏ đường lưới (grid lines) đậm hoặc sử dụng `strokeDasharray="3 3"` với màu `stroke="#f4f4f5"` (light) hoặc `stroke="#27272a"` (dark).
  - Sử dụng màu xám tối (`#27272a` hoặc `#a1a1aa`) làm màu cột (Bar) thay vì màu xanh dương bóng bẩy mặc định.
- **Bản đồ Thu Nhỏ (Mini Map Widget)**: Đặt trong một khung hình bo góc (`rounded-lg`) tối giản với bản đồ không chứa các nút điều hướng phóng to/thu nhỏ thừa thãi trên widget.

### 📦 Chi Tiết Lô Hàng (Batch Detail) & Stepper Hành Trình
- **QR Code Card**: Sử dụng màu nền xám nhạt `bg-zinc-50 dark:bg-zinc-900/40` để bao bọc mã QR nhằm tối đa hóa độ tương phản máy quét đọc được.
- **Hành Trình Dọc (Timeline Stepper)**:
  - Thay đổi đường nối timeline thành đường kẻ mảnh 1px màu xám: `bg-zinc-200 dark:bg-zinc-800`.
  - Các bước hoàn thành: dùng dấu tích nhỏ hoặc chấm tròn đặc đen/trắng. Các bước chưa tới: dùng chấm tròn rỗng `border-zinc-300 bg-white`.
  - Giảm thiểu kích thước phần mô tả sự kiện, đưa ngày giờ về góc phải dạng chữ in nghiêng nhỏ.

### 🚚 Chi Tiết Vận Đơn (Shipment Detail) & Quản Lý Sự Cố
- **Tuyến Đường Mạng Lưới (Visual Route Mapping)**: Hiển thị sơ đồ dạng ngang trực quan:
  `Node Xuất (Tên & Trạng Thái) ────→ [Vận chuyển] ────→ Node Nhận (Tên & Trạng Thái)`
- **Dual-Signature Alerts**: Nếu nhân viên báo cáo sự cố trùng với người đang phê duyệt, hiển thị một banner cảnh báo mỏng, tinh tế sử dụng nền màu vàng nhạt/cam nhạt có độ bão hòa cực thấp (`bg-amber-50/50 dark:bg-amber-950/10 border-l-2 border-amber-500`), không dùng các bảng thông báo đỏ lòe loẹt.

### 🔍 Nhật Ký Kiểm Toán (Audit Logs)
- **So Sánh Thay Đổi (Diff Viewer)**:
  - Hiển thị bảng so sánh dày đặc thông tin nhưng có cấu trúc rõ ràng.
  - Sử dụng phông chữ monospace (`font-mono text-xs`).
  - Màu sắc so sánh dữ liệu:
    - Phần bị xóa: `text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/10 line-through`
    - Phần thêm mới: `text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10`
    - Phần sửa đổi: màu nền vàng nhạt.

### 📱 Giao Diện Công Khai: Quét QR (/scan) & Truy Xuất (/trace/:batchCode)
- **Scan Camera Box**: Khung quét bo góc tròn lớn với hiệu ứng đường quét laser mỏng màu xanh lục phát sáng chớp tắt tinh tế.
- **Trace Page Map**: Bản đồ Leaflet phủ toàn màn hình thiết bị di động ở phần dưới, thông tin sản phẩm dạng thẻ nổi (Floating Cards) nằm phía trên bản đồ, mang lại cảm giác ứng dụng di động gốc (Native App Feel).

---

## 5. Quy Tắc Viết Code CSS & Tailwind Cho AI
1. **Bắt buộc sử dụng viền mỏng 1px**: `border border-zinc-200 dark:border-zinc-850`.
2. **Bo góc hợp lý**: Tròn nhẹ ở góc card `rounded-lg` (8px), nút bấm và input `rounded-md` (6px).
3. **Màu Chữ Phân Cấp**:
   - Tiêu đề chính: `text-zinc-900 dark:text-zinc-50`
   - Nội dung thường: `text-zinc-500 dark:text-zinc-400`
   - Chỉ số phụ/Thời gian: `text-zinc-400 dark:text-zinc-500`
4. **Nút Bấm Giao Diện Chính (btn-primary)**: Tránh dùng màu xanh lam sáng thông thường. Thay thế bằng màu xám đen đậm ở light mode và màu trắng tinh ở dark mode:
   `bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100`
5. **Hiệu Ứng Chuyển Động (Hover & Focus)**: Sử dụng các chuyển động mượt mà `transition-all duration-150 ease-in-out` kèm theo thay đổi nhẹ về độ mờ hoặc độ sáng viền khi di chuột qua.
