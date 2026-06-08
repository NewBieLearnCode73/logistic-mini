# CHƯƠNG 5. THIẾT KẾ GIAO DIỆN VÀ CÀI ĐẶT (Phần 5.2 & 5.3)

---

## 5.2 Thiết kế giao diện phía quản trị

Toàn bộ giao diện phía quản trị được xây dựng theo phong cách SaaS Dashboard hiện đại, hỗ trợ chế độ sáng (Light mode) và tối (Dark mode). Bố cục tổng thể tuân theo mô hình **Sidebar + Header + Content Area** quen thuộc, tối ưu cho trải nghiệm quản trị nghiệp vụ trên màn hình rộng.

### 5.2.1. Bố cục tổng thể (Layout chung)

Hình 15. Giao diện bố cục tổng thể trang quản trị (Layout)

Giao diện tổng thể được chia thành 3 vùng chính:
- **Sidebar (Thanh điều hướng bên trái):** Cố định bên trái màn hình, chứa logo ứng dụng, danh sách menu điều hướng và thông tin tài khoản đăng nhập. Trên thiết bị di động, Sidebar được ẩn mặc định và mở ra bằng nút hamburger trên Header.
- **Header (Thanh công cụ trên cùng):** Cố định trên đầu trang, chứa nút chuyển đổi ngôn ngữ (Tiếng Việt / English), nút chuyển đổi giao diện sáng/tối (Light/Dark mode), và nút mở menu trên thiết bị di động.
- **Content Area (Vùng nội dung chính):** Vùng hiển thị nội dung của từng trang chức năng tương ứng với mục được chọn trên Sidebar.

---

### 5.2.2. Giao diện thanh điều hướng (Sidebar)

Hình 16. Giao diện thanh điều hướng Sidebar

Thanh điều hướng Sidebar được chia thành các nhóm từ trên xuống dưới:
- **Logo ứng dụng:** Hiển thị tên hệ thống "Mini Logistic" ở đầu thanh.
- **Nhóm Menu chính (Chuỗi cung ứng):**
    - Trang tổng quan (Dashboard): Biểu tượng nhà, dẫn đến trang thống kê KPI tổng hợp.
    - Quản lý Lô hàng (Batches): Biểu tượng hộp, dẫn đến danh sách và quản lý các lô hàng.
    - Quản lý Vận đơn (Shipments): Biểu tượng xe tải, dẫn đến danh sách vận đơn.
    - Quản lý Sản phẩm (Products): Biểu tượng tag, dẫn đến quản lý danh mục sản phẩm.
    - Quét mã QR (Scan): Biểu tượng QR Code, dẫn đến trang quét mã vạch.
- **Nhóm Menu Quản trị (Chỉ hiển thị cho vai trò Admin):**
    - Quản lý Nhân sự (Users): Biểu tượng nhóm người, quản lý tài khoản nhân viên.
    - Quản lý Điểm nút (Nodes): Biểu tượng ghim bản đồ, quản lý các điểm cung ứng.
    - Quản lý Sự cố (Incidents): Biểu tượng cảnh báo, quản lý hồ sơ sự cố.
    - Nhật ký Kiểm toán (Audit Logs): Biểu tượng danh sách, xem nhật ký hệ thống bất biến.
    - Bản đồ Mạng lưới (Map): Biểu tượng bản đồ, hiển thị sơ đồ mạng lưới các node trên bản đồ.
- **Khu vực Tài khoản (Chân Sidebar):**
    - Avatar chữ cái đầu tên người dùng, tên đầy đủ và vai trò hiện tại.
    - Nút **Đổi mật khẩu**: Mở hộp thoại cho phép người dùng đổi mật khẩu (nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới).
    - Nút **Đăng xuất**: Kết thúc phiên làm việc và chuyển hướng về trang đăng nhập.

> **Lưu ý kỹ thuật:** Các mục menu được lọc theo vai trò người dùng đang đăng nhập (RBAC). Nhân viên Manufacturer/Distributor/Retailer sẽ không nhìn thấy nhóm menu Quản trị.

---

### 5.2.3. Giao diện Header (Thanh công cụ)

Hình 17. Giao diện Header trang quản trị

Thanh Header cố định trên cùng bao gồm từ trái sang phải:
- **Nút hamburger menu (☰):** Chỉ hiển thị trên thiết bị di động (responsive), dùng để mở/đóng Sidebar.
- **Nút chuyển đổi ngôn ngữ:** Hiển thị chữ "EN" hoặc "VI", khi nhấn sẽ chuyển đổi toàn bộ giao diện giữa Tiếng Việt và Tiếng Anh (i18n – internationalization).
- **Nút chuyển đổi giao diện sáng/tối:** Biểu tượng mặt trời (☀) hoặc mặt trăng (🌙), khi nhấn sẽ chuyển đổi giữa Light Mode và Dark Mode.

