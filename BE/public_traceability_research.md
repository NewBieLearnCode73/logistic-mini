# KHẢO SÁT & NGHIÊN CỨU: TẠI SAO HỆ THỐNG CHUỖI CUNG ỨNG CẦN CÔNG KHAI DỮ LIỆU TRUY XUẤT LÔ HÀNG (BATCH TRACEABILITY)

Tài liệu này tổng hợp các kết quả khảo sát thị trường, phân tích nghiệp vụ và tiêu chuẩn công nghệ toàn cầu nhằm giải thích lý do tại sao các hệ thống chuỗi cung ứng hiện đại (đặc biệt là Y tế, Dược phẩm và Vaccine) bắt buộc phải cung cấp một cổng công khai để người dùng/cơ quan thanh tra truy xuất thông tin lịch sử của Lô hàng (Batch/Lot).

---

## 1. PHÂN TÍCH TÌNH HUỐNG THỰC TẾ (USE-CASES)

Khi một khách hàng quét mã QR trên hộp vaccine hoặc dược phẩm ngoài nhà thuốc, hệ thống của chúng ta phản hồi toàn bộ dòng lịch sử sự kiện từ khi sản xuất, qua nhà vận chuyển, đến nhà thuốc và thậm chí các trạng thái như trễ hạn (`DELAYED`) hay thất thoát (`LOST`). Đây là thiết kế nghiệp vụ chuẩn vì các lý do sau:

### Case 1: Chống hàng giả, hàng nhái (Anti-Counterfeiting)
*   **Vấn đề**: Kẻ gian có thể in giả bao bì sản phẩm giống hệt sản phẩm thật.
*   **Giải pháp**: Mã QR tĩnh trên bao bì rất dễ sao chép, nhưng **Lịch sử di chuyển của Lô hàng thì không thể làm giả**. Khi người mua quét mã QR và thấy lô hàng này chưa từng được phân phối qua nhà phân phối chính thức, hoặc lộ trình di chuyển đi từ một kho hàng lạ, họ lập tức phát hiện ra hàng giả.

### Case 2: Kiểm soát chuỗi cung ứng lạnh (Cold Chain Integrity)
*   **Vấn đề**: Vaccine là sản phẩm sinh học nhạy cảm với nhiệt độ và thời gian di chuyển. Nếu vận chuyển quá lâu, vaccine bị biến chất và mất tác dụng.
*   **Giải pháp**: Công khai các mốc thời gian (`shippedAt`, `occurredAt`) giúp các bác sĩ tại trung tâm tiêm chủng hoặc người tiêm kiểm tra xem lô vaccine này có bị vận chuyển quá lâu giữa các chặng hay không. Nếu phát hiện sự kiện trễ hạn (`DELAYED`) hệ thống cảnh báo công khai, bác sĩ sẽ từ chối tiêm để đảm bảo tính mạng cho bệnh nhân.

### Case 3: Thu hồi sản phẩm khẩn cấp (Rapid Product Recall)
*   **Vấn đề**: Khi nhà sản xuất phát hiện một lô vaccine bị lỗi tạp chất tại nhà máy, họ cần thu hồi lập tức toàn bộ số vaccine đã phân phối ra thị trường.
*   **Giải pháp**: Khi thông tin trạng thái lô hàng được cập nhật thành `LOST` hoặc `INVESTIGATING` trên hệ thống, bất kỳ bệnh viện hay người tiêu dùng nào quét mã QR trên sản phẩm đang giữ trong tay đều sẽ thấy trạng thái cảnh báo ngay lập tức. Điều này giúp ngăn chặn việc sử dụng sản phẩm lỗi nhanh hơn gấp nhiều lần so với việc thông báo qua văn bản hành chính thông thường.

---

## 2. KHẢO SÁT TIÊU CHUẨN VÀ DỊCH VỤ TOÀN CẦU

Cơ chế công khai thông tin lô hàng thông qua mã định danh toàn cầu là tiêu chuẩn bắt buộc tại các nước phát triển:

