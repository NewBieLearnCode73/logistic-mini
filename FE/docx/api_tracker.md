# Nhật Ký Phát Triển & Tài Liệu API

File này dùng để cập nhật tiến độ phát triển dự án và chi tiết các API đã được phát triển trong hệ thống.

---

## 📌 Tổng Quan Tiến Độ
- **Giai đoạn 1: Identity & Authentication** (Đã hoàn thành)
  - Khởi tạo cấu trúc dự án chuẩn Modular Architecture.
  - Xây dựng database schema: `UserEntity`, `RoleEntity`, `UserRoleEntity`.
  - Triển khai cơ chế xác thực JWT & phân quyền `RolesGuard`.
  - Viết script seed dữ liệu mẫu thành công.

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu (Entities)

### 1. User (`users`)
- `id`: UUID (Primary Key)
- `email`: string (Unique, Lowercase, Indexed)
- `password_hash`: string (Bcrypt, saltRounds = 12)
- `full_name`: string
- `node_id`: UUID | null (Liên kết với các nút trong chuỗi cung ứng)
- `is_active`: boolean (Default: `true`)
- `created_at`: timestamptz
- `updated_at`: timestamptz
- `deleted_at`: timestamptz (Phục vụ Soft Delete)
- `version`: integer (@VersionColumn phục vụ Optimistic Locking)

### 2. Role (`roles`)
- `id`: UUID (Primary Key)
- `name`: string (Unique - `Admin`, `Manufacturer`, `Distributor`, `Retailer`, `Consumer`)
- `description`: string
- `created_at`: timestamptz

### 3. UserRole (`users_roles`)
- `user_id`: UUID (Composite Primary Key, Foreign Key -> `users`)
- `role_id`: UUID (Composite Primary Key, Foreign Key -> `roles`)
- `assigned_at`: timestamptz

### 4. Node (`nodes`)
- `id`: UUID (Primary Key)
- `name`: string
- `node_type`: string (Enum - `MANUFACTURER`, `DISTRIBUTOR`, `RETAILER`, `WAREHOUSE`)
- `address`: string | null
- `latitude`: decimal(10,7) | null
- `longitude`: decimal(10,7) | null
- `is_active`: boolean
- `created_at`: timestamptz
- `updated_at`: timestamptz
- `deleted_at`: timestamptz | null
- `version`: integer

### 5. Product (`products`)
- `id`: UUID (Primary Key)
- `name`: string
- `sku`: string (Unique)
- `unit`: string
- `description`: string | null
- `category`: string | null
- `is_active`: boolean
- `created_at`: timestamptz
- `updated_at`: timestamptz
- `deleted_at`: timestamptz | null

### 6. Batch (`batches`)
- `id`: UUID (Primary Key)
- `batch_code`: string (Unique)
- `product_id`: UUID (Foreign Key -> `products`)
- `origin_node_id`: UUID (Foreign Key -> `nodes`)
- `current_node_id`: UUID (Foreign Key -> `nodes`)
- `quantity`: decimal(12,3)
- `unit`: string
- `manufacture_date`: date
- `expiry_date`: date
- `status`: string (Enum - `CREATED`, `IN_TRANSIT`, `RECEIVED`, `SOLD`, `DISCARDED`, `LOST`)
- `created_by`: UUID (Foreign Key -> `users`)
- `created_at`: timestamptz
- `updated_at`: timestamptz
- `version`: integer

### 7. BatchQrCode (`batch_qr_codes`)
- `id`: UUID (Primary Key)
- `batch_id`: UUID (Unique, Foreign Key -> `batches`)
- `qr_data`: text (Payload URL)
- `svg_data`: text (SVG XML string)
- `qr_image_url`: text (base64 PNG data URL)
- `generated_at`: timestamptz
- `generated_by`: UUID (Foreign Key -> `users`)

### 8. Inventory (`inventory`)
- `batch_id`: UUID (Composite Primary Key, Foreign Key -> `batches`)
- `node_id`: UUID (Composite Primary Key, Foreign Key -> `nodes`)
- `quantity_available`: decimal(12,3)
- `last_updated_at`: timestamptz
- `version`: integer

### 9. TimelineEvent (`timeline_events`)
- `id`: UUID (Primary Key)
- `batch_id`: UUID (Foreign Key -> `batches`)
- `event_type`: string (Enum)
- `node_id`: UUID | null (Foreign Key -> `nodes`)
- `actor_id`: UUID | null (Foreign Key -> `users`)
- `shipment_id`: UUID | null
- `quantity_delta`: decimal(12,3) | null
- `notes`: text | null
- `occurred_at`: timestamptz
- `metadata`: jsonb | null

### 10. IncidentReport (`incident_reports`)
- `id`: UUID (Primary Key)
- `incident_code`: string (Unique, INC-YYYYMMDD-xxxx)
- `shipment_id`: UUID (Foreign Key -> `shipments`)
- `batch_id`: UUID (Foreign Key -> `batches`)
- `incident_type`: string (OVERDUE | MISSING | DAMAGED | FRAUD | OTHER)
- `status`: string (OPEN | IN_PROGRESS | RESOLVED | CLOSED)
- `priority`: string (LOW | MEDIUM | HIGH | CRITICAL)
- `reported_by`: UUID (Foreign Key -> `users`)
- `assigned_to`: UUID | null (Foreign Key -> `users`)
- `description`: text
- `resolution`: text | null
- `resolution_type`: string | null (FOUND | LOSS_CONFIRMED | CANCELLED | CORRECTED)
- `approved_by`: UUID | null (Foreign Key -> `users`)
- `evidence_jsonb`: jsonb | null
- `opened_at`: timestamptz
- `resolved_at`: timestamptz | null
- `closed_at`: timestamptz | null
- `version`: integer

### 11. ShipmentIssue (`shipment_issues`)
- `id`: UUID (Primary Key)
- `shipment_id`: UUID (Foreign Key -> `shipments`)
- `issue_type`: string (OVERDUE | MISSING | WRONG_NODE | UNACKNOWLEDGED | DAMAGED | FRAUD)
- `severity`: string (LOW | MEDIUM | HIGH | CRITICAL)
- `detected_at`: timestamptz
- `detected_by`: string
- `reported_by`: UUID | null (Foreign Key -> `users`)
- `notes`: text | null
- `is_resolved`: boolean
- `resolved_at`: timestamptz | null
- `incident_report_id`: UUID | null (Foreign Key -> `incident_reports`)

### 12. InventoryAdjustment (`inventory_adjustments`)
- `id`: UUID (Primary Key)
- `batch_id`: UUID (Foreign Key -> `batches`)
- `node_id`: UUID (Foreign Key -> `nodes`)
- `adjustment_type`: string (LOSS_ROLLBACK | DAMAGE_WRITE_OFF | CORRECTION | RECONCILIATION)
- `qty_before`: decimal(12,3)
- `qty_delta`: decimal(12,3)
- `qty_after`: decimal(12,3)
- `reason`: text
- `approved_by`: UUID (Foreign Key -> `users`)
- `second_approver`: UUID | null (Foreign Key -> `users`)
- `reference_id`: UUID | null
- `reference_type`: string | null (incident_reports | shipments)
- `created_at`: timestamptz

### 13. AuditLog (`audit_logs`)
- `id`: UUID (Primary Key)
- `actor_id`: UUID | null (Foreign Key -> `users`)
- `action`: string (CREATE | UPDATE | DELETE | LOGIN...)
- `entity_type`: string
- `entity_id`: UUID | null
- `old_values`: jsonb | null
- `new_values`: jsonb | null
- `ip_address`: string | null
- `user_agent`: string | null
- `occurred_at`: timestamptz