---

### 5.2.4. Giao diện Đăng nhập hệ thống

Hình 18. Giao diện trang Đăng nhập (Light Mode)

Hình 19. Giao diện trang Đăng nhập (Dark Mode)

Trang đăng nhập được thiết kế ở giữa màn hình, bao gồm:
- **Tiêu đề ứng dụng:** Tên hệ thống "Mini Logistic" và mô tả ngắn "Hệ thống quản lý chuỗi cung ứng".
- **Biểu mẫu đăng nhập:**
    - Trường **Email**: Biểu tượng email, nhập email đăng nhập (ví dụ: admin@logistic.com).
    - Trường **Mật khẩu**: Biểu tượng khóa, nhập mật khẩu kèm nút hiển thị/ẩn mật khẩu (biểu tượng mắt).
    - Nút **Đăng nhập**: Nút chính, khi nhấn sẽ xác thực và chuyển hướng vào trang Dashboard.
- **Bảng tài khoản demo nhanh (Quick Access):** Hiển thị 4 nút phím tắt chọn tài khoản mẫu (Admin, Manufacturer, Distributor, Retailer) để phục vụ mục đích demo và kiểm thử nhanh. Mỗi nút có biểu tượng riêng biệt theo vai trò.
- **Nút chuyển ngôn ngữ và chế độ sáng/tối:** Đặt ở góc trên bên phải trang.

---

### 5.2.5. Giao diện trang Tổng quan (Dashboard)

Hình 20. Giao diện trang Tổng quan - Dashboard (phần KPI)

Trang Dashboard là trang chính sau khi đăng nhập, bao gồm các phần:

**a. Phần Lời chào và Vai trò:**
- Hiển thị tiêu đề "Tổng quan" (Dashboard).
- Dòng chào mừng kèm tên đầy đủ người dùng đăng nhập và vai trò hiện tại (ví dụ: "Chào mừng trở lại, System Administrator · Admin").

**b. Phần Thẻ KPI thống kê (3 thẻ):**
- **Tổng tồn kho (Total Inventory):** Hiển thị tổng số lượng hàng tồn kho trong hệ thống.
- **Vận đơn đang hoạt động (Active Shipments):** Hiển thị số lượng vận đơn đang vận chuyển (IN_TRANSIT).
- **Sự cố đang mở (Open Incidents):** Hiển thị số lượng sự cố chưa được giải quyết, đổi màu cảnh báo (đỏ/cam) nếu có sự cố.

Hình 21. Giao diện trang Tổng quan - Dashboard (phần Xuất báo cáo)

**c. Phần Xuất Báo cáo (Reports Export) – Chỉ hiển thị cho Admin và Manufacturer:**
- **Bộ chọn Loại báo cáo:** Dropdown chọn loại dữ liệu xuất: Tồn kho (Inventory), Vận đơn (Shipments), hoặc Sự cố (Incidents).
- **Bộ chọn Khoảng thời gian:** Dropdown chọn: Hôm nay, Tháng này, Quý này, Năm nay, hoặc Khoảng tự chọn (Custom). Khi chọn "Khoảng tự chọn", hiển thị thêm 2 ô chọn ngày Từ ngày (Start Date) và Đến ngày (End Date).
- **Bộ chọn Định dạng file:** Dropdown chọn: Excel (XLSX), CSV, hoặc PDF.
- **Nút Xuất báo cáo:** Nút có biểu tượng tải xuống, khi nhấn sẽ tạo và tải file báo cáo về máy tính.

Hình 22. Giao diện trang Tổng quan - Dashboard (phần Vận đơn và Lô hàng gần đây)

**d. Phần Bảng Vận đơn gần đây (Recent Shipments):**
- Hiển thị bảng 5 vận đơn gần nhất với các cột: Mã tracking, Nút nguồn (From), Nút đích (To), Số lượng, Trạng thái (có badge màu), Ngày gửi.
- Nút "Xem tất cả" dẫn đến trang quản lý Vận đơn đầy đủ.

**e. Phần Bảng Lô hàng gần đây (Recent Batches):**
- Hiển thị bảng 5 lô hàng gần nhất với các cột: Mã lô (Batch Code), Sản phẩm, Số lượng, Trạng thái, Ngày tạo.
- Nút "Xem tất cả" dẫn đến trang quản lý Lô hàng đầy đủ.

---

### 5.2.6. Giao diện trang Quản lý Nhân sự (Users)

Hình 23. Giao diện trang Quản lý Nhân sự

Trang quản lý nhân sự bao gồm:

