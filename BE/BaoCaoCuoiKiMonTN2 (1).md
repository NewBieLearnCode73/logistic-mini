BAN CƠ YẾU CHÍNH PHỦ

**HỌC VIỆN KỸ THUẬT MẬT MÃ**

¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯

**BÁO CÁO KẾT THÚC HỌC PHẦN**

**MÔN TỐT NGHIỆP 2**

**HỆ THỐNG QUẢN LÝ CHUỖI CUNG ỨNG MINI**

Ngành: Công nghệ thông tin

_Sinh viên thực hiện:_

- Nguyễn Đình Chiêu – CT07N0105
- Dương Minh Kha – CT07N0123
- Huỳnh Đức Thắng – CT07N0149

Lớp : CT07N01

_Giảng viên hướng dẫn_:

ThS. Nguyễn Minh Đế

Trường Học viện Kỹ thuật Mật mã

**TP. Hồ Chí Minh – 06/2026**

BAN CƠ YẾU CHÍNH PHỦ

**HỌC VIỆN KỸ THUẬT MẬT MÃ**

¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯

**BÁO CÁO KẾT THÚC HỌC PHẦN**

**MÔN TỐT NGHIỆP 2**

**HỆ THỐNG QUẢN LÝ CHUỖI CUNG ỨNG MINI**

Ngành: Công nghệ thông tin

_Sinh viên thực hiện:_

- Nguyễn Đình Chiêu – CT07N0105
- Dương Minh Kha – CT07N0123
- Huỳnh Đức Thắng – CT07N0149

Lớp : CT07N01

_Giảng viên hướng dẫn_:

ThS. Nguyễn Minh Đế

Trường Học viện Kỹ thuật Mật mã

**TP. Hồ Chí Minh – 06/2026**

LỜI NHẬN XÉT CỦA GIẢNG VIÊN HƯỚNG DẪN

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

.....................................................................................................................................

............., ngày... tháng... năm 2026

Xác nhận của giảng viên hướng dẫn

(Ký và ghi rõ họ tên)

**MỤC LỤC**

