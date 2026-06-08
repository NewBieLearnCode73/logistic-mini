# KỊCH BẢN TRÌNH DIỄN ĐỒ ÁN TỐT NGHIỆP 2
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ CHUỖI CUNG ỨNG MINI (MINI-LOGISTIC)

> [!IMPORTANT]
> **HƯỚNG DẪN DÀNH CHO NHÓM (Nguyễn Đình Chiêu, Dương Minh Kha, Huỳnh Đức Thắng)**
> - **Thời lượng demo tối ưu**: 15 - 20 phút.
> - **Nguyên tắc**: Nói tới đâu, thao tác tới đó. Show bằng chứng thực tế (Email nhận được, Logs trong Database, Network Tab trong DevTools, File xuất ra) để thầy thấy sự đầu tư nghiêm túc về mặt kỹ thuật.
> - **Mục tiêu**: Làm nổi bật các từ khóa kỹ thuật "đắt giá" như **ACID Transaction, Pessimistic/Optimistic Locking, Row Level Security (RLS), Immutable Audit Trail, Two-Man Rule**.

---

## TÓM TẮT CÁC CÔNG NGHỆ & KỸ THUẬT "TINH TÚY" SẼ DEMO
Hệ thống không đơn thuần là các chức năng CRUD (Thêm, Xóa, Sửa) cơ bản, mà tập trung giải quyết các bài toán hóc búa của chuỗi cung ứng thực tế:
1. **Phân quyền nâng cao (RBAC & RLS)**: Tách biệt vai trò (Admin, Manufacturer, Distributor, Retailer). Bảo mật dòng dữ liệu (Nhà máy nào chỉ được thấy lô hàng của nhà máy đó).
2. **Giao dịch ACID & Khóa tranh chấp (Pessimistic & Optimistic Locking)**: Ngăn chặn âm kho, chống ghi đè dữ liệu khi nhiều người dùng cùng thao tác, đảm bảo tính nhất quán tuyệt đối.
3. **Trục thời gian bất biến (Immutable Timeline - Append-only)**: Lịch sử lô hàng không thể chỉnh sửa hay xóa từ giao diện, được lưu vết chặt chẽ làm bằng chứng pháp lý.
4. **Hệ thống cảnh báo tự động (Cron Job)**: System tự động quét phát hiện các vận đơn bị tắc nghẽn, cắm cờ sự cố và gửi email về Admin.
5. **Cơ chế phê duyệt kép (Two-Man Rule)**: Ngăn ngừa gian lận nội bộ. Một Admin báo mất hàng, phải có một Admin khác phê duyệt thì kho mới được rollback.
6. **Webcam QR Scanner trên localhost**: Trải nghiệm thực tế quét mã QR trực tiếp từ Webcam mượt mà, tự động chuyển hướng và ghi nhận Scan Log kèm tọa độ GPS.
7. **Email Service tích hợp Brevo API**: Gửi email thực tế chứa mật khẩu tạm thời hoặc cảnh báo sự cố ngay lập tức.
8. **Báo cáo tài chính chuyên nghiệp**: Xuất báo cáo CSV/Excel/PDF theo khoảng thời gian tùy chỉnh, định dạng đẹp mắt kèm tổng giá trị toàn bộ lô hàng ở dòng tổng kết chân trang.

---

## TỔNG QUAN LUỒNG KỊCH BẢN DEMO
```mermaid
graph TD
    subgraph Kịch bản 1: Thiết lập & Nhân sự
        A[Admin đăng nhập] --> B[Khởi tạo Node & Sản phẩm]
        B --> C[Tạo tài khoản User -> Tự động gửi Email Brevo]
        C --> D[Kiểm tra Audit Logs]
    end

    subgraph Kịch bản 2: Vòng đời Lô hàng & Giao dịch ACID
        E[Manufacturer tạo Lô hàng vaccine -> Sinh QR] --> F[Xuất kho sang Distributor]
        F -->|Pessimistic Lock| G[Distributor ký nhận -> UPSERT kho]
        G --> H[Chuyển tiếp Retailer -> Retailer nhận & Bán lẻ]
    end

    subgraph Kịch bản 3: Truy xuất QR & Bản đồ hành trình
        I[Quét QR qua Webcam] --> J[Truy xuất Public Timeline]
        J --> K[Trực quan hóa Bản đồ GPS]
    end

    subgraph Kịch bản 4: Sự cố, Phê duyệt kép & Báo cáo
        L[Xung đột đồng thời -> Optimistic Lock 409] --> M[Cron Job quét trễ hạn -> DELAYED]
        M --> N[Admin 1 lập Incident -> Đóng băng lô hàng]
        N --> O[Admin 2 phê duyệt -> Rollback kho nguồn]
        O --> P[Xuất báo cáo PDF/Excel theo thời gian & tổng giá trị]
    end
```