| Hệ thống / Tiêu chuẩn | Phạm vi áp dụng | Cách thức hoạt động |
| :--- | :--- | :--- |
| **GS1 Global Traceability Standard** | Toàn cầu (Dược phẩm & Thực phẩm) | Mỗi lô hàng có mã định danh GTIN + Lot Number. Người tiêu dùng quét barcode để kiểm tra trạng thái lưu hành trên cổng thông tin GS1 toàn cầu. |
| **IBM Food Trust** | Chuỗi cung ứng thực phẩm của Walmart, Carrefour | Cho phép người tiêu dùng quét QR để xem toàn bộ hành trình nông sản từ trang trại sản xuất, các trạm đóng gói đến quầy kệ siêu thị. |
| **EU Falsified Medicines Directive (FMD)** | Liên minh Châu Âu (Dược phẩm) | Bắt buộc mọi hộp thuốc bán ra phải có mã 2D DataMatrix chứa số lô và hạn dùng công khai để dược sĩ quét xác thực trước khi giao cho bệnh nhân. |
| **Mạng lưới TE-FOOD** | Châu Á & Châu Âu (Nông sản & Dược phẩm) | Người dùng cuối truy xuất minh bạch nguồn gốc động vật, quy trình giết mổ và điều kiện bảo quản vận chuyển qua cổng Web công khai. |

---

## 3. NGUYÊN TẮC THIẾT KẾ AN TOÀN THÔNG TIN (SECURITY PRINCIPLES)

Để đảm bảo việc công khai dữ liệu **không gây ảnh hưởng đến an ninh hệ thống**, API `/api/v1/public/trace/:batchCode` được áp dụng các nguyên tắc thiết kế bảo mật chặt chẽ:

```mermaid
graph TD
    A[Dữ liệu gốc trong DB] -->|Bộ lọc Security Filter| B(Dữ liệu truy xuất công khai)
    
    subgraph Dữ liệu bị loại bỏ hoàn toàn
        ID[Khóa chính/Khóa ngoại UUID: id, productId, nodeId]
        AUTH[Thông tin xác thực: passwordHash]
        PRIV[Liên lạc cá nhân: email, phone]
        SYS[Mốc thời gian hệ thống: createdAt, updatedAt]
    end
    
    subgraph Dữ liệu được phép hiển thị
        CODE[Mã nghiệp vụ: batchCode, trackingCode]
        PRODUCT[Thông tin sản phẩm: name, sku, unit]
        NODE[Địa lý công cộng: tên Node, địa chỉ, tọa độ]
        TIME[Lịch sử sự kiện: eventType, notes, occurredAt]
        ACTOR[Tên định danh rút gọn: fullName]
    end

    A -.-> Dữ liệu bị loại bỏ hoàn toàn
    B --> Dữ liệu được phép hiển thị
```

### 1. Nguyên tắc tối thiểu hóa thông tin (Data Minimization)
Chỉ hiển thị các thông tin cần thiết phục vụ cho việc đối chứng thực tế. Không hiển thị cấu trúc tổ chức nội bộ hay cấu trúc dữ liệu kỹ thuật của phần mềm.

### 2. Che giấu định danh thực tế (Anonymization)
Không công khai tài khoản đăng nhập hay email của các nhân viên vận hành, tránh việc họ bị kẻ xấu thu thập thông tin để thực hiện các cuộc tấn công lừa đảo giả mạo (Phishing) hoặc brute force mật khẩu.

### 3. Tách biệt hoàn toàn API nội bộ và API công cộng
API công khai không đi qua các bộ lọc xác thực token của quản trị viên (Admin) nhưng được giới hạn quyền tối đa (Read-Only) và cấu hình phòng chống tấn công từ chối dịch vụ (Rate Limiting) để tránh việc bot tự động cào quét dữ liệu quy mô lớn.

---

## 4. KẾT LUẬN

Việc cung cấp API truy xuất công khai thông tin lô hàng không phải là một lỗi bảo mật mà là **tính năng cốt lõi bắt buộc** của một hệ thống Logistics hiện đại. Trọng tâm của việc phát triển hệ thống là phân định ranh giới rõ ràng: **Công khai minh bạch lịch sử sản phẩm nhưng bảo mật tối đa hạ tầng dữ liệu và danh tính con người vận hành.**
