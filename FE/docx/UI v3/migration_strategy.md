# 🚚 UI v3 Migration & Restructuring Strategy

Tài liệu này vạch ra chiến lược di chuyển (Migration Strategy) an toàn từ cấu trúc FE cũ sang kiến trúc UI v3 mới, đảm bảo giữ vững logic nghiệp vụ, các kết nối API hiện tại và tránh đứt gãy luồng biên dịch (Zero Bundling Breaks).

---

## 1. Bản đồ di chuyển thư mục (Directory Migration Map)

Các file cũ sẽ được chuyển sang vị trí mới theo bảng ánh xạ dưới đây:

| Thư mục/File cũ | Vị trí mới trong UI v3 | Trạng thái chuyển đổi |
| :--- | :--- | :--- |
| `src/design-system/` | `src/design-system/` | Cập nhật cấu hình Tailwind JS & CSS variables |
| `src/components/ui/DataTable.tsx` | `src/design-system/primitives/DataTable.tsx` | Nâng cấp API props, tích hợp bàn phím |
| `src/components/ui/StatusBadge.tsx` | `src/design-system/primitives/Badge.tsx` | Chuyển đổi thành component chung |
| `src/components/layout/AppLayout.tsx` | `src/core/AppShellV3.tsx` | Rebuild lưới thích ứng 4 cột |
| `src/components/layout/Sidebar.tsx` | `src/features/intelligence/components/SidebarV3.tsx` | Tự động chuyển Bottom Nav di động |
| `src/pages/dashboard/DashboardPage.tsx` | `src/features/command-center/pages/DashboardPage.tsx` | Rebuild thành trung tâm điều hành |
| `src/pages/batches/` | `src/features/operations/pages/batches/` | Chuyển sang dạng Workspace, quick edit |
| `src/pages/shipments/` | `src/features/operations/pages/shipments/` | Tích hợp sơ đồ di chuyển ngang động |
| `src/pages/map/` | `src/features/logistics/pages/map/` | Tải map đính kèm trong dashboard / operations |
| `src/pages/audit/` | `src/features/audit/pages/` | Chuyển đổi thành tab quản trị chung |
| `src/pages/auth/LoginPage.tsx` | `src/features/user-profile/pages/LoginPage.tsx` | Cập nhật màu sắc, layout Vercel |

---

## 2. Chiến lược tích hợp từng bước (Incremental Integration Strategy)

Để đảm bảo dự án luôn biên dịch thành công trong suốt quá trình tái kiến trúc, chúng ta thực hiện theo nguyên tắc **Chuyển đổi cuốn chiếu (Incremental Migration)**:

```
[BƯỚC 1: Setup Foundation & Tokens]
       │
       ▼
[BƯỚC 2: Di chuyển Primitives (DataTable, Badges)]
       │
       ▼
[BƯỚC 3: Triển khai Shell mới & Navigation (AppShellV3, Command Palette)]
       │
       ▼
[BƯỚC 4: Refactor từng Feature Workspace (Dashboard, Operations, Logistics)]
       │
       ▼
[BƯỚC 5: Xóa bỏ hoàn toàn code cũ không sử dụng]
```

### Bước 1: Setup Foundation & Thư mục mới
- Giữ nguyên toàn bộ code cũ hoạt động bình thường.
- Tạo sẵn các cấu trúc thư mục mới: `src/core/`, `src/features/`, `src/design-system/primitives/`.
- Cấu hình lại `tailwind.config.js` để nhận diện các đường dẫn thư mục mới này trong tham số `content`.

### Bước 2: Di chuyển và nâng cấp Core Primitives
- Viết các primitives mới như `Button`, `Badge`, `Card` kế thừa từ theme.css.
- Viết phiên bản `DataTable` mới hỗ trợ phím tắt và phân trang tối giản.

### Bước 3: Triển khai AppShell V3
- Viết `AppShellV3.tsx` cùng với `SidebarV3.tsx`, `HeaderV3.tsx` và `AIAssistantDock.tsx`.
- Cập nhật định tuyến tạm thời trong `App.tsx` để bọc các trang cũ dưới `AppShellV3` mới nhằm kiểm tra tính tương thích.

### Bước 4: Refactor cuốn chiếu từng tính năng (Feature Refactoring)
- Di chuyển từng thư mục con của `pages/` vào `features/` tương ứng, cập nhật lại đường dẫn import tương đối (relative paths) của các hooks, api client và utils.
- Refactor giao diện của trang đó sang chuẩn UI v3.
- Sau mỗi trang, chạy `npm run build` để kiểm tra lỗi biên dịch tức thời.

### Bước 5: Dọn dẹp và Tối ưu
- Xóa các file layout cũ (`Sidebar.tsx`, `Header.tsx`, `AppLayout.tsx`) và các thư mục cũ không còn tham chiếu.
- Chạy công cụ kiểm tra cú pháp TypeScript (`npx tsc --noEmit`) để dọn sạch các cảnh báo import rác.

---

## 3. Bảo toàn logic nghiệp vụ (API & React Query Stores)

> [!IMPORTANT]
> **Cấm thay đổi logic API**:
> - Giữ nguyên toàn bộ các file trong `src/api/` và `src/hooks/queries/` (chỉ di chuyển thư mục hoặc cập nhật import).
> - Tránh sửa đổi cấu trúc dữ liệu trả về từ server của các API `Batches`, `Shipments`, `Incidents`, `Audit Logs` để tránh gây crash runtime.
> - Các thay đổi chỉ tập trung vào lớp trình diễn (Presentation Layer - TSX & CSS).