---

## CHI TIẾT CÁC BƯỚC TRÌNH DIỄN (DEMO STEPS)

### KỊCH BẢN 1: THIẾT LẬP HẠ TẦNG & PHÂN QUYỀN TỰ ĐỘNG
*(Mục đích: Show khả năng quản trị mạng lưới, tích hợp Email Brevo thật và tính năng ghi vết Audit Logs)*

*   **Bước 1: Đăng nhập Admin hệ thống**
    - Đăng nhập bằng tài khoản Admin gốc (`admin@logistic.com` / `password123`).
    - Giải thích: Hệ thống sử dụng phân quyền **RBAC (Role-Based Access Control)** chặt chẽ. Chỉ Admin mới được truy cập các menu quản trị cốt lõi.
*   **Bước 2: Tạo Điểm mạng lưới (Node) & Sản phẩm**
    - Tạo một điểm nút mới: **Nhà máy sản xuất Vắc-xin A** (loại `MANUFACTURER`) kèm tọa độ GPS thực tế.
    - Tạo một sản phẩm mới: **Vắc-xin Influenza** (SKU: `VAC-INF-001`, Đơn vị: Hộp).
*   **Bước 3: Tạo nhân sự & Gửi email mật khẩu tạm thời**
    - Admin tạo một tài khoản nhân sự mới cho nhà máy:
        - Email: *Nhập email thật của bạn hoặc của nhóm để check mail ngay lúc demo* (ví dụ: `thang.huynhduc.learning@gmail.com`).
        - Vai trò: `Manufacturer`.
        - Node quản lý: Chọn **Nhà máy sản xuất Vắc-xin A** vừa tạo.
    - **Hành động tạo điểm nhấn:**
        - Mở tab Email cá nhân lên trước lớp và Hội đồng. 
        - Nhấp nút **Tạo**. Hệ thống thông báo thành công.
        - Chờ 3-5 giây, **mở Email thật** vừa nhận được từ hệ thống! Cho thầy xem thư chào mừng chuyên nghiệp của dự án gửi qua **Brevo SMTP API** chứa mật khẩu tạm thời.
*   **Bước 4: Kiểm chứng Audit Logs (Nhật ký kiểm toán)**
    - Admin truy cập trang **Audit Logs**.
    - Cho thầy xem danh sách nhật ký: Ghi rõ thời gian, IP người thực hiện, hành động `CREATE` trên bảng `users` và `nodes`.
    - **Điểm cộng kỹ thuật:** Nhấp xem chi tiết bản ghi Audit Log để thấy dữ liệu snapshot `new_values` dạng JSON lưu trong database PostgreSQL. Giải thích: *“Bảng này là Immutable (chỉ ghi, không cho phép update/delete) để phục vụ công tác thanh tra khi có gian lận dữ liệu”*.

---

### KỊCH BẢN 2: VÒNG ĐỜI LÔ HÀNG & GIAO DỊCH ACID TRONG CHUỖI CUNG ỨNG
*(Mục đích: Show khả năng xử lý nghiệp vụ kho bãi, sinh mã QR, bảo mật Row Level Security và Transaction đảm bảo tính nhất quán dữ liệu)*

*   **Bước 1: Manufacturer Đăng nhập & Tạo Lô hàng**
    - Đăng xuất Admin, dùng mật khẩu tạm thời trong Email để đăng nhập vào tài khoản Manufacturer vừa tạo. (Hệ thống yêu cầu đổi mật khẩu ở lần đầu đăng nhập - tính năng bảo mật thực tế).
    - Vào mục **Quản lý lô hàng**, tạo lô hàng mới:
        - Chọn sản phẩm: Vắc-xin Influenza.
        - Số lượng: `1000` hộp.
        - Ngày sản xuất: Hôm nay, Hạn sử dụng: 1 năm sau.
    - **Điểm cộng kỹ thuật:**
        - Bấm tạo lô hàng. Hệ thống tự động thực thi 1 **Database Transaction**: Tạo lô hàng -> Tạo bản ghi tồn kho ban đầu (`1000` hộp tại nhà máy) -> Sinh mã định danh duy nhất (`BCH-YYYYMMDD-xxxx`) -> Mã hóa thông tin và sinh mã QR Code.
        - Show cho thầy thấy mã QR được hiển thị đẹp mắt trên màn hình.