### 14. ScanLog (`scan_logs`)
- `id`: UUID (Primary Key)
- `batch_id`: UUID (Foreign Key -> `batches`)
- `qr_code_id`: UUID | null (Foreign Key -> `batch_qr_codes`)
- `scanned_by`: UUID | null (Foreign Key -> `users`)
- `ip_address`: string | null
- `user_agent`: string | null
- `latitude`: decimal(10,7) | null
- `longitude`: decimal(10,7) | null
- `scanned_at`: timestamptz

---

## 📡 Danh Sách API Đã Triển Khai

### 1. Đăng Nhập & Xác Thực (Auth)

#### 1.1. Đăng Nhập Hệ Thống
*   **Endpoint**: `POST /api/v1/auth/login`
*   **Mô tả**: Xác thực người dùng bằng Email và Mật khẩu. Trả về mã JWT dùng cho các API tiếp theo.
*   **Quyền truy cập**: Công khai (`@Public()`)
*   **Request Headers**:
    ```http
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "email": "admin@logistic.com", // String (Bắt buộc, tự động chuẩn hóa về viết thường và cắt khoảng trắng)
      "password": "password123"      // String (Bắt buộc, tối thiểu 6 ký tự)
    }
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
    *Thông tin mã hóa trong JWT Payload:*
    ```json
    {
      "sub": "a0000000-0000-0000-0000-000000000001", // User ID
      "role": "Admin",                               // Vai trò chính của User
      "nodeId": null,                                // Node ID gán với User (nếu có)
      "iat": 1779423219,
      "exp": 1779509619
    }
    ```
*   **Response Lỗi (`401 Unauthorized`)**:
    ```json
    {
      "message": "Email hoặc mật khẩu không chính xác",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```
*   **Response Lỗi (`400 Bad Request`)**:
    ```json
    {
      "message": [
        "Email không hợp lệ"
      ],
      "error": "Bad Request",
      "statusCode": 400
    }
    ```

#### 1.2. Lấy Thông Tin Người Dùng Hiện Tại
*   **Endpoint**: `GET /api/v1/auth/me`
*   **Mô tả**: Trả về thông tin chi tiết của người dùng đang đăng nhập dựa trên JWT token được gửi kèm.
*   **Quyền truy cập**: Đăng nhập thành công (`JwtAuthGuard`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Request Body**: *Trống*
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "a0000000-0000-0000-0000-000000000001",
      "email": "admin@logistic.com",
      "fullName": "System Administrator",
      "nodeId": null,
      "isActive": true,
      "createdAt": "2026-05-22T04:13:27.375Z",
      "updatedAt": "2026-05-22T04:13:27.375Z",
      "deletedAt": null,
      "version": 1,
      "userRoles": [
        {
          "userId": "a0000000-0000-0000-0000-000000000001",
          "roleId": "00000000-0000-0000-0000-000000000001",
          "assignedAt": "2026-05-22T04:13:27.379Z",
          "role": {
            "id": "00000000-0000-0000-0000-000000000001",
            "name": "Admin",
            "description": "System Administrator",
            "createdAt": "2026-05-22T04:13:27.189Z"
          }
        }
      ]
    }
    ```
    *(Chú ý: Trường `passwordHash` đã được lọc bỏ để bảo mật).*
*   **Response Lỗi (`401 Unauthorized`)**:
    ```json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    ```

#### 1.3. Đăng Xuất Hệ Thống
*   **Endpoint**: `POST /api/v1/auth/logout`
*   **Mô tả**: Đăng xuất người dùng khỏi hệ thống.
*   **Quyền truy cập**: Đăng nhập thành công (`JwtAuthGuard`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Request Body**: *Trống*
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "message": "Đăng xuất thành công"
    }
    ```
*   **Response Lỗi (`401 Unauthorized`)**:
    ```json
    {
      "message": "Unauthorized",
      "statusCode": 401
    }
    ```

---

### 2. Quản Lý Tài Khoản Nhân Sự (Users)

#### 2.1. Tạo Tài Khoản Nhân Sự Mới
*   **Endpoint**: `POST /api/v1/users`
*   **Mô tả**: Tạo tài khoản nhân sự mới, gán vai trò (`role`) và điểm mạng lưới quản lý (`node_id`). Tự động sinh mật khẩu tạm thời và mô phỏng gửi email kích hoạt.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "email": "staff.manufacturer@logistic.com", // String (Bắt buộc)
      "fullName": "Nguyen Van B", // String (Bắt buộc)
      "role": "Manufacturer", // Enum: Admin, Manufacturer, Distributor, Retailer, Consumer
      "nodeId": "e3000000-0000-0000-0000-000000000001" // UUID (Optional, Node ID liên kết)
    }
    ```
*   **Response Thành Công (`201 Created`)**:
    ```json
    {
      "message": "Tạo tài khoản nhân sự mới thành công",
      "data": {
        "id": "a0000000-0000-0000-0000-000000000003",
        "email": "staff.manufacturer@logistic.com",
        "fullName": "Nguyen Van B",
        "nodeId": "e3000000-0000-0000-0000-000000000001",
        "isActive": true,
        "createdAt": "2026-05-22T08:45:00.000Z",
        "updatedAt": "2026-05-22T08:45:00.000Z",
        "userRoles": [
          {
            "userId": "a0000000-0000-0000-0000-000000000003",
            "roleId": "00000000-0000-0000-0000-000000000002",
            "role": {
              "id": "00000000-0000-0000-0000-000000000002",
              "name": "Manufacturer"
            }
          }
        ]
      },
      "temporaryPassword": "x9a3f2d1" // Mật khẩu sinh ngẫu nhiên trả về để phục vụ thử nghiệm/kích hoạt
    }
    ```

#### 2.2. Lấy Danh Sách Tài Khoản Nhân Sự
*   **Endpoint**: `GET /api/v1/users`
*   **Mô tả**: Lấy danh sách tài khoản kèm phân trang và các bộ lọc tìm kiếm.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Query Parameters**:
    *   `page`: Page number (mặc định: `1`)
    *   `limit`: Page size (mặc định: `10`)
    *   `role`: Filter theo tên vai trò (ví dụ: `Manufacturer`)
    *   `nodeId`: Filter theo Node ID (UUID)
    *   `isActive`: Filter theo trạng thái hoạt động (`true`/`false`)
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "data": [
        {
          "id": "a0000000-0000-0000-0000-000000000003",
          "email": "staff.manufacturer@logistic.com",
          "fullName": "Nguyen Van B",
          "nodeId": "e3000000-0000-0000-0000-000000000001",
          "isActive": true,
          "createdAt": "2026-05-22T08:45:00.000Z",
          "userRoles": [
            {
              "role": {
                "name": "Manufacturer"
              }
            }
          ]
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    }
    ```

#### 2.3. Cập Nhật Thông Tin Tài Khoản
*   **Endpoint**: `PUT /api/v1/users/:id`
*   **Mô tả**: Cập nhật thông tin cá nhân, thay đổi quyền hạn (vai trò) hoặc nút mạng lưới công tác của nhân sự.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "fullName": "Nguyen Van B - Chỉnh Sửa", // Optional
      "role": "Distributor", // Enum (Optional, thay đổi vai trò)
      "nodeId": "e3000000-0000-0000-0000-000000000002" // UUID | null (Optional, thay đổi Node công tác)
    }
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "message": "Cập nhật thông tin nhân sự thành công",
      "data": {
        "id": "a0000000-0000-0000-0000-000000000003",
        "email": "staff.manufacturer@logistic.com",
        "fullName": "Nguyen Van B - Chỉnh Sửa",
        "nodeId": "e3000000-0000-0000-0000-000000000002",
        "isActive": true,
        "userRoles": [
          {
            "role": {
              "name": "Distributor"
            }
          }
        ]
      }
    }
    ```

#### 2.4. Kích Hoạt / Vô Hiệu Hóa Tài Khoản (Soft Active Toggle)
*   **Endpoint**: `PATCH /api/v1/users/:id/toggle-active`
*   **Mô tả**: Kích hoạt lại hoặc vô hiệu hóa tài khoản (Soft disable). Khi tài khoản bị vô hiệu hóa, `isActive` chuyển sang `false` làm mất quyền đăng nhập của nhân sự đó, nhưng dữ liệu lịch sử audit trail vẫn được lưu trữ nguyên vẹn.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "message": "Vô hiệu hóa tài khoản nhân sự thành công", // Hoặc "Kích hoạt tài khoản nhân sự thành công"
      "data": {
        "id": "a0000000-0000-0000-0000-000000000003",
        "email": "staff.manufacturer@logistic.com",
        "fullName": "Nguyen Van B - Chỉnh Sửa",
        "nodeId": "e3000000-0000-0000-0000-000000000002",
        "isActive": false, // Trạng thái đã thay đổi
        "userRoles": [
          {
            "role": {
              "name": "Distributor"
            }
          }
        ]
      }
    }
    ```

#### 2.5. Cấp Lại Mật Khẩu Cho Nhân Sự
*   **Endpoint**: `POST /api/v1/users/:id/reset-password`
*   **Mô tả**: Cập lại mật khẩu mới cho nhân sự được chọn. Ngoại trừ các tài khoản có vai trò `Admin` (sẽ trả về lỗi `400 Bad Request`). Mật khẩu cấp lại được tạo ngẫu nhiên (> 6 ký tự) và mã hóa lưu vào cơ sở dữ liệu.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "message": "Cập lại mật khẩu nhân sự thành công",
      "data": {
        "id": "a0000000-0000-0000-0000-000000000003",
        "email": "staff.manufacturer@logistic.com",
        "fullName": "Nguyen Van B - Chỉnh Sửa",
        "nodeId": "e3000000-0000-0000-0000-000000000002",
        "isActive": false,
        "userRoles": [
          {
            "role": {
              "name": "Distributor"
            }
          }
        ]
      },
      "temporaryPassword": "y2e8a1w0" // Mật khẩu mới sinh ngẫu nhiên trả về để phục vụ thử nghiệm/kích hoạt
    }
    ```
*   **Response Lỗi (`400 Bad Request`)**:
    ```json
    {
      "message": "Không thể cấp lại mật khẩu cho tài khoản có quyền Admin",
      "error": "Bad Request",
      "statusCode": 400
    }
    ```

---

### 3. Quản Lý Hạ Tầng Mạng Lưới (Nodes)

#### 3.1. Tạo Điểm Mạng Lưới Mới
*   **Endpoint**: `POST /api/v1/nodes`
*   **Mô tả**: Tạo một node mới trong mạng lưới chuỗi cung ứng. Bắt buộc phải khai báo tọa độ GPS (vĩ độ/kinh độ) phục vụ vẽ bản đồ.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "name": "Nhà máy Sản xuất A",
      "nodeType": "MANUFACTURER", // Enum: MANUFACTURER, DISTRIBUTOR, RETAILER, WAREHOUSE
      "address": "123 Đường Láng, Hà Nội", // Optional
      "latitude": 21.0285, // Number (Bắt buộc, -90 đến 90)
      "longitude": 105.8542 // Number (Bắt buộc, -180 đến 180)
    }
    ```
*   **Response Thành Công (`201 Created`)**:
    ```json
    {
      "id": "e3000000-0000-0000-0000-000000000001",
      "name": "Nhà máy Sản xuất A",
      "nodeType": "MANUFACTURER",
      "address": "123 Đường Láng, Hà Nội",
      "latitude": 21.0285,
      "longitude": 105.8542,
      "isActive": true,
      "createdAt": "2026-05-22T08:00:00.000Z",
      "updatedAt": "2026-05-22T08:00:00.000Z",
      "deletedAt": null,
      "version": 1
    }
    ```

#### 3.2. Lấy Danh Sách Các Điểm Mạng Lưới
*   **Endpoint**: `GET /api/v1/nodes`
*   **Mô tả**: Lấy danh sách các điểm mạng lưới kèm phân trang. Hỗ trợ query tham số `includeInventory=true` để lấy tổng hợp dữ liệu tồn kho phục vụ module bản đồ quản trị.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer (`@Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Query Parameters**:
    *   `page`: Page number (mặc định: `1`)
    *   `limit`: Page size (mặc định: `10`)
    *   `includeInventory`: Trả về thông tin tồn kho tại node (`true`/`false`)
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "data": [
        {
          "id": "e3000000-0000-0000-0000-000000000001",
          "name": "Nhà máy Sản xuất A",
          "nodeType": "MANUFACTURER",
          "address": "123 Đường Láng, Hà Nội",
          "latitude": 21.0285,
          "longitude": 105.8542,
          "isActive": true,
          "createdAt": "2026-05-22T08:00:00.000Z",
          "version": 1,
          "inventories": [
            {
              "batchId": "b3000000-0000-0000-0000-000000000001",
              "nodeId": "e3000000-0000-0000-0000-000000000001",
              "quantityAvailable": 500,
              "lastUpdatedAt": "2026-05-22T08:30:00.000Z",
              "version": 1,
              "batch": {
                "id": "b3000000-0000-0000-0000-000000000001",
                "batchCode": "BCH-20260522-8f9d0c2e",
                "product": {
                  "id": "p0000000-0000-0000-0000-000000000001",
                  "name": "Sản phẩm A",
                  "sku": "SKU-PROD-A"
                }
              }
            }
          ]
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    }
    ```

#### 3.3. Chỉnh Sửa Thông Tin Điểm Mạng Lưới
*   **Endpoint**: `PUT /api/v1/nodes/:id`
*   **Mô tả**: Chỉnh sửa thông tin điểm mạng lưới. Áp dụng cơ chế khóa lạc quan (optimistic locking) sử dụng trường `version` trong body để phát hiện và ngăn chặn ghi đè dữ liệu bị xung đột.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "name": "Nhà máy Sản xuất A - Đã Sửa",
      "nodeType": "MANUFACTURER",
      "address": "456 Đường Láng, Hà Nội",
      "latitude": 21.0285,
      "longitude": 105.8542,
      "version": 1 // Number (Sử dụng cho khóa lạc quan)
    }
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "e3000000-0000-0000-0000-000000000001",
      "name": "Nhà máy Sản xuất A - Đã Sửa",
      "nodeType": "MANUFACTURER",
      "address": "456 Đường Láng, Hà Nội",
      "latitude": 21.0285,
      "longitude": 105.8542,
      "isActive": true,
      "createdAt": "2026-05-22T08:00:00.000Z",
      "updatedAt": "2026-05-23T13:00:00.000Z",
      "version": 2 // Tự động tăng lên 2 sau khi update thành công
    }
    ```
*   **Response Lỗi Xung Đột (`409 Conflict`)**:
    ```json
    {
      "statusCode": 409,
      "message": "Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang.",
      "error": "Conflict"
    }
    ```

#### 3.4. Vô Hiệu Hóa Điểm Mạng Lưới (Soft Delete)
*   **Endpoint**: `DELETE /api/v1/nodes/:id`
*   **Mô tả**: Vô hiệu hóa điểm mạng lưới bằng cơ chế Soft Delete (`deleted_at = NOW()`). Hệ thống bắt buộc kiểm tra điều kiện an toàn kho bãi: nếu node đó vẫn còn chứa hàng tồn kho (`quantityAvailable > 0`), hệ thống sẽ từ chối xóa và trả về lỗi `400 Bad Request`.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`204 No Content`)**: *Trống*
*   **Response Lỗi Khóa Kho Bãi (`400 Bad Request`)**:
    ```json
    {
      "statusCode": 400,
      "message": "Không thể xóa/vô hiệu hóa điểm nút vì vẫn còn hàng tồn kho tại đây (Số lượng: 500)",
      "error": "Bad Request"
    }
    ```