**a. Thanh tiêu đề và nút thêm mới:**
- Tiêu đề "Quản lý Nhân sự" (Users Management).
- Mô tả phụ: "Quản lý tài khoản nhân viên trong hệ thống."
- Nút **Thêm nhân sự (+):** Nút chính mở hộp thoại tạo tài khoản mới.

**b. Bộ lọc dữ liệu (Filters):**
- Dropdown lọc theo **Vai trò**: Tất cả / Admin / Manufacturer / Distributor / Retailer / Consumer.
- Dropdown lọc theo **Điểm nút**: Tất cả / Danh sách các Node đang hoạt động.
- Dropdown lọc theo **Trạng thái**: Tất cả / Hoạt động / Vô hiệu hóa.

**c. Bảng danh sách nhân sự (DataTable):**
- Các cột bao gồm:
    - **Họ tên:** Tên đầy đủ nhân sự (in đậm).
    - **Email:** Địa chỉ email đăng nhập (font mono).
    - **Vai trò:** Vai trò được gán (Admin, Manufacturer, Distributor, Retailer).
    - **Điểm nút:** Tên Node quản lý được gán.
    - **Trạng thái:** Hiển thị chấm tròn kèm nhãn "Hoạt động" (xanh) hoặc "Vô hiệu hóa" (xám).
    - **Hành động:** Ba nút thao tác:
        - Nút **Chỉnh sửa** (biểu tượng bút chì): Mở hộp thoại sửa thông tin.
        - Nút **Khóa/Mở khóa** (biểu tượng cấm/chấp nhận): Mở hộp thoại xác nhận vô hiệu hóa hoặc kích hoạt tài khoản.
        - Nút **Cấp lại mật khẩu** (biểu tượng chìa khóa): Mở hộp thoại xác nhận cấp lại mật khẩu mới. Nút bị vô hiệu hóa (disabled) nếu tài khoản có vai trò Admin.
- Phân trang ở dưới bảng hiển thị tổng số bản ghi và nút chuyển trang.

Hình 24. Hộp thoại Tạo tài khoản nhân sự mới

**d. Hộp thoại Tạo/Sửa nhân sự (Form Modal):**
- Tiêu đề: "Tạo nhân sự mới" (khi thêm) hoặc "Cập nhật nhân sự" (khi sửa).
- Các trường nhập liệu:
    - **Email (*):** Trường nhập email, bị khóa (disabled) khi chỉnh sửa.
    - **Họ tên (*):** Trường nhập tên đầy đủ.
    - **Vai trò (*):** Dropdown chọn vai trò (Admin, Manufacturer, Distributor, Retailer, Consumer).
    - **Điểm nút (*):** Dropdown chọn Node quản lý (chỉ hiển thị khi vai trò không phải Admin).
- Nút **Hủy** và **Lưu**: Thực hiện lưu hoặc đóng hộp thoại.
- Khi tạo thành công, hiển thị hộp thoại chứa mật khẩu tạm thời được sinh tự động kèm nút **Sao chép** để copy vào clipboard.

Hình 25. Hộp thoại hiển thị Mật khẩu tạm thời

**e. Hộp thoại Mật khẩu tạm thời:**
- Hiển thị mật khẩu tạm thời dạng font mono in đậm.
- Nút sao chép (biểu tượng clipboard) để sao chép mật khẩu vào bộ nhớ tạm.
- Nút **Đóng** để tắt hộp thoại.

---

### 5.2.7. Giao diện trang Quản lý Điểm nút Mạng lưới (Nodes)

Hình 26. Giao diện trang Quản lý Điểm nút Mạng lưới

Trang quản lý điểm nút bao gồm:

**a. Thanh tiêu đề và nút thêm mới:**
- Tiêu đề "Quản lý Điểm nút" (Nodes Management).
- Nút **Thêm điểm nút (+):** Mở hộp thoại tạo Node mới.

**b. Bảng danh sách Node (DataTable):**
- Các cột: Tên Node, Loại Node (MANUFACTURER / DISTRIBUTOR / RETAILER / WAREHOUSE), Địa chỉ, Tọa độ GPS (Kinh độ, Vĩ độ), Trạng thái (Hoạt động/Ngừng), Phiên bản (Version - phục vụ Optimistic Locking), Hành động.
- Cột Hành động gồm: Nút **Xem chi tiết**, **Chỉnh sửa**, **Xóa mềm**.
- Phân trang ở dưới bảng.

Hình 27. Hộp thoại Tạo/Sửa Điểm nút

**c. Hộp thoại Tạo/Sửa Node (Form Modal):**
- Các trường: Tên Node (*), Loại Node (*), Địa chỉ, Vĩ độ (Latitude) (*), Kinh độ (Longitude) (*).
- Trường Version: Hiển thị khi chỉnh sửa, dùng cho cơ chế Optimistic Locking.
- Nút **Hủy** và **Lưu**.