*   **Bước 2: Xuất kho tạo vận đơn (Shipment) & Khóa dữ liệu chống tranh chấp**
    - Manufacturer tiến hành xuất `600` hộp vaccine chuyển đi cho **Kho phân phối miền Bắc** (Distributor).
    - **Giải thích thuật toán Backend:**
        - Khi nhấn "Xuất kho", Backend thực hiện câu lệnh `SELECT ... FROM inventory WHERE ... FOR UPDATE` (Pessimistic Lock - khóa bi quan). 
        - Khóa này ngăn chặn tất cả các tiến trình khác cố tình sửa đổi số lượng tồn kho của lô hàng này cho đến khi giao dịch hoàn tất.
        - Sau khi kiểm tra số lượng hợp lệ (1000 >= 600), hệ thống trừ kho nguồn đi `600` (còn `400`), tạo vận đơn `IN_TRANSIT` và ghi nhận sự kiện `SHIPPED` vào Timeline.
*   **Bước 3: Distributor nhận hàng & UPSERT tồn kho**
    - Đăng nhập tài khoản Distributor.
    - Vào mục **Vận đơn đến**, thấy vận đơn `600` hộp đang ở trạng thái `IN_TRANSIT`.
    - **Chứng minh cơ chế bảo mật RLS:** Thử đăng nhập tài khoản Distributor khác hoặc Retailer để chứng minh họ *không thể nhìn thấy* vận đơn này vì nó không thuộc điểm nút của họ quản lý (Node isolation).
    - Distributor bấm **Ký nhận**.
    - **Giải thích kỹ thuật:** Hệ thống thực hiện câu lệnh **UPSERT** (Insert ... ON CONFLICT DO UPDATE). Nếu đây là lần đầu kho phân phối nhận lô vaccine này, hệ thống sẽ chèn mới bản ghi tồn kho. Nếu đã có sẵn, hệ thống sẽ cộng dồn số lượng. Tồn kho tại Distributor cập nhật thành `600`.
*   **Bước 4: Luân chuyển đến Retailer & Bán lẻ**
    - Distributor xuất tiếp `400` hộp vaccine chuyển cho **Nhà thuốc Retailer C**.
    - Retailer đăng nhập, ký nhận `400` hộp. Kho Distributor giảm còn `200` hộp.
    - Retailer thực hiện **Bán lẻ** `50` hộp vaccine cho bệnh nhân. Tồn kho tại Retailer tự động giảm còn `350` hộp. Hệ thống ghi nhận sự kiện `SOLD` vào lịch sử.

---

### KỊCH BẢN 3: TRÌNH QUÉT QR CAMERA & TRUY XUẤT HÀNH TRÌNH TỐT NGHIỆP
*(Mục đích: Trình diễn tính năng Webcam Scanner tối ưu trên Localhost, giao diện Timeline và Bản đồ hành trình GPS)*

*   **Bước 1: Quét mã QR bằng Webcam trên Localhost**
    - Dùng một thiết bị di động hoặc in/hiển thị mã QR của lô hàng vừa tạo trên màn hình điện thoại.
    - Ở máy tính demo, truy cập trang **Quét mã QR công khai** (không cần đăng nhập).
    - Bật camera lên và quét mã QR. 
    - **Điểm cộng kỹ thuật:** Trình quét Webcam được tối ưu hóa trên localhost. Ngay khi camera nhận diện được mã QR (cho dù đó là link tuyệt đối `https://mini-logistic.com/...` hay `http://localhost/...`), hệ thống tự động trích xuất mã lô hàng ở đuôi URL và thực hiện chuyển hướng mượt mà (Redirect) sang trang truy xuất nguồn gốc công khai `/trace/BCH-xxxx`.
