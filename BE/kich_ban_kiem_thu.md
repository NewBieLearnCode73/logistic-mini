# TÀI LIỆU KỊCH BẢN KIỂM THỨ HỆ THỐNG (TEST SCRIPT SPECIFICATION)

**Dự án:** Hệ thống Quản lý Chuỗi cung ứng Mini (TraceFlow)
**Đối tượng kiểm thử:** Hệ thống phân hệ Backend (NestJS + TypeORM) và Frontend (ReactJS)

---

# PHẦN 1: KIỂM THỬ CHỨC NĂNG CỐT LÕI (CORE FUNCTIONAL TESTING)

## Kịch bản TC-01: Khởi tạo Lô hàng & Sinh mã QR định danh (Happy Path)

- **Mã kiểm thử:** TC-FN-01
- **Tác nhân thực hiện (Actor):** Nhà sản xuất (Manufacturer)
- **Điều kiện tiên quyết (Pre-conditions):** Tài khoản Manufacturer đã đăng nhập thành công, nút (Node) nhà máy đang hoạt động, danh mục sản phẩm (SKU) đã tồn tại trên DB.
- **Dữ liệu đầu vào (Test Input):** `product_id` (UUID), `quantity` = 1000, `production_date` = Current Date, `expiry_date` = Current Date + 6 months.