Hình 28. Giao diện Chi tiết Điểm nút (Node Detail)

**d. Trang Chi tiết Node:**
- Hiển thị thông tin chi tiết Node: Tên, loại, địa chỉ, tọa độ GPS, trạng thái, phiên bản (version).
- Bảng Tồn kho tại Node: Hiển thị danh sách các lô hàng đang lưu trữ tại Node đó kèm số lượng khả dụng.

---

### 5.2.8. Giao diện trang Quản lý Sản phẩm (Products)

Hình 29. Giao diện trang Quản lý Sản phẩm

Trang quản lý sản phẩm bao gồm:

**a. Thanh tiêu đề và nút thêm mới:**
- Tiêu đề "Quản lý Sản phẩm" (Products Management).
- Nút **Thêm sản phẩm (+):** Mở hộp thoại tạo sản phẩm mới.

**b. Bộ lọc và tìm kiếm:**
- Ô tìm kiếm: Tìm theo tên hoặc mã SKU sản phẩm.
- Dropdown lọc theo Danh mục (Category).
- Dropdown lọc theo Trạng thái hoạt động.

**c. Bảng danh sách Sản phẩm (DataTable):**
- Các cột: Tên sản phẩm, Mã SKU (font mono), Đơn vị tính, Danh mục, Trạng thái hoạt động, Hành động (Sửa, Xóa).
- Phân trang ở dưới bảng.

Hình 30. Hộp thoại Tạo/Sửa Sản phẩm

**d. Hộp thoại Tạo/Sửa sản phẩm (Form Modal):**
- Các trường: Tên sản phẩm (*), Mã SKU (*), Đơn vị tính (*), Mô tả, Danh mục.
- Nút **Hủy** và **Lưu**.

---

### 5.2.9. Giao diện trang Quản lý Lô hàng (Batches)

Hình 31. Giao diện trang Quản lý Lô hàng

Trang quản lý lô hàng bao gồm:

**a. Thanh tiêu đề và nút tạo lô hàng:**
- Tiêu đề "Quản lý Lô hàng" (Batches Management).
- Nút **Tạo lô hàng (+):** Mở hộp thoại tạo lô hàng mới (chỉ hiển thị cho vai trò Manufacturer và Admin).

**b. Bảng danh sách Lô hàng (DataTable):**
- Các cột:
    - **Mã lô (Batch Code):** Mã định danh duy nhất dạng BCH-YYYYMMDD-xxxxxxxx (font mono).
    - **Sản phẩm:** Tên sản phẩm liên kết.
    - **Số lượng:** Số lượng lô hàng kèm đơn vị tính.
    - **Nơi sản xuất (Origin):** Tên Node nhà máy sản xuất.
    - **Vị trí hiện tại (Current):** Tên Node hiện đang giữ lô hàng.
    - **Trạng thái (Status):** Badge màu hiển thị trạng thái vòng đời (CREATED - xám, IN_TRANSIT - xanh dương, RECEIVED - xanh lá, SOLD - tím, DELAYED - vàng cam, INVESTIGATING - cam, LOST - đỏ).
    - **Ngày sản xuất / Hạn sử dụng:** Ngày sản xuất và hạn sử dụng.
    - **Hành động:** Nút xem chi tiết.
- Phân trang ở dưới bảng.

> **Lưu ý:** Dữ liệu hiển thị được lọc theo cơ chế **Row Level Security (RLS)**. Manufacturer chỉ thấy lô hàng sản xuất tại nhà máy mình, Retailer chỉ thấy lô hàng đã từng nhập về cửa hàng mình.

Hình 32. Hộp thoại Tạo Lô hàng mới

**c. Hộp thoại Tạo Lô hàng (Form Modal):**
- Các trường: Sản phẩm (*), Số lượng (*), Đơn vị tính (*), Ngày sản xuất (*), Hạn sử dụng (*).
- Nút **Hủy** và **Tạo**.

Hình 33. Giao diện Chi tiết Lô hàng (Batch Detail)

**d. Trang Chi tiết Lô hàng:**
- **Phần thông tin tổng quan:** Mã lô, sản phẩm, số lượng, nơi sản xuất, vị trí hiện tại, trạng thái, ngày sản xuất, hạn sử dụng, người tạo.
- **Phần Mã QR:** Hiển thị ảnh mã QR code (SVG/PNG) được sinh tự động khi tạo lô hàng. Nút **Tái tạo QR** để sinh lại mã QR mới.
- **Phần Timeline (Trục thời gian):** Hiển thị danh sách các sự kiện vòng đời theo thứ tự thời gian (CREATED → SHIPPED → RECEIVED → SOLD...) với thông tin: Loại sự kiện, Thời điểm xảy ra, Nơi xảy ra, Người thực hiện, Ghi chú.