*   **Bước 2: Giao diện Trục thời gian (Timeline) & Bản đồ GPS**
    - Trang truy xuất hiển thị:
        1. **Thông tin lô hàng**: Tên sản phẩm, hạn sử dụng, nhà sản xuất gốc.
        2. **Trục thời gian (Timeline)**: Trực quan hóa toàn bộ hành trình đi qua các chặng: *Khởi tạo tại nhà máy -> Xuất kho -> Nhận tại kho trung chuyển -> Xuất kho -> Nhận tại nhà thuốc -> Bán lẻ cho khách hàng*. Tất cả đều hiển thị rõ ràng thời gian thực tế (`occurredAt`) và tên nhân viên phụ trách.
        3. **Bản đồ tương tác**: Bản đồ vẽ đường đi (từ Hà Nội -> Hải Phòng -> Nhà thuốc) kết nối các điểm nút dựa trên tọa độ GPS, giúp khách hàng hình dung trực quan con đường di chuyển của hộp vaccine.
    - **Giải thích bảo mật**: Nhấn mạnh nguyên tắc **Data Minimization & Anonymization** trong báo cáo nghiên cứu `public_traceability_research.md`. *“Chúng em chỉ hiển thị các mã nghiệp vụ và tên rút gọn của nhân viên, hoàn toàn ẩn UUID của Database và thông tin email cá nhân để chống tấn công brute-force và phishing”*.
    - **Ghi nhận Scan Log bất đồng bộ (Async):** Cho thầy xem trong DB hoặc console: mỗi lượt quét của khách hàng đều được ghi nhận tọa độ GPS và thiết bị để phục vụ thống kê phân tích thị trường mà không làm chậm tốc độ tải trang của người dùng.

---

### KỊCH BẢN 4: CRON JOB TỰ ĐỘNG, SỰ CỐ PHÊ DUYỆT KÉP & BÁO CÁO TINH TÚY
*(Mục đích: Trình diễn các kỹ thuật nâng cao nhất: Khóa lạc quan 409, Cron Job tự động, Two-Man Rule chống gian lận và Xuất báo cáo đẹp mắt)*

*   **Bước 1: Trình diễn Xung đột dữ liệu (Optimistic Locking & Ràng buộc tồn kho)**
    - **Kịch bản 409 Conflict:** Hai Admin cùng mở trang cấu hình **Nhà máy sản xuất Vắc-xin A** (cùng đọc được `version = 1`).
        - Admin 1 sửa địa chỉ và lưu thành công (DB cập nhật version thành `2`).
        - Admin 2 bấm lưu thay đổi mà không tải lại trang. Hệ thống lập tiếp chặn lại và hiển thị thông báo lỗi: **`409 Conflict - Dữ liệu đã bị thay đổi bởi người dùng khác`**.
    - **Kịch bản Ràng buộc an toàn:** Admin cố tình bấm xóa **Nhà máy sản xuất Vắc-xin A** trong khi kho nhà máy vẫn còn `400` hộp vaccine. Hệ thống chặn đứng hành động và báo lỗi: **`Không thể xóa điểm nút vì vẫn còn hàng tồn kho`** (Bảo vệ dữ liệu).
*   **Bước 2: Cron Job tự động phát hiện trễ hạn & Cảnh báo**
    - Giả lập một vận đơn xuất kho đi nhưng sau 48 giờ chưa có ai ký nhận. 
    - **Điểm cộng kỹ thuật:** Giới thiệu với Hội đồng: *“Hệ thống của chúng em có một Cron Job chạy ngầm định kỳ. Khi phát hiện vận đơn quá hạn, hệ thống tự động chuyển trạng thái vận đơn thành DELAYED, cắm cờ cảnh báo ShipmentIssue mức độ CRITICAL và gửi Email cảnh báo tự động về cho Admin”*.
*   **Bước 3: Lập sự cố & Cơ chế phê duyệt kép (Two-Man Rule)**
    - Một lô hàng vaccine bị thất lạc trên đường đi. Admin 1 (`admin.investigator@logistic.com`) lập hồ sơ báo cáo sự cố (Incident Report) loại `MISSING` mức độ `HIGH`.
    - **Hệ quả đóng băng kho:** Ngay lập tức trạng thái lô hàng chuyển sang `INVESTIGATING`. Thử thực hiện hành động bán lẻ hay xuất kho lô hàng này, hệ thống sẽ báo lỗi chặn đứng.
    - **Trình diễn Two-Man Rule (Chống gian lận nội bộ):**
        - Admin 1 cố gắng tự bấm nút **Xác nhận thất lạc & Hoàn kho (Confirm Lost)**. Hệ thống chặn lại và báo lỗi bảo mật: *“Người lập hồ sơ không được tự phê duyệt sự cố”*.
        - Admin 2 (`admin.director@logistic.com`) đăng nhập vào hệ thống, kiểm tra hồ sơ và bấm **Phê duyệt (Approve)**.
        - **Cơ chế Rollback kho tự động:** Sau khi Admin 2 phê duyệt, transaction được thực thi: Trạng thái lô hàng chuyển sang `LOST` (Đóng băng vĩnh viễn) -> Hệ thống tự động **cộng trả lại** số lượng vaccine bị mất vào kho nguồn của nhà sản xuất -> Ghi nhận bản ghi điều chỉnh tồn kho bất biến `inventory_adjustments` để phục vụ đối soát tài chính sau này.