---

### 4. Quản Lý Sản Phẩm (Products)

#### 4.1. Tạo Sản Phẩm Mới
*   **Endpoint**: `POST /api/v1/products`
*   **Mô tả**: Tạo một sản phẩm thương mại mới trong hệ thống.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "name": "Sản phẩm A", // String (Bắt buộc)
      "sku": "SKU-PROD-A", // String (Bắt buộc, duy nhất)
      "unit": "Hộp", // String (Bắt buộc, ví dụ: Hộp, Chai, kg)
      "description": "Mô tả chi tiết sản phẩm A", // String (Optional)
      "category": "Dược phẩm" // String (Optional)
    }
    ```
*   **Response Thành Công (`201 Created`)**:
    ```json
    {
      "id": "p0000000-0000-0000-0000-000000000001",
      "name": "Sản phẩm A",
      "sku": "SKU-PROD-A",
      "unit": "Hộp",
      "description": "Mô tả chi tiết sản phẩm A",
      "category": "Dược phẩm",
      "isActive": true,
      "createdAt": "2026-05-23T14:15:00.000Z",
      "updatedAt": "2026-05-23T14:15:00.000Z"
    }
    ```

#### 4.2. Lấy Danh Sách Sản Phẩm
*   **Endpoint**: `GET /api/v1/products`
*   **Mô tả**: Lấy danh sách sản phẩm có phân trang, hỗ trợ tìm kiếm theo tên/sku và lọc theo danh mục, trạng thái hoạt động.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer, Consumer (`@Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER, RoleName.CONSUMER)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Query Parameters**:
    *   `page`: Page number (mặc định: `1`)
    *   `limit`: Page size (mặc định: `10`)
    *   `search`: Từ khóa tìm kiếm theo tên hoặc SKU (Optional)
    *   `category`: Tên danh mục (Optional)
    *   `isActive`: Trạng thái hoạt động `true`/`false` (Optional)
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "data": [
        {
          "id": "p0000000-0000-0000-0000-000000000001",
          "name": "Sản phẩm A",
          "sku": "SKU-PROD-A",
          "unit": "Hộp",
          "description": "Mô tả chi tiết sản phẩm A",
          "category": "Dược phẩm",
          "isActive": true,
          "createdAt": "2026-05-23T14:15:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10
    }
    ```

#### 4.3. Xem Chi Tiết Sản Phẩm
*   **Endpoint**: `GET /api/v1/products/:id`
*   **Mô tả**: Xem thông tin chi tiết của một sản phẩm.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer, Consumer (`@Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER, RoleName.CONSUMER)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "p0000000-0000-0000-0000-000000000001",
      "name": "Sản phẩm A",
      "sku": "SKU-PROD-A",
      "unit": "Hộp",
      "description": "Mô tả chi tiết sản phẩm A",
      "category": "Dược phẩm",
      "isActive": true,
      "createdAt": "2026-05-23T14:15:00.000Z",
      "updatedAt": "2026-05-23T14:15:00.000Z"
    }
    ```

#### 4.4. Cập Nhật Sản Phẩm
*   **Endpoint**: `PUT /api/v1/products/:id`
*   **Mô tả**: Cập nhật thông tin sản phẩm.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "name": "Sản phẩm A - Đã Sửa",
      "description": "Cập nhật mô tả mới",
      "category": "Thiết bị y tế"
    }
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "p0000000-0000-0000-0000-000000000001",
      "name": "Sản phẩm A - Đã Sửa",
      "sku": "SKU-PROD-A",
      "unit": "Hộp",
      "description": "Cập nhật mô tả mới",
      "category": "Thiết bị y tế",
      "isActive": true,
      "createdAt": "2026-05-23T14:15:00.000Z",
      "updatedAt": "2026-05-23T14:20:00.000Z"
    }
    ```