---

### 5.2.10. Giao diện trang Quản lý Vận đơn (Shipments)

Hình 34. Giao diện trang Quản lý Vận đơn

Trang quản lý vận đơn bao gồm:

**a. Thanh tiêu đề và nút tạo vận đơn:**
- Tiêu đề "Quản lý Vận đơn" (Shipments Management).
- Nút **Tạo vận đơn (+):** Mở hộp thoại tạo vận đơn xuất kho mới.

**b. Bảng danh sách Vận đơn (DataTable):**
- Các cột: Mã tracking (SHP-YYYYMMDD-xxxx), Lô hàng (Batch Code), Nút nguồn (From Node), Nút đích (To Node), Số lượng gửi, Số lượng nhận (nếu có), Trạng thái (IN_TRANSIT / RECEIVED / DELAYED / LOST), Ngày gửi, Ngày nhận, Hành động (Xem chi tiết, Ký nhận).
- Nút **Ký nhận (Receive)** chỉ hiển thị cho tài khoản thuộc Node đích của vận đơn đang ở trạng thái IN_TRANSIT.
- Phân trang ở dưới bảng.

Hình 35. Hộp thoại Tạo Vận đơn Xuất kho

**c. Hộp thoại Tạo Vận đơn (Form Modal):**
- Các trường: Lô hàng (*), Node đích (*), Số lượng xuất (*), Ghi chú.
- Nút **Hủy** và **Xuất kho**.

Hình 36. Giao diện Chi tiết Vận đơn (Shipment Detail)

**d. Trang Chi tiết Vận đơn:**
- Thông tin: Mã tracking, Lô hàng, Node nguồn, Node đích, Số lượng gửi/nhận, Trạng thái, Người gửi, Người nhận, Ngày gửi/nhận.
- Nút **Ký nhận hàng** (nếu vận đơn đang IN_TRANSIT và người dùng thuộc Node đích).

---

### 5.2.11. Giao diện trang Quản lý Sự cố (Incidents)

Hình 37. Giao diện trang Quản lý Sự cố

Trang quản lý sự cố bao gồm:

**a. Thanh tiêu đề và nút lập sự cố:**
- Tiêu đề "Quản lý Sự cố" (Incidents Management).
- Nút **Lập sự cố (+):** Mở hộp thoại tạo hồ sơ sự cố mới.

**b. Bảng danh sách Sự cố (DataTable):**
- Các cột: Mã sự cố (INC-YYYYMMDD-xxxx), Lô hàng, Vận đơn, Loại sự cố (OVERDUE / MISSING / DAMAGED / FRAUD / OTHER), Mức ưu tiên (LOW / MEDIUM / HIGH / CRITICAL), Trạng thái (OPEN / IN_PROGRESS / RESOLVED / CLOSED), Người báo cáo, Ngày mở, Hành động.
- Cột Hành động:
    - Nút **Xác nhận tìm thấy (Confirm Found):** Đóng sự cố, nhập hàng về kho đích.
    - Nút **Xác nhận thất lạc (Confirm Lost):** Áp dụng cơ chế Two-Man Rule. Nếu người bấm là người lập hồ sơ thì hệ thống chặn lại.

Hình 38. Hộp thoại Lập sự cố mới

**c. Hộp thoại Lập sự cố (Form Modal):**
- Các trường: Vận đơn liên quan (*), Loại sự cố (*), Mức ưu tiên (*), Mô tả chi tiết (*).
- Nút **Hủy** và **Lập sự cố**.

---

### 5.2.12. Giao diện trang Nhật ký Kiểm toán (Audit Logs)

Hình 39. Giao diện trang Nhật ký Kiểm toán

Trang nhật ký kiểm toán hiển thị toàn bộ lịch sử thao tác của người dùng trên hệ thống (Immutable – chỉ đọc, không cho phép chỉnh sửa hay xóa):

**a. Bảng Audit Logs:**
- Các cột:
    - **Người thực hiện (Actor):** Tên nhân sự thực hiện hành động.
    - **Hành động (Action):** Loại hành động (CREATE, UPDATE, DELETE, LOGIN, AUTO_DELAY...).
    - **Đối tượng (Entity Type):** Tên bảng/thực thể bị tác động (users, batches, shipments, nodes...).
    - **ID đối tượng (Entity ID):** UUID của bản ghi bị tác động.
    - **Thời gian:** Thời điểm thực hiện hành động.
    - **Địa chỉ IP:** IP của người thực hiện.
    - **Hành động:** Nút xem chi tiết.