*   **Bước 4: Xuất báo cáo tài chính chuyên nghiệp (Mới bổ sung nâng cấp)**
    - Distributor hoặc Admin truy cập mục **Thống kê / Dashboard**.
    - Chọn bộ lọc thời gian: **Từ ngày ... Đến ngày ...** (Chọn khoảng thời gian chứa các giao dịch vừa thực hiện).
    - Lựa chọn định dạng xuất file: **PDF** hoặc **Excel (XLSX)** hoặc **CSV**.
    - **Trình diễn kết quả:** 
        - Mở file Excel/PDF đã tải xuống cho thầy xem. 
        - Nhấn mạnh: File được format chỉn chu, có tiêu đề rõ ràng, hiển thị đầy đủ thông tin mã lô, số lượng, **cột Tổng giá trị của từng lô hàng**, và đặc biệt là **dòng tổng kết tổng số lượng + tổng giá trị ở chân trang (Footer)**. Điều này giúp doanh nghiệp có ngay số liệu đối soát kế toán tức thì.

---

## CÁC TỪ KHÓA "VÀNG" CẦN NÓI KHI DEMO ĐỂ ĐẠT ĐIỂM TỐT ĐA

Khi trình bày với thầy Nguyễn Minh Đế và Hội đồng phản biện, hãy cố gắng lồng ghép các câu giải thích kỹ thuật dưới đây:

1.  **Khi nói về DB Transactions:**
    > *"Thay vì viết các truy vấn rời rạc, tất cả các luồng thay đổi kho bãi (Xuất, Nhận, Hoàn kho) của dự án đều được bao bọc trong một **Database Transaction** đạt chuẩn **ACID**. Nếu xảy ra sự cố mạng hoặc lỗi logic giữa chừng, toàn bộ các bước trước đó sẽ được **Rollback** hoàn toàn, đảm bảo dữ liệu kho không bao giờ bị lệch hoặc tồn kho bị âm."*
2.  **Khi nói về Cơ chế khóa (Concurrency Control):**
    > *"Để giải quyết vấn đề tranh chấp dữ liệu khi hàng ngàn nhân viên kho cùng thao tác đồng thời trên một lô hàng, chúng em áp dụng **Pessimistic Locking (SELECT FOR UPDATE)** ở cấp độ cơ sở dữ liệu để khóa bản ghi tồn kho khi xuất hàng, tránh race condition. Đồng thời sử dụng **Optimistic Locking (trường version)** để bảo vệ các thông tin cấu hình điểm nút, ngăn ngừa việc hai người quản trị vô tình ghi đè dữ liệu lên nhau."*
3.  **Khi nói về Audit Trail & Tính bất biến (Immutability):**
    > *"Dữ liệu chuỗi cung ứng yêu cầu tính minh bạch cao nhất. Do đó, các bảng `timeline_events`, `audit_logs` và `inventory_adjustments` được thiết kế theo nguyên tắc **Append-only (Chỉ thêm mới, cấm sửa xóa)**. Dù là Admin cấp cao nhất cũng không thể chỉnh sửa lịch sử di chuyển của lô hàng trên giao diện, đảm bảo tính chống chối bỏ."*
4.  **Khi nói về Bảo mật thông tin (Data Security):**
    > *"Chúng em áp dụng cơ chế **Row Level Security (RLS)** trên API. Nhân viên thuộc điểm nút nào chỉ có quyền thao tác và nhìn thấy lô hàng/vận đơn liên quan đến điểm nút đó, tránh việc rò rỉ thông tin kinh doanh giữa các nhà phân phối đối thủ trong cùng một hệ thống."*

---

**Chúc nhóm có một buổi bảo vệ thành công rực rỡ và đạt điểm số cao nhất (A+)!** 🚀