#### 4.5. Xóa Sản Phẩm
*   **Endpoint**: `DELETE /api/v1/products/:id`
*   **Mô tả**: Xóa mềm sản phẩm khỏi hệ thống (thiết lập trường `deletedAt`).
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`204 No Content`)**: *Trống*

---

### 5. Quản Lý Lô Hàng (Batches)

#### 5.1. Khởi Tạo Lô Hàng Mới & Sinh Mã QR
*   **Endpoint**: `POST /api/v1/batches`
*   **Mô tả**: Tạo một lô hàng mới cho sản phẩm tại node sản xuất. Toàn bộ quá trình tạo lô hàng, sinh mã QR (SVG & PNG data URL), khởi tạo tồn kho và ghi sự kiện timeline được thực thi trong một Database Transaction.
*   **Quyền truy cập**: Manufacturer (`@Roles(RoleName.MANUFACTURER)`) / Admin
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "productId": "p0000000-0000-0000-0000-000000000001",
      "quantity": 500, // Number (Bắt buộc, > 0)
      "unit": "Hộp", // String (Bắt buộc)
      "manufactureDate": "2026-05-22T00:00:00.000Z", // String (Bắt buộc)
      "expiryDate": "2027-05-22T00:00:00.000Z", // String (Bắt buộc, > manufactureDate)
      "originNodeId": "e3000000-0000-0000-0000-000000000001" // UUID (Bắt buộc đối với Admin, tự động lấy của user đối với Manufacturer)
    }
    ```
*   **Response Thành Công (`201 Created`)**:
    ```json
    {
      "id": "b3000000-0000-0000-0000-000000000001",
      "batchCode": "BCH-20260522-8f9d0c2e",
      "productId": "p0000000-0000-0000-0000-000000000001",
      "originNodeId": "e3000000-0000-0000-0000-000000000001",
      "currentNodeId": "e3000000-0000-0000-0000-000000000001",
      "quantity": 500,
      "unit": "Hộp",
      "manufactureDate": "2026-05-22T00:00:00.000Z",
      "expiryDate": "2027-05-22T00:00:00.000Z",
      "status": "CREATED",
      "createdBy": "a0000000-0000-0000-0000-000000000002",
      "createdAt": "2026-05-22T08:30:00.000Z",
      "updatedAt": "2026-05-22T08:30:00.000Z",
      "version": 1,
      "product": {
        "id": "p0000000-0000-0000-0000-000000000001",
        "name": "Sản phẩm A",
        "sku": "SKU-PROD-A",
        "unit": "Hộp",
        "isActive": true
      },
      "originNode": {
        "id": "e3000000-0000-0000-0000-000000000001",
        "name": "Nhà máy Sản xuất A",
        "nodeType": "MANUFACTURER",
        "isActive": true
      },
      "currentNode": {
        "id": "e3000000-0000-0000-0000-000000000001",
        "name": "Nhà máy Sản xuất A",
        "nodeType": "MANUFACTURER",
        "isActive": true
      }
    }
    ```

#### 5.2. Bán Lẻ Sản Phẩm Từ Lô Hàng
*   **Endpoint**: `POST /api/v1/batches/:id/sell`
*   **Mô tả**: Trừ kho khả dụng tại nút bán lẻ khi bán lẻ sản phẩm. Nếu tồn kho của lô hàng tại nút này giảm về 0, tự động cập nhật trạng thái của lô hàng sang `SOLD`. Đồng thời ghi nhận sự kiện timeline `SOLD` (giá trị `quantity_delta` âm).
*   **Quyền truy cập**: Retailer (`@Roles(RoleName.RETAILER)`) / Admin
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "quantity": 50 // Number (Bắt buộc, > 0)
    }
    ```
*   **Response Thành Công (`200 OK`)**: *Trống*