| Bước thực hiện (Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- |
| **1.** Truy cập màn hình "Quản lý lô hàng", bấm nút "Tạo lô hàng mới". | Hiển thị form nhập liệu với đầy đủ trường thông tin chuẩn hóa. | [ ] Pass / [ ] Fail |
| **2.** Điền đầy đủ dữ liệu hợp lệ (Dữ liệu đầu vào) và bấm "Xác nhận tạo". | - Backend phản hồi mã `201 Created` kèm payload chứa `batch_id` (UUID). <br> - Giao dịch database thành công: Ghi nhận đồng thời vào các bảng `batches`, `inventory` (số dư tăng lên 1000 tại node nguồn), và `timeline_events` (trạng thái `CREATED`). | [ ] Pass / [ ] Fail |
| **3.** Quan sát giao diện danh sách lô hàng sau khi chuyển hướng tự động. | - Hệ thống hiển thị lô hàng mới ở vị trí đầu tiên với trạng thái `CREATED`. <br> - Cột mã QR hiển thị ảnh QR code động (sinh từ chuỗi payload chứa URL truy vết công khai). | [ ] Pass / [ ] Fail |

---

## Kịch bản TC-02: Xuất kho - Tạo vận đơn điều chuyển liên nút

- **Mã kiểm thử:** TC-FN-02
- **Tác nhân thực hiện (Actor):** Nhân viên kho nguồn (Manufacturer / Distributor)
- **Điều kiện tiên quyết:** Lô hàng đang ở trạng thái `CREATED` hoặc `RECEIVED` tại kho nguồn; Số lượng tồn kho thực tế của lô hàng này tại nút lớn hơn hoặc bằng số lượng xuất.
- **Dữ liệu đầu vào:** `batch_id` (UUID), `destination_node_id` (UUID), `quantity_to_ship` = 500.

| Bước thực hiện (Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- |
| **1.** Tại giao diện quản lý tồn kho, chọn lô hàng, bấm "Xuất kho / Điều chuyển". | Hệ thống mở popup yêu cầu chọn Nút đích (Destination Node) và nhập số lượng xuất. | [ ] Pass / [ ] Fail |
| **2.** Chọn Nút đích hợp lệ từ dropdown, nhập số lượng 500, bấm "Xác nhận xuất". | - Backend thực hiện Database Transaction: <br> + Kiểm tra và trừ số dư bảng `inventory` kho nguồn đi 500. <br> + Thêm bản ghi mới vào bảng `shipments` với trạng thái `IN_TRANSIT`. <br> + Thêm sự kiện vào `timeline_events`. <br> - Màn hình hiển thị thông báo "Xuất kho thành công". | [ ] Pass / [ ] Fail |
| **3.** Nhập số lượng vượt quá tồn kho hiện tại (1500/1000) và bấm "Xác nhận xuất". | - Backend chặn lại bằng lỗi `400 Bad Request`. <br> - Trả về thông báo lỗi trực quan: "Số lượng xuất kho vượt quá số lượng hiện có trong kho". Không có dữ liệu nào bị thay đổi trong database. | [ ] Pass / [ ] Fail |

---

## Kịch bản TC-03: Quét mã QR ký nhận - Tiếp nhận lô hàng tại nút đích (UPSERT Logic)

- **Mã kiểm thử:** TC-FN-03
- **Tác nhân thực hiện (Actor):** Nhân viên kho đích (Distributor / Retailer)
- **Điều kiện tiên quyết:** Vận đơn của lô hàng đang ở trạng thái `IN_TRANSIT` và nút đích được chỉ định chính là nút của nhân viên đang đăng nhập (đảm bảo Row Level Security).
- **Dữ liệu đầu vào:** Quét luồng dữ liệu QR của lô hàng đang di chuyển.

| Bước thực hiện (Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- |
| **1.** Nhân viên nút đích đăng nhập ứng dụng trên di động, chọn "Quét mã nhận hàng", cấp quyền Camera và đưa mã QR của lô hàng vào khung quét. | Thư viện `html5-qrcode` nhận diện chuỗi payload, gọi API cập nhật trạng thái tiếp nhận. | [ ] Pass / [ ] Fail |
| **2.** Hệ thống thực thi giao dịch nhận hàng tại Backend. | - Trạng thái vận đơn trong bảng `shipments` chuyển sang `RECEIVED`. <br> - Thực thi cú pháp `UPSERT` an toàn tại database: Tăng số lượng tồn kho tại kho đích (nếu sản phẩm này chưa từng có ở kho đích, thực hiện lệnh `INSERT`, nếu đã có thì cộng dồn `UPDATE`). <br> - Ghi nhận sự kiện `RECEIVED` vào `timeline_events`. | [ ] Pass / [ ] Fail |
| **3.** Nhân viên thuộc một Node khác (không phải nút đích của vận đơn này) cố tình dùng mã QR này để quét nhận hàng. | Hệ thống chặn quyền bằng `RolesGuard` hoặc Logic Validation nội bộ, trả về mã lỗi `403 Forbidden`: "Bạn không có quyền tiếp nhận vận đơn này". | [ ] Pass / [ ] Fail |

---

# PHẦN 2: KIỂM THỬ LUỒNG NGOẠI LỆ & KHẢ NĂNG CHỊU LỖI ("ANTIGRAVITY" TESTING)

## Kịch bản TC-04: Hệ thống Cron Job tự động phát hiện vận đơn trễ hạn (TTL)

- **Mã kiểm thử:** TC-EX-04
- **Tác nhân thực hiện (Actor):** Tiến trình ngầm hệ thống (System Cron Job)
- **Điều kiện tiên quyết:** Tồn tại ít nhất 1 bản ghi vận đơn (`shipments`) có trạng thái `IN_TRANSIT` và thời gian xuất kho (`shipped_at`) đã vượt quá 48 giờ tính đến thời điểm hiện tại nhưng chưa được nút đích bấm nhận.
- **Dữ liệu đầu vào:** Thay đổi thủ công trường `shipped_at` của một vận đơn trong DB lùi lại 50 giờ trước để phục vụ test nghiệm thu.

| Bước thực hiện (Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- |
| **1.** Tiến trình ngầm (Cron Job) được kích hoạt theo chu kỳ (mỗi 1 giờ quét 1 lần). | Tiến trình tự động thực hiện truy vấn quét các vận đơn thỏa mãn điều kiện trễ hạn (Thời gian hiện tại - `shipped_at` > 48 giờ). | [ ] Pass / [ ] Fail |
| **2.** Tiến trình xử lý dữ liệu tự động tại Backend. | - Hệ thống tự động cập nhật trạng thái vận đơn sang `DELAYED`. <br> - Bắn log cảnh báo vào hệ thống, ghi nhận một sự kiện loại ngoại lệ `DELAYED` vào bảng `timeline_events`. | [ ] Pass / [ ] Fail |
| **3.** Kiểm tra giao diện Quản trị của Admin và nhân viên liên quan. | Xuất hiện thông báo đẩy cảnh báo (Toast Notification) thời gian thực qua WebSocket; trên bản đồ Leaflet.js, tuyến đường vận chuyển của lô hàng này chuyển sang màu cam nhấp nháy cảnh báo. | [ ] Pass / [ ] Fail |

---

## Kịch bản TC-05: Kích hoạt Giao dịch bù khi xác nhận sự cố thất lạc lô hàng (LOST - Two-Man Approval)

- **Mã kiểm thử:** TC-EX-05
- **Tác nhân thực hiện (Actor):** 02 Quản trị viên hệ thống (Admin 1 và Admin 2)
- **Điều kiện tiên quyết:** Vận đơn đang bị kẹt ở trạng thái `DELAYED` hoặc `INVESTIGATING`.
- **Dữ liệu đầu vào:** Biên bản xác nhận thất lạc từ đối tác vận chuyển ngoại vi.

| Bước thực hiện (Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- |
| **1.** Admin 1 truy cập phân hệ quản lý sự cố `incident_reports`, chọn lô hàng bị trễ, bấm nút "Yêu cầu gán nhãn THẤT LẠC (LOST)". | Hồ sơ chuyển sang trạng thái chờ phê duyệt (`PENDING_APPROVAL`). Trạng thái lô hàng trên hệ thống chưa thay đổi. | [ ] Pass / [ ] Fail |
| **2.** Admin 2 đăng nhập vào tài khoản độc lập, truy cập danh sách phê duyệt sự cố, bấm nút "Xác nhận đồng ý phê duyệt". | Hệ thống kích hoạt Giao dịch bù (Compensating Transaction) mức Database: <br> 1. Trạng thái vận đơn/lô hàng chính thức chuyển sang `LOST` (Trạng thái terminal). <br> 2. Thực hiện "Cân bằng kho kế toán" (Write-Off): Khấu hao hủy bỏ dung lượng dự kiến (`allocated_quantity`) tại kho đích để tránh lỗi ảo năng lực chứa thực tế. <br> 3. Cập nhật sổ cái kiểm toán hao hụt tài sản `inventory_adjustments`. | [ ] Pass / [ ] Fail |
| **3.** Kiểm tra luồng định tuyến Dijkstra của hệ thống sau khi gán nhãn LOST. | Mã định danh `batch_id` (UUID) này lập tức bị cô lập, loại bỏ hoàn toàn khỏi đồ thị ma trận của Route Engine. Thuật toán Dijkstra tính toán lại tuyến đường vận tải mà không bị nhiễu bởi trọng số của lô hàng lỗi này. | [ ] Pass / [ ] Fail |

---

# PHẦN 3: KIỂM THỬ TƯƠNG TRANH & CHỐNG RACE CONDITION (CONCURRENCY TESTING)

## Kịch bản TC-06: Hai nhân viên cùng thao tác xuất kho đồng thời trên một mã lô hàng

- **Mã kiểm thử:** TC-CC-06
- **Tác nhân thực hiện (Actor):** Nhân viên A và Nhân viên B (Thực hiện hành động song song gối chéo thời gian bằng công cụ Apache JMeter hoặc bấm đồng thời trên hai thiết bị).
- **Điều kiện tiên quyết:** Lô hàng sữa X đang có số lượng tồn kho thực tế là 500 sản phẩm.
- **Dữ liệu đầu vào:** <br> - Nhân viên A gửi lệnh xuất: `quantity` = 400 sang đại lý 1. <br> - Nhân viên B gửi lệnh xuất: `quantity` = 300 sang đại lý 2. <br> *(Tổng nhu cầu xuất 400 + 300 = 700 > 500 tồn kho thực tế).*

| Bước thực hiện (Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- |
| **1.** Nhân viên A và Nhân viên B cùng mở màn hình xuất kho của lô hàng X. | Cả hai giao diện đều hiển thị số lượng khả dụng hiện tại là 500. | [ ] Pass / [ ] Fail |
| **2.** Gửi đồng thời hai yêu cầu xuất kho lên Backend NestJS trong cùng một mili giây ($t_1$). | - Tầng dịch vụ (Service Layer) thực thi cơ chế Pessimistic Locking (`SELECT ... FOR UPDATE` trên PostgreSQL). <br> - Yêu cầu của Nhân viên A đến trước một phần siêu nhỏ của giây: Hệ thống khóa dòng dữ liệu của lô hàng này lại, thực hiện trừ kho thành công ($500 - 400 = 100$). Bản ghi được cập nhật lên bảng `shipments` và giải phóng khóa. Nhân viên A nhận thông báo "Xuất kho thành công". | [ ] Pass / [ ] Fail |
| **3.** Hệ thống xử lý tiếp yêu cầu của Nhân viên B sau khi khóa được giải phóng. | - Yêu cầu của Nhân viên B sau khi thoát hàng chờ khóa sẽ đọc lại số dư mới thực tế lúc này (chỉ còn 100 sản phẩm do khóa lạc quan check trường `version` hoặc logic kiểm tra số dư sau khi lock). <br> - Hệ thống nhận diện $300 > 100$, lập tức tự động Rollback toàn bộ giao dịch của Nhân viên B. <br> - Trả về màn hình Nhân viên B lỗi an toàn: "Thao tác thất bại. Số dư kho đã thay đổi hoặc không đủ số lượng thực tế". Số dư kho được bảo toàn chính xác là 100 sản phẩm, không xảy ra hiện tượng âm kho. | [ ] Pass / [ ] Fail |

---

# PHẦN 4: KIỂM THỬ PHÂN HỆ CÔNG KHAI TRUY XUẤT NGUỒN GỐC (PUBLIC TRACEABILITY TESTING)

## Kịch bản TC-07: Người tiêu dùng truy xuất nguồn gốc sản phẩm qua mã QR (No Auth)

- **Mã kiểm thử:** TC-PB-07
- **Tác nhân thực hiện (Actor):** Người tiêu dùng (Consumer)
- **Điều kiện tiên quyết:** Lô hàng đã hoàn thành toàn bộ vòng đời chặng từ Nhà máy qua các kho và đã được bán ra thị trường (SOLD). Mã QR in trên bao bì sản phẩm hoàn toàn sắc nét.
- **Dữ liệu đầu vào:** Thiết bị di động của người dùng không cài đặt ứng dụng, không đăng nhập tài khoản hệ thống.

| Bước thực hiện (Steps) | Kết quả mong đợi (Expected Results) | Trạng thái |
| :--- | :--- | :--- |
| **1.** Consumer dùng ứng dụng quét mã QR bất kỳ trên điện thoại (Zalo, Camera iPhone, Viber...) để quét mã QR trên sản phẩm. | Trình duyệt di động tự động mở ra, chuyển hướng trực tiếp đến đường dẫn public của cổng thông tin: `https://traceflow.id/trace/batch-[UUID]` mà không yêu cầu đăng nhập. | [ ] Pass / [ ] Fail |
| **2.** Quan sát giao diện thông tin sản phẩm hiển thị trên Mobile Web. | - Giao diện responsive chuẩn Mobile-first tải mượt mà. <br> - Hiển thị đầy đủ thông tin gốc: Tên sản phẩm, hình ảnh, thông số SKU, ngày sản xuất, hạn sử dụng, thông tin nhà máy chế biến nguyên bản. | [ ] Pass / [ ] Fail |
| **3.** Quan sát và tương tác với phân hệ Hành trình chuỗi cung ứng (Timeline & Bản đồ). | - Component trục thời gian động hiển thị tuần tự các mốc lịch sử từ CREATED $\rightarrow$ IN_TRANSIT $\rightarrow$ RECEIVED $\rightarrow$ SOLD một cách trực quan. <br> - Bản đồ Leaflet.js vẽ chính xác các đường Polyline nối các nút tọa độ GPS thực tế mà lô hàng này đã đi qua. <br> - Backend tự động ghi nhận một lượt quét bất đồng bộ vào bảng `scan_logs` (lưu thời gian, tọa độ ước tính) để phục vụ thống kê chống hàng giả cho Admin mà không làm chậm tốc độ phản hồi trang web của Consumer. | [ ] Pass / [ ] Fail |