- Khi bấm xem chi tiết: Hiển thị 2 khối dữ liệu JSON:
    - **Giá trị cũ (Old Values):** Snapshot dữ liệu trước khi thay đổi.
    - **Giá trị mới (New Values):** Snapshot dữ liệu sau khi thay đổi.

---

### 5.2.13. Giao diện trang Bản đồ Mạng lưới (Map)

Hình 40. Giao diện trang Bản đồ Mạng lưới

Trang bản đồ hiển thị sơ đồ trực quan toàn bộ mạng lưới cung ứng trên bản đồ tương tác (Leaflet/OpenStreetMap):
- **Các Marker (Điểm ghim):** Mỗi Node trong hệ thống được đánh dấu trên bản đồ bằng marker có biểu tượng và màu sắc khác nhau theo loại (Manufacturer - xanh dương, Distributor - cam, Retailer - tím, Warehouse - xám).
- **Popup thông tin:** Khi nhấn vào marker, hiện popup chứa tên Node, loại, địa chỉ, tọa độ GPS và tổng tồn kho hiện tại.
- **Bản đồ tương tác:** Hỗ trợ kéo thả, zoom, và chuyển đổi giữa các lớp bản đồ (Street / Satellite).

---

## 5.3 Thiết kế giao diện phía người dùng cuối

Giao diện phía người dùng cuối (Consumer) được thiết kế theo phong cách tối giản, tập trung vào trải nghiệm trên thiết bị di động (Mobile-first). Người dùng cuối **không cần đăng nhập** để truy cập các trang truy xuất nguồn gốc.

### 5.3.1. Giao diện trang Quét mã QR (Scan Page)

Hình 41. Giao diện trang Quét mã QR (Camera chưa kích hoạt)

Hình 42. Giao diện trang Quét mã QR (Camera đang quét)

Trang quét mã QR bao gồm:

**a. Tiêu đề:**
- "Quét mã QR sản phẩm" và mô tả phụ hướng dẫn người dùng quét mã hoặc nhập mã thủ công.

**b. Vùng Camera Scanner:**
- Khi camera chưa kích hoạt: Hiển thị biểu tượng camera lớn, dòng chữ "Camera chưa kích hoạt" và nút **Mở Camera** (màu xanh chủ đạo).
- Khi camera đang quét: Hiển thị luồng video từ camera thiết bị, vùng quét hình vuông ở giữa, và **tia laser xanh** nhấp nháy (animation) để tạo hiệu ứng quét chuyên nghiệp. Nút **Dừng quét** (màu đỏ) ở dưới cùng để tắt camera.
- Khi nhận diện được mã QR: Hệ thống tự động trích xuất mã lô hàng (Batch Code) từ URL trong mã QR và chuyển hướng sang trang Truy xuất.

**c. Phần Nhập mã thủ công:**
- Trường nhập liệu để nhập trực tiếp mã lô hàng (Batch Code).
- Nút **Tra cứu** để thực hiện tra cứu thủ công.

**d. Phần Sandbox Developer Simulator (Chỉ hiển thị khi đã đăng nhập):**
- Bảng viền đứt nét (dashed border) màu xanh dương nhạt.
- Tiêu đề "Developer Sandbox Simulator".
- Danh sách các lô hàng thực tế đang có trong hệ thống, cho phép bấm trực tiếp để mô phỏng quét mã nhanh trong quá trình phát triển và kiểm thử.
- Mỗi mục hiển thị: Mã lô hàng (font mono), Tên sản phẩm, Số lượng và Đơn vị tính.

**e. Ghi chú bảo mật:**
- Dòng chữ nhỏ ở cuối trang: "Hệ thống truy xuất nguồn gốc được bảo mật và xác thực chuỗi" kèm biểu tượng khiên bảo mật (Shield).

---

### 5.3.2. Giao diện trang Truy xuất nguồn gốc (Trace Page)

Hình 43. Giao diện trang Truy xuất nguồn gốc - Phần Thông tin lô hàng

Trang truy xuất nguồn gốc là trang công khai chính, được thiết kế để người tiêu dùng xem toàn bộ hành trình sản phẩm. Bố cục bao gồm:

**a. Nút Quay lại:**
- Nút mũi tên trái "Quay lại trang quét" để quay về trang Scan.