#### 5.3. Tra Cứu Danh Sách Lô Hàng (Phân Trang & RLS)
*   **Endpoint**: `GET /api/v1/batches`
*   **Mô tả**: Tra cứu danh sách các lô hàng có phân trang. Áp dụng Row-level Security để giới hạn phạm vi dữ liệu:
    *   **Admin**: Thấy toàn bộ lô hàng trong hệ thống.
    *   **Manufacturer**: Chỉ thấy các lô hàng được sản xuất tại cơ sở của mình (`originNodeId` khớp với `nodeId` của user).
    *   **Distributor/Retailer**: Chỉ thấy các lô hàng đã từng đi qua kho của mình (tức là đã từng phát sinh tồn kho tại `nodeId` của user).
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer
*   **Query Parameters**:
    *   `page`: number (Optional, mặc định `1`)
    *   `limit`: number (Optional, mặc định `10`)
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "data": [
        {
          "id": "b3000000-0000-0000-0000-000000000001",
          "batchCode": "BCH-20260522-8f9d0c2e",
          "productId": "p0000000-0000-0000-0000-000000000001",
          "originNodeId": "e3000000-0000-0000-0000-000000000001",
          "currentNodeId": "e3000000-0000-0000-0000-000000000001",
          "quantity": 500,
          "unit": "Hộp",
          "manufactureDate": "2026-05-22T00:00:00.000Z",
          "expiryDate": "2027-05-22T00:00:00.000Z",
          "status": "CREATED",
          "createdAt": "2026-05-22T08:30:00.000Z",
          "product": {
            "id": "p0000000-0000-0000-0000-000000000001",
            "name": "Sản phẩm A",
            "sku": "SKU-PROD-A",
            "unit": "Hộp",
            "isActive": true
          },
          "originNode": {
            "id": "e3000000-0000-0000-0000-000000000001",
            "name": "Nhà máy Sản xuất A",
            "nodeType": "MANUFACTURER",
            "isActive": true
          },
          "currentNode": {
            "id": "e3000000-0000-0000-0000-000000000001",
            "name": "Nhà máy Sản xuất A",
            "nodeType": "MANUFACTURER",
            "isActive": true
          }
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
    ```

#### 5.4. Xem Chi Tiết Một Lô Hàng
*   **Endpoint**: `GET /api/v1/batches/:id`
*   **Mô tả**: Xem chi tiết một lô hàng theo ID. Trả về thông tin sản phẩm, vị trí hiện tại và dữ liệu ảnh mã QR dán trên bao bì. Áp dụng RLS tương tự như API danh sách.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "b3000000-0000-0000-0000-000000000001",
      "batchCode": "BCH-20260522-8f9d0c2e",
      "productId": "p0000000-0000-0000-0000-000000000001",
      "originNodeId": "e3000000-0000-0000-0000-000000000001",
      "currentNodeId": "e3000000-0000-0000-0000-000000000001",
      "quantity": 500,
      "unit": "Hộp",
      "manufactureDate": "2026-05-22T00:00:00.000Z",
      "expiryDate": "2027-05-22T00:00:00.000Z",
      "status": "CREATED",
      "product": {
        "id": "p0000000-0000-0000-0000-000000000001",
        "name": "Sản phẩm A",
        "sku": "SKU-PROD-A",
        "unit": "Hộp",
        "isActive": true
      },
      "originNode": {
        "id": "e3000000-0000-0000-0000-000000000001",
        "name": "Nhà máy Sản xuất A",
        "nodeType": "MANUFACTURER",
        "isActive": true
      },
      "currentNode": {
        "id": "e3000000-0000-0000-0000-000000000001",
        "name": "Nhà máy Sản xuất A",
        "nodeType": "MANUFACTURER",
        "isActive": true
      },
      "qrCode": {
        "id": "q3000000-0000-0000-0000-000000000001",
        "qrData": "https://mini-logistic.com/public/trace/BCH-20260522-8f9d0c2e",
        "svgData": "<svg>...</svg>",
        "qrImageUrl": "data:image/png;base64,..."
      }
    }
    ```

#### 5.5. Xem Chi Tiết Lịch Sử Lô Hàng (Timeline)
*   **Endpoint**: `GET /api/v1/batches/:id/timeline`
*   **Mô tả**: Trả về danh sách chuỗi sự kiện lịch sử bất biến của lô hàng sắp xếp theo thứ tự thời gian tăng dần (`occurredAt ASC`). Áp dụng RLS bảo mật.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer
*   **Response Thành Công (`200 OK`)**:
    ```json
    [
      {
        "id": "t3000000-0000-0000-0000-000000000001",
        "batchId": "b3000000-0000-0000-0000-000000000001",
        "eventType": "CREATED",
        "nodeId": "e3000000-0000-0000-0000-000000000001",
        "actorId": "a0000000-0000-0000-0000-000000000002",
        "occurredAt": "2026-05-22T08:30:00.000Z",
        "quantityDelta": 500,
        "notes": "Khởi tạo lô hàng mới tại nhà máy."
      }
    ]
    ```

#### 5.6. Cấp Lại Mã QR Cho Lô Hàng
*   **Endpoint**: `POST /api/v1/batches/:id/regenerate-qr`
*   **Mô tả**: Cấp lại mã QR mới cho lô hàng (regenerate hình ảnh SVG và PNG base64). Chỉ áp dụng cho Admin hoặc Manufacturer trực tiếp sản xuất ra lô hàng đó.
*   **Quyền truy cập**: Admin, Manufacturer
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "q3000000-0000-0000-0000-000000000001",
      "batchId": "b3000000-0000-0000-0000-000000000001",
      "qrData": "https://mini-logistic.com/public/trace/BCH-20260522-8f9d0c2e",
      "svgData": "<svg>...</svg>",
      "qrImageUrl": "data:image/png;base64,...",
      "generatedBy": "a0000000-0000-0000-0000-000000000002"
    }
    ```

---

### 6. Quản Lý Vận Đơn & Xuất Kho (Shipments)

#### 6.1. Khởi Tạo Vận Đơn Xuất Kho
*   **Endpoint**: `POST /api/v1/shipments`
*   **Mô tả**: Xuất kho lô hàng từ kho nguồn đến kho đích và tạo vận đơn mới.
    *   Sử dụng cơ chế khóa dòng Pessimistic Write Lock (`SELECT FOR UPDATE`) trên bản ghi tồn kho của lô hàng tại kho nguồn để tránh xung đột hoặc làm âm kho khi có các request đồng thời.
    *   Tự động trừ tồn kho nguồn tương ứng với số lượng xuất đi.
    *   Tạo bản ghi vận đơn mới với trạng thái `IN_TRANSIT` và mã tracking định dạng `SHP-YYYYMMDD-{4_random_chars}`.
    *   Cập nhật trạng thái của Batch thành `IN_TRANSIT`.
    *   Ghi sự kiện `SHIPPED` vào lịch sử lô hàng với giá trị `quantity_delta` âm.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor (`@Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "batchId": "b3000000-0000-0000-0000-000000000001", // UUID (Bắt buộc)
      "sourceNodeId": "e3000000-0000-0000-0000-000000000001", // UUID (Optional đối với Admin để chỉ định kho nguồn, Manufacturer/Distributor lấy theo node của mình)
      "destinationNodeId": "e3000000-0000-0000-0000-000000000002", // UUID (Bắt buộc)
      "quantityShipped": 150.000, // Decimal/Numeric (Bắt buộc, > 0)
      "notes": "Chuyển giao hàng tồn kho bổ sung cho cửa hàng bán lẻ", // String (Optional)
      "expectedDeliveryDate": "2026-05-25T17:00:00.000Z" // ISO Date String (Optional)
    }
    ```
*   **Response Thành Công (`201 Created`)**:
    ```json
    {
      "id": "s3000000-0000-0000-0000-000000000001",
      "trackingCode": "SHP-20260523-EF4B",
      "batchId": "b3000000-0000-0000-0000-000000000001",
      "sourceNodeId": "e3000000-0000-0000-0000-000000000001",
      "destinationNodeId": "e3000000-0000-0000-0000-000000000002",
      "quantityShipped": 150,
      "status": "IN_TRANSIT",
      "shippedAt": "2026-05-23T13:45:00.000Z",
      "expectedDeliveryDate": "2026-05-25T17:00:00.000Z",
      "actualDeliveryDate": null,
      "notes": "Chuyển giao hàng tồn kho bổ sung cho cửa hàng bán lẻ",
      "createdBy": "a0000000-0000-0000-0000-000000000002",
      "createdAt": "2026-05-23T13:45:00.000Z",
      "updatedAt": "2026-05-23T13:45:00.000Z",
      "version": 1
    }
    ```

#### 6.2. Xác Nhận Nhận Hàng (Receive Shipment)
*   **Endpoint**: `PATCH /api/v1/shipments/:id/receive`
*   **Mô tả**: Xác nhận đã nhận được hàng từ vận đơn tại node nhận (kho nhận).
    *   Bọc trong một Database Transaction và thực hiện Pessimistic Lock trên bản ghi vận đơn để tránh double-receive.
    *   Kiểm tra xem tài khoản đang gọi API có thuộc `destinationNodeId` của vận đơn này hay không. Nếu không, trả về lỗi `403 Forbidden`.
    *   Cập nhật trạng thái vận đơn thành `RECEIVED` và gán ngày nhận hàng thực tế (`actualDeliveryDate`).
    *   Thực hiện UPSERT tồn kho ở kho nhận: Nếu chưa có tồn kho cho lô hàng này tại kho nhận thì tạo mới (INSERT), nếu đã có sẵn tồn kho thì cộng dồn số lượng thông qua cú pháp `ON CONFLICT (batch_id, node_id) DO UPDATE`.
    *   Cập nhật `currentNodeId` của lô hàng sang kho nhận và trạng thái lô hàng thành `RECEIVED`.
    *   Ghi nhận sự kiện timeline `RECEIVED` với `quantity_delta` dương.
*   **Quyền truy cập**: Admin, Distributor, Retailer (`@Roles(RoleName.ADMIN, RoleName.DISTRIBUTOR, RoleName.RETAILER)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "s3000000-0000-0000-0000-000000000001",
      "trackingCode": "SHP-20260523-EF4B",
      "batchId": "b3000000-0000-0000-0000-000000000001",
      "sourceNodeId": "e3000000-0000-0000-0000-000000000001",
      "destinationNodeId": "e3000000-0000-0000-0000-000000000002",
      "quantityShipped": 150,
      "status": "RECEIVED",
      "shippedAt": "2026-05-23T13:45:00.000Z",
      "expectedDeliveryDate": "2026-05-25T17:00:00.000Z",
      "actualDeliveryDate": "2026-05-23T14:40:00.000Z",
      "notes": "Chuyển giao hàng tồn kho bổ sung cho cửa hàng bán lẻ",
      "createdBy": "a0000000-0000-0000-0000-000000000002",
      "createdAt": "2026-05-23T13:45:00.000Z",
      "updatedAt": "2026-05-23T14:40:00.000Z",
      "version": 2
    }
    ```

#### 6.3. Xem Danh Sách Vận Đơn (Phân Trang & RLS)
*   **Endpoint**: `GET /api/v1/shipments`
*   **Mô tả**: Xem danh sách các vận đơn luân chuyển trong chuỗi (gồm cả hàng đang chuyển đến kho của mình hoặc hàng mình đã xuất đi). Áp dụng Row-level Security:
    *   **Admin**: Thấy toàn bộ vận đơn trong hệ thống.
    *   **Manufacturer/Distributor/Retailer**: Chỉ thấy các vận đơn có kho xuất (`sourceNodeId`) hoặc kho nhận (`destinationNodeId`) trùng với `nodeId` của user.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer (`@Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)`)
*   **Query Parameters**:
    *   `page`: number (Optional, mặc định `1`)
    *   `limit`: number (Optional, mặc định `10`)
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "data": [
        {
          "id": "s3000000-0000-0000-0000-000000000001",
          "trackingCode": "SHP-20260523-EF4B",
          "batchId": "b3000000-0000-0000-0000-000000000001",
          "sourceNodeId": "e3000000-0000-0000-0000-000000000001",
          "destinationNodeId": "e3000000-0000-0000-0000-000000000002",
          "quantityShipped": 150,
          "status": "IN_TRANSIT",
          "shippedAt": "2026-05-23T13:45:00.000Z",
          "expectedDeliveryDate": "2026-05-25T17:00:00.000Z",
          "actualDeliveryDate": null,
          "notes": "Chuyển giao hàng tồn kho bổ sung cho cửa hàng bán lẻ",
          "createdBy": "a0000000-0000-0000-0000-000000000002",
          "createdAt": "2026-05-23T13:45:00.000Z",
          "product": {
            "id": "p0000000-0000-0000-0000-000000000001",
            "name": "Sản phẩm A",
            "sku": "SKU-PROD-A",
            "unit": "Hộp",
            "isActive": true
          },
          "sourceNode": {
            "id": "e3000000-0000-0000-0000-000000000001",
            "name": "Nhà máy Sản xuất A",
            "nodeType": "MANUFACTURER",
            "isActive": true
          },
          "destinationNode": {
            "id": "e3000000-0000-0000-0000-000000000002",
            "name": "Kho Phân Phối B",
            "nodeType": "DISTRIBUTOR",
            "isActive": true
          }
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
    ```