[LỜI MỞ ĐẦU 7](#_Toc230085230)

[CHƯƠNG 1. TỔNG QUAN 8](#_Toc230085231)

[1.1 Đặt vấn đề 8](#_Toc230085232)

[1.1.1. Tính cấp thiết của việc truy xuất nguồn gốc hàng hóa 8](#_Toc230085233)

[1.1.2. Lí do chọn đề tài 8](#_Toc230085234)

[1.2 Xác định đề tài 9](#_Toc230085235)

[1.2.1. Mục tiêu của đề tài 9](#_Toc230085236)

[1.2.2. Tên đề tài 10](#_Toc230085237)

[1.2.3. Đối tượng nghiên cứu 10](#_Toc230085238)

[1.2.4. Phạm vi đề tài 10](#_Toc230085239)

[1.3 Kết luận chương 1 11](#_Toc230085240)

[CHƯƠNG 2. PHƯƠNG PHÁP, CÔNG CỤ SỬ DỤNG 12](#_Toc230085241)

[2.1 Công cụ lập trình, phần mềm 12](#_Toc230085242)

[2.1.1. Visual Studio Code 12](#_Toc230085243)

[2.1.2. Window Subsystem For Linux 2 (WSL2) 12](#_Toc230085244)

[2.2 Công nghệ phát triển ứng dụng 14](#_Toc230085245)

[2.2.1. TypeScript, NestJS 14](#_Toc230085246)

[2.2.2. ReactJS, Tailwind CSS 15](#_Toc230085247)

[2.2.3. PostgreSQL 16](#_Toc230085248)

[2.2.4. Git và Github 17](#_Toc230085249)

[2.3 Công cụ thiết kế đồ họa 18](#_Toc230085250)

[2.3.1. Draw.io 18](#_Toc230085251)

[2.3.2. Figma 19](#_Toc230085252)

[2.4 Công cụ quản lý công việc 20](#_Toc230085253)

[2.4.1. Notion 20](#_Toc230085254)

[2.5 Kết luận chương 2 20](#_Toc230085255)

[CHƯƠNG 3. KHẢO SÁT, PHÂN TÍCH 22](#_Toc230085256)

[3.1 Phân tích quy trình nghiệp vụ 22](#_Toc230085257)

[3.1.1. Vòng đời của một lô hàng 22](#_Toc230085258)

[3.1.2. Luồng luân chuyển hàng hóa 24](#_Toc230085259)

[3.2 Xác định các actor 27](#_Toc230085260)

[3.2.1. Danh sách các actor 27](#_Toc230085261)

[3.3 Mô tả nghiệp vụ hệ thống 31](#_Toc230085262)

[3.3.1. Nghiệp vụ chung của các actor 32](#_Toc230085263)

[3.3.1.1. Danh sách các usecase 32](#_Toc230085264)

[3.3.1.1.1.Đặc tả các usecase 33](#_Toc230085265)

[3.3.2. Nghiệp vụ của Admin 40](#_Toc230085266)

[3.3.2.1. Sơ đồ usecase 40](#_Toc230085267)

[3.3.2.2. Danh sách các usecase 40](#_Toc230085268)

[3.3.3. Nghiệp vụ của Manufactor 50](#_Toc230085269)

[3.3.3.1. Sơ đồ usecase 50](#_Toc230085270)

[3.3.3.2. Danh sách các usecase 50](#_Toc230085271)

[3.3.4. Nghiệp vụ của Distributor 59](#_Toc230085272)

[3.3.4.1. Sơ đồ usecase 59](#_Toc230085273)

[3.3.4.2. Danh sách các usecase 59](#_Toc230085274)

[3.3.5. Nghiệp vụ của Retailer 67](#_Toc230085275)

[3.3.5.1. Sơ đồ usecase 67](#_Toc230085276)

[3.3.5.2. Danh sách các usecase 67](#_Toc230085277)

[3.4 Ma trận phân quyền 73](#_Toc230085278)

[3.5 Kết luận chương 3 74](#_Toc230085279)

[CHƯƠNG 4. THIẾT KẾ CƠ SỞ DỮ LIỆU 75](#_Toc230085280)

[4.1 Thiết kế kiến trúc Cơ sở dữ liệu 75](#_Toc230085281)

[4.1.1. Sơ đồ thực thể liên kết (ERD) 75](#_Toc230085282)

[4.1.1.1. Nhóm Core – Identity 75](#_Toc230085283)

[4.1.1.2. Nhóm Core - Supply Chain 76](#_Toc230085284)

[4.1.1.3. Nhóm Audit - Immutable 80](#_Toc230085285)

[4.1.1.4. Nhóm Incident Management 84](#_Toc230085286)

[4.2 Thiết kế luồng giao dịch 87](#_Toc230085287)

[4.2.1. Luồng tạo lô hàng & sinh mã QR 87](#_Toc230085288)

[4.2.2. Luồng xuất kho – Tạo vận đơn 89](#_Toc230085289)

[4.2.3. Luồng xác nhận nhận hàng 91](#_Toc230085290)

[4.2.4. Luồng phát hiện trễ hạng tự động 93](#_Toc230085291)

[4.2.5. Luồng xác nhận thất lạc & Rollback kho 94](#_Toc230085292)

[4.2.6. Luồng quét QR & truy xuất nguồn gốc 95](#_Toc230085293)

[4.3 Kết luận chương 4 96](#_Toc230085294)

[CHƯƠNG 5. THIẾT KẾ GIAO DIỆN VÀ CÀI ĐẶT 97](#_Toc230085295)

[5.1 Thiết kế giao diện phía quản trị 97](#_Toc230085296)

[5.1.1. Giao diện Dashboard và thống kê tồn kho 97](#_Toc230085297)

[5.1.2. Giao diện quản lý lô hàng và sinh mã QR 97](#_Toc230085298)

[5.1.3. Giao diện điều chuyển và nhận hàng 97](#_Toc230085299)

[5.2 Thiết kế giao diện phía người dùng cuối 97](#_Toc230085300)

[5.2.1. Giao diện quét mã QR 97](#_Toc230085301)

[5.2.2. Giao diện trục thời gian truy xuất 97](#_Toc230085302)

[5.2.3. Giao diện bản đồ và hành trình lô hàng 97](#_Toc230085303)

[5.3 Cài đặt hệ thống 98](#_Toc230085304)

[5.4 Kết luận chương 5 98](#_Toc230085305)

[CHƯƠNG 6. KỊCH BẢN DEMO, ĐÁNH GIÁ VÀ HƯỚNG PHÁT TRIỂN 98](#_Toc230085306)

[6.1 Chạy chương trình và kịch bản demo thực tế 98](#_Toc230085307)

[6.1.1. Luồng 1: Khởi tạo dữ liệu và sinh mã QR 98](#_Toc230085308)

[6.1.2. Luồng 2: Quét QR bằng thiết bị di động để luân chuyển kho 98](#_Toc230085309)

[6.1.3. Luồng 3: Khách hàng truy xuất nguồn gốc 98](#_Toc230085310)

[6.2 Đánh giá hệ thống 98](#_Toc230085311)

[6.2.1. Ưu điểm và các chức năng nổi bật 98](#_Toc230085312)

[6.2.2. Hạn chế còn tồn tại 98](#_Toc230085313)

[6.3 Hướng phát triển 98](#_Toc230085314)

[6.4 Kết luận 98](#_Toc230085315)

[TÀI LIỆU THAM KHẢO 99](#_Toc230085316)

**MỤC LỤC HÌNH ẢNH**

[Hình 1: Biểu tượng VSCode 12](#_Toc229857164)

[Hình 2: Biểu tượng WSL2 13](#_Toc229857165)

[Hình 3: Biểu tượng TypeScript 14](#_Toc229857166)

[Hình 4: Biểu tượng ExpressJS 14](#_Toc229857167)

[Hình 5: Biểu tượng Tailwind CSS và ReactJS 15](#_Toc229857168)

[Hình 6: Biểu tượng PostgreSQL 16](#_Toc229857169)

[Hình 7: Biểu tượng Git và Github 16](#_Toc229857170)

[Hình 8: Biểu tượng draw.io 17](#_Toc229857171)

[Hình 9: Biểu tượng Figma 18](#_Toc229857172)

[Hình 10: Biểu tượng Notion 19](#_Toc229857173)

## LỜI MỞ ĐẦU

Khoảng thời gian học tập và rèn luyện tại **Phân Hiệu Học Viện Kỹ Thuật Mật Mã Hồ Chí Minh** cho đến giờ là một hành trình đáng nhớ, đầy ý nghĩa và thử thách. Trong suốt quá trình ấy, chúng em đã nhận được sự quan tâm, dìu dắt tận tình từ thầy cô, cũng như sự giúp đỡ, động viên từ bạn bè. Những bài giảng, những lời chỉ dạy và cả những lời khích lệ của thầy cô không chỉ giúp chúng em nâng cao kiến thức chuyên môn mà còn là kim chỉ nam để rèn luyện đạo đức, tác phong và tinh thần trách nhiệm trong công việc cũng như cuộc sống.

Trong suốt học kỳ này, giảng viên tại Phân Hiệu Học Viện Kỹ Thuật Mật Mã Hồ Chí Minh đã tạo cơ hội để chúng em thực hiện báo cáo cuối môn học, một trải nghiệm vô cùng hữu ích đối với sinh viên ngành Công nghệ Thông tin. Nhóm chúng em đã chọn đề tài **“HỆ THỐNG QUẢN LÝ CHUỖI CUNG ỨNG MINI”**, một chủ đề thiết thực, giúp chúng em áp dụng kiến thức vào thực tế. Chúng em xin gửi lời cảm ơn chân thành đến thầy Nguyễn Minh Đế, người đã tận tâm hướng dẫn, chỉ bảo từng bước, cũng như dành thời gian trao đổi, giải đáp thắc mắc, giúp nhóm chúng em hoàn thành tốt bài báo cáo.

Bên cạnh đó, chúng em cũng xin bày tỏ lòng biết ơn sâu sắc đến ban lãnh đạo Phân Hiệu Học Viện Kỹ Thuật Mật Mã Hồ Chí Minh cùng các thầy cô trong Khoa Công Nghệ Thông Tin - An Toàn Thông Tin. Sự quan tâm, hỗ trợ và tạo điều kiện từ quý thầy cô đã giúp chúng em có môi trường học tập thuận lợi, tích lũy thêm nhiều kiến thức và kỹ năng bổ ích.

Cuối cùng, chúng em xin dành lời tri ân sâu sắc đến gia đình và những người thân yêu, những người luôn âm thầm ủng hộ, tạo điều kiện tốt nhất để chúng em hoàn thành quá trình học tập. Chính sự động viên và khích lệ từ họ đã giúp chúng em có thêm ý chí và quyết tâm vượt qua mọi thử thách.

## TỔNG QUAN

### Đặt vấn đề

##### Tính cấp thiết của việc truy xuất nguồn gốc hàng hóa

Trong bối cảnh nền kinh tế thị trường phát triển mạnh mẽ và xu hướng chuyển đổi số diễn ra sâu rộng, tính minh bạch của thông tin sản phẩm trở thành một trong những tiêu chí hàng đầu quyết định niềm tin của người tiêu dùng. Người tiêu dùng hiện nay không chỉ quan tâm đến giá cả hay công dụng, mà còn đòi hỏi được biết rõ ràng về nguồn gốc xuất xứ, điều kiện sản xuất, và hành trình luân chuyển thực tế của sản phẩm (đặc biệt là các nhóm hàng như thực phẩm, dược phẩm, và hàng tiêu dùng nhanh) nhằm phòng tránh hàng giả, hàng nhái, hoặc hàng kém chất lượng.

Tuy nhiên, các phương thức quản lý chuỗi cung ứng truyền thống hiện nay tại nhiều doanh nghiệp vừa và nhỏ vẫn phụ thuộc nặng nề vào sổ sách giấy tờ hoặc các phần mềm nội bộ rời rạc. Điều này dẫn đến tình trạng "ốc đảo thông tin", khiến việc đồng bộ dữ liệu giữa các mắt xích trong chuỗi gặp nhiều khó khăn. Khi xảy ra sự cố về chất lượng sản phẩm (ví dụ: hàng hóa bị hỏng hóc, nhiễm khuẩn hoặc lỗi kỹ thuật), việc truy cứu trách nhiệm và tìm ra nguyên nhân gốc rễ tại các nút (Nhà sản xuất, Đại lý phân phối, Nhà bán lẻ) thường diễn ra rất chậm chạp, thiếu chính xác và dễ bị can thiệp làm sai lệch dữ liệu lịch sử.

Do đó, việc phát triển một hệ thống tích hợp có khả năng số hóa toàn bộ vòng đời sản phẩm, tự động cấp mã định danh, kiểm soát chặt chẽ luồng dịch chuyển hàng hóa và cho phép người tiêu dùng trực tiếp kiểm chứng nguồn gốc thông qua mã QR thời gian thực là vô cùng cấp thiết.

#### Lí do chọn đề tài

Đề tài "Hệ thống Quản lý chuỗi cung ứng Mini" được lựa chọn nghiên cứu và triển khai nhằm giải quyết bài toán thực tế nêu trên, đồng thời đáp ứng đầy đủ các tiêu chí khắt khe của một đồ án công nghệ phần mềm cuối khóa.

**Về mặt kỹ thuật và kiến trúc hệ thống:** Đề tài đặt ra những thách thức bài bản về mặt tư duy thiết kế phần mềm bao gồm: chuẩn hóa cơ sở dữ liệu đạt dạng chuẩn 3 (3NF) để đảm bảo tính toàn vẹn ; thực thi các ràng buộc dữ liệu nghiêm ngặt ở cả tầng ứng dụng và tầng cơ sở dữ liệu để ngăn chặn tình trạng tồn kho bị âm; áp dụng cơ chế quản trị giao dịch (Database Transaction) đạt chuẩn ACID để đồng bộ hóa việc trừ kho nơi đi, cộng kho nơi đến và ghi nhật ký luân chuyển ; sử dụng các kỹ thuật khóa lạc quan (Optimistic Locking) và khóa bi quan (Pessimistic Locking) để xử lý tranh chấp dữ liệu khi nhiều tác nhân tương tác đồng thời ; và thiết lập tính bất biến (Immutability) cho dữ liệu kiểm toán và trục thời gian lịch sử.

**Về mặt thực tiễn và tính khả thi:** Dự án hướng tới xây dựng một ứng dụng web gọn nhẹ nhưng mang lại tác động thị giác mạnh mẽ thông qua các tính năng hiện đại như tự động sinh và quét mã QR trực tiếp qua camera thiết bị , trực quan hóa sơ đồ mạng lưới cung ứng và đường đi của lô hàng trên bản đồ tương tác, cùng giao diện trục thời gian sinh động. Với công nghệ cốt lõi hiện đại (ReactJS, NestJS/ExpressJS, PostgreSQL, Tailwind CSS).

### Xác định đề tài

#### Mục tiêu của đề tài

Mục tiêu tổng quát: Nghiên cứu, thiết kế và cài đặt thành công ứng dụng web "Hệ thống Quản lý chuỗi cung ứng Mini" cho phép số hóa, giám sát và truy xuất nguồn gốc các lô hàng hóa theo thời gian thực từ khâu sản xuất, phân phối cho đến khi tiêu thụ.

**Mục tiêu cụ thể:**

1.  Xây dựng hệ thống cơ sở dữ liệu quan hệ PostgreSQL chuẩn hóa 3NF, sử dụng khóa chính UUID để đảm bảo tính an toàn dữ liệu, bảo mật và sẵn sàng cho việc mở rộng.
2.  Thiết kế và cài đặt các luồng xử lý dữ liệu chặt chẽ cho nghiệp vụ chuyển giao hàng hóa giữa các nút, áp dụng Transaction chặt chẽ nhằm loại bỏ hoàn toàn các lỗi sai lệch kho.
3.  Ứng dụng thành công giải pháp đóng gói dữ liệu và mã hóa thông tin sang mã QR Code gắn liền với từng lô hàng duy nhất.
4.  Xây dựng module công khai không cần xác thực dành cho người tiêu dùng cuối, hỗ trợ quét mã để trả về giao diện Trục thời gian lịch sử (Timeline) trực quan kết hợp bản đồ hiển thị tuyến đường di chuyển của sản phẩm.
5.  Thiết lập hệ thống Nhật ký lịch sử bất biến (Timeline Events) và Nhật ký kiểm toán hệ thống (Audit Logs) dùng cơ chế Append-only ở mức DB-level nhằm phục vụ mục đích kiểm định tính minh bạch thông tin.
6.  Tối ưu hóa mã nguồn, xử lý các kịch bản bất đồng bộ và xung đột dữ liệu đồng thời.

#### Tên đề tài

Tên đầy đủ của đề tài “**Hệ thống Quản lý chuỗi cung ứng Mini**.”

#### Đối tượng nghiên cứu

- **Đơn vị hạt nhân quản lý:** Lô hàng (Batches) – thực thể trung tâm mang thông tin mã lô (batch_code), thông tin sản phẩm, số lượng, ngày sản xuất, hạn sử dụng và trạng thái vòng đời.
- **Các thực thể nút mạng lưới:** Các điểm nút trong chuỗi cung ứng (Nodes) bao gồm Nhà sản xuất (Manufacturer), Đại lý phân phối (Distributor), Nhà bán lẻ/Siêu thị (Retailer), và Kho hàng trung chuyển (Warehouse).
- **Các quy trình dịch chuyển và lưu trữ:** Vận đơn vận chuyển (Shipments) giữa hai nút địa lý , trạng thái tồn kho thực tế (Inventory) tại từng nút tương ứng , và mã QR đại diện (Batch QR Codes).
- **Hành vi và dấu vết hệ thống:** Sự kiện trục thời gian (Timeline Events) , nhật ký hoạt động của người dùng (Audit Logs) , và nhật ký quét mã của người tiêu dùng (Scan Logs).

#### Phạm vi đề tài

**Nội dung nằm trong phạm vi nghiên cứu:**

- _Phạm vi dữ liệu:_ Thiết kế và cài đặt đầy đủ cấu trúc của các thực thể cốt lõi bao gồm tài khoản, vai trò, nút mạng lưới, danh mục sản phẩm, lô hàng, mã QR, vận đơn, tồn kho hiện thời, sự kiện chuỗi cung ứng, nhật ký kiểm toán và dữ liệu phân tích quét mã.
- _Phạm vi quy trình nghiệp vụ:_ Quản lý vòng đời khép kín của lô hàng từ khâu Khởi tạo tại nhà máy (sinh mã vạch công khai và QR code) , luồng Điều chuyển hàng đi (trừ kho nguồn, gán trạng thái vận chuyển) , luồng Xác nhận nhận hàng tại điểm đích (cập nhật trạng thái nhận, cộng kho điểm đến) , luồng Bán ra/Tiêu thụ cuối cùng tại nhà bán lẻ , cho đến nghiệp vụ Quét QR công khai để hiển thị dữ liệu lịch sử và vị trí địa lý của các nút trên bản đồ mà không yêu cầu đăng nhập.

**Nội dung nằm ngoài phạm vi nghiên cứu:**

- Hệ thống không tích hợp sâu với các giải pháp quản trị doanh nghiệp cồng kềnh bên ngoài (ERP bên ngoài), hệ thống thanh toán điện tử phức tạp, hay tự động xuất hóa đơn tài chính (Invoicing).
- Hệ thống không sử dụng các thiết bị phần cứng định vị GPS gắn trực tiếp trên phương tiện vận chuyển theo thời gian thực (Real-time GPS tracking), hành trình di chuyển dựa hoàn toàn trên cơ chế check-in/check-out rời rạc tại từng nút trung chuyển cố định.
- Không đi sâu vào các module phụ trợ của doanh nghiệp như kế toán nội bộ, quản lý nhân sự (HR), quản lý nguồn nguyên liệu thô đầu vào của nhà sản xuất, hay các thủ tục thông quan, xuất nhập khẩu pháp lý.

### Kết luận chương 1

Chương 1 đã phác thảo một cách tổng quan và tường minh về bối cảnh thực tế dẫn đến nhu cầu minh bạch hóa dữ liệu sản phẩm, qua đó khẳng định tính cấp thiết mang tầm thực tiễn của đề tài "Hệ thống Quản lý chuỗi cung ứng Mini". Bằng việc xác định rõ ràng mục tiêu công nghệ, tên gọi chuẩn hóa, các đối tượng thực thể nghiên cứu trọng tâm cùng việc thiết lập ranh giới vận hành rõ ràng, chương này đóng vai trò làm kim chỉ nam và đặt nền móng vững chắc cho việc lựa chọn công nghệ ở Chương 2 và phân tích chi tiết nghiệp vụ hệ thống ở các chương tiếp theo.

## PHƯƠNG PHÁP, CÔNG CỤ SỬ DỤNG

### Công cụ lập trình, phần mềm

#### Visual Studio Code

Hình 1: Biểu tượng VSCode

**Visual Studio Code (VSCode)** là trình soạn thảo mã nguồn nhẹ, miễn phí và mã nguồn mở cực kỳ phổ biến do Microsoft phát triển. Nó được thiết kế để hỗ trợ toàn diện cho các lập trình viên, từ viết code, gỡ lỗi (debug) đến quản lý phiên bản.

**Các đặc điểm nổi bật:**

- **Đa nền tảng:** Chạy mượt mà trên hệ điều hành Windows, Linux và macOS.
- **Hỗ trợ đa ngôn ngữ:** Tích hợp sẵn cho JavaScript, TypeScript, Node.js và có thể mở rộng cho hầu hết mọi ngôn ngữ lập trình khác (Python, C++, Java, PHP, v.v.).
- **Hệ sinh thái Extensions phong phú:** Cung cấp hàng ngàn tiện ích mở rộng (extension) để tùy biến giao diện, thêm công cụ tự động hóa, hỗ trợ AI hoặc thêm các framework chuyên sâu.
- **Tích hợp sẵn Git:** Dễ dàng quản lý mã nguồn, commit, push code lên GitHub hoặc các nền tảng khác ngay trong trình soạn thảo.
- **Tùy biến cao:** Cho phép tạo, lưu và chia sẻ các _Profile_ (cấu hình) khác nhau để phù hợp với từng dự án hoặc ngôn ngữ cụ thể.

#### Window Subsystem For Linux 2 (WSL2)

Hình 2: Biểu tượng WSL2

Windows Subsystem for Linux 2 (WSL2) là một tính năng của Windows cho phép chạy môi trường Linux nguyên bản trực tiếp trên Windows. Nhờ tích hợp sâu với Visual Studio Code, có thể sử dụng giao diện Windows để lập trình trong khi toàn bộ mã nguồn và công cụ được thực thi mượt mà trên môi trường Linux.

Các đặc điểm của WSL2:

- **Bản chất:** WSL2 là một cỗ máy ảo (Virtual Machine) gọn nhẹ, sử dụng nhân (kernel) Linux thực thụ chạy ngầm trên Windows.
- **Khác biệt cốt lõi:** Khác với WSL1 (chỉ dịch các lệnh Linux thành lệnh Windows), WSL2 mang lại tốc độ vượt trội (nhất là khi đọc/ghi file) và hỗ trợ hoàn hảo cho các công cụ như Docker.
- **Hiệu năng cao:** Chạy các lệnh, cài đặt thư viện (npm, pip, composer...) và build ứng dụng nhanh như trên một hệ điều hành Linux thực thụ.
- **Môi trường sát thực tế:** Các ứng dụng web hoặc backend thường được triển khai trên máy chủ Linux. Code trong WSL2 đảm bảo môi trường phát triển của bạn khớp hoàn toàn với môi trường production.
- **Sự tiện lợi tối đa:** Bạn tránh được việc phải dual-boot (cài song song hai hệ điều hành) hoặc sử dụng các phần mềm máy ảo nặng nề như VirtualBox.

### Công nghệ phát triển ứng dụng

#### TypeScript, NestJS

Hình 3: Biểu tượng TypeScript

TypeScript là một ngôn ngữ lập trình mã nguồn mở được phát triển bởi Microsoft, hoạt động như một tập cha (superset) của JavaScript bằng cách bổ sung thêm tùy chọn kiểu tĩnh (static typing). TypeScript giúp phát hiện lỗi ngay từ giai đoạn biên dịch (compile-time) thay vì lúc chạy (run-time), hỗ trợ tự động hoàn thiện mã (auto-complete) tốt hơn trên các môi trường phát triển (IDE), và giúp mã nguồn dễ đọc, dễ bảo trì hơn trong các dự án quy mô lớn.

Hình 4: Biểu tượng NestJS

NestJS là một framework Node.js mã nguồn mở, chuyên dùng để xây dựng các ứng dụng phía máy chủ (backend) hiệu quả và dễ mở rộng. Nó kết hợp hoàn hảo giữa lập trình hướng đối tượng (OOP), lập trình hàm (FP) và lập trình hướng mặt cắt (AOP), sử dụng chủ yếu ngôn ngữ TypeScript.

Tổng quan:

- Nền tảng cốt lõi: Được xây dựng dựa trên Node.js và sử dụng mặc định Express (hoặc Fastify) làm thư viện xử lý HTTP, giúp tận dụng hệ sinh thái thư viện khổng lồ của JavaScript.
- Lấy cảm hứng từ Angular: Cấu trúc ứng dụng của NestJS rất quen thuộc với các lập trình viên Angular. Nó áp dụng triệt để các khái niệm như Modules, Controllers, Providers (Services), và Dependency Injection.
- Hỗ trợ TypeScript: TypeScript giúp phát hiện lỗi từ sớm, tăng tính bảo trì và mở rộng cho các dự án lớn. NestJS cũng hỗ trợ hoàn toàn JavaScript thuần.
- Kiến trúc module hóa: Cho phép tổ chức code gọn gàng thành các module độc lập, dễ dàng chia sẻ, tái sử dụng và kiểm thử (testing).

#### ReactJS, Tailwind CSS

Hình 5: Biểu tượng Tailwind CSS và ReactJS

ReactJS: Là một thư viện JavaScript mã nguồn mở được Meta phát triển, chuyên dùng để xây dựng giao diện người dùng (User Interface). React nổi bật với kiến trúc hướng thành phần (Component-based), cho phép chia nhỏ UI thành các phần độc lập có thể tái sử dụng. Cơ chế Virtual DOM của React giúp tối ưu hóa quá trình cập nhật giao diện, mang lại trải nghiệm mượt mà, đặc biệt phù hợp cho các ứng dụng một trang (Single Page Application - SPA).

Tailwind CSS: Là một framework CSS theo hướng tiện ích (Utility-first). Thay vì viết các file CSS tùy chỉnh phức tạp, Tailwind cung cấp sẵn các lớp (classes) linh hoạt (như flex, p-4, text-center) để người lập trình áp dụng trực tiếp vào thẻ HTML. Điều này giúp đẩy nhanh tốc độ thiết kế, đảm bảo tính nhất quán (design system) và dễ dàng tạo ra các giao diện đáp ứng (responsive) trên nhiều thiết bị.

Vai trò kết hợp: ReactJS đảm nhiệm việc xử lý logic giao diện và quản lý trạng thái, trong khi Tailwind CSS giải quyết bài toán định dạng (styling) trực quan và nhanh chóng. Cặp công nghệ này là lựa chọn lý tưởng để xây dựng các Dashboard quản trị trực quan hoặc các giao diện truy xuất thông tin yêu cầu tính thẩm mỹ và tốc độ cao.

#### PostgreSQL

Hình 6: Biểu tượng PostgreSQL

PostgreSQL: Là một hệ quản trị cơ sở dữ liệu quan hệ khách-chủ (RDBMS) mã nguồn mở tiên tiến và mạnh mẽ. Khác với các hệ thống NoSQL, PostgreSQL tuân thủ nghiêm ngặt các tiêu chuẩn SQL và tính chất ACID (Atomicity, Consistency, Isolation, Durability) trong xử lý giao dịch.

Đặc điểm nổi bật: PostgreSQL hỗ trợ mạnh mẽ các kiểu dữ liệu phức tạp (như JSONB, UUID), cho phép tạo các ràng buộc dữ liệu (Constraints) chặt chẽ ở mức cơ sở dữ liệu, và hỗ trợ tốt các kỹ thuật khóa (Locking) để xử lý tranh chấp dữ liệu đồng thời (Concurrency).

Vai trò: Đây là "xương sống" cho các hệ thống đòi hỏi tính toàn vẹn dữ liệu tuyệt đối (như quản lý luân chuyển kho, lưu vết lịch sử kiểm toán), đảm bảo không xảy ra tình trạng mất mát, sai lệch thông tin hay tồn kho âm trong quá trình hệ thống vận hành đa tác nhân.

#### Git và Github

Hình 7: Biểu tượng Git và Github

Git: Là một hệ thống quản lý phiên bản phân tán (Distributed Version Control System) mã nguồn mở, hoạt động chủ yếu ở môi trường cục bộ (local) trên máy tính của lập trình viên. Git cho phép ghi nhận chi tiết lịch sử từng thay đổi của mã nguồn, hỗ trợ tạo nhánh (branching) để phát triển các tính năng mới một cách độc lập mà không làm ảnh hưởng đến mã nguồn chính. Cấu trúc của Git giúp các nhà phát triển dễ dàng theo dõi, hợp nhất (merging) mã nguồn và xử lý xung đột (conflict) một cách an toàn.

GitHub: Là một nền tảng dịch vụ lưu trữ trực tuyến trên nền tảng đám mây (cloud-based) dành riêng cho các dự án sử dụng Git. Không chỉ cung cấp không gian lưu trữ mã nguồn từ xa (remote repository), GitHub còn mở rộng sức mạnh của Git bằng việc cung cấp các công cụ quản lý cộng tác nhóm chuyên sâu như: theo dõi lỗi và tác vụ (Issues), quy trình đề xuất và đánh giá mã nguồn (Pull Requests), và hệ thống tự động hóa tích hợp/triển khai liên tục (GitHub Actions).

Vai trò kết hợp: Trong dự án thực tế, Git đóng vai trò là động cơ cốt lõi kiểm soát phiên bản tại máy cá nhân, còn GitHub là trung tâm điều phối mạng lưới mã nguồn của toàn đội nhóm. Sự kết hợp này giúp đồng bộ hóa tiến độ công việc giữa các thành viên, cho phép khôi phục lại các phiên bản ổn định khi có sự cố, đồng thời là nền tảng bắt buộc để vận hành các quy trình CI/CD chuyên nghiệp.

### Công cụ thiết kế đồ họa

#### Draw.io

Hình 8: Biểu tượng draw.io

Draw.io là một nền tảng thiết kế sơ đồ mã nguồn mở và hoàn toàn miễn phí. Công cụ này hỗ trợ đắc lực trong việc phác thảo đa dạng các loại biểu đồ kỹ thuật như flowchart, UML, ERD, sơ đồ kiến trúc phần mềm, mạng lưới và cấu trúc tổ chức. Người dùng có thể linh hoạt sử dụng phiên bản web trực tiếp trên trình duyệt hoặc cài đặt ứng dụng desktop.

Điểm cộng lớn của draw.io là giao diện kéo-thả trực quan, đi kèm thư viện icon khổng lồ dành riêng cho các hệ thống lớn như AWS, Azure, GCP hay Kubernetes. Ngoài khả năng tùy biến mạnh mẽ về màu sắc, font chữ và định dạng xuất file (PNG, PDF, SVG, XML...), công cụ này còn liên kết chặt chẽ với Google Drive, OneDrive, GitHub và Dropbox, giúp tối ưu hóa quy trình lưu trữ và làm việc nhóm. Nhờ tính tiện lợi, không cần đăng ký tài khoản, đây là giải pháp tối ưu cho cả sinh viên lẫn các kỹ sư, kiến trúc sư hệ thống.

#### Figma

Hình 9: Biểu tượng Figma

Figma là nền tảng điện toán đám mây chuyên dụng cho thiết kế giao diện và trải nghiệm người dùng (UI/UX), được ứng dụng rộng rãi bởi các designer, kỹ sư phần mềm và doanh nghiệp toàn cầu. Điểm mạnh cốt lõi của Figma là vận hành trực tiếp trên trình duyệt, loại bỏ sự phụ thuộc vào việc cài đặt phần mềm phức tạp.

Nền tảng này tối ưu hóa quy trình làm việc nhóm nhờ tính năng cộng tác theo thời gian thực (real-time), cho phép nhiều nhân sự cùng chỉnh sửa đồng thời và quản lý lịch sử phiên bản một cách chặt chẽ. Bên cạnh đó, Figma sở hữu hệ sinh thái tính năng mạnh mẽ: từ tạo prototype tương tác, thiết kế linh hoạt (responsive) đa màn hình, đến kho plugin phong phú giúp tự động hóa tác vụ. Với khả năng xuất file đa dạng và tối ưu hóa bàn giao (hand-off) cho lập trình viên, Figma là giải pháp toàn diện giúp các tổ chức từ startup đến tập đoàn lớn tăng tốc quy trình phát triển sản phẩm.

### Công cụ quản lý công việc

#### Notion

Hình 10: Biểu tượng Notion

Notion là một nền tảng không gian làm việc "tất cả trong một" (all-in-one workspace) được ứng dụng rộng rãi trong quy trình phát triển phần mềm hiện đại. Thay vì phải sử dụng nhiều ứng dụng rời rạc cho việc ghi chú, theo dõi dự án và lưu trữ tài liệu, Notion tích hợp toàn bộ các tính năng này vào một nền tảng duy nhất, hoạt động dựa trên cấu trúc các khối nội dung (blocks) vô cùng linh hoạt.

Sức mạnh cốt lõi của Notion nằm ở hệ thống Cơ sở dữ liệu (Database) tùy biến cao. Người dùng có thể thiết lập một tập dữ liệu nhưng hiển thị dưới nhiều góc nhìn (views) khác nhau như: bảng trạng thái Kanban (Kanban board) để quản lý luồng công việc, danh sách (List), hoặc trục thời gian (Timeline) để quản lý thời hạn (deadlines). Bên cạnh đó, Notion hỗ trợ định dạng Markdown và hiển thị mã nguồn (code snippets) rất trực quan, kết hợp cùng khả năng đồng bộ theo thời gian thực (real-time collaboration) giữa nhiều người dùng.

### Kết luận chương 2

Chương 2 đã trình bày chi tiết về hệ sinh thái các công nghệ, nền tảng và công cụ được nhóm lựa chọn để phát triển "Hệ thống Quản lý chuỗi cung ứng Mini". Bằng việc kết hợp ngôn ngữ TypeScript với framework NestJS cho tầng xử lý nghiệp vụ (Backend), thư viện ReactJS và Tailwind CSS cho tầng giao diện người dùng (Frontend), cùng hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ PostgreSQL, hệ thống được đảm bảo về cả hiệu năng, tính toàn vẹn dữ liệu lẫn trải nghiệm người dùng hiện đại.

Bên cạnh đó, việc áp dụng nghiêm ngặt hệ thống quản lý phiên bản Git/GitHub và công cụ điều phối dự án Notion đã giúp tối ưu hóa quy trình làm việc nhóm, đảm bảo tính đồng bộ trong một khoảng thời gian phát triển giới hạn. Việc thiết lập thành công một nền tảng kỹ thuật vững chắc và lựa chọn các công cụ phù hợp chính là tiền đề quan trọng, tạo cơ sở để nhóm tiến hành các bước khảo sát, phân tích hệ thống và đặc tả các luồng nghiệp vụ cốt lõi sẽ được trình bày chi tiết trong Chương 3.

## KHẢO SÁT, PHÂN TÍCH

### Khảo sát thực tế và phân tích hệ thống

#### Khảo sát thực tế hoạt động quản lý chuỗi cung ứng

Hiện nay, các doanh nghiệp vừa và nhỏ (SMEs) tại Việt Nam đóng vai trò quan trọng trong các ngành hàng như thực phẩm sạch, mỹ phẩm thiên nhiên và dược phẩm. Tuy nhiên, qua khảo sát thực tế, phần lớn các đơn vị này vẫn vận hành chuỗi cung ứng dựa trên các phương thức truyền thống mang tính rời rạc.

Mô hình vận hành và các mắt xích chính: Chuỗi cung ứng thường bao gồm 05 chủ thể chính: (1) Nhà sản xuất, (2) Kho trung tâm, (3) Đơn vị vận chuyển, (4) Nhà bán lẻ và (5) Người tiêu dùng. Quy trình luân chuyển hàng hóa bắt đầu từ việc đóng gói sản phẩm theo lô (Batch), nhập kho, điều phối vận chuyển đến các đại lý và cuối cùng là tới tay khách hàng.

Thực trạng quản lý hiện tại: Khảo sát tại một số doanh nghiệp cung ứng thực phẩm đóng gói và mỹ phẩm tại TP.HCM cho thấy:

- Công cụ lưu trữ: Hơn 70% doanh nghiệp vẫn sử dụng Microsoft Excel làm công cụ quản lý chính. Các giao dịch nhập-xuất và lu chuyển nội bộ được ghi chép thủ công qua sổ ghi chép hoặc hóa đơn giấy.
- Kênh tương tác: Việc xác nhận đơn hàng, điều phối xe tải và báo cáo tình trạng hàng hóa chủ yếu thực hiện qua điện thoại hoặc các ứng dụng nhắn tin (Zalo, Messenger), dẫn đến dữ liệu không có tính cấu trúc và khó tra cứu lại.
- Thiếu tracking real-time: Doanh nghiệp thường chỉ biết hàng đã rời kho nhưng không nắm bắt được vị trí chính xác hoặc trạng thái thực tế của lô hàng trong quá trình vận chuyển cho đến khi có xác nhận bằng văn bản từ điểm đích.

Số liệu tham khảo từ thực tiễn:

- Sai lệch tồn kho: Tỷ lệ sai lệch giữa số liệu trên file Excel và thực tế tại kho thường dao động từ 8% - 12%.
- Thất lạc hàng hóa: Tỷ lệ thất thoát hoặc hư hỏng không rõ nguyên nhân chiếm khoảng 2% - 3% tổng giá trị lô hàng.
- Thời gian kiểm kê: Một doanh nghiệp có khoảng 500 SKU thường mất từ 2-3 ngày để hoàn thành một đợt kiểm kê thủ công toàn diện.

Hậu quả của việc quản lý lỏng lẻo này là sự xuất hiện của hàng giả, hàng kém chất lượng trà trộn vào chuỗi phân phối. Khi có sự cố về chất lượng sản phẩm (ví dụ: một lô thực phẩm bị biến chất), doanh nghiệp mất rất nhiều thời gian để xác định phạm vi ảnh hưởng, gây mất niềm tin nghiêm trọng với khách hàng và thiệt hại về thương hiệu.

### Phân tích các vấn đề tồn tại

Dưới góc độ phân tích hệ thống, các vấn đề tồn tại trong quy trình hiện nay không chỉ là sự thiếu hụt về công cụ mà còn là sự đứt gãy về dòng chảy thông tin.

#### Thiếu minh bạch nguồn gốc sản phẩm

Hầu hết sản phẩm hiện nay chỉ có nhãn mác thông thường, thiếu mã định danh duy nhất cho từng lô hàng (Batch ID). Người tiêu dùng và ngay cả các đại lý bán lẻ cũng không có công cụ để tự kiểm tra hành trình của sản phẩm. Điều này tạo kẽ hở cho hàng giả và hàng không rõ nguồn gốc xâm nhập.

#### Khó truy vết khi xảy ra sự cố

Nguyên nhân cốt lõi là do thiếu sự liên kết dữ liệu giữa các mắt xích. Khi một lô dược phẩm được báo cáo có lỗi sản xuất, việc truy tìm xem lô đó đã xuất cho đại lý nào, còn tồn bao nhiêu và đang trên xe vận chuyển nào là một quá trình tốn kém thời gian. Hệ quả là việc thu hồi sản phẩm diễn ra chậm chạp, không triệt để.

#### Dữ liệu phân tán và thiếu tính tức thời

Dữ liệu nằm rải rác ở các file Excel cá nhân hoặc các mẩu tin nhắn rời rạc. Khi nhà quản lý cần một báo cáo tổng quát về tình hình tồn kho trên toàn chuỗi, nhân viên phải mất nhiều giờ để tổng hợp thủ công. Sự chậm trễ này dẫn đến các quyết định kinh doanh sai lệch, ví dụ như tiếp tục sản xuất trong khi hàng tồn kho tại đại lý vẫn còn cao.

#### Không kiểm soát được biến động tồn kho theo thời gian thực

Việc cập nhật số liệu "offline" khiến doanh nghiệp luôn đối mặt với tình trạng "tồn kho ảo". Hàng có thể đã xuất kho nhưng trên hệ thống vẫn hiển thị còn hàng, hoặc ngược lại. Điều này ảnh hưởng trực tiếp đến khả năng đáp ứng đơn hàng và uy tín của doanh nghiệp.

#### Khó phát hiện thất lạc và gian lận nội bộ

Do không có sự đối soát chặt chẽ giữa các khâu (ví dụ: kho xuất 100 nhưng vận chuyển chỉ nhận 98), các hành vi gian lận hoặc thất thoát hàng hóa thường bị bỏ qua hoặc chỉ được phát hiện sau một thời gian dài.

####  Thiếu cơ chế Audit và lịch sử thay đổi 

Trong các bảng tính Excel, bất kỳ ai có quyền truy cập đều có thể chỉnh sửa số liệu mà không để lại dấu vết. Việc thiếu lịch sử ghi nhận (Ai đã sửa? Sửa lúc nào? Nội dung cũ là gì?) khiến cho việc quy trách nhiệm khi xảy ra sai sót trở nên bất khả thi.

### Khảo sát nhu cầu hệ thống

Dựa trên những khó khăn thực tế, doanh nghiệp cần một hệ thống công nghệ thông tin tập trung, tối giản nhưng hiệu quả cao. Nhu cầu thực tế được cụ thể hóa như sau:

- Quản lý Batch/Lô hàng: Mục tiêu là định danh duy nhất cho mỗi đợt sản xuất/nhập hàng. Giá trị mang lại là khả năng quản trị hàng hóa theo đơn vị lô, hỗ trợ quản lý hạn sử dụng và chiến lược xuất kho hiệu quả (FIFO/FEFO).
- Truy xuất nguồn gốc qua QR Code: Cần một cơ chế quét mã nhanh để truy xuất thông tin sản phẩm. Điều này giúp nhân viên kho thao tác nhanh hơn và giúp khách hàng kiểm tra tính xác thực của sản phẩm tức thì qua điện thoại thông minh.
- Theo dõi dòng thời gian: Hệ thống cần ghi nhận mọi điểm chạm (Touchpoints) của lô hàng: từ lúc sản xuất -> nhập kho -> xuất kho -> vận chuyển -> giao hàng thành công. Mỗi sự kiện phải gắn liền với mốc thời gian và đối tác thực hiện.
- Quản lý sự cố: Nhu cầu ghi nhận các phản hồi hoặc hư hỏng ngay khi phát hiện trên chuỗi. Điều này giúp doanh nghiệp có dữ liệu để đánh giá chất lượng của đơn vị vận chuyển hoặc nhà cung cấp.
- Cơ chế Audit Log: Mọi hành động nhạy cảm như thay đổi trạng thái lô hàng, cập nhật số lượng tồn kho đều phải được hệ thống lưu trữ lịch sử bất biến để phục vụ công tác kiểm tra, giám sát.
- Dashboard thống kê: Cung cấp cái nhìn trực quan về tỷ lệ hàng tồn, tốc độ luân chuyển và các sự cố phát sinh, giúp nhà quản lý điều hành dựa trên dữ liệu thực tế thay vì cảm tính.

### Phân tích giải pháp hệ thống đề xuất

Giải pháp xây dựng hệ thống "Mini Supply Chain Traceability System" được đề xuất dựa trên các tiêu chí: gọn nhẹ, minh bạch và dễ triển khai.

Cấu trúc và công nghệ đề xuất:

- Web Application: Lựa chọn nền tảng Web giúp hệ thống có thể truy cập mọi lúc, mọi nơi trên nhiều thiết bị (PC, Smartphone, Tablet) mà không cần cài đặt phức tạp, phù hợp với môi trường kho bãi và vận chuyển linh hoạt.
- Mã QR: Đây là "chìa khóa" để liên kết hàng hóa vật lý với dữ liệu số. Mỗi lô hàng khi khởi tạo sẽ được cấp một QR Code định danh duy nhất. Thao tác quét mã sẽ kích hoạt các sự kiện trong Timeline.
- Mô hình Timeline & Audit Log: Thay vì chỉ lưu trạng thái hiện tại, hệ thống lưu trữ theo mô hình sự kiện (Event-driven). Điều này tạo ra một "cuốn sổ cái" minh bạch về hành trình hàng hóa, đảm bảo dữ liệu không bị thay đổi tùy tiện.
- Quản lý trạng thái: Lô hàng sẽ đi qua các trạng thái được định nghĩa chặt chẽ (CREATED, IN_TRANSIT, RECEIVED, SOLD, DELAYED,…). Việc chuyển trạng thái yêu cầu quyền hạn tương ứng (RBAC).
- Phân quyền (RBAC): Hệ thống phân tách rõ rệt vai trò của Admin, Manufacturer, Distributor, Retailer, Consumer. Điều này không chỉ bảo mật dữ liệu mà còn đảm bảo tính trách nhiệm trong mỗi thao tác.

Tính khả thi và thực tiễn: Giải pháp này có tính khả thi kỹ thuật cao vì không yêu cầu hạ tầng phần cứng đắt tiền. Tính minh bạch được đảm bảo qua việc chuẩn hóa quy trình nhập liệu và xuất dữ liệu. Đặc biệt, khả năng mở rộng của hệ thống cho phép tích hợp các công nghệ như cảm biến IoT hoặc Blockchain trong tương lai khi doanh nghiệp phát triển quy mô lớn hơn.

### Phân tích quy trình nghiệp vụ

Hệ thống Mini Supply Chain Traceability được thiết kế để bao quát và quản lý toàn bộ vòng đời của một lô hàng (Batch) sản phẩm, tính từ thời điểm lô hàng được khởi tạo tại Nhà sản xuất (Manufacturer), trải qua quá trình vận chuyển qua các trạm trung gian như Đại lý phân phối (Distributor) và Nhà bán lẻ (Retailer), cho đến khi sản phẩm đến tay Người tiêu dùng cuối (Consumer).

Điểm nổi bật của hệ thống không chỉ nằm ở việc theo dõi luồng đi thuận lợi của hàng hóa, mà còn ở việc tích hợp một phân hệ Quản lý sự cố (Incident Management) toàn diện. Phân hệ này có nhiệm vụ xử lí toàn bộ các tình huống bất thường phát sinh trong chuỗi cung ứng thực tế, điển hình như: hàng hóa bị trễ hạn giao, thất lạc, hư hỏng trong quá trình vận chuyển hoặc các dấu hiệu gian lận dữ liệu. Bằng cách số hóa mọi "điểm chạm", hệ thống đảm bảo tính minh bạch, toàn vẹn dữ liệu và khả năng truy xuất nguồn gốc chính xác tuyệt đối.

#### Vòng đời của một lô hàng

Vòng đời của một lô hàng trong hệ thống được định nghĩa và kiểm soát nghiêm ngặt thông qua một cỗ máy trạng thái (Batch Lifecycle State Machine) mở rộng. Cỗ máy trạng thái này quy định rõ các mốc mà một lô hàng phải đi qua, ai là người có quyền kích hoạt, và tính chất của từng trạng thái:

|     |     |
| --- | --- |
| TRẠNG THÁI | MÔ TẢ |
| CREATED (Khởi tạo) | Đây là trạng thái đầu tiên, được kích hoạt bởi tác nhân Manufacturer khi tiến hành tạo một lô hàng mới. Trạng thái này không thể bị hoàn tác (không revertible) và lô hàng sẽ chuyển sang trạng thái IN_TRANSIT khi bắt đầu được giao đi. |
| IN_TRANSIT (Đang vận chuyển) | Trạng thái này xuất hiện khi Manufacturer hoặc Distributor thực hiện tạo vận đơn luân chuyển hàng hóa (Transfer Shipment). Từ đây, hệ thống sẽ chờ lô hàng được xác nhận nhận hàng (RECEIVED) hoặc tự động chuyển sang trạng thái trễ hạn (DELAYED) nếu quá thời gian quy định. |
| RECEIVED (Đã nhận) | Kích hoạt khi Distributor hoặc Retailer thao tác xác nhận đã nhận hàng thành công tại cơ sở của mình. Lô hàng sau đó có thể tiếp tục được xuất đi (quay lại IN_TRANSIT) nếu người nhận là Distributor |
| SOLD (Đã bán) | Đây là một trạng thái kết thúc (Terminal state), được Retailer kích hoạt khi đánh dấu lô hàng đã được bán ra cho người tiêu dùng. Trạng thái này đánh dấu việc hoàn thành vòng đời thương mại của sản phẩm và không thể hoàn tác. |
| DELAYED (Trễ hạn) | Trạng thái cảnh báo tự động được Hệ thống (System Cron job) kích hoạt khi lô hàng nằm ở trạng thái IN_TRANSIT vượt quá 48 giờ mà chưa có xác nhận nhận hàng. Từ trạng thái này, lô hàng có thể tiếp tục hành trình (IN_TRANSIT) nếu vấn đề được giải quyết, hoặc bị đưa vào diện điều tra (INVESTIGATING). |
| INVESTIGATING (Đang điều tra) | Chỉ có Admin mới có quyền chuyển lô hàng sang trạng thái này khi quyết định mở hồ sơ điều tra sự cố. Kết quả của quá trình điều tra sẽ quyết định lô hàng được tìm thấy (RECEIVED), thực sự bị mất (LOST), hoặc lệnh vận chuyển bị hủy bỏ (CANCELLED). |
| LOST (Thất lạc) | Trạng thái kết thúc (Terminal) khi sự cố mất hàng được xác nhận. Để đảm bảo tính bảo mật, hành động này yêu cầu sự phê duyệt của hai Admin độc lập (Two-Man approver). Ngay khi xác nhận, hệ thống sẽ thực hiện Rollback kho, trả lại số lượng hàng hóa về kho xuất phát. |
| DISCARDED (Loại bỏ) | Trạng thái kết thúc khi Admin quyết định hủy bỏ lô hàng ra khỏi hệ thống kinh doanh vì các lý do đặc biệt. |

#### Luồng luân chuyển hàng hóa

Luồng luân chuyển hàng hóa (End-to-End Business Flow) mô tả cách thức các tác nhân tương tác với hệ thống để di chuyển lô hàng từ đầu đến cuối chuỗi cung ứng. Luồng này được chia làm hai phần chính: luồng vận hành tiêu chuẩn và luồng xử lý sự cố bất thường.

1.  **Luồng vận hành tiêu chuẩn:**

|     |     |
| --- | --- |
| CÁC BƯỚC | MÔ TẢ |
| Bước 1 - Khởi tạo | Tại nhà máy, Manufacturer tiến hành tạo lô hàng mới (Create Batch). Hệ thống tự động sinh ra mã batch_code duy nhất cùng mã QR tương ứng, thực hiện lệnh INSERT dữ liệu vào bảng lô hàng và bảng tồn kho. Lô hàng chính thức có trạng thái CREATED. |
| Bước 2 - Xuất kho lần đầu | Manufacturer thực hiện tạo vận đơn (Transfer Shipment) để chuyển hàng cho đại lý. Hệ thống ngay lập tức kiểm tra (validate) số lượng tồn kho hợp lệ, trừ số lượng tương ứng ở kho nguồn và tạo bản ghi shipment. Trạng thái lô hàng chuyển thành IN_TRANSIT. |
| Bước 3 - Đại lý nhận hàng | Distributor tiến hành xác nhận đã nhận hàng (Receive Shipment). Hệ thống cập nhật trạng thái vận đơn thành RECEIVED và cộng số lượng hàng vào tồn kho của Distributor. |
| Bước 4 - Phân phối đến điểm bán lẻ | Distributor tiếp tục luân chuyển hàng hóa đến Retailer. Quá trình này lặp lại thao tác kiểm tra tồn kho, trừ kho Distributor và tạo vận đơn mới với trạng thái IN_TRANSIT. |
| Bước 5 - Điểm bán lẻ nhận hàng | Retailer xác nhận nhận hàng thành công. Hệ thống cập nhật vận đơn và cộng số lượng hàng vào kho của Retailer, trạng thái lô hàng cập nhật là RECEIVED. |
| Bước 6 - Tiêu thụ sản phẩm | Khi sản phẩm được bán cho người tiêu dùng, Retailer đánh dấu hoàn tất (Mark as Sold). Hệ thống cập nhật trạng thái lô hàng thành SOLD. |
| Bước 7 - Truy xuất nguồn gốc | Xuyên suốt vòng đời hoặc sau khi mua hàng, Consumer có thể quét mã QR (Scan QR / Trace) để xem toàn bộ lịch sử luân chuyển. Thao tác này chỉ có quyền Đọc (READ only) và hệ thống sẽ tự động ghi nhận lại sự kiện quét mã này (log scan event). |

1.  **Luồng xử lý sự cố:**

Trong quá trình luân chuyển (Bước 2 hoặc Bước 4), nếu xảy ra rủi ro, hệ thống sẽ kích hoạt các bước sau:

|     |     |
| --- | --- |
| CÁC BƯỚC | MÔ TẢ |
| Bước 8 - Phát hiện trễ hạn tự động | Một tiến trình ngầm của hệ thống (System Cron) liên tục giám sát các vận đơn. Nếu phát hiện trạng thái IN_TRANSIT kéo dài quá 48 giờ, hệ thống tự động cắm cờ (flag), thêm dữ liệu vào bảng và chuyển trạng thái lô hàng thành DELAYED. |
| Bước 9 - Mở hồ sơ điều tra | Khi nhận được cảnh báo, Admin can thiệp bằng cách mở điều tra (Open Investigation). Hệ thống tiến hành tạo báo cáo sự cố đóng băng tồn kho liên quan và đổi trạng thái thành INVESTIGATING. |
| Bước 10 - Xác nhận thất lạc | Nếu kết quả điều tra cho thấy hàng đã mất, hai Admin độc lập (Admin x2) phải cùng thực hiện xác nhận LOST (Two-man approval). Ngay sau đó, hệ thống thực hiện Rollback: cộng lại số lượng hàng bị mất vào kho xuất phát ban đầu và ghi nhận điều chỉnh này vào bảng lịch sử kho, trạng thái cuối cùng là LOST. |

### Xác định các actor

#### Danh sách các actor

Hệ thống xác định cấu trúc bao gồm 05 actor chính tham gia tác động và vận hành dữ liệu, được mô tả chi tiết dưới đây:

|     |     |     |
| --- | --- | --- |
| Tác nhân | Mô tả | Vai trò cốt lõi |
| Quản trị viên hệ thống (Admin) | Tác nhân có quyền hạn tối cao trong phạm vi phần mềm, đại diện cho tổ chức điều hành hoặc ban kiểm soát tổng thể toàn chuỗi cung ứng. | Thực hiện cấu hình hệ thống lưới địa lý, khởi tạo dữ liệu nền (Master Data) bao gồm việc thêm mới các loại sản phẩm và thiết lập các nút mạng lưới kèm theo tọa độ. Đặc biệt, trong phân hệ quản lý sự cố, Admin giữ vai trò độc quyền trong việc mở hồ sơ điều tra biến động bất thường (INVESTIGATING) và phê duyệt xác nhận trạng thái thất lạc hàng hóa (LOST) theo cơ chế bảo mật nghiêm ngặt |
| Nhà sản xuất (Manufacturer) | Tác nhân đại diện cho nhân viên bộ phận quản lý kho thành phẩm hoặc điều phối sản xuất tại các Nhà máy – điểm nút khởi nguồn của chuỗi cung ứng. | Kích hoạt vòng đời đầu tiên của hàng hóa thông qua chức năng tạo lô hàng mới (Create Batch). Tác nhân này chịu trách nhiệm khai báo các thuộc tính sản xuất, tiếp nhận mã định danh lô hàng duy nhất (Batch ID) và mã QR tương ứng từ hệ thống. Đồng thời, Manufacturer là thực thể duy nhất có quyền tạo vận đơn luân chuyển đầu tiên (Transfer Shipment) để xuất kho gửi hàng tới các đại lý phân phối trung gian. |
| Đại lý phân phối (Distributor) | Tác nhân đại diện cho nhân viên quản lý vận hành tại các nút trung chuyển, tổng kho hoặc trung tâm phân phối khu vực (Tier-2 Node). | Đóng vai trò cầu nối luân chuyển hàng hóa đại trà. Khi xe tải từ nhà máy đến, Distributor thực hiện quét mã QR để xác nhận nhập kho (Receive Shipment), hệ thống sẽ tự động cộng số lượng vào tồn kho riêng của đại lý. Sau đó, khi có yêu cầu phân phối từ thị trường, Distributor sử dụng quyền hạn của mình để tạo vận đơn điều chuyển tiếp theo (Transfer Shipment) nhằm xuất kho và chuyển hàng hóa tới các điểm bán lẻ. Tác nhân này không có quyền bán hàng trực tiếp cho người tiêu dùng hoặc khởi tạo một lô hàng mới. |
| Nhà bán lẻ (Retailer) | Tác nhân đại diện cho nhân viên trực kho hoặc nhân viên thu ngân tại các điểm bán hàng cuối chuỗi như siêu thị, cửa hàng tiện lợi hoặc đại lý bán lẻ (Tier-3 Node). | Đóng vai trò là điểm chạm vật lý cuối cùng của chuỗi cung ứng trước khi sản phẩm ra thị trường. Retailer thực hiện quét mã QR để xác nhận nhận hàng từ Vận đơn của Đại lý phân phối gửi đến, cập nhật tồn kho tại điểm bán lẻ. Khi sản phẩm được tiêu thụ, Retailer kích hoạt chức năng Đánh dấu đã bán (Mark as Sold), chính thức chuyển đổi trạng thái lô hàng sang trạng thái kết thúc vòng đời thương mại. Retailer hoàn toàn bị chặn quyền khởi tạo mã lô hàng hoặc tạo vận đơn luân chuyển quy mô lớn. |
| Người tiêu dùng cuối (Consumer) | Tác nhân vãng lai nằm ngoài tổ chức, đại diện cho khách hàng mua sắm sản phẩm hoặc các kiểm toán viên độc lập cần kiểm chứng nguồn gốc thông tin. | Truy cập hệ thống thông qua giao diện công khai (Public Client) mà không yêu cầu bất kỳ thủ tục đăng nhập hay xác thực nào (No Authentication). Tác nhân này sử dụng camera thiết bị để quét mã QR dán trên bao bì sản phẩm, kích hoạt quyền Đọc duy nhất (Read-only) để hệ thống kết xuất và hiển thị trực quan toàn bộ Trục thời gian lịch sử (Timeline) và sơ đồ luồng dịch chuyển địa lý của lô hàng. |
| Hệ thống tự động (System / Cron Job) | Tác nhân phi con người (System Actor), vận hành dưới dạng các tiến trình bất đồng bộ được lập lịch chạy ngầm định kỳ theo chu kỳ thời gian thực ở tầng máy chủ. | Đóng vai trò là giám sát viên tự động đối với các rủi ro vận chuyển. Tiến trình này liên tục quét tập dữ liệu vận đơn đang lưu chuyển, nếu phát hiện bất kỳ vận đơn nào duy trì trạng thái IN_TRANSIT vượt quá ngưỡng thời gian quy định (ví dụ: 48 giờ) mà chưa có xác nhận từ người nhận, hệ thống sẽ tự động can thiệp cập nhật trạng thái lô hàng sang trễ hạn (DELAYED) và chuyển thông tin cảnh báo sang phân hệ quản lý sự cố của Admin. |

### Mô tả nghiệp vụ hệ thống

- **Danh sách các usecase của toàn bộ hệ thống**

|     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
| **Nhóm** | **UC-ID** | **Tên Use Case** | **Actor chính** | **Module** | **Priority** | **Loại** |
| A – Dùng chung | UC-01 | Login / Logout | All actors | Auth | MUST | Core |
| A – Dùng chung | UC-04 | View Batch Detail | Admin, Mfr, Dist, Retail | Batch | MUST | Core |
| A – Dùng chung | UC-08 | Scan QR Code | All + Consumer | QR  | MUST | Core |
| A – Dùng chung | UC-09 | Trace Timeline | All + Consumer | Traceability | MUST | Core |
| A – Dùng chung | UC-10 | View Inventory Dashboard | All authenticated | Dashboard | MUST | Core |
| B – Admin | UC-02 | Manage Nodes (CRUD) | Admin | Node Mgmt | MUST | Core |
| B – Admin | UC-11 | View Map – Node Locations | Admin | Map | SHOULD | Enhanced |
| B – Admin | UC-12 | Manage Users | Admin | User Mgmt | SHOULD | Support |
| B – Admin | UC-13 | View Audit Log | Admin | Audit | SHOULD | Support |
| B – Admin | UC-14 | Export Report | Admin, Manufacturer | Report | COULD | Enhanced |
| B – Admin | UC-16 | Lost & Incident Management | Admin, System | Incident | MUST | Core |
| C – Manufacturer | UC-03 | Create Batch | Manufacturer | Batch | MUST | Core |
| C – Manufacturer | UC-05 | Generate & Print QR Code | Manufacturer | QR  | MUST | Core |
| D – Transfer | UC-06/17 | Manufacturer Transfer Shipment | Manufacturer | Shipment | MUST | Core |
| D – Transfer | UC-18 | Distributor Transfer Shipment | Distributor | Shipment | MUST | Core |
| E – Receive | UC-07/19 | Distributor Receive Shipment | Distributor | Shipment | MUST | Core |
| E – Receive | UC-20 | Retailer Receive Shipment | Retailer | Shipment | MUST | Core |
| F – Retailer | UC-15 | Mark Batch as Sold/Consumed | Retailer | Batch | MUST | Core |

#### Nghiệp vụ chung của các actor

##### Danh sách các usecase

Các Use Case sau được nhiều Actor cùng sử dụng. Đặc tả một lần, áp dụng cho tất cả vai trò liên quan.

##### Đặc tả các usecase

- **UC-01: Login / Logout**

|     |     |
| --- | --- |
| **Use Case ID** | UC-01 |
| **Tên Use Case** | Đăng nhập / Đăng xuất (Login / Logout) |
| **Actor chính** | Admin, Manufacturer, Distributor, Retailer (tất cả người dùng có tài khoản) |
| **Actor phụ** | System (JWT signing, audit log) |
| **Mô tả** | Actor xác thực vào hệ thống bằng email + mật khẩu, nhận JWT token. Logout hủy session phía client và ghi audit log. |
| **Tiền điều kiện** | Tài khoản đã tồn tại trong hệ thống và is_active = TRUE. |
| **Hậu điều kiện (Login)** | Actor nhận JWT token hợp lệ, được redirect đến Dashboard theo role. Audit log ghi nhận action=LOGIN. |
| **Hậu điều kiện (Logout)** | Token bị xóa khỏi client. Audit log ghi nhận action=LOGOUT. |
| **Priority** | MUST HAVE – Foundation của toàn bộ hệ thống |
| **API Endpoint** | POST /auth/login \| POST /auth/logout \| GET /auth/me |

**Luồng chính – Login:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Actor | Mở trang Login, nhập email + password | Hiển thị form Login với validation client-side |     |
| 2   | Actor | Submit form | POST /auth/login – validate email format, password không rỗng | Client-side validate trước |
| 3   | System | Kiểm tra email tồn tại, is_active=TRUE | Nếu không tồn tại → trả lỗi 401 | DB query users |
| 4   | System | Verify bcrypt hash password | Nếu sai → trả lỗi 401 (không phân biệt email/pass) | Bảo vệ enumeration |
| 5   | System | Sinh JWT (HS256, exp=24h) với payload {sub, role, nodeId} | Trả về { access_token, user: { id, email, fullName, role, nodeId } } | Role embedded trong JWT |
| 6   | System | INSERT audit_log (action=LOGIN) | Lưu: actor_id, ip_address, user_agent, timestamp |     |
| 7   | Client | Lưu token vào store, redirect Dashboard | Navigate đến Dashboard theo role | Không dùng localStorage |

**Luồng chính – Logout:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Actor | Click nút Logout trên navigation bar | Frontend gọi POST /auth/logout (đính kèm JWT) |     |
| 2   | System | Ghi audit_log (action=LOGOUT) | Xác nhận logout thành công |     |
| 3   | Client | Xóa token khỏi store | Navigate về /login | Stateless – không revoke server |

**Luồng thay thế & Ngoại lệ:**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Email không tồn tại hoặc is_active=FALSE | Trả HTTP 401: 'Email hoặc mật khẩu không đúng' (không tiết lộ nguyên nhân). |
| A2  | Sai mật khẩu nhiều lần | Sau 5 lần sai liên tiếp: lock tài khoản 15 phút. Trả HTTP 401 cùng message. |
| A3  | Token hết hạn khi đang dùng | API trả 401. Axios interceptor tự redirect về /login với thông báo 'Phiên đăng nhập hết hạn'. |
| A4  | Role không được cấu hình | Trả 403. Ghi audit_log. Admin nhận alert. |

- **UC-04: View Batch Detail**

|     |     |
| --- | --- |
| **Use Case ID** | UC-04 |
| **Tên Use Case** | Xem chi tiết lô hàng (View Batch Detail) |
| **Actor chính** | Admin (toàn bộ), Manufacturer (own batch), Distributor (related batch), Retailer (related batch) |
| **Actor phụ** | —   |
| **Mô tả** | Actor xem thông tin chi tiết của một Batch: thông tin sản phẩm, trạng thái, lịch sử vận chuyển, tồn kho theo node. Mỗi role thấy phạm vi dữ liệu khác nhau theo phân quyền. |
| **Tiền điều kiện** | Actor đã đăng nhập (JWT hợp lệ). Batch tồn tại trong hệ thống. Actor có quyền xem batch này theo role. |
| **Hậu điều kiện** | Thông tin Batch được hiển thị. Read-only, không thay đổi dữ liệu. |
| **Phân quyền** | Admin: xem tất cả batches. Manufacturer: chỉ xem batch có origin_node = node của mình. Distributor/Retailer: chỉ xem batch đã từng qua node của mình. Consumer: không có quyền – dùng UC-08/UC-09. |
| **Priority** | MUST HAVE – Core read operation |
| **API Endpoint** | GET /batches/:id \| GET /batches?status=&nodeId=&productId=&page=&limit= |

**Luồng chính:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Actor | Nhập batch_code hoặc click từ danh sách | Gửi GET /batches/:id hoặc /batches?code=xxx |     |
| 2   | System | JwtAuthGuard xác thực token. RolesGuard kiểm tra quyền theo role. | Admin: toàn bộ; Manufacturer: own; Distributor/Retailer: related | Row-level security |
| 3   | System | Query batch JOIN product, origin_node, current_node | Trả JSON đầy đủ thông tin batch |     |
| 4   | System | Query timeline_events theo batch_id ORDER BY occurred_at ASC | Trả mảng events cho timeline display | Immutable log |
| 5   | System | Query shipments liên quan theo batch_id | Trả danh sách shipments với status |     |
| 6   | Client | Render Batch Detail Page | Hiển thị: Info card, Timeline stepper, Inventory table, Shipment list, QR Code + nút Download/Print | Tab-based UI |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Batch không tồn tại | Trả 404: 'Không tìm thấy lô hàng.' |
| A2  | Actor không có quyền xem batch này | Trả 403: 'Bạn không có quyền truy cập batch này'. Ghi audit_log. |
| A3  | Batch đang INVESTIGATING/LOST | Hiển thị alert banner đỏ trên đầu trang. Consumer chỉ thấy thông tin public. |

- **UC-08: Scan QR Code**

|     |     |
| --- | --- |
| **Use Case ID** | UC-08 |
| **Tên Use Case** | Quét mã QR (Scan QR Code) |
| **Actor chính** | Consumer (public), Admin/Manufacturer/Distributor/Retailer (authenticated) |
| **Actor phụ** | System (decode URL, log scan event async) |
| **Mô tả** | Actor dùng camera thiết bị scan QR Code gắn trên Batch. Hệ thống decode URL, resolve Batch Code và redirect đến trang Trace Timeline. Không yêu cầu đăng nhập với Consumer. |
| **Tiền điều kiện** | QR Code đã được sinh và in. Batch tồn tại trong hệ thống. Thiết bị có camera hoặc có thể nhập thủ công Batch Code. |
| **Hậu điều kiện** | Trang Trace Timeline được hiển thị. Scan event được ghi vào scan_logs (async, không block response). |
| **Priority** | MUST HAVE – Core UX / Consumer touchpoint |
| **API Endpoint** | GET /public/trace/:batchCode (public, no auth) |

**Luồng chính:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Consumer | Mở trang /scan (không cần đăng nhập) | Hiển thị trang Scan với nút Mở Camera | Public endpoint, no auth |
| 2   | Consumer | Click 'Mở Camera Quét QR' – yêu cầu camera permission | html5-qrcode hiển thị viewfinder với khung guide hình vuông |     |
| 3   | Consumer | Hướng camera vào QR Code trên bao bì | html5-qrcode decode → lấy URL embedded trong QR | URL format: /public/trace/{batch_code} |
| 4   | Client | Navigate đến URL từ QR, loading spinner 0.5s | Browser GET /public/trace/{batch_code} |     |
| 5   | System | Validate batch_code, query batch + timeline + current_node | Trả dữ liệu public (ẩn thông tin nhạy cảm) |     |
| 6   | System (async) | INSERT scan_log (batch_id, scannedAt, userAgent, ipAddress) | Non-blocking – không ảnh hưởng response time | Fire-and-forget |
| 7   | Client | Render Trace Timeline Page | Hiển thị: origin, journey map, current status, timeline events | Mobile-first UI |

**Luồng thay thế & Ngoại lệ**:

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | QR Code bị hỏng / không đọc được | Hiển thị form nhập Batch Code thủ công thay thế. Camera app báo lỗi. |
| A2  | Batch không tìm thấy | Trả trang: 'Sản phẩm này không có trong hệ thống. Có thể là hàng giả.' kèm thông tin liên hệ. |
| A3  | Batch đang INVESTIGATING/LOST | Hiển thị cảnh báo đỏ: 'Lô hàng này đang được điều tra / đã báo cáo mất. Liên hệ nhà sản xuất.' |
| A4  | Authenticated actor scan | Nếu có JWT, ghi scan_log với actor_id. Hiển thị thêm thông tin nội bộ theo role. |

- **UC-09: Trace Timeline**

|     |     |
| --- | --- |
| **Use Case ID** | UC-09 |
| **Tên Use Case** | Xem trục thời gian truy xuất (Trace Timeline) |
| **Actor chính** | Consumer (public), tất cả authenticated actors |
| **Actor phụ** | —   |
| **Mô tả** | Hệ thống hiển thị toàn bộ lịch sử hành trình của một lô hàng dưới dạng vertical timeline trực quan. Mỗi sự kiện (tạo, vận chuyển, nhận, bán, sự cố) có timestamp, node, actor và ghi chú. Dữ liệu immutable. |
| **Tiền điều kiện** | Batch tồn tại (bất kể status). Có ít nhất 1 timeline event (CREATED). Không yêu cầu đăng nhập (public endpoint). |
| **Hậu điều kiện** | Timeline hiển thị đầy đủ events theo thứ tự thời gian ASC. Read-only, không thay đổi DB. |
| **Priority** | MUST HAVE – Core UX / Consumer-facing / WOW Factor |
| **API Endpoint** | GET /public/trace/:batchCode \| GET /api/batches/:id/timeline (auth, full data) |

**Luồng chính:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Actor | Truy cập Timeline từ Batch Detail hoặc sau QR Scan | Gửi GET /public/trace/:batch_code hoặc GET /batches/:id/timeline |     |
| 2   | System | SELECT batch WHERE batch_code=:code | Nếu không tồn tại → 404 |     |
| 3   | System | SELECT timeline_events JOIN nodes JOIN users WHERE batch_id=:id ORDER BY occurred_at ASC | Trả mảng events theo thứ tự thời gian | Immutable log |
| 4   | System | Lọc thông tin theo role (public vs internal) | Ẩn: actor email, actor userId, internal notes \[INTERNAL\].<br><br>Tính duration giữa các steps. |     |
| 5   | System (async) | INSERT scan_logs (non-blocking) | Không block response | Fire-and-forget |
| 6   | Client | Render vertical timeline với animation | Mỗi event card: icon + type + nodeName + actorName + timestamp + notes + durationToNext.<br><br>DELAYED: viền cam. INVESTIGATING: đỏ nhấp nháy. LOST: crimson, icon X. | Framer Motion stagger |

- **UC-10: View Inventory Dashboard**

|     |     |
| --- | --- |
| **Use Case ID** | UC-10 |
| **Tên Use Case** | Xem Dashboard & Tồn kho (View Inventory Dashboard) |
| **Actor chính** | Admin (toàn hệ thống), Manufacturer / Distributor / Retailer (chỉ node của mình) |
| **Actor phụ** | —   |
| **Mô tả** | Dashboard cung cấp cái nhìn tổng quan về tình trạng chuỗi cung ứng: thống kê số lô hàng, tồn kho, shipment đang di chuyển và cảnh báo sự cố. Mỗi role thấy phạm vi dữ liệu khác nhau. |
| **Tiền điều kiện** | Actor đã đăng nhập. JWT hợp lệ. |
| **Hậu điều kiện** | Dữ liệu thống kê được hiển thị. Read-only, không thay đổi DB. |
| **Phân quyền** | Admin: thống kê toàn hệ thống – tất cả nodes. Manufacturer: chỉ batches tạo từ node của mình. Distributor/Retailer: chỉ inventory và shipments liên quan đến node của mình. |
| **Priority** | MUST HAVE |
| **API Endpoint** | GET /dashboard/stats?nodeId=&period=7d |

**Luồng chính:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Actor | Đăng nhập → tự động redirect đến Dashboard | Load Dashboard theo role |     |
| 2   | System | Xác định scope theo role từ JWT | Admin=all; others=own node_id. Build query với filter tương ứng. | JWT node_id |
| 3   | System | Query inventory JOIN batches JOIN nodes theo scope | Trả: tổng batch, tổng qty, top products, batches sắp hết hạn | Indexed queries |
| 4   | System | Query summary: IN_TRANSIT count, DELAYED count, INVESTIGATING count | Trả KPI cards data | Incident-aware |
| 5   | Client | Render Dashboard | Stats Cards (4 card): Tổng Batch \| IN_TRANSIT \| Tổng tồn kho \| Bán hôm nay.<br><br>Inventory Bar Chart (Recharts), Active Shipments Table, Alert Banner, Mini Map, Recent Activity Feed. |     |
| 6   | System | TanStack Query staleTime=30s, auto-refresh background sau 30 giây | Dữ liệu tự cập nhật định kỳ | Polling/SSE |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Node không có hàng | Dashboard hiển thị empty state: 'Chưa có hàng hóa tại kho này.' |
| A2  | Có batch sắp hết hạn (< 30 ngày) | Highlight hàng màu vàng cảnh báo. |
| A3  | Có incident đang mở | Hiển thị Alert Banner đỏ/cam sticky ở đầu trang. |

#### Nghiệp vụ của Admin

##### Sơ đồ usecase

##### Danh sách các usecase

Các Use Case sau chỉ Admin mới có quyền thực hiện.

- **UC-02: Manage Nodes (CRUD)**

|     |     |
| --- | --- |
| **Use Case ID** | UC-02 |
| **Tên Use Case** | Quản lý Node (Manage Nodes – CRUD) |
| **Actor chính** | Admin |
| **Actor phụ** | —   |
| **Mô tả** | Admin quản lý toàn bộ các điểm (Node) trong chuỗi cung ứng: nhà máy, kho phân phối, cửa hàng bán lẻ. Node là cơ sở hạ tầng cho toàn bộ hệ thống – mọi Batch và Shipment đều gắn với Node. |
| **Tiền điều kiện** | Đăng nhập với role ADMIN. |
| **Hậu điều kiện (Create)** | Node mới được tạo với node_code unique. Audit log ghi nhận. |
| **Hậu điều kiện (Update)** | Thông tin Node được cập nhật, version tăng 1. Audit log ghi nhận. |
| **Hậu điều kiện (Delete)** | Node bị Soft Delete: deleted_at=NOW(), is_active=false. Audit log ghi nhận. |
| **Priority** | MUST HAVE |
| **API Endpoint** | GET /nodes \| POST /nodes \| PUT /nodes/:id \| DELETE /nodes/:id |

**Luồng chính – Tạo Node mới:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Click 'Thêm Node mới' → mở form | Hiển thị form: name, node_code, type (MANUFACTURER/DISTRIBUTOR/RETAILER/WAREHOUSE), address, lat/lng, contact |     |
| 2   | Admin | Nhập thông tin và Submit | Validate: node_code unique, type hợp lệ, lat/lng trong range. Map preview hiển thị marker. |     |
| 3   | System | INSERT INTO nodes + INSERT audit_log | Trả node mới với ID. Frontend refresh danh sách + toast success. | ACID |

**Luồng chính – Cập nhật Node**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Chọn Node → Click 'Chỉnh sửa' | Load thông tin hiện tại vào form |     |
| 2   | Admin | Sửa thông tin và Submit | PUT /nodes/:id { ...changes, version: currentVersion } |     |
| 3   | System | UPDATE nodes SET ...version=version+1 WHERE id=? AND version=? | Nếu version mismatch → HTTP 409 'Node đã được sửa bởi người khác. Vui lòng reload.' | Optimistic lock |
| 4   | System | INSERT audit_log ghi nhận thay đổi (old_values vs new_values) | Commit thành công |     |

**Luồng chính – Vô hiệu hóa Node:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Click 'Xóa' → Confirm modal | Hiển thị: 'Node này có \[n\] batch liên quan. Vẫn xóa?' |     |
| 2   | Admin | Xác nhận → DELETE /nodes/:id | Backend: kiểm tra Node có inventory > 0 hoặc hàng đang IN_TRANSIT → cảnh báo nhưng vẫn cho soft-delete. | Safety check |
| 3   | System | UPDATE nodes SET deleted_at=NOW(), is_active=false WHERE id=? | INSERT audit_log. Response success. | Soft delete – không hard delete |

**Luồng thay thế & Ngoại lệ:**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | node_code đã tồn tại | HTTP 409 – 'Mã Node đã được sử dụng. Chọn mã khác.' |
| A2  | Node không tìm thấy | HTTP 404. |
| A3  | Optimistic lock conflict | HTTP 409 – 'Node đã được sửa bởi người khác. Vui lòng reload.' |

- **UC-11: View Map (Node Locations)**

|     |     |
| --- | --- |
| **Use Case ID** | UC-11 |
| **Tên Use Case** | Xem bản đồ vị trí Node (View Map) |
| **Actor chính** | Admin (full view), Authenticated users (limited) |
| **Actor phụ** | —   |
| **Mô tả** | Hiển thị tất cả Nodes trên bản đồ địa lý (Leaflet + OpenStreetMap). Mỗi marker hiển thị tên Node, loại, tồn kho tổng hợp. Polyline dashed thể hiện các Shipment đang IN_TRANSIT. |
| **Tiền điều kiện** | Đăng nhập. Nodes đã có tọa độ latitude/longitude. |
| **Hậu điều kiện** | Bản đồ render với các markers. Không có thay đổi DB (read-only). |
| **Priority** | SHOULD HAVE – Enhancement |
| **API Endpoint** | GET /nodes?includeInventory=true \| GET /shipments?status=IN_TRANSIT&includeNodes=true |

**Luồng chính:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Click tab 'Map View' trên Dashboard | Tải Map component (react-leaflet / Leaflet.js) |     |
| 2   | System | GET /nodes?includeInventory=true + GET /shipments?status=IN_TRANSIT | Trả GeoJSON data cho map |     |
| 3   | Client | Render markers theo node_type color: xanh=Manufacturer, cam=Distributor, đỏ=Retailer | Leaflet render markers, zoom fit tất cả markers |     |
| 4   | System | Vẽ Polyline dashed nối source → dest cho mỗi IN_TRANSIT shipment | Polyline chỉ vẽ nếu cả 2 node có lat/lng | Haversine Formula tính khoảng cách |
| 5   | Admin | Click marker | Popup: Node name, type, address, tồn kho tổng, số shipment đang đến |     |
| 6   | Admin | Click Polyline | Popup: Tracking code, Batch, Qty, Elapsed time |     |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Node không có tọa độ | Node không hiển thị trên map. Hiện badge cảnh báo trong Node List: 'Thiếu tọa độ'. |
| A2  | API map service lỗi | Hiển thị fallback: table danh sách nodes thay vì map. |

- **UC-12: Manage Users**

|     |     |
| --- | --- |
| **Use Case ID** | UC-12 |
| **Tên Use Case** | Quản lý tài khoản người dùng (Manage Users) |
| **Actor chính** | Admin |
| **Actor phụ** | —   |
| **Mô tả** | Admin tạo, xem, sửa, vô hiệu hóa tài khoản người dùng. Gán role và Node cho từng tài khoản. Không cho phép xóa vật lý (soft delete để bảo toàn audit trail). |
| **Tiền điều kiện** | Admin đã đăng nhập. |
| **Hậu điều kiện** | User được tạo/cập nhật. Audit log ghi nhận. |
| **Priority** | SHOULD HAVE – Support |
| **API Endpoint** | GET /users \| POST /users \| PUT /users/:id \| PATCH /users/:id/toggle-active |

**Luồng chính – Tạo User mới**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Click 'Tạo User' → nhập: full_name, email, role, node (nếu không phải Admin) | Validate: email unique, node tồn tại và is_active, role hợp lệ |     |
| 2   | System | Hash temporary password, INSERT users + INSERT user_roles | User được tạo với is_active=TRUE | bcrypt saltRounds=12 |
| 3   | System | Gửi email chứa link đặt mật khẩu (expires 24h) | Email gửi thành công | SMTP (optional) |
| 4   | System | INSERT audit_log | Ghi nhận: ai tạo, lúc nào, email, role, node |     |

**Luồng chính – Vô hiệu hóa User**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Chọn user → Click Toggle 'Vô hiệu hóa' / PATCH /users/:id/toggle-active | Xác nhận: 'User này có X shipment đang pending?' |     |
| 2   | System | UPDATE users SET is_active=NOT is_active WHERE id=? | Soft delete. JWT cũ của user bị reject ở middleware (check is_active) | Token cũ expire sau 24h |
| 3   | System | INSERT audit_log | Ghi nhận hành động |     |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Email đã tồn tại | HTTP 409 – 'Email đã được sử dụng bởi tài khoản khác.' |
| A2  | Admin tự vô hiệu hóa tài khoản của mình | HTTP 400 – 'Không thể vô hiệu hóa tài khoản của chính mình.' |
| A3  | Gán node không tồn tại hoặc is_active=FALSE | HTTP 404/422 – Validate fail. |

- **UC-13: View Audit Log**

|     |     |
| --- | --- |
| **Use Case ID** | UC-13 |
| **Tên Use Case** | Xem nhật ký kiểm toán (View Audit Log) |
| **Actor chính** | Admin |
| **Actor phụ** | —   |
| **Mô tả** | Admin xem toàn bộ audit trail của hệ thống: ai làm gì, lúc nào, từ IP nào, thay đổi dữ liệu gì. Audit log là IMMUTABLE – không thể sửa hoặc xóa. |
| **Tiền điều kiện** | Admin đã đăng nhập. |
| **Hậu điều kiện** | Audit log được hiển thị. Read-only, không thay đổi DB. |
| **Priority** | SHOULD HAVE – Support |
| **API Endpoint** | GET /audit-logs?actorId=&action=&entityType=&dateFrom=&dateTo=&page=&limit=20 (Admin only) |

**Luồng chính**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Mở trang Audit Log, chọn filter: entity_type, date range, actor_id | Build query với filter tương ứng |     |
| 2   | System | Query audit_logs với pagination (20 records/page, ORDER BY created_at DESC) | Trả danh sách logs với: entity_type, entity_id, action, actor, ip, timestamp, old/new values | Indexed |
| 3   | Admin | Click vào 1 record để xem chi tiết | Hiển thị: old_values (JSON), new_values (JSON), user_agent, full context | JSON diff viewer |
| 4   | Admin | Click 'Export CSV' | Generate và download CSV toàn bộ logs theo filter hiện tại | Liên quan UC-14 |

**Luồng thay thế & Ngoại lệ:**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Không có log nào theo filter | Hiển thị empty state: 'Không tìm thấy bản ghi nào phù hợp.' |
| A2  | Phân trang vượt quá số lượng | Trả page rỗng. Frontend hiển thị thông báo. |

- **UC-14: Export Report**

|     |     |
| --- | --- |
| **Use Case ID** | UC-14 |
| **Tên Use Case** | Xuất báo cáo (Export Report) |
| **Actor chính** | Admin (toàn bộ hệ thống), Manufacturer (phạm vi của mình) |
| **Actor phụ** | —   |
| **Mô tả** | Xuất báo cáo tồn kho, lịch sử shipment, audit trail ra file CSV hoặc PDF. Dữ liệu được filter theo thời gian, node, product trước khi export. |
| **Tiền điều kiện** | Actor đã đăng nhập. |
| **Hậu điều kiện** | File được tạo và download. INSERT audit_log ghi nhận export event. |
| **Loại báo cáo** | Inventory Summary \| Shipment History \| Batch Traceability \| Incident Report |
| **Priority** | COULD HAVE – Enhancement |
| **API Endpoint** | POST /reports/export \| GET /reports/templates |

**Luồng chính:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Actor | Chọn Report Type, Date Range, Node, Format (CSV/PDF). Preview: 'Sẽ export X records' | Hiển thị options |     |
| 2   | Actor | Click 'Export' → POST /reports/export { type, filters, format } | Backend nhận yêu cầu |     |
| 3   | System | Kiểm tra scope theo role: Admin=all, Manufacturer=own | Build query với filter | Row-level security |
| 4   | System | Generate file (CSV: fast-csv / PDF: PDFKit) | Stream file về client | Streaming tránh OOM |
| 5   | System | INSERT audit_log (action=EXPORT, entity_type=report, actor_id) | Ghi nhận ai export lúc nào loại gì |     |
| 6   | Client | Trigger file download qua blob URL | File download bắt đầu |     |

**Luồng thay thế & Ngoại lệ:**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Quá nhiều records (> 100,000) | Tạo export job async. Gửi email link download khi xong. |
| A2  | Manufacturer cố export data của người khác | API filter theo owner. Trả 403 nếu request data ngoài scope. |

- **UC-16: Lost & Incident Management**

|     |     |
| --- | --- |
| **Use Case ID** | UC-16 |
| **Tên Use Case** | Quản lý sự cố hàng thất lạc (Lost & Incident Management) |
| **Actor chính** | Admin (mở điều tra, xác nhận LOST); System/Cron (auto-detect DELAYED) |
| **Actor phụ** | —   |
| **Mô tả** | Hệ thống tự động phát hiện và Admin xử lý các Shipment bị trễ, mất mát, hư hỏng hoặc gian lận. Quy trình: Auto-detect DELAYED → Admin mở INVESTIGATING → Two-Man Rule xác nhận LOST → Rollback inventory. |
| **Tiền điều kiện** | Tồn tại shipment đang IN_TRANSIT. Admin đã đăng nhập. |
| **Hậu điều kiện LOST** | Shipment.status=LOST. Inventory tại source_node rollback (qty+=quantity_shipped). Incident report đóng với resolution=LOSS_CONFIRMED. Timeline event LOST được ghi (immutable). |
| **Priority** | MUST HAVE – Core |
| **API Endpoint** | GET /incidents \| POST /incidents \| POST /incidents/:id/confirm-lost \| POST /incidents/:id/confirm-found |

**Luồng 1: CRON Auto-Detect DELAYED**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | System (CRON) | Chạy mỗi 1 giờ: query shipments IN_TRANSIT có shipped_at > NOW()-48h chưa có OVERDUE issue | Trả danh sách shipments overdue | Configurable threshold |
| 2   | System | Với mỗi overdue shipment: INSERT shipment_issues (OVERDUE) | Tạo issue record |     |
| 3   | System | UPDATE shipments SET status='DELAYED' | Status chuyển DELAYED |     |
| 4   | System | INSERT timeline_events (DELAYED) + INSERT audit_logs (AUTO_DELAY) | Immutable record |     |
| 5   | System | Gửi notification đến Admin + dest_node users | Email + in-app alert (WebSocket) |     |

**Luồng 2: Admin Mở Investigation**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Xem Alert Banner trên Dashboard → click vào shipment DELAYED | Hiển thị Shipment Detail với elapsed time |     |
| 2   | Admin | Click 'Open Investigation', nhập description (min 20 ký tự), chọn assigned_to | Validate input |     |
| 3   | System | BEGIN TX: UPDATE shipments status=INVESTIGATING, INSERT incident_reports (OPEN), INSERT timeline_events (INVESTIGATING), INSERT audit_log. COMMIT. | Incident mở thành công | ACID |
| 4   | Admin | Upload bằng chứng (ảnh, GPS data, tracking link) | Lưu vào incident_reports.evidence_jsonb |     |

**Luồng 3: Xác Nhận LOST (Two-Man Rule)**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin1 | Click 'Confirm LOST' → nhập lý do, chọn 2nd approver (Admin2) | Ghi nhận yêu cầu, gửi notification cho Admin2 |     |
| 2   | Admin2 | Nhận notification, vào hệ thống xác nhận | Validate: Admin2 ≠ Admin1 (khác người) | Two-Man Rule |
| 3   | Admin2 | Click 'Confirm LOST' – Step 2/2 | Kích hoạt LOST transaction |     |
| 4   | System | BEGIN TX: SELECT inventory FOR UPDATE (lock source node) | Pessimistic lock |     |
| 5   | System | UPDATE inventory +qty_shipped tại source_node (ROLLBACK) | Tồn kho source tăng trở lại |     |
| 6   | System | INSERT inventory_adjustments (LOSS_ROLLBACK, approved_by=Admin1, second_approver=Admin2) | Immutable audit trail |     |
| 7   | System | UPDATE batches SET status=CREATED, current_node_id=source_node_id | Batch quay về source |     |
| 8   | System | UPDATE shipments status=LOST. UPDATE incident_reports status=CLOSED. | Terminal state |     |
| 9   | System | INSERT timeline_events (LOST + INVENTORY_ADJUSTED). COMMIT. | Immutable trail hoàn chỉnh |     |

**Luồng 4: Resolution – Shipment FOUND**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Admin | Click 'Mark as Found' trong Incident Detail | Xác nhận tìm thấy hàng |     |
| 2   | System | BEGIN TX: UPDATE shipments status=RECEIVED, UPSERT inventory dest_node +=qty, UPDATE batch.status=RECEIVED, UPDATE incident=RESOLVED, INSERT timeline_events (RECEIVED + INCIDENT_CLOSED). COMMIT. | Hàng được nhận thành công | Full ACID |

**Luồng thay thế & ngoại lệ:**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Admin2 xác nhận là chính Admin1 | HTTP 400 – 'Người xác nhận thứ hai phải khác người đề xuất.' |
| A2  | Incident đã CLOSED | Block action: 'Sự cố này đã được đóng.' |
| A3  | Auto-flag FRAUD_SUSPECTED | Cùng actor confirm > 3 shipments trong 1h, hoặc RECEIVED ngoài 22:00–06:00 → hệ thống tự flag để Admin review. |

#### Nghiệp vụ của Manufactor

##### Sơ đồ usecase

##### Danh sách các usecase

Các Use Case đặc thù của Manufacturer (Admin cũng có quyền thực hiện).

- **UC-03: Create Batch**

|     |     |
| --- | --- |
| **Use Case ID** | UC-03 |
| **Tên Use Case** | Tạo lô hàng (Create Batch) |
| **Actor chính** | Manufacturer (Admin cũng có thể thực hiện) |
| **Actor phụ** | System (sinh batch_code, generate QR, ghi audit log) |
| **Mô tả** | Manufacturer khởi tạo một lô hàng mới với đầy đủ thông tin sản phẩm, số lượng, ngày sản xuất, hạn sử dụng. Hệ thống tự động sinh Batch Code unique và QR Code, cộng inventory tại Node gốc và ghi timeline event đầu tiên. |
| **Tiền điều kiện** | Đăng nhập với role MANUFACTURER. Node của Manufacturer đã được tạo và is_active=TRUE. Sản phẩm (Product) tương ứng đã tồn tại trong hệ thống. |
| **Hậu điều kiện** | Batch mới với status=CREATED, batch_code unique. \| batch_qr_codes: 1 record với SVG string và PNG URL. \| inventory: qty tại origin_node_id tăng đúng quantity. \| timeline_events: 1 record type=CREATED (immutable). \| audit_logs: 1 record action=CREATE_BATCH. |
| **Priority** | MUST HAVE – Core Business Flow |
| **API Endpoint** | POST /batches |

**Luồng chính**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Manufacturer | Click 'Tạo lô hàng mới' | Hiển thị form: product (dropdown), quantity, unit, manufacture_date, expiry_date, notes. Preview: 'Batch sẽ được tạo tại: \[Node của bạn\]'. |     |
| 2   | Manufacturer | Chọn product, nhập quantity, ngày sản xuất, hạn sử dụng → Submit | Client validate: quantity > 0, expiry > manufacture_date | Real-time validation |
| 3   | System | BEGIN TRANSACTION | Bắt đầu ACID transaction |     |
| 4   | System | Sinh batch_code = BCH-YYYYMMDD-{uuid4\[:8\]}, kiểm tra unique | batch_code unique toàn hệ thống (DB UNIQUE constraint) |     |
| 5   | System | INSERT INTO batches (status=CREATED, origin_node_id=current_node_id=actor's node) | Batch record được tạo |     |
| 6   | System | UPSERT inventory { batch_id, node_id=origin, quantity_available=quantity } | Tồn kho khởi tạo |     |
| 7   | System | QrService.generateQR(batchId, batchCode) → SVG + PNG 512px. INSERT batch_qr_codes. | QR Code generated | errorCorrectionLevel=H |
| 8   | System | INSERT timeline_events (event_type=CREATED, node=origin, actor=userId) | Timeline event đầu tiên – immutable |     |
| 9   | System | INSERT audit_logs. COMMIT. | Transaction hoàn tất |     |
| 10  | Client | Navigate đến Batch Detail page | Hiển thị batch vừa tạo với QR Code to, nút Download/Print. |     |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | batch_code collision (rất hiếm) | System retry sinh batch_code mới. Nếu 3 lần vẫn collision → báo lỗi 500. |
| A2  | expiry_date <= manufacture_date | HTTP 400 – 'Hạn sử dụng phải sau ngày sản xuất.' |
| A3  | Product không tồn tại hoặc is_active=FALSE | Dropdown không hiện product. Nếu force-submit → HTTP 422. |
| A4  | Transaction fail ở bất kỳ bước nào | ROLLBACK hoàn toàn. Không tạo Batch, không tạo inventory. |

- **UC-05: Generate & Print QR Code**

|     |     |
| --- | --- |
| **Use Case ID** | UC-05 |
| **Tên Use Case** | Sinh và in mã QR (Generate & Print QR Code) |
| **Actor chính** | Manufacturer (primary), Admin |
| **Actor phụ** | System (QrService) |
| **Mô tả** | QR Code được tự động sinh khi tạo Batch (UC-03 «include» UC-05). Ngoài ra, Manufacturer có thể regenerate QR (nếu QR cũ bị hỏng) hoặc download/in QR từ Batch Detail page. |
| **Tiền điều kiện** | Batch đã được tạo (status ≠ DISCARDED). Manufacturer là owner của batch này. |
| **Hậu điều kiện** | QR Code (SVG + PNG 512px) available tại URL. URL trong QR: {APP_BASE_URL}/public/trace/{batchCode}. |
| **Priority** | MUST HAVE |
| **API Endpoint** | GET /batches/:id/qr \| POST /batches/:id/regenerate-qr |

**Luồng chính – Auto (Từ UC-03)**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | System | Sau INSERT batches, QrService.generateQR() được gọi trong cùng TX | Sinh QR tự động | «include» từ UC-03 |
| 2   | System | QRCode.toString(url, { type:'svg', errorCorrectionLevel:'H' }) → svgString | SVG QR Code generated |     |
| 3   | System | QRCode.toBuffer(url, { type:'png', width:512 }) → pngBuffer. Save PNG. | PNG 512x512px saved |     |
| 4   | System | INSERT batch_qr_codes { batch_id, trace_url, svg_data, qr_code_url } | QR record lưu DB |     |

**Luồng chính – Manual Download/Print**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Manufacturer | Mở Batch Detail page → click 'Xem / In QR Code' | Gọi GET /batches/:id/qr |     |
| 2   | System | Lấy qr_data từ batch_qr_codes, render PNG/SVG | Trả base64 PNG hoặc SVG string | Server-side render |
| 3   | Client | Hiển thị QR Code + batch_code + product_name + manufacture_date + expiry_date | Print-ready layout |     |
| 4   | Manufacturer | Click 'Download PNG' hoặc 'Download SVG' | File download về máy |     |
| 5   | Manufacturer | Click 'In QR' → window.print() với print CSS | Print dialog hiển thị | Print-optimized layout |
| 6   | Manufacturer | (Optional) Click 'In hàng loạt' – chọn nhiều batch | Generate PDF nhiều QR trên 1 trang, download | Bulk print |

**Luồng chính – Regenerate QR**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Manufacturer | Click 'Tạo lại QR' (nếu QR cũ bị hỏng/mất file) | POST /batches/:id/regenerate-qr |     |
| 2   | System | QrService sinh lại. UPDATE batch_qr_codes. INSERT audit_log. | Thông báo: 'QR Code đã được tái tạo' | Ghi đè record cũ + audit |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | batch_qr_codes không tồn tại (batch cũ) | System tự generate và INSERT record mới. Thông báo: 'QR Code đã được tái tạo'. |
| A2  | QR library lỗi | Trả 500. Hiển thị batch_code text để nhập thủ công. |

- **UC-06 / UC-17: Manufacturer Transfer Shipment**

|     |     |
| --- | --- |
| **Use Case ID** | UC-06 / UC-17 |
| **Tên Use Case** | Chuyển lô hàng – Nhà sản xuất (Manufacturer Transfer Shipment) |
| **Actor chính** | Manufacturer |
| **Actor phụ** | System (validate inventory, ACID transaction, audit log) |
| **Mô tả** | Manufacturer tạo một Shipment để chuyển một phần hoặc toàn bộ lô hàng từ Nhà máy đến Kho của Nhà phân phối. ACID transaction quan trọng: trừ kho nguồn, tạo shipment record, cập nhật batch status, ghi timeline event – tất cả trong 1 DB transaction. |
| **Tiền điều kiện** | Đăng nhập với role MANUFACTURER. Batch tồn tại với inventory tại node của user >= quantity muốn ship. Node đích tồn tại, is_active=true, khác Node nguồn. |
| **Hậu điều kiện** | Shipment record: status=IN_TRANSIT, tracking_code unique. inventory tại source_node: qty-=quantity_shipped. batch.status=IN_TRANSIT. timeline_events: 1 record type=SHIPPED (immutable). audit_logs: 1 record action=SHIP. |
| **Priority** | MUST HAVE – Core Business Flow / ACID Critical |
| **API Endpoint** | POST /shipments |

**Luồng chính**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Manufacturer | Chọn Batch (dropdown lọc theo inventory của node mình có).<br><br>Nhập quantity, chọn Node đích, điền notes (optional). Preview: 'Chuyển \[qty\] \[unit\] từ \[NodeA\] đến \[NodeB\]. Còn lại: \[remaining\].'<br><br>Submit. | Validate: dest_node ≠ source_node, Node đích is_active, quantity > 0. |     |
| 2   | System | BEGIN TRANSACTION (isolation=READ_COMMITTED) | Bắt đầu ACID transaction |     |
| 3   | System | SELECT inventory FOR UPDATE (Pessimistic Lock) | Khóa dòng tồn kho. Lấy quantity_available và version. | Ngăn Concurrent ship |
| 4   | System | Kiểm tra qty_available >= quantity_shipped | Nếu không đủ → ROLLBACK → E1 |     |
| 5   | System | UPDATE inventory SET qty -= quantity_shipped WHERE qty >= qty (atomic check) | Trừ kho nguồn. Nếu rowCount=0 → race condition → ROLLBACK → E1 | Atomic check |
| 6   | System | Sinh tracking_code = SHP-YYYYMMDD-{4 random chars}. INSERT shipments (status=IN_TRANSIT). | Shipment record được tạo |     |
| 7   | System | UPDATE batches SET status=IN_TRANSIT, current_node_id=destNodeId, version+=1 | Batch status cập nhật |     |
| 8   | System | INSERT timeline_events (type=SHIPPED, node=sourceNode, qty_delta=-qty). INSERT audit_logs. COMMIT. | Transaction hoàn tất |     |
| 9   | Client | Toast 'Tạo Shipment thành công. Tracking: SHP-...' + navigate | Hiển thị trang Shipment Detail |     |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Số lượng tồn kho không đủ (qty > available) | ROLLBACK. HTTP 400/422 – 'Tồn kho không đủ. Hiện có: \[n\] \[unit\].' |
| A2  | source = dest node | HTTP 400 – 'Node nguồn và Node đích không được trùng nhau.' |
| A3  | Node đích không active | HTTP 404 – 'Node đích không tồn tại hoặc không hoạt động.' |
| A4  | Concurrent transfer (2 người cùng ship) | SELECT FOR UPDATE serialization. Yêu cầu đến sau chờ và thất bại nếu kho đã hết. |
| A5  | Batch đang INVESTIGATING/LOST | HTTP 400 – 'Lô hàng đang trong quá trình điều tra. Liên hệ Admin.' |
| A6  | Manufacturer ship từ node không thuộc mình | HTTP 403 – Forbidden. Ghi audit_log hành vi bất thường. |

#### Nghiệp vụ của Distributor

##### Sơ đồ usecase

##### Danh sách các usecase

- **UC – 18: Distributor Transfer Shipment**

|     |     |
| --- | --- |
| **Use Case ID** | UC-18 |
| **Tên Use Case** | Chuyển lô hàng – Nhà phân phối (Distributor Transfer Shipment) |
| **Actor chính** | Distributor |
| **Actor phụ** | System (validate inventory, ACID transaction, audit log) |
| **Mô tả** | Distributor tạo lệnh vận chuyển (Shipment) để chuyển một phần hoặc toàn bộ Lô sản phẩm từ Kho phân phối sang Cửa hàng của Nhà bán lẻ thông qua quy trình transaction bảo mật. |
| **Tiền điều kiện** | Đăng nhập với role DISTRIBUTOR. Batch tồn tại với inventory > 0 tại kho của Distributor. Node đích là Cửa hàng Retailer: tồn tại và is_active=TRUE. |
| **Hậu điều kiện** | Shipment mới với status=IN_TRANSIT. Tồn kho tại Kho Distributor giảm đi. batch.status=IN_TRANSIT. Timeline event SHIPPED được ghi. Audit log lưu vết. |
| **Priority** | MUST HAVE – Core Business Flow / ACID Critical |
| **API Endpoint** | POST /shipments |

**Luồng chính**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Distributor | Chọn Batch tại kho của mình, nhập quantity, chọn Node đích (Cửa hàng Retailer), bấm Submit. | Validate: dest_node ≠ source_node, Node đích is_active, quantity > 0. |     |
| 2   | System | BEGIN TRANSACTION | Bắt đầu ACID transaction cô lập |     |
| 3   | System | SELECT inventory WHERE batch_id AND node_id=source FOR UPDATE | Pessimistic lock dòng tồn kho Kho phân phối. Lấy quantity_available và version. | Tránh âm kho đồng thời |
| 4   | System | Kiểm tra: quantity_available >= qty_to_ship | Nếu không đủ → ROLLBACK → A1 |     |
| 5   | System | UPDATE inventory SET qty -= qty, version+=1 WHERE batch_id AND node_id=source AND qty >= qty | Trừ kho phân phối. Atomic check tại tầng DB. |     |
| 6   | System | INSERT shipments (tracking_code=SHP-..., status=IN_TRANSIT, shipped_at=NOW()) | Vận đơn xuất kho được tạo |     |
| 7   | System | UPDATE batches SET status=IN_TRANSIT, updated_at=NOW() | Batch status cập nhật |     |
| 8   | System | INSERT timeline_events (SHIPPED) + INSERT audit_logs + COMMIT | Immutable trail hoàn chỉnh |     |
| 9   | Client | Hiển thị vận đơn: tracking_code, dest_node, qty, ETA | Trang chi tiết vận chuyển |     |

**Luồng ngoại lệ & Thay thế**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Tồn kho Kho phân phối không đủ | ROLLBACK. HTTP 422 – 'Số lượng vượt tồn hiện có. Hiện khả dụng: X.' |
| A2  | Source node = Dest node | HTTP 400 – 'Không cho phép tạo lệnh điều chuyển nội bộ tại cùng một kho.' |
| A3  | Concurrent transfer | SELECT FOR UPDATE serialization. Lệnh muộn hơn thất bại nếu kho đã hết. |
| A4  | Batch đang INVESTIGATING/LOST | HTTP 400 – 'Lô hàng đang tạm khóa để phục vụ công tác thanh tra.' |
| A5  | Partial shipping | Cho phép. qty < total. Kho nguồn chỉ giảm phần đã ship. |
| A6  | Distributor ship từ node không thuộc mình | HTTP 403 – Unauthorized Node Access. Ghi audit_log. |

- **UC-07 / UC-19: Distributor Receive Shipment**

|     |     |
| --- | --- |
| **Use Case ID** | UC-07 / UC-19 |
| **Tên Use Case** | Nhận lô hàng – Nhà phân phối (Distributor Receive Shipment) |
| **Actor chính** | Distributor |
| **Actor phụ** | System (ACID transaction, audit log) |
| **Mô tả** | Distributor xác nhận tiếp nhận Lô hàng vận chuyển từ Nhà sản xuất gửi tới Kho của mình. Hệ thống cập nhật trạng thái RECEIVED, tăng tồn kho tại Kho nhận, ghi timeline event và audit log trong một giao dịch ACID khép kín. |
| **Tiền điều kiện** | Shipment tồn tại và đang ở trạng thái IN_TRANSIT. Actor thuộc Kho đích (dest_node) được chỉ định trên vận đơn. |
| **Hậu điều kiện** | Shipment.status=RECEIVED. Tồn kho tại Kho Distributor tăng thêm qty_received. Batch.current_node_id cập nhật thành Kho Distributor. Timeline event RECEIVED được ghi. Audit log lưu vết. |
| **Priority** | MUST HAVE – Core Business Flow / ACID Critical |
| **API Endpoint** | PATCH /shipments/:id/receive |

**Luồng chính**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Distributor | Truy cập danh sách hàng đang chuyển đến Kho mình, chọn vận đơn, bấm 'Xác nhận nhận hàng'. | Hiển thị Chi tiết lô nhận: batch info, qty_shipped, source_node, shipped_at. |     |
| 2   | Distributor | Kiểm đếm hàng, nhập qty_received (có thể < qty_shipped nếu hàng hư hỏng), ghi chú, submit. | Validate: actor.node_id = shipment.dest_node_id |     |
| 3   | System | BEGIN TRANSACTION | Bắt đầu ACID transaction |     |
| 4   | System | SELECT shipment FOR UPDATE: kiểm tra status = IN_TRANSIT | Ngăn double receive | Pessimistic lock |
| 5   | System | UPDATE shipments SET status=RECEIVED, received_by=actor, received_at=NOW(), qty_received=qty | Cập nhật vận đơn. received_at >= shipped_at. |     |
| 6   | System | UPSERT inventory: qty_available += qty_received tại dest_node (ON CONFLICT DO UPDATE) | Tồn kho Kho phân phối tăng |     |
| 7   | System | UPDATE batches SET current_node_id=dest_node_id | Vị trí hiện tại của Batch cập nhật |     |
| 8   | System | INSERT timeline_events (RECEIVED) + INSERT audit_logs + COMMIT | Immutable trail hoàn chỉnh |     |
| 9   | Client | Toast 'Nhận hàng thành công. Tồn kho Kho phân phối đã được cập nhật.' Navigate về trang Inventory. |     |     |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Actor không thuộc dest_node | HTTP 403 – 'Bạn không có quyền hạn nhận lô hàng này.' Ghi audit_log. |
| A2  | Shipment đã RECEIVED trước đó | Block: 'Lô hàng vận chuyển này đã được xác nhận tiếp nhận trước đó.' |
| A3  | qty_received < qty_shipped (hàng hư hỏng) | Cho phép ghi nhận số lượng thực tế. Bắt buộc nhập lý do. Hệ thống tạo shipment_issues (DAMAGED) và kích hoạt UC-16 sub-flow DAMAGED. |
| A4  | Shipment đang DELAYED | Cho phép nhận bình thường. Hệ thống tự động đóng incident liên quan. |

#### Nghiệp vụ của Retailer

##### Sơ đồ usecase

##### Danh sách các usecase

- **UC-20: Retailer Receive Shipment**

|     |     |
| --- | --- |
| **Use Case ID** | UC-20 |
| **Tên Use Case** | Nhận lô hàng – Nhà bán lẻ (Retailer Receive Shipment) |
| **Actor chính** | Retailer |
| **Actor phụ** | System (ACID transaction, audit log) |
| **Mô tả** | Retailer xác nhận tiếp nhận Lô hàng vận chuyển từ Kho phân phối đến Cửa hàng của mình. Hệ thống cập nhật trạng thái RECEIVED, tăng tồn kho tại Cửa hàng, ghi timeline event và audit log trong giao dịch ACID. |
| **Tiền điều kiện** | Shipment tồn tại với trạng thái IN_TRANSIT. Actor có quyền hạn gắn với Cửa hàng đích (dest_node) của vận đơn. |
| **Hậu điều kiện** | Shipment.status=RECEIVED. Tồn kho tại Cửa hàng Retailer tăng lên. Batch.current_node_id cập nhật thành ID Cửa hàng. Timeline event RECEIVED được ghi. Audit log lưu vết. |
| **Priority** | MUST HAVE – Core Business Flow / ACID Critical |
| **API Endpoint** | PATCH /shipments/:id/receive |

**Luồng chính:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Retailer | Mở danh sách hàng đang vận chuyển đến Cửa hàng mình, chọn vận đơn, bấm 'Xác nhận nhận hàng'. | Hiển thị Chi tiết nhận hàng: batch info, qty_shipped, source_node, shipped_at. |     |
| 2   | Retailer | Đồng kiểm hàng thực tế tại cửa hàng, nhập qty_received, ghi chú tình trạng hàng, submit. | Validate: actor.node_id = shipment.dest_node_id |     |
| 3   | System | BEGIN TRANSACTION | Bắt đầu ACID transaction bảo vệ dữ liệu bán lẻ |     |
| 4   | System | SELECT shipment FOR UPDATE: kiểm tra status = IN_TRANSIT | Loại bỏ rủi ro xác nhận đồng thời | Pessimistic lock |
| 5   | System | UPDATE shipments SET status=RECEIVED, received_by=actor, received_at=NOW(), qty_received=qty | Lưu thông tin tiếp nhận và thời gian ký nhận |     |
| 6   | System | UPSERT inventory: qty_available += qty_received tại dest_node (ON CONFLICT DO UPDATE) | Tăng tồn kho thương mại tại Cửa hàng |     |
| 7   | System | UPDATE batches SET current_node_id=dest_node_id | Vị trí Batch sang ID Cửa hàng bán lẻ |     |
| 8   | System | INSERT timeline_events (RECEIVED) + INSERT audit_logs + COMMIT | Immutable trail hoàn chỉnh |     |
| 9   | Client | Toast 'Cửa hàng xác nhận nhận hàng thành công.' Navigate về trang quản lý kệ hàng. |     |     |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | Actor không thuộc dest_node | HTTP 403 – 'Tài khoản của bạn không được phân quyền tiếp nhận lô hàng này.' Ghi audit_log. |
| A2  | Shipment đã RECEIVED trước đó | Block: 'Vận đơn đã được ký nhận hoàn tất.' (BR-12) |
| A3  | qty_received < qty_shipped (hàng hư hỏng) | Cho phép nhập số lượng thực tế đạt chất lượng. Yêu cầu lý do + bằng chứng. Tạo shipment_issues (DAMAGED) → UC-16 sub-flow. |
| A4  | Shipment DELAYED | Cho phép nhận bình thường. Hệ thống tự đóng phiếu sự cố trễ liên quan. |

- **UC-15: Mark Batch as Sold/Consumed**

|     |     |
| --- | --- |
| **Use Case ID** | UC-15 |
| **Tên Use Case** | Đánh dấu lô hàng đã bán (Mark Batch as Sold/Consumed) |
| **Actor chính** | Retailer (Admin cũng có thể thực hiện) |
| **Actor phụ** | System (ACID transaction, audit log) |
| **Mô tả** | Retailer đánh dấu toàn bộ hoặc một phần Batch đã bán cho Consumer. Khi toàn bộ quantity được bán, Batch chuyển sang trạng thái terminal SOLD. |
| **Tiền điều kiện** | Retailer đã đăng nhập. Batch ở trạng thái RECEIVED tại node của Retailer. Inventory > 0. |
| **Hậu điều kiện** | Inventory giảm theo qty_sold. Nếu inventory = 0: batch.status=SOLD (terminal). Timeline event SOLD được ghi. Audit log ghi nhận. |
| **Priority** | MUST HAVE – Core |
| **API Endpoint** | POST /batches/:id/sell |

**Luồng chính:**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **#** | **Actor** | **Hành động** | **Phản hồi hệ thống** | **Ghi chú** |
| 1   | Retailer | Vào Batch tại node mình → Click 'Đánh dấu đã bán' | Hiển thị form: qty_sold (max=inventory_current), sale_date, buyer_ref (optional) |     |
| 2   | Retailer | Nhập qty_sold và Submit | Validate: qty_sold &lt;= inventory_available, qty_sold &gt; 0 |     |
| 3   | System | BEGIN TRANSACTION | Bắt đầu ACID transaction |     |
| 4   | System | SELECT inventory FOR UPDATE | Lock inventory, lấy qty hiện tại | Pessimistic lock |
| 5   | System | UPDATE inventory SET quantity_available -= qty_sold | Tồn kho giảm |     |
| 6   | System | Kiểm tra nếu inventory = 0 → UPDATE batches SET status=SOLD | Batch chuyển sang terminal state nếu hết hàng | Terminal |
| 7   | System | INSERT timeline_events (SOLD, quantity_delta=-qty_sold) + INSERT audit_logs + COMMIT | Transaction hoàn tất |     |
| 8   | Client | Cập nhật Dashboard: inventory mới, badge SOLD nếu hết hàng | Real-time UI update |     |

**Luồng thay thế & Ngoại lệ**

|     |     |     |
| --- | --- | --- |
| **#** | **Tình huống** | **Xử lý** |
| A1  | qty_sold > inventory_available | HTTP 400 – 'Số lượng bán vượt quá tồn kho. Hiện có: X.' |
| A2  | Retailer mark SOLD hàng không phải của mình | HTTP 403 – 'Batch này không thuộc node của bạn.' |
| A3  | Batch đã SOLD (terminal) | Block: 'Lô hàng này đã được bán hoàn toàn. Không thể thao tác thêm.' |
| A4  | Partial sell (chỉ bán một phần) | Cho phép. Batch vẫn status=RECEIVED cho đến khi inventory = 0. |

### Ma trận phân quyền

Để hiện thực hóa nguyên tắc phân tách trách nhiệm nghiệp vụ và bảo vệ an toàn dữ liệu mức cơ sở dữ liệu, hệ thống thiết lập một Ma trận phân quyền chi tiết. Ma trận này phân định rõ ràng các quyền truy cập API Endpoints và các thao tác thay đổi dữ liệu của từng tác nhân riêng biệt. Mọi nỗ lực truy cập trái phép từ các vai trò không được thiết lập trong ma trận sẽ bị hệ thống từ chối ngay lập tức ở tầng Middleware bảo mật và trả về mã lỗi HTTP 403 Forbidden.

|     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- |
| **Use Case** | **Admin** | **Manufacturer** | **Distributor** | **Retailer** | **Consumer** |
| **UC-01 Login** | ✓   | ✓   | ✓   | ✓   | —   |
| **UC-02 Manage Nodes** | ✓   | —   | —   | —   | —   |
| **UC-03 Create Batch** | ✓   | ✓   | —   | —   | —   |
| **UC-04 View Batch Detail** | ✓   | ✓ (own) | ✓ (related) | ✓ (related) | —   |
| **UC-05 Generate QR** | ✓   | ✓   | —   | —   | —   |
| **UC-06 Transfer Shipment** | ✓   | ✓   | ✓   | —   | —   |
| **UC-07 Receive Shipment** | ✓   | —   | ✓   | ✓   | —   |
| **UC-08 Scan QR** | ✓   | ✓   | ✓   | ✓   | ✓ (public) |
| **UC-09 Trace Timeline** | ✓   | ✓   | ✓   | ✓   | ✓ (public) |
| **UC-10 Dashboard** | ✓   | ✓ (own) | ✓ (own) | ✓ (own) | —   |
| **UC-11 Map View** | ✓   | —   | —   | —   | —   |
| **UC-12 Manage Users** | ✓   | —   | —   | —   | —   |
| **UC-13 Audit Log** | ✓   | —   | —   | —   | —   |
| **UC-14 Export Report** | ✓   | ✓   | —   | —   | —   |
| **UC-15 Mark Sold** | ✓   | —   | —   | ✓   | —   |
| **UC-16 Lost & Incident** | ✓ (full) | —   | —   | —   | —   |
| **UC-17 Manufacturer Transfer Shipment** | ✓   | ✓   | —   | —   | —   |
| **UC-18 Distributor Transfer Shipment** | ✓   | —   | ✓   | —   | —   |
| **UC-19 Distributor Receive Shipment** | ✓   | —   | ✓   | —   | —   |
| **UC-20 Retailer Receive Shipment** | ✓   | —   | —   | ✓   | —   |

**Chú thích:** ✓ = có quyền | ✓ (own) = chỉ data của mình | — = không có quyền

### Kết luận chương 3

Trong Chương 3, nhóm em đã hoàn thành việc khảo sát và mô hình hóa quy trình nghiệp vụ của hệ thống. Thông qua quá trình phân tích chuỗi cung ứng thực tế, nhóm đã xây dựng được mô hình vòng đời khép kín của lô hàng, đồng thời xác định rõ 05 tác nhân người dùng, 01 tác nhân tự động (Cron Job) và ma trận phân quyền chi tiết cho từng API Endpoint. Bên cạnh đó, nhóm cũng hoàn thiện đặc tả cho 20 Use Case, bao gồm các nghiệp vụ cốt lõi và phân hệ quản lý sự cố đặc thù, chẳng hạn như cơ chế phê duyệt kép (Two-Man Rule) dùng để rollback kho khi xảy ra thất lạc hàng hóa. Các kết quả phân tích này tạo cơ sở để nhóm chuyển sang Chương 4, tập trung vào thiết kế cơ sở dữ liệu chuẩn hóa 3NF và xây dựng các luồng giao dịch an toàn theo chuẩn ACID.

## THIẾT KẾ CƠ SỞ DỮ LIỆU

### Thiết kế kiến trúc Cơ sở dữ liệu

#### Sơ đồ thực thể liên kết (ERD)

##### Nhóm Core – Identity

Đây là nhóm nền tảng phụ trách việc quản lý danh tính, bảo mật và kiểm soát truy cập. Nhóm này quyết định "Ai được phép đăng nhập vào hệ thống" và "Họ được phép làm những chức năng gì".

Hình 11: Mô hình ERD cơ sở dữ liệu của nhóm core - identity

- Chi tiết các bảng
    - Bảng users: Tài khoản người dùng, xác thực & phân quyền

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính, tự sinh bằng gen_random_uuid() |
| email | varchar(255) | Email đăng nhập, duy nhất (unique), viết thường, có index |
| password_hash | varchar(255) | Mật khẩu đã hash bằng bcrypt |
| full_name | varchar(150) | Họ và tên đầy đủ của người dùng |
| node_id | uuid | Liên kết đến node (null nếu là Admin) |
| is_active | boolean | Trạng thái tài khoản – soft disable (mặc định: true) |
| created_at | timestamptz | Thời điểm tạo bản ghi |
| updated_at | timestamptz | Thời điểm cập nhật gần nhất |
| deleted_at | timestamptz | Soft delete – null nếu chưa xóa |
| version | integer | Optimistic locking – tăng mỗi lần cập nhật |

- - Bảng roles: Danh sách vai trò hệ thống

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính, tự sinh bằng gen_random_uuid() |
| name | varchar(50) | Tên vai trò: Admin \| Manufacturer \| Distributor \| Retailer \| Consumer (unique) |
| description | text | Mô tả chi tiết về vai trò (có thể null) |
| created_at | timestamptz | Thời điểm tạo bản ghi |

- - Bảng users-roles: Bảng phụ thể hiện quan hệ giữa users và roles

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| user_id | uuid | FK → users.id; phần của khóa chính kép (composite PK) |
| role_id | uuid | FK → roles.id; phần của khóa chính kép (composite PK) |
| assigned_at | timestamptz | Thời điểm gán vai trò cho người dùng |

##### Nhóm Core - Supply Chain

Đây là "trái tim" của hệ thống, lưu trữ toàn bộ dữ liệu về thực thể vật lý, vòng đời sản phẩm và sự luân chuyển hàng hóa. Nhóm này quản lý việc hàng hóa đi từ điểm này đến điểm khác và số lượng tồn kho theo thời gian thực.

Hình 12: Mô hình ERD cơ sở dữ liệu của nhóm core - supply chain

- Chi tiết các bảng
    - Bảng nodes: Điểm trong chuỗi cung ứng (Nhà máy, kho, siêu thị,…)

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính, tự sinh bằng gen_random_uuid() |
| name | varchar(200) | Tên của node |
| node_type | varchar(20) | Loại node: MANUFACTURER \| DISTRIBUTOR \| RETAILER \| WAREHOUSE |
| address | text | Địa chỉ thực tế (có thể null) |
| latitude | decimal(10,7) | Vĩ độ GPS (có thể null) |
| longitude | decimal(10,7) | Kinh độ GPS (có thể null) |
| is_active | boolean | Trạng thái hoạt động (mặc định: true) |
| created_at | timestamptz | Thời điểm tạo bản ghi |
| updated_at | timestamptz | Thời điểm cập nhật gần nhất |
| deleted_at | timestamptz | Soft delete – null nếu chưa xóa |
| version | integer | Optimistic locking |

- - Bảng products: Danh mục sản phẩm

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính, tự sinh bằng gen_random_uuid() |
| name | varchar(200) | Tên sản phẩm |
| sku | varchar(100) | Mã SKU, duy nhất (unique) |
| unit | varchar(50) | Đơn vị tính: kg \| box \| pcs… |
| description | text | Mô tả chi tiết sản phẩm (có thể null) |
| category | varchar(100) | Danh mục sản phẩm (có thể null) |
| is_active | boolean | Trạng thái sản phẩm (mặc định: true) |
| created_at | timestamptz | Thời điểm tạo bản ghi |
| updated_at | timestamptz | Thời điểm cập nhật gần nhất |
| deleted_at | timestamptz | Soft delete – null nếu chưa xóa |

- - Bảng batches: Lô hàng

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính, tự sinh bằng gen_random_uuid() |
| batch_code | varchar(100) | Mã lô hàng duy nhất, định dạng BCH-YYYYMMDD-xxxx |
| product_id | uuid | FK → products.id |
| origin_node_id | uuid | FK → nodes.id – nơi sản xuất/xuất xứ |
| current_node_id | uuid | FK → nodes.id – vị trí hiện tại của lô hàng |
| quantity | decimal(12,3) | Số lượng ban đầu (CHECK > 0) |
| unit | varchar(50) | Đơn vị tính, denormalized để đảm bảo tính bất biến |
| manufacture_date | date | Ngày sản xuất |
| expiry_date | date | Ngày hết hạn (CHECK > manufacture_date) |
| status | varchar(20) | Trạng thái lô: CREATED \| IN_TRANSIT \| RECEIVED \| SOLD \| DISCARDED \| LOST |
| created_by | uuid | FK → users.id – người tạo lô hàng |
| created_at | timestamptz | Thời điểm tạo bản ghi |
| updated_at | timestamptz | Thời điểm cập nhật gần nhất |
| version | integer | Optimistic locking |

- - Bảng batch_qr_codes: QR code gắn với từng Batch (Quan hệ 1: 1)

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính |
| batch_id | uuid | FK → batches.id, unique (1 batch – 1 QR code) |
| qr_data | text | Payload QR: URL hoặc chuỗi được encode |
| qr_image_url | text | Đường dẫn S3/CDN lưu ảnh QR (có thể null) |
| generated_at | timestamptz | Thời điểm tạo QR code |
| generated_by | uuid | FK → users.id – người tạo QR |

- - Bảng shipments: Bảng ghi vận chuyển giữa 2 node

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính |
| tracking_code | varchar(100) | Mã vận đơn duy nhất, định dạng SHP-YYYYMMDD-xxxx |
| batch_id | uuid | FK → batches.id |
| source_node_id | uuid | FK → nodes.id – kho xuất hàng |
| dest_node_id | uuid | FK → nodes.id – kho nhận hàng (CHECK != source_node_id) |
| quantity_shipped | decimal(12,3) | Số lượng xuất kho (CHECK > 0) |
| quantity_received | decimal(12,3) | Số lượng nhận được – null cho đến khi trạng thái RECEIVED |
| status | varchar(20) | Trạng thái: IN_TRANSIT \| RECEIVED \| REJECTED \| DELAYED \| INVESTIGATING \| LOST \| DAMAGED \| CANCELLED |
| shipped_by | uuid | FK → users.id – người xuất hàng |
| received_by | uuid | FK → users.id – người nhận hàng (có thể null) |
| shipped_at | timestamptz | Thời điểm xuất kho |
| received_at | timestamptz | Thời điểm nhận hàng (có thể null) |
| notes | text | Ghi chú bổ sung (có thể null) |

- - Bảng inventory: Tồn kho theo Batch x Node

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| batch_id | uuid | FK → batches.id; phần của composite PK |
| node_id | uuid | FK → nodes.id; phần của composite PK |
| quantity_available | decimal(12,3) | Số lượng khả dụng tại node (CHECK >= 0) |
| last_updated_at | timestamptz | Thời điểm cập nhật tồn kho gần nhất |
| version | integer | Optimistic lock – dùng SELECT FOR UPDATE khi cập nhật |

##### Nhóm Audit - Immutable

Chịu trách nhiệm theo dõi và lưu vết (tracking & tracing). Đặc tính quan trọng nhất của nhóm này là Bất biến (Immutable) – nghĩa là dữ liệu chỉ được _thêm mới_ (Insert-only), tuyệt đối không được sửa (Update) hay xóa (Delete). Điều này đảm bảo tính minh bạch, chống gian lận và phục vụ cho thanh tra, truy xuất nguồn gốc.

Hình 13: Mô hình ERD cơ sở dữ liệu của nhóm audit - immutable

- Chi tiết các bảng
    - Bảng timeline_events: Ghi lại các mốc sự kiện quan trọng trong vòng đời của một thực thể

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính |
| batch_id | uuid | FK → batches.id |
| event_type | varchar(30) | Loại sự kiện: CREATED \| SHIPPED \| RECEIVED \| SOLD \| DISCARDED \| DELAYED \| INVESTIGATING \| LOST \| DAMAGED \| CANCELLED \| INVENTORY_ADJUSTED \| INCIDENT_CLOSED |
| node_id | uuid | FK → nodes.id – nơi xảy ra sự kiện |
| actor_id | uuid | FK → users.id – người thực hiện sự kiện |
| shipment_id | uuid | FK → shipments.id (có thể null) |
| quantity_delta | decimal(12,3) | Thay đổi số lượng (+/-), null nếu không liên quan số lượng |
| notes | text | Ghi chú sự kiện (có thể null) |
| occurred_at | timestamptz | Thời điểm xảy ra sự kiện – IMMUTABLE |
| metadata | text | JSONB – Dữ liệu linh hoạt bổ sung (có thể null) |

- - Bảng audit_logs: Ghi lại mọi thao tác của người dùng trên phần mềm

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính |
| actor_id | uuid | FK → users.id – người thực hiện hành động |
| action | varchar(50) | Loại hành động: CREATE \| UPDATE \| DELETE \| LOGIN… |
| entity_type | varchar(50) | Tên bảng/entity bị tác động |
| entity_id | uuid | ID của bản ghi bị tác động |
| old_values | text | JSONB snapshot trạng thái trước khi thay đổi (có thể null) |
| new_values | text | JSONB snapshot trạng thái sau khi thay đổi (có thể null) |
| ip_address | varchar(45) | Địa chỉ IP của người thực hiện (có thể null) |
| user_agent | text | Thông tin trình duyệt/client (có thể null) |
| occurred_at | timestamptz | Thời điểm xảy ra hành động |

- - Bảng scan_logs: Lưu lại lịch sử mỗi lần mã QR/Barcode được thiết bị quét. Bảng này giúp vẽ lên bản đồ đường đi thực tế của hàng hóa dựa trên tọa độ (GPS) và thời gian quét.

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính |
| batch_id | uuid | FK → batches.id |
| qr_code_id | uuid | FK → batch_qr_codes.id |
| scanned_by | uuid | FK → users.id – null nếu là Consumer ẩn danh |
| ip_address | varchar(45) | Địa chỉ IP của người quét (có thể null) |
| user_agent | text | Thông tin trình duyệt/thiết bị (có thể null) |
| latitude | decimal(10,7) | Vĩ độ GPS khi quét (có thể null) |
| longitude | decimal(10,7) | Kinh độ GPS khi quét (có thể null) |
| scanned_at | timestamptz | Thời điểm quét QR code |

##### Nhóm Incident Management

Theo dõi, báo cáo và quản lý quy trình xử lý các rủi ro, sai lệch hoặc tai nạn phát sinh trong chuỗi cung ứng để có biện pháp khắc phục kịp thời.

Hình 14: Mô hình ERD cơ sở dữ liệu của nhóm Incident Management

- Chi tiết các bảng
    - Bảng incident_reports: Hồ sơ ghi nhận các vấn đề chung ảnh hưởng đến vận hành (MISSING / DAMAGED / FRAUD)

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính, tự sinh bằng gen_random_uuid() |
| incident_code | varchar(50) | Mã sự cố duy nhất, định dạng INC-YYYYMMDD-xxxx |
| shipment_id | uuid | FK → shipments.id |
| batch_id | uuid | FK → batches.id – denorm để truy vấn nhanh |
| incident_type | varchar(20) | Loại sự cố: OVERDUE \| MISSING \| DAMAGED \| FRAUD \| OTHER |
| status | varchar(20) | Trạng thái: OPEN \| IN_PROGRESS \| RESOLVED \| CLOSED |
| priority | varchar(10) | Mức ưu tiên: LOW \| MEDIUM \| HIGH \| CRITICAL |
| reported_by | uuid | FK → users.id – Admin mở incident |
| assigned_to | uuid | FK → users.id – người phụ trách xử lý (có thể null) |
| description | text | Mô tả sự cố, tối thiểu 20 ký tự |
| resolution | text | Cách thức giải quyết (có thể null) |
| resolution_type | varchar(50) | Kết quả: FOUND \| LOSS_CONFIRMED \| CANCELLED \| CORRECTED (có thể null) |
| approved_by | uuid | FK → users.id – approver thứ 2 (Two-Man Rule, CHECK != reported_by) |
| evidence_jsonb | text | JSONB – Ảnh, tracking, GPS data… (có thể null) |
| opened_at | timestamptz | Thời điểm mở incident |
| resolved_at | timestamptz | Thời điểm giải quyết (có thể null) |
| closed_at | timestamptz | Thời điểm đóng incident (có thể null) |
| version | integer | Optimistic locking |

- - Bảng shipment_issues: Flag bất thường từng shipment 

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính |
| shipment_id | uuid | FK → shipments.id |
| issue_type | varchar(20) | Loại vấn đề: OVERDUE \| MISSING \| WRONG_NODE \| UNACKNOWLEDGED \| DAMAGED \| FRAUD |
| severity | varchar(10) | Mức độ nghiêm trọng: LOW \| MEDIUM \| HIGH \| CRITICAL |
| detected_at | timestamptz | Thời điểm phát hiện vấn đề |
| detected_by | varchar(50) | Nguồn phát hiện: SYSTEM_CRON hoặc USER:{userId} |
| reported_by | uuid | FK → users.id – null nếu auto-detect |
| notes | text | Ghi chú bổ sung (có thể null) |
| is_resolved | boolean | Đã giải quyết hay chưa (mặc định: false) |
| resolved_at | timestamptz | Thời điểm giải quyết (có thể null) |
| incident_report_id | uuid | FK → incident_reports.id – null nếu chưa escalate |

- - Bảng inventory_adjustments: Audit trail điều chỉnh tồn kho 

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính |
| batch_id | uuid | FK → batches.id |
| node_id | uuid | FK → nodes.id |
| adjustment_type | varchar(20) | Loại điều chỉnh: LOSS_ROLLBACK \| DAMAGE_WRITE_OFF \| CORRECTION \| RECONCILIATION |
| qty_before | decimal(12,3) | Số lượng tồn kho trước khi điều chỉnh |
| qty_delta | decimal(12,3) | Lượng thay đổi (+/-); CHECK: qty_after = qty_before + qty_delta |
| qty_after | decimal(12,3) | Số lượng tồn kho sau khi điều chỉnh |
| reason | text | Lý do điều chỉnh (bắt buộc) |
| approved_by | uuid | FK → users.id – Admin 1 (người tạo yêu cầu) |
| second_approver | uuid | FK → users.id – Admin 2 (Two-Man Rule cho LOSS_ROLLBACK, có thể null) |
| reference_id | uuid | ID tham chiếu đến incident_reports hoặc shipments (có thể null) |
| reference_type | varchar(50) | Loại bảng tham chiếu: incident_reports \| shipments (có thể null) |
| created_at | timestamptz | Thời điểm tạo bản ghi |

- - Bảng escalation_logs: Ghi lại quá trình báo cáo sự cố lên các cấp quản lý cao hơn.

| **Tên Cột** | **Kiểu Dữ Liệu** | **Mô Tả** |
| --- | --- | --- |
| id  | uuid | Khóa chính |
| incident_id | uuid | FK → incident_reports.id |
| from_level | varchar(10) | Cấp độ trước khi leo thang: L1 \| L2 \| L3 \| L4 |
| to_level | varchar(10) | Cấp độ sau khi leo thang: L1 \| L2 \| L3 \| L4 |
| escalated_by | uuid | FK → users.id – Admin thực hiện leo thang |
| reason | text | Lý do leo thang (bắt buộc) |
| escalated_at | timestamptz | Thời điểm thực hiện leo thang |
| auto_triggered | boolean | true nếu được kích hoạt tự động bởi CRON job |

### Thiết kế luồng giao dịch

Phần này mô tả chi tiết các luồng giao dịch quan trọng nhất trong hệ thống, bao gồm các thao tác trên cơ sở dữ liệu (DB Operations), cơ chế khóa (Locking), và đảm bảo tính ACID cho từng nghiệp vụ cốt lõi.

Mỗi luồng giao dịch đều được thiết kế theo nguyên tắc:

- Atomicity: Tất cả các bước thực hiện thành công hoặc ROLLBACK toàn bộ.
- Consistency: Ràng buộc dữ liệu (CHECK, FK, UNIQUE) luôn được duy trì.
- Isolation: Dùng Pessimistic Lock (SELECT FOR UPDATE) ở các điểm tranh chấp tồn kho.
- Durability: Sau COMMIT, dữ liệu được ghi bền vững, kể cả timeline_events và audit_logs.

#### Luồng tạo lô hàng & sinh mã QR

Đây là luồng khởi đầu vòng đời của một lô hàng. Manufacturer tạo lô hàng mới, hệ thống tự động sinh mã batch_code, khởi tạo tồn kho và tạo mã QR gắn liền với lô hàng. Toàn bộ quá trình phải nằm trong 1 transaction để đảm bảo không có lô hàng nào tồn tại mà thiếu tồn kho hoặc thiếu QR code.

| **Bước** | **Tác nhân** | **Thao tác / Mô tả** | **DB Operation** | **Ghi chú** |
| --- | --- | --- | --- | --- |
| **1** | Client (Manufacturer) | Gửi thông tin tạo lô hàng (product_id, quantity, manufacture_date, expiry_date) | —   | Validate: expiry_date > manufacture_date, qty > 0 |
| **2** | API Server | Kiểm tra vai trò Manufacturer | SELECT roles WHERE user_id=? | Chỉ Manufacturer được tạo lô hàng |
| **3** | API Server | Sinh batch_code định dạng BCH-YYYYMMDD-xxxx | SELECT gen_random_uuid() / logic sinh code | Đảm bảo unique trên bảng batches |
| **4** | API Server | INSERT lô hàng mới | INSERT INTO batches (batch_code, product_id, origin_node_id, current_node_id, quantity, status='CREATED', created_by, created_at) | origin_node_id = node của Manufacturer đang đăng nhập |
| **5** | API Server | Khởi tạo tồn kho tại node Manufacturer | INSERT INTO inventory (batch_id, node_id, quantity_available=quantity, version=1) | Tồn kho ban đầu bằng số lượng lô hàng |
| **6** | QR Service | Sinh QR payload (URL truy xuất công khai) | Logic: url = https://domain/trace/{batch_id} | Payload được encode thành ảnh QR PNG |
| **7** | API Server | Lưu metadata QR code | INSERT INTO batch_qr_codes (batch_id, qr_data, qr_image_url, generated_at, generated_by) | qr_image_url trỏ đến CDN/S3 |
| **8** | API Server | Ghi timeline event khởi tạo | INSERT INTO timeline_events (event_type='CREATED', batch_id, node_id, actor_id, quantity_delta=+quantity, occurred_at) | —   |
| **9** | API Server | Ghi audit log | INSERT INTO audit_logs (action='CREATE', entity_type='batches', entity_id, new_values, ...) | —   |
| **10** | API Server | COMMIT & trả kết quả | COMMIT | Response: batch_id, batch_code, qr_image_url |

#### Luồng xuất kho – Tạo vận đơn

Luồng này xử lý việc chuyển hàng từ một node sang node khác. Đây là luồng có nguy cơ tranh chấp dữ liệu cao nhất vì nhiều người dùng có thể cùng lúc xuất kho từ một lô hàng. Hệ thống sử dụng Pessimistic Locking (SELECT FOR UPDATE) để đảm bảo chỉ một tác nhân được trừ kho tại một thời điểm, và Optimistic Locking (version field) làm lớp bảo vệ thứ hai.

| **Bước** | **Tác nhân** | **Thao tác / Mô tả** | **DB Operation** | **Ghi chú** |
| --- | --- | --- | --- | --- |
| **1** | Client | Gửi yêu cầu chuyển kho (source_node, dest_node, batch_id, qty) | —   | Validate input tại tầng API |
| **2** | API Server | Kiểm tra quyền hạn actor | SELECT users, roles WHERE user_id = ? | Chỉ Manufacturer / Distributor mới được tạo shipment |
| **3** | API Server | Đọc tồn kho & khóa bản ghi để tránh race condition | SELECT ... FROM inventory WHERE batch_id=? AND node_id=? FOR UPDATE | Pessimistic Lock – giữ khóa cho đến khi COMMIT |
| **4** | API Server | Kiểm tra số lượng khả dụng ≥ qty yêu cầu | CHECK: quantity_available >= qty_shipped | Nếu không đủ → ROLLBACK, trả lỗi 400 |
| **5** | API Server | Tạo bản ghi vận đơn | INSERT INTO shipments (tracking_code, batch_id, source_node_id, dest_node_id, quantity_shipped, status='IN_TRANSIT', shipped_at) | tracking_code tự sinh: SHP-YYYYMMDD-xxxx |
| **6** | API Server | Trừ tồn kho tại node nguồn | UPDATE inventory SET quantity_available = quantity_available - qty_shipped, version = version + 1 WHERE batch_id=? AND node_id=? AND version=? | Optimistic Lock check qua version |
| **7** | API Server | Cập nhật trạng thái lô hàng | UPDATE batches SET status='IN_TRANSIT', current_node_id=dest_node_id, version=version+1 | —   |
| **8** | API Server | Ghi sự kiện bất biến vào timeline | INSERT INTO timeline_events (batch_id, event_type='SHIPPED', node_id, actor_id, shipment_id, quantity_delta, occurred_at) | Append-only, không UPDATE/DELETE |
| **9** | API Server | Ghi nhật ký kiểm toán | INSERT INTO audit_logs (actor_id, action='CREATE', entity_type='shipments', entity_id, new_values, ip_address, occurred_at) | —   |
| **10** | API Server | COMMIT toàn bộ transaction | COMMIT | Nếu bất kỳ bước nào lỗi → ROLLBACK toàn bộ |

#### Luồng xác nhận nhận hàng

Distributor hoặc Retailer xác nhận đã nhận hàng từ vận đơn. Luồng này thực hiện cộng tồn kho tại node đích và cập nhật trạng thái vận đơn. UPSERT được dùng để an toàn xử lý cả trường hợp node nhận hàng lần đầu (chưa có bản ghi inventory) lẫn trường hợp đã có tồn kho trước đó.

| **Bước** | **Tác nhân** | **Thao tác / Mô tả** | **DB Operation** | **Ghi chú** |
| --- | --- | --- | --- | --- |
| **1** | Client | Gửi yêu cầu xác nhận nhận hàng (shipment_id, quantity_received) | —   | Actor: Distributor hoặc Retailer |
| **2** | API Server | Kiểm tra quyền hạn & tìm vận đơn | SELECT shipments WHERE id=? AND status='IN_TRANSIT' | Nếu status != IN_TRANSIT → lỗi 409 |
| **3** | API Server | Khóa bản ghi shipment | SELECT ... FROM shipments WHERE id=? FOR UPDATE | Pessimistic Lock tránh double-receive |
| **4** | API Server | Cập nhật trạng thái vận đơn | UPDATE shipments SET status='RECEIVED', quantity_received=?, received_by=?, received_at=NOW() | quantity_received có thể nhỏ hơn quantity_shipped (nhận thiếu) |
| **5** | API Server | Cộng tồn kho tại node đích (UPSERT) | INSERT INTO inventory (batch_id, node_id, quantity_available) VALUES (?,?,?) ON CONFLICT (batch_id, node_id) DO UPDATE SET quantity_available = quantity_available + qty | UPSERT đảm bảo an toàn khi chưa có bản ghi tồn kho |
| **6** | API Server | Cập nhật vị trí hiện tại của lô hàng | UPDATE batches SET status='RECEIVED', current_node_id=dest_node_id, version=version+1 | —   |
| **7** | API Server | Ghi timeline event bất biến | INSERT INTO timeline_events (event_type='RECEIVED', batch_id, node_id, actor_id, shipment_id, quantity_delta=+qty, occurred_at) | —   |
| **8** | API Server | Ghi audit log | INSERT INTO audit_logs (...) | —   |
| **9** | API Server | COMMIT transaction | COMMIT | Rollback nếu có lỗi bất kỳ |

#### Luồng phát hiện trễ hạng tự động

Đây là luồng phi tương tác người dùng, được thực thi bởi tiến trình nền (System Cron Job) chạy định kỳ mỗi 1 giờ. Cron Job quét tất cả các vận đơn đang IN_TRANSIT quá 48 giờ mà chưa được xác nhận, tự động cắm cờ cảnh báo và chuyển trạng thái lô hàng sang DELAYED.

| **Bước** | **Tác nhân** | **Thao tác / Mô tả** | **DB Operation** | **Ghi chú** |
| --- | --- | --- | --- | --- |
| **1** | System (CRON) | Chạy định kỳ mỗi 1 giờ | —   | Được lập lịch bằng NestJS Scheduler hoặc cron tầng OS |
| **2** | System (CRON) | Query tất cả vận đơn IN_TRANSIT quá 48h chưa nhận | SELECT \* FROM shipments WHERE status='IN_TRANSIT' AND shipped_at < NOW() - INTERVAL '48 hours' AND id NOT IN (SELECT shipment_id FROM shipment_issues WHERE issue_type='OVERDUE') | Tránh tạo duplicate issue |
| **3** | System (CRON) | Với mỗi shipment overdue: tạo flag cảnh báo | INSERT INTO shipment_issues (shipment_id, issue_type='OVERDUE', severity='HIGH', detected_at=NOW(), detected_by='SYSTEM_CRON', is_resolved=false) | —   |
| **4** | System (CRON) | Cập nhật trạng thái lô hàng sang DELAYED | UPDATE batches SET status='DELAYED', version=version+1 WHERE id=batch_id | —   |
| **5** | System (CRON) | Ghi timeline event bất biến | INSERT INTO timeline_events (event_type='DELAYED', batch_id, actor_id=NULL, occurred_at=NOW()) | actor_id=NULL vì là system action |
| **6** | System (CRON) | Ghi audit log hệ thống | INSERT INTO audit_logs (actor_id=NULL, action='AUTO_DELAY', entity_type='batches', entity_id=batch_id, occurred_at) | —   |
| **7** | System (CRON) | COMMIT từng batch một (loop) | COMMIT per batch | Dùng transaction riêng mỗi batch để tránh 1 lỗi ảnh hưởng tất cả |

#### Luồng xác nhận thất lạc & Rollback kho

Đây là luồng phức tạp và nhạy cảm nhất trong hệ thống, áp dụng cơ chế Two-Man Approval (hai Admin độc lập phải cùng phê duyệt) để đảm bảo không có trường hợp xóa kho đơn phương. Sau khi xác nhận thất lạc, hệ thống tự động rollback tồn kho về node xuất phát ban đầu và ghi lại toàn bộ audit trail bất biến.

| **Bước** | **Tác nhân** | **Thao tác / Mô tả** | **DB Operation** | **Ghi chú** |
| --- | --- | --- | --- | --- |
| **1** | Admin 1 | Mở hồ sơ điều tra sự cố (incident_report) | INSERT INTO incident_reports (incident_code, shipment_id, batch_id, incident_type='MISSING', status='OPEN', reported_by=Admin1, opened_at) | Admin 1 là người mở case |
| **2** | API Server | Đóng băng tồn kho liên quan (cờ cảnh báo) | UPDATE batches SET status='INVESTIGATING', version=version+1 | Không trừ kho ngay – chờ xác nhận LOST |
| **3** | API Server | Ghi timeline event điều tra | INSERT INTO timeline_events (event_type='INVESTIGATING', batch_id, actor_id=Admin1, occurred_at) | Append-only |
| **4** | Admin 1 | Cập nhật hồ sơ: kết quả điều tra = LOST | UPDATE incident_reports SET status='IN_PROGRESS', resolution_type='LOSS_CONFIRMED' | Chờ Admin 2 phê duyệt |
| **5** | Admin 2 | Phê duyệt xác nhận thất lạc (Two-Man Rule) | UPDATE incident_reports SET approved_by=Admin2, status='RESOLVED' WHERE id=? AND reported_by != Admin2 | CHECK: approved_by != reported_by – bắt buộc 2 người khác nhau |
| **6** | API Server | Rollback tồn kho về kho xuất phát ban đầu | UPDATE inventory SET quantity_available = quantity_available + qty_lost WHERE batch_id=? AND node_id=source_node_id | Cộng lại kho nguồn đã trừ trước đó |
| **7** | API Server | Ghi audit trail điều chỉnh kho | INSERT INTO inventory_adjustments (batch_id, node_id, adjustment_type='LOSS_ROLLBACK', qty_before, qty_delta=+qty, qty_after, approved_by=Admin1, second_approver=Admin2, reference_id=incident_id) | Immutable – không xóa được |
| **8** | API Server | Cập nhật trạng thái lô hàng & vận đơn | UPDATE batches SET status='LOST' UPDATE shipments SET status='LOST' | Terminal state – không thể hoàn tác |
| **9** | API Server | Ghi 2 timeline event liên tiếp | INSERT INTO timeline_events (event_type='LOST', ...) INSERT INTO timeline_events (event_type='INVENTORY_ADJUSTED', ...) | Đảm bảo trail đầy đủ |
| **10** | API Server | Đóng hồ sơ sự cố | UPDATE incident_reports SET status='CLOSED', closed_at=NOW() | —   |
| **11** | API Server | COMMIT toàn bộ transaction | COMMIT | Bất kỳ lỗi nào → ROLLBACK, không có trạng thái trung gian |

#### Luồng quét QR & truy xuất nguồn gốc

Luồng này hoàn toàn là READ-ONLY, không yêu cầu xác thực. Consumer quét mã QR để xem toàn bộ lịch sử lô hàng. Đây là luồng duy nhất trong hệ thống không sử dụng transaction ghi dữ liệu (chỉ ghi scan_log bất đồng bộ), ưu tiên tốc độ phản hồi và khả năng chịu tải cao.

| **Bước** | **Tác nhân** | **Thao tác / Mô tả** | **DB Operation** | **Ghi chú** |
| --- | --- | --- | --- | --- |
| **1** | Consumer (thiết bị) | Quét mã QR, trích xuất URL/batch_id | —   | Không yêu cầu đăng nhập, giao diện public |
| **2** | API Server | Query thông tin lô hàng | SELECT batches, products, nodes WHERE batches.id=? | READ ONLY – không thay đổi dữ liệu |
| **3** | API Server | Query toàn bộ timeline của lô hàng | SELECT \* FROM timeline_events WHERE batch_id=? ORDER BY occurred_at ASC | Trả về chuỗi sự kiện theo thứ tự thời gian |
| **4** | API Server | Query thông tin các node (tọa độ GPS) | SELECT nodes.name, latitude, longitude WHERE id IN (SELECT node_id FROM timeline_events WHERE batch_id=?) | Dùng để vẽ bản đồ hành trình |
| **5** | API Server | Ghi log lượt quét (không trong transaction ghi dữ liệu) | INSERT INTO scan_logs (batch_id, qr_code_id, scanned_by=NULL, ip_address, user_agent, latitude, longitude, scanned_at) | Ghi bất đồng bộ (async) để không chậm response |
| **6** | API Server | Trả dữ liệu về Client | —   | Response: batch info + timeline events + node coordinates |
| **7** | Client | Render Timeline + Bản đồ hành trình | —   | Read-only, không mutation nào xảy ra |

### Kết luận chương 4

Chương 4 đã trình bày toàn diện kiến trúc cơ sở dữ liệu và thiết kế luồng giao dịch của hệ thống Quản lý chuỗi cung ứng Mini, được tổ chức thành bốn nhóm thực thể rõ ràng theo từng tầng chức năng và sáu luồng giao dịch cốt lõi đảm bảo tính toàn vẹn dữ liệu trong môi trường đa tác nhân.

Nhóm Core – Identity thiết lập nền tảng bảo mật và kiểm soát truy cập thông qua cơ chế phân quyền nhiều vai trò (Admin, Manufacturer, Distributor, Retailer, Consumer), đảm bảo mỗi tác nhân chỉ được phép thao tác đúng phạm vi nghiệp vụ của mình.

Nhóm Core – Supply Chain đóng vai trò trung tâm, mô hình hóa đầy đủ vòng đời của một lô hàng từ lúc khởi tạo đến khi tiêu thụ, bao gồm các thực thể nút mạng lưới, danh mục sản phẩm, lô hàng, mã QR, vận đơn và tồn kho theo thời gian thực.

Nhóm Audit – Immutable đảm bảo tính minh bạch và chống gian lận thông qua cơ chế Append-only, trong đó mọi sự kiện vòng đời (timeline_events), thao tác người dùng (audit_logs) và lượt quét mã QR (scan_logs) đều được lưu vết bất biến, không thể sửa hay xóa ở tầng cơ sở dữ liệu.

Nhóm Incident Management hoàn thiện hệ thống bằng phân hệ xử lý rủi ro toàn diện, hỗ trợ phát hiện tự động trễ hạn, mở hồ sơ điều tra và xác nhận thất lạc theo cơ chế Two-Man Approval nhằm ngăn chặn mọi hành vi gian lận đơn phương.

Về thiết kế luồng giao dịch, chương này đã đặc tả chi tiết sáu luồng nghiệp vụ quan trọng nhất, gồm: tạo lô hàng và sinh mã QR, xuất kho tạo vận đơn, xác nhận nhận hàng, phát hiện trễ hạn tự động qua Cron Job, xác nhận thất lạc với rollback tồn kho, và truy xuất nguồn gốc công khai. Mỗi luồng đều tuân thủ đầy đủ tính chất ACID, áp dụng kết hợp Pessimistic Locking (SELECT FOR UPDATE) tại các điểm tranh chấp tồn kho và Optimistic Locking (trường version) như lớp bảo vệ thứ hai, đảm bảo hệ thống hoạt động an toàn ngay cả khi nhiều tác nhân thao tác đồng thời trên cùng một lô hàng.

Tổng thể, toàn bộ cơ sở dữ liệu được thiết kế đạt chuẩn hóa 3NF, sử dụng UUID làm khóa chính thống nhất, đảm bảo tính toàn vẹn, bảo mật và sẵn sàng mở rộng. Kết quả của chương này tạo nền tảng kỹ thuật vững chắc để nhóm tiến hành thiết kế giao diện người dùng và cài đặt hệ thống chi tiết tại Chương 5.

## THIẾT KẾ GIAO DIỆN VÀ CÀI ĐẶT

### Thiết kế giao diện phía quản trị

#### Giao diện Dashboard và thống kê tồn kho

#### Giao diện quản lý lô hàng và sinh mã QR

#### Giao diện điều chuyển và nhận hàng

### Thiết kế giao diện phía người dùng cuối

#### Giao diện quét mã QR

#### Giao diện trục thời gian truy xuất

#### Giao diện bản đồ và hành trình lô hàng

### Cài đặt hệ thốngKết luận chương 5

## KỊCH BẢN DEMO, ĐÁNH GIÁ VÀ HƯỚNG PHÁT TRIỂN

### Chạy chương trình và kịch bản demo thực tế

#### Luồng 1: Khởi tạo dữ liệu và sinh mã QR

#### Luồng 2: Quét QR bằng thiết bị di động để luân chuyển kho

#### Luồng 3: Khách hàng truy xuất nguồn gốc

### Đánh giá hệ thống

#### Ưu điểm và các chức năng nổi bật

#### Hạn chế còn tồn tại

### Hướng phát triểnKết luận

## TÀI LIỆU THAM KHẢO

1.  _DSA Tutorial GeeksforGeeks_. _Link_: https://www.geeksforgeeks.org/dsa/dsa-tutorial-learn-data-structures-and-algorithms/
2.  _Bài đọc Cấu trúc dữ liệu trong Python_. _Link_: https://viblo.asia/p/cau-truc-du-lieu-trong-python-phan-1-63vKjvzyK2R
3.  _Thuật toán KMP_. _Link_: https://www.geeksforgeeks.org/dsa/kmp-algorithm-for-pattern-searching/
4.  _Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein (2009)_
5.  _Lê Minh Hoàng (2003). Giải thuật và Lập trình. Đại học Sư phạm Hà Nội._
6.  _Robert Sedgewick, Kevin Wayne (2011). Algorithms (4th Edition). Addison-Wesley Professional._
7.  _Sunil Chopra, Peter Meindl (2015). Supply Chain Management: Strategy, Planning, and Operation (6th Edition). Pearson._
8.  _Robert C. Martin (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design. Prentice Hall._
9.  _Alex Xu (2020). System Design Interview – An insider's guide._
10. _Robert C. Martin (2008). Clean Code: A Handbook of Agile Software Craftsmanship._
11. _Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (1994). Design Patterns: Elements of Reusable Object-Oriented Software._
12. _Bộ Kế hoạch và Đầu tư (MPI) & USAID, Báo cáo Thường niên Chuyển đổi số doanh nghiệp Việt Nam, giai đoạn 2021–2023._
13. _Bộ Công Thương Việt Nam, Báo cáo Logistics Việt Nam (các năm gần đây)._
14. _Hiệp hội Doanh nghiệp Dịch vụ Logistics Việt Nam (VLA)._
15. _Hiệp hội Thương mại điện tử Việt Nam (VECOM), Vietnam E-business Index (EBI)._