**b. Phần Thông tin Lô hàng (Batch Info Card):**
- **Tiêu đề lô hàng:** Mã lô hàng dạng BCH-YYYYMMDD-xxxxxxxx hiển thị lớn.
- **Badge trạng thái:** Hiển thị trạng thái hiện tại của lô hàng (CREATED / IN_TRANSIT / RECEIVED / SOLD / DELAYED / LOST) với badge màu tương ứng.
- **Lưới thông tin chi tiết (Information Grid):** Chia làm 2 cột, mỗi ô gồm biểu tượng, nhãn và giá trị:
    - Sản phẩm (tên sản phẩm)
    - Số lượng (kèm đơn vị tính)
    - Nơi sản xuất (Origin – tên Node nhà máy)
    - Vị trí hiện tại (Current Location – tên Node hiện tại)
    - Ngày sản xuất
    - Hạn sử dụng
    - Người tạo lô hàng (tên nhân viên – chỉ hiển thị tên, không hiển thị email)

> **Lưu ý bảo mật:** Tuân thủ nguyên tắc Data Minimization – chỉ hiển thị tên rút gọn, không hiển thị UUID, email hay bất kỳ định danh kỹ thuật nào.

Hình 44. Giao diện trang Truy xuất nguồn gốc - Phần Trục thời gian (Timeline)

**c. Phần Trục thời gian (Timeline Events):**
- Tiêu đề "Hành trình lô hàng" (Product Journey).
- Hiển thị danh sách các sự kiện theo trình tự thời gian từ trên xuống, mỗi sự kiện bao gồm:
    - **Biểu tượng sự kiện:** Icon tương ứng với loại sự kiện (nhà máy cho CREATED, xe tải cho SHIPPED, dấu tích cho RECEIVED, giỏ hàng cho SOLD, đồng hồ cho DELAYED, cảnh báo cho LOST...).
    - **Tiêu đề sự kiện:** Ví dụ: "Sản xuất tại nhà máy", "Đang vận chuyển", "Đã nhận tại kho", "Bán lẻ".
    - **Thời gian:** Thời điểm xảy ra sự kiện (occurredAt) định dạng dd/mm/yyyy hh:mm.
    - **Địa điểm:** Tên Node nơi xảy ra sự kiện.
    - **Người thực hiện:** Tên nhân viên thực hiện thao tác.
    - **Ghi chú:** Nội dung ghi chú bổ sung (nếu có).
- Mỗi sự kiện có **viền màu** và **nền** khác nhau theo loại: Xám (CREATED), Xanh dương (SHIPPED), Xanh lá (RECEIVED), Tím (SOLD), Vàng cam (DELAYED), Cam (INVESTIGATING), Đỏ (LOST).
- Giữa các sự kiện có **đường kẻ dọc** (vertical line) kết nối tạo thành trục thời gian trực quan.

Hình 45. Giao diện trang Truy xuất nguồn gốc - Phần Bản đồ hành trình GPS

**d. Phần Bản đồ hành trình (Route Map):**
- Tiêu đề "Bản đồ hành trình" (Route Map).
- Bản đồ tương tác (Leaflet/OpenStreetMap) hiển thị:
    - **Các Marker điểm nút:** Mỗi Node mà lô hàng đã đi qua được đánh dấu trên bản đồ với marker riêng biệt.
    - **Đường đi tuyến đường:** Các điểm nút được nối với nhau bằng đường tuyến tính (Polyline) hoặc tuyến đường thực tế (OSRM routing) hiển thị con đường di chuyển của lô hàng từ nhà máy sản xuất qua các trạm trung chuyển đến điểm bán lẻ cuối cùng.
    - **Popup thông tin:** Khi nhấn vào marker, hiện popup chứa tên Node, loại Node, và địa chỉ.
- Bản đồ tự động điều chỉnh khung nhìn (fitBounds) để hiển thị toàn bộ tuyến đường vừa khít trong vùng nhìn.

---

### 5.3.3. Giao diện đổi mật khẩu (Change Password Modal)

Hình 46. Giao diện hộp thoại Đổi mật khẩu

Hộp thoại đổi mật khẩu được mở từ nút "Đổi mật khẩu" trên Sidebar, bao gồm:
- Trường **Mật khẩu cũ (*)**
- Trường **Mật khẩu mới (*)**
- Trường **Xác nhận mật khẩu mới (*)**
- Nút **Hủy** và **Lưu**

> Hệ thống kiểm tra: Mật khẩu mới phải khớp với xác nhận. Mật khẩu cũ phải đúng với mật khẩu hiện tại trong cơ sở dữ liệu.

---

### 5.3.4. Giao diện Responsive trên thiết bị di động

Hình 47. Giao diện Responsive trên thiết bị di động (Sidebar mở)

Hình 48. Giao diện Responsive trên thiết bị di động (Trang Dashboard)