#### 6.4. Xem Chi Tiết Vận Đơn
*   **Endpoint**: `GET /api/v1/shipments/:id`
*   **Mô tả**: Xem thông tin chi tiết một vận đơn cụ thể bao gồm số lượng xuất, số lượng thực nhận, người ký nhận và các sự cố đính kèm. Áp dụng RLS bảo mật tương tự như API danh sách.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer (`@Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)`)
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "s3000000-0000-0000-0000-000000000001",
      "trackingCode": "SHP-20260523-EF4B",
      "batchId": "b3000000-0000-0000-0000-000000000001",
      "sourceNodeId": "e3000000-0000-0000-0000-000000000001",
      "destinationNodeId": "e3000000-0000-0000-0000-000000000002",
      "quantityShipped": 150,
      "status": "RECEIVED",
      "shippedAt": "2026-05-23T13:45:00.000Z",
      "expectedDeliveryDate": "2026-05-25T17:00:00.000Z",
      "actualDeliveryDate": "2026-05-23T14:40:00.000Z",
      "notes": "Chuyển giao hàng tồn kho bổ sung cho cửa hàng bán lẻ",
      "createdBy": "a0000000-0000-0000-0000-000000000002",
      "quantityReceived": 150,
      "receiver": {
        "id": "a0000000-0000-0000-0000-000000000003",
        "email": "receiver@logistic.com",
        "fullName": "Nguyễn Văn Nhận"
      },
      "issues": [],
      "batch": {
        "id": "b3000000-0000-0000-0000-000000000001",
        "batchCode": "BCH-20260522-8f9d0c2e",
        "productId": "p0000000-0000-0000-0000-000000000001",
        "product": {
          "id": "p0000000-0000-0000-0000-000000000001",
          "name": "Sản phẩm A",
          "sku": "SKU-PROD-A",
          "unit": "Hộp",
          "isActive": true
        }
      },
      "sourceNode": {
        "id": "e3000000-0000-0000-0000-000000000001",
        "name": "Nhà máy Sản xuất A",
        "nodeType": "MANUFACTURER",
        "isActive": true
      },
      "destinationNode": {
        "id": "e3000000-0000-0000-0000-000000000002",
        "name": "Kho Phân Phối B",
        "nodeType": "DISTRIBUTOR",
        "isActive": true
      }
    }
    ```

---

### 7. Quản Lý Sự Cố & Thất Lạc (Incidents)

#### 7.1. Tạo Hồ Sơ Báo Cáo Sự Cố
*   **Endpoint**: `POST /api/v1/incidents`
*   **Mô tả**: Admin báo cáo một sự cố xảy ra đối với vận đơn (vận đơn nghi ngờ thất lạc, hư hỏng,...).
    *   Tự động sinh mã sự cố định dạng `INC-YYYYMMDD-{4_random_hex}`.
    *   Tạo bản ghi hồ sơ sự cố `IncidentReportEntity` với trạng thái ban đầu là `OPEN`.
    *   Đóng băng tạm thời lô hàng bằng cách chuyển trạng thái của lô hàng (`BatchEntity.status`) sang `INVESTIGATING`.
    *   Ghi sự kiện `INVESTIGATING` vào timeline của lô hàng.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "shipmentId": "s3000000-0000-0000-0000-000000000001", // UUID (Bắt buộc)
      "incidentType": "MISSING", // Enum/String: MISSING | DAMAGED | FRAUD | OTHER (Bắt buộc)
      "description": "Nghi ngờ thất lạc hàng hóa do xe tải mất tín hiệu định vị quá 12 giờ.", // String (Bắt buộc, tối thiểu 20 ký tự)
      "priority": "HIGH" // Enum/String: LOW | MEDIUM | HIGH | CRITICAL (Optional)
    }
    ```
