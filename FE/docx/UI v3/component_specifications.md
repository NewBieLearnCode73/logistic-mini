# 🧱 UI v3 Component Specifications & TypeScript Types

Tài liệu này định nghĩa chi tiết API và cấu trúc Props của các React components lõi sẽ được triển khai trong dự án Frontend UI v3.

---

## 1. Command Palette / CommandBar

Component điều phối cổng tìm kiếm và gõ phím tắt toàn cục.

### TypeScript Interface
```typescript
interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'navigation' | 'actions' | 'search_batch' | 'search_shipment';
  shortcut?: string[]; // e.g. ['G', 'D'] for "Go to Dashboard"
  onTrigger: () => void;
  icon?: React.ComponentType<any>;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
}
```

### UX Behavior
- Kích hoạt bằng tổ hợp phím `Ctrl + K` (hoặc `Cmd + K` trên macOS).
- Tích hợp ô tìm kiếm tự động focus ngay khi mở.
- Sử dụng phím mũi tên `Up`/`Down` để lựa chọn, phím `Enter` để kích hoạt và `Esc` để đóng.

---

## 2. AI Assistant Dock (`AIAssistantDock`)

Dock chỉ huy thông minh trượt bên phải màn hình.

### TypeScript Interface
```typescript
interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextAction?: {
    label: string;
    actionType: 'redirect' | 'modal' | 'quick_fill';
    payload: any;
  };
}

interface AIAssistantDockProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPageContext: string; // e.g. "/shipments/12"
  activeEntityContext?: {
    type: 'batch' | 'shipment' | 'incident';
    id: string;
    code: string;
  };
}
```

### Features
- **Auto-Suggestions Box**: Dựa trên ngữ cảnh trang hiện tại để gợi ý 3 câu hỏi nhanh (ví dụ: đang ở trang Batch -> gợi ý "Dự báo thời gian giao lô hàng này", "In nhãn QR của lô hàng").
- **Realtime Activity Stream**: Hiển thị nhật ký sự kiện dạng ticker cập nhật liên tục từ WebSocket ở đáy panel.

---

## 3. Detail Inspector Drawer (`InspectorDrawer`)

Bảng trượt đa năng thay thế cho các Modal cũ để xem thông tin chi tiết nhanh mà không làm gián đoạn luồng làm việc hiện tại.

### TypeScript Interface
```typescript
interface InspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: 'sm' | 'md' | 'lg'; // sm = 360px, md = 480px, lg = 640px
  children: React.ReactNode;
  actions?: React.ReactNode; // Nút hành động đặt cố định ở đáy drawer
}
```

---

## 4. Recharts Wrapper Widget (`AnalyticsChart`)

Component bao bọc biểu đồ tối giản thích ứng tự động với theme màu và kích thước container.

### TypeScript Interface
```typescript
interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartDataPoint[];
  metrics: {
    key: string;
    label: string;
    colorVar: string; // Tên CSS variable e.g. "--brand-accent"
  }[];
  chartType: 'line' | 'bar' | 'area';
  loading?: boolean;
}
```

---

## 5. Interactive Leaflet Marker (`TelemetryMarker`)

Tạo divIcon Leaflet động dạng CSS thay vì ảnh PNG truyền thống để tích hợp hiệu ứng phát sóng sự cố (incident ping radar).

### Helper Generator Function
```typescript
function createTelemetryMarker(
  nodeType: 'MANUFACTURER' | 'DISTRIBUTOR' | 'RETAILER' | 'WAREHOUSE',
  status: 'NORMAL' | 'INCIDENT_OPEN' | 'WARNING',
  label: string
): L.DivIcon {
  // Returns L.divIcon with custom HTML template containing:
  // - Pulsing radar circles (pulsing red for incident_open, amber for warning)
  // - Custom SVG symbol matching node type
  // - Popover details container on hover
}
```