Toàn bộ giao diện hệ thống được thiết kế đáp ứng (Responsive Design):
- **Trên thiết bị di động (< 1024px):** Sidebar được ẩn mặc định, mở ra bằng nút hamburger (☰) trên Header. Các bảng dữ liệu tự động cuộn ngang (horizontal scroll). Các lưới thẻ KPI chuyển từ 3 cột thành 1 cột.
- **Trên thiết bị máy tính bàn (≥ 1024px):** Sidebar cố định bên trái, nội dung chính chiếm toàn bộ không gian còn lại.

---

## DANH SÁCH HÌNH ẢNH CẦN CHỤP (CHECKLIST)

| STT | Mã Hình | Mô Tả | Ghi Chú |
|-----|---------|--------|---------|
| 1 | Hình 15 | Bố cục tổng thể trang quản trị (Layout) | Chụp toàn màn hình gồm Sidebar + Header + Content |
| 2 | Hình 16 | Thanh điều hướng Sidebar | Chụp riêng Sidebar từ logo đến nút đăng xuất |
| 3 | Hình 17 | Header trang quản trị | Chụp riêng thanh Header |
| 4 | Hình 18 | Trang Đăng nhập (Light Mode) | Chụp toàn bộ trang Login ở chế độ sáng |
| 5 | Hình 19 | Trang Đăng nhập (Dark Mode) | Chụp toàn bộ trang Login ở chế độ tối |
| 6 | Hình 20 | Dashboard - Phần KPI | Chụp 3 thẻ KPI (Tồn kho, Vận đơn, Sự cố) |
| 7 | Hình 21 | Dashboard - Phần Xuất báo cáo | Chụp widget Reports Export |
| 8 | Hình 22 | Dashboard - Bảng Vận đơn và Lô hàng gần đây | Chụp 2 bảng Recent Shipments + Recent Batches |
| 9 | Hình 23 | Trang Quản lý Nhân sự | Chụp toàn bộ trang Users (filters + bảng) |
| 10 | Hình 24 | Hộp thoại Tạo tài khoản nhân sự | Chụp Form Modal tạo User |
| 11 | Hình 25 | Hộp thoại Mật khẩu tạm thời | Chụp Modal hiện temporary password |
| 12 | Hình 26 | Trang Quản lý Điểm nút | Chụp toàn bộ trang Nodes |
| 13 | Hình 27 | Hộp thoại Tạo/Sửa Điểm nút | Chụp Form Modal Node |
| 14 | Hình 28 | Chi tiết Điểm nút | Chụp trang Node Detail |
| 15 | Hình 29 | Trang Quản lý Sản phẩm | Chụp toàn bộ trang Products |
| 16 | Hình 30 | Hộp thoại Tạo/Sửa Sản phẩm | Chụp Form Modal Product |
| 17 | Hình 31 | Trang Quản lý Lô hàng | Chụp toàn bộ trang Batches |
| 18 | Hình 32 | Hộp thoại Tạo Lô hàng | Chụp Form Modal tạo Batch |
| 19 | Hình 33 | Chi tiết Lô hàng (kèm QR + Timeline) | Chụp trang Batch Detail |
| 20 | Hình 34 | Trang Quản lý Vận đơn | Chụp toàn bộ trang Shipments |
| 21 | Hình 35 | Hộp thoại Tạo Vận đơn | Chụp Form Modal tạo Shipment |
| 22 | Hình 36 | Chi tiết Vận đơn | Chụp trang Shipment Detail |
| 23 | Hình 37 | Trang Quản lý Sự cố | Chụp toàn bộ trang Incidents |
| 24 | Hình 38 | Hộp thoại Lập sự cố | Chụp Form Modal tạo Incident |
| 25 | Hình 39 | Trang Nhật ký Kiểm toán | Chụp trang Audit Logs |
| 26 | Hình 40 | Trang Bản đồ Mạng lưới | Chụp trang Map với markers |
| 27 | Hình 41 | Trang Quét QR (camera chưa bật) | Chụp trang Scan khi chưa mở cam |
| 28 | Hình 42 | Trang Quét QR (camera đang quét) | Chụp trang Scan khi cam đang hoạt động |
| 29 | Hình 43 | Truy xuất nguồn gốc - Thông tin lô hàng | Chụp phần Batch Info trên Trace Page |
| 30 | Hình 44 | Truy xuất nguồn gốc - Trục thời gian | Chụp phần Timeline Events trên Trace Page |
| 31 | Hình 45 | Truy xuất nguồn gốc - Bản đồ hành trình | Chụp phần Route Map trên Trace Page |
| 32 | Hình 46 | Hộp thoại Đổi mật khẩu | Chụp Change Password Modal |
| 33 | Hình 47 | Responsive - Sidebar di động | Chụp giao diện mobile khi mở Sidebar |
| 34 | Hình 48 | Responsive - Dashboard di động | Chụp trang Dashboard trên mobile |