*   **Response Thành Công (`201 Created`)**:
    ```json
    {
      "id": "i3000000-0000-0000-0000-000000000001",
      "incidentCode": "INC-20260523-abcd",
      "shipmentId": "s3000000-0000-0000-0000-000000000001",
      "batchId": "b3000000-0000-0000-0000-000000000001",
      "incidentType": "MISSING",
      "status": "OPEN",
      "priority": "HIGH",
      "reportedBy": "a0000000-0000-0000-0000-000000000002",
      "assignedTo": null,
      "description": "Nghi ngờ thất lạc hàng hóa do xe tải mất tín hiệu định vị quá 12 giờ.",
      "resolution": null,
      "resolutionType": null,
      "approvedBy": null,
      "evidenceJsonb": null,
      "openedAt": "2026-05-23T14:50:00.000Z",
      "resolvedAt": null,
      "closedAt": null,
      "version": 1
    }
    ```

#### 7.2. Phê Duyệt Xác Nhận Thất Lạc & Rollback Kho (Two-Man Approval)
*   **Endpoint**: `POST /api/v1/incidents/:id/confirm-lost`
*   **Mô tả**: Phê duyệt quyết định xác nhận mất hàng và rollback tồn kho tại node nguồn.
    *   **Quy tắc Phê duyệt kép (Two-Man Rule)**: Bắt buộc người thực hiện phê duyệt (Admin 2) phải khác người báo cáo sự cố ban đầu (Admin 1). Nếu trùng khớp, trả về lỗi `403 Forbidden`.
    *   Bọc trong một Database Transaction và thực hiện Pessimistic Lock trên bản ghi tồn kho để cộng ngược số lượng an toàn.
    *   Hoàn trả lại toàn bộ số lượng hàng bị mất (`quantityShipped` của vận đơn) cộng ngược trở lại vào tồn kho tại node nguồn (`source_node_id`).
    *   Ghi nhận vết lịch sử điều chỉnh tồn kho vào bảng `InventoryAdjustmentEntity` loại `LOSS_ROLLBACK`.
    *   Cập nhật trạng thái cuối cùng của vận đơn thành `LOST`, và trạng thái của lô hàng thành `LOST`.
    *   Cập nhật hồ sơ sự cố thành `CLOSED`, resolutionType = `LOSS_CONFIRMED`.
    *   Ghi sự kiện `LOST` vào lịch sử timeline của lô hàng.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "i3000000-0000-0000-0000-000000000001",
      "incidentCode": "INC-20260523-abcd",
      "shipmentId": "s3000000-0000-0000-0000-000000000001",
      "batchId": "b3000000-0000-0000-0000-000000000001",
      "incidentType": "MISSING",
      "status": "CLOSED",
      "priority": "HIGH",
      "reportedBy": "a0000000-0000-0000-0000-000000000002",
      "assignedTo": null,
      "description": "Nghi ngờ thất lạc hàng hóa do xe tải mất tín hiệu định vị quá 12 giờ.",
      "resolution": "Xác nhận mất hàng và hoàn trả tồn kho kho nguồn",
      "resolutionType": "LOSS_CONFIRMED",
      "approvedBy": "a0000000-0000-0000-0000-000000000003",
      "evidenceJsonb": null,
      "openedAt": "2026-05-23T14:50:00.000Z",
      "resolvedAt": "2026-05-23T14:52:00.000Z",
      "closedAt": "2026-05-23T14:52:00.000Z",
      "version": 2
    }
    ```

#### 7.3. Lấy Danh Sách Toàn Bộ Sự Cố (Phân Trang)
*   **Endpoint**: `GET /api/v1/incidents`
*   **Mô tả**: Xem danh sách toàn bộ hồ sơ sự cố phát sinh trong hệ thống.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Query Parameters**:
    *   `page`: number (Optional, mặc định `1`)
    *   `limit`: number (Optional, mặc định `10`)
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "data": [
        {
          "id": "i3000000-0000-0000-0000-000000000001",
          "incidentCode": "INC-20260523-abcd",
          "shipmentId": "s3000000-0000-0000-0000-000000000001",
          "batchId": "b3000000-0000-0000-0000-000000000001",
          "incidentType": "MISSING",
          "status": "OPEN",
          "priority": "HIGH",
          "reportedBy": "a0000000-0000-0000-0000-000000000002",
          "description": "Nghi ngờ thất lạc hàng hóa...",
          "openedAt": "2026-05-23T14:50:00.000Z",
          "shipment": {
            "id": "s3000000-0000-0000-0000-000000000001",
            "trackingCode": "SHP-20260523-EF4B",
            "quantityShipped": 150
          },
          "batch": {
            "id": "b3000000-0000-0000-0000-000000000001",
            "batchCode": "BCH-20260522-8f9d0c2e",
            "product": {
              "id": "p0000000-0000-0000-0000-000000000001",
              "name": "Sản phẩm A"
            }
          },
          "reporter": {
            "id": "a0000000-0000-0000-0000-000000000002",
            "fullName": "Nhân viên Báo cáo"
          }
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
    ```

#### 7.4. Xác Nhận Tìm Thấy Hàng Hóa (Confirm Found)
*   **Endpoint**: `POST /api/v1/incidents/:id/confirm-found`
*   **Mô tả**: Đóng hồ sơ sự cố trong trường hợp tìm lại được lô hàng thất lạc.
    *   Cập nhật trạng thái sự cố thành `CLOSED`, resolutionType = `FOUND_CONFIRMED`.
    *   Cập nhật trạng thái vận đơn thành `RECEIVED`.
    *   Thực hiện nhập kho và cộng dồn số lượng hàng tại kho nhận đích (`destinationNodeId`).
    *   Cập nhật trạng thái của lô hàng thành `RECEIVED` và định vị tại kho đích.
    *   Ghi nhận sự kiện `RECEIVED` vào lịch sử timeline của lô hàng.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "id": "i3000000-0000-0000-0000-000000000001",
      "incidentCode": "INC-20260523-abcd",
      "shipmentId": "s3000000-0000-0000-0000-000000000001",
      "batchId": "b3000000-0000-0000-0000-000000000001",
      "incidentType": "MISSING",
      "status": "CLOSED",
      "priority": "HIGH",
      "reportedBy": "a0000000-0000-0000-0000-000000000002",
      "resolution": "Tìm thấy hàng hóa thất lạc và tiến hành nhập kho đích",
      "resolutionType": "FOUND_CONFIRMED",
      "approvedBy": "a0000000-0000-0000-0000-000000000003",
      "resolvedAt": "2026-05-23T15:30:00.000Z",
      "closedAt": "2026-05-23T15:30:00.000Z",
      "version": 2
    }
    ```

---

### 8. Quét QR & Truy Xuất Nguồn Gốc (Traceability)

#### 8.1. Truy Xuất Hành Trình Lô Hàng Công Cộng
*   **Endpoint**: `GET /api/v1/public/trace/:batchCode`
*   **Mô tả**: Cho phép người tiêu dùng hoặc các đối tác quét mã QR để xem toàn bộ lịch sử vòng đời và đường đi của lô hàng mà không cần đăng nhập.
    *   Truy vấn thông tin chi tiết của lô hàng (`BatchEntity`) kèm theo sản phẩm, kho gốc, kho hiện tại.
    *   Tự động truy xuất danh sách sự kiện vòng đời (`timeline_events`) sắp xếp theo thời gian tăng dần (`occurredAt ASC`) cùng thông tin GPS của các nút mạng lưới để hiển thị bản đồ hành trình.
    *   **Tối ưu hiệu năng**: Hành động ghi nhật ký quét mã (`ScanLogEntity`) được thực hiện hoàn toàn bất đồng bộ (fire-and-forget) không làm tăng thời gian phản hồi (response time) của API chính.
*   **Quyền truy cập**: Công khai (`@Public()`)
*   **Query Parameters**:
    *   `lat` (Optional): Vĩ độ GPS của vị trí quét mã.
    *   `lng` (Optional): Kinh độ GPS của vị trí quét mã.
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "batch": {
        "id": "b3000000-0000-0000-0000-000000000001",
        "batchCode": "BCH-20260523-xyz",
        "quantity": 1000,
        "status": "RECEIVED",
        "product": {
          "id": "p0000000-0000-0000-0000-000000000001",
          "name": "Vắc-xin Influenza",
          "sku": "VAC-INF-001"
        },
        "originNode": {
          "id": "n0000000-0000-0000-0000-000000000001",
          "name": "Nhà máy Sản xuất A",
          "latitude": 21.0285,
          "longitude": 105.8542
        },
        "currentNode": {
          "id": "n0000000-0000-0000-0000-000000000002",
          "name": "Kho Trung chuyển miền Bắc",
          "latitude": 20.8449,
          "longitude": 106.6881
        }
      },
      "timelineEvents": [
        {
          "id": "e3000000-0000-0000-0000-000000000001",
          "eventType": "CREATED",
          "occurredAt": "2026-05-23T08:00:00.000Z",
          "node": {
            "name": "Nhà máy Sản xuất A",
            "latitude": 21.0285,
            "longitude": 105.8542
          }
        },
        {
          "id": "e3000000-0000-0000-0000-000000000002",
          "eventType": "SHIPPED",
          "occurredAt": "2026-05-23T10:00:00.000Z",
          "node": {
            "name": "Nhà máy Sản xuất A",
            "latitude": 21.0285,
            "longitude": 105.8542
          }
        },
        {
          "id": "e3000000-0000-0000-0000-000000000003",
          "eventType": "RECEIVED",
          "occurredAt": "2026-05-23T14:30:00.000Z",
          "node": {
            "name": "Kho Trung chuyển miền Bắc",
            "latitude": 20.8449,
            "longitude": 106.6881
          }
        }
      ]
    }
    ```

---

### 9. Thống Kê, Báo Cáo & Kiểm Toán (Dashboard & Reports)

#### 9.1. Lấy Dữ Liệu Dashboard Thống Kê (Stats)
*   **Endpoint**: `GET /api/v1/dashboard/stats`
*   **Mô tả**: Kết xuất dữ liệu tổng hợp KPI phục vụ hiển thị biểu đồ và các thẻ đếm số lượng tồn kho, vận đơn đang chạy, cảnh báo sự cố theo phạm vi quyền hạn.
    *   **Admin**: Thấy tổng tồn kho hệ thống, tổng vận đơn đang chạy (IN_TRANSIT, DELAYED) và tổng cảnh báo sự cố mở (OPEN, IN_PROGRESS).
    *   **Manufacturer/Distributor/Retailer**: Dữ liệu trả về tự động filter theo `nodeId` của user.
*   **Quyền truy cập**: Admin, Manufacturer, Distributor, Retailer (`@Roles(RoleName.ADMIN, RoleName.MANUFACTURER, RoleName.DISTRIBUTOR, RoleName.RETAILER)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "totalInventory": 1500,
      "activeShipments": 2,
      "incidents": 1
    }
    ```

#### 9.2. Xem Nhật Ký Kiểm Toán (Audit Logs)
*   **Endpoint**: `GET /api/v1/audit-logs`
*   **Mô tả**: Truy xuất dữ liệu nhật ký hoạt động hệ thống lưu vết snapshot dữ liệu trước và sau thay đổi phục vụ công tác thanh tra chuỗi cung ứng.
*   **Quyền truy cập**: Admin (`@Roles(RoleName.ADMIN)`)
*   **Query Parameters**:
    *   `page`: number (Optional, mặc định `1`)
    *   `limit`: number (Optional, mặc định `10`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    ```
*   **Response Thành Công (`200 OK`)**:
    ```json
    {
      "data": [
        {
          "id": "a1000000-0000-0000-0000-000000000001",
          "actorId": "u1000000-0000-0000-0000-000000000001",
          "action": "CREATE",
          "entityType": "BatchEntity",
          "entityId": "b3000000-0000-0000-0000-000000000001",
          "oldValues": null,
          "newValues": {
            "batchCode": "BCH-20260522-8f9d0c2e",
            "quantity": 1000,
            "status": "CREATED"
          },
          "ipAddress": "127.0.0.1",
          "userAgent": "Mozilla/5.0...",
          "occurredAt": "2026-05-23T08:00:00.000Z",
          "actor": {
            "id": "u1000000-0000-0000-0000-000000000001",
            "fullName": "Nguyễn Văn Admin"
          }
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
    ```

#### 9.3. Xuất Báo Cáo Dữ Liệu (Export Report)
*   **Endpoint**: `POST /api/v1/reports/export`
*   **Mô tả**: Trích xuất và xuất dữ liệu báo cáo ra các định dạng file CSV hoặc luồng stream PDF phục vụ lưu trữ nội bộ.
    *   Hỗ trợ `reportType`: `inventory` | `shipments` | `incidents`.
    *   Hỗ trợ `format`: `csv` | `pdf`.
    *   Áp dụng Row-level Security bảo mật tương tự như API thống kê.
*   **Quyền truy cập**: Admin, Manufacturer (`@Roles(RoleName.ADMIN, RoleName.MANUFACTURER)`)
*   **Request Headers**:
    ```http
    Authorization: Bearer <accessToken>
    Content-Type: application/json
    ```
*   **Request Body**:
    ```json
    {
      "format": "csv",
      "reportType": "inventory"
    }
    ```
*   **Response Thành Công (`201 Created`)**: Trả về file tải xuống với header `Content-Type: text/csv` hoặc `application/pdf`.

---

## 🛡️ Cơ Chế Bảo Mật & Phân Quyền

1.  **JwtAuthGuard**:
    - Được kích hoạt toàn cục (`APP_GUARD`). Bắt buộc tất cả các API phải truyền Header `Authorization: Bearer <JWT>` để xác thực.
    - Cho phép bỏ qua xác thực ở những API được đánh dấu bằng decorator `@Public()` (ví dụ: `POST /api/v1/auth/login`).
2.  **RolesGuard**:
    - Được cấu hình toàn cục. Đọc metadata `@Roles(RoleName...)` ở cấp Controller hoặc Action để so khớp với trường `role` trong JWT token.
    - Hỗ trợ bypass hoàn toàn đối với vai trò `Admin`.
    - **Ranh giới Node (Node isolation)**: Nếu người dùng không phải là `Admin` và có `nodeId` trong JWT, guard sẽ tự động trích xuất các trường xác định Node trong request body, query hoặc params (như `nodeId`, `node_id`, `sourceNodeId`, `source_node_id`, `originNodeId`, `origin_node_id`) và so sánh với `nodeId` của người dùng. Nếu không trùng khớp, hệ thống sẽ trả về lỗi `403 Forbidden`.
