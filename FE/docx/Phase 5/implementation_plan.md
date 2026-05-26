# Phase 5: Batches & QR Code Lifecycle Documentation & Description

Module quản lý lô hàng (**Batches Management**) chịu trách nhiệm giám sát toàn bộ dòng đời của hàng hóa sản xuất trong hệ thống, từ lúc khởi tạo tại nhà máy, vận chuyển qua các kho trung chuyển, cho đến khi bán hết tại cửa hàng bán lẻ.

## 1. Nghiệp vụ Lô Hàng & Mã QR
- **Khởi tạo lô hàng**: Nhà sản xuất tạo lô hàng gắn liền với một danh mục sản phẩm, khai báo số lượng, đơn vị, ngày sản xuất và hạn sử dụng.
- **Tạo mã QR truy xuất**: Backend tự sinh một mã QR chứa địa chỉ liên kết URL truy xuất công khai (ví dụ: `/public/trace/BCH-...`). Ảnh QR được trả về dạng base64 string.
- **Tải ảnh & In ấn**: Hệ thống hỗ trợ tải tệp ảnh mã QR định dạng PNG và hỗ trợ in ấn tối ưu nhãn dán sản phẩm bằng CSS `@media print`.
- **Hành trình lô hàng (Timeline Stepper)**: Mỗi hoạt động dịch chuyển kho (Shipment) hay bán lẻ (Sell) đều ghi nhận một Timeline Event. Hệ thống vẽ sơ đồ dạng cây dọc hiển thị thời gian, địa điểm, người thực hiện và ghi chú của từng sự kiện để đảm bảo tính minh bạch.
- **Bán lẻ hàng hóa**: Cho phép cửa hàng bán lẻ trừ dần số lượng tồn kho của lô hàng khi có giao dịch bán lẻ. Khi số lượng về 0, trạng thái lô hàng chuyển sang `SOLD` (Đã bán hết).

## 2. API Endpoints Tích Hợp
- `POST /api/v1/batches`: Khởi tạo lô hàng mới.
- `GET /api/v1/batches`: Lấy danh sách lô hàng phân trang và có RLS (tự lọc theo Node của người dùng đăng nhập).
- `GET /api/v1/batches/:id`: Chi tiết một lô hàng cùng thông tin ảnh QR.
- `GET /api/v1/batches/:id/timeline`: Danh sách các mốc hành trình lịch sử.
- `POST /api/v1/batches/:id/sell`: Thực hiện bán lẻ hàng hóa, khấu trừ tồn kho.
- `POST /api/v1/batches/:id/regenerate-qr`: Cấp lại mã QR.

## 3. Các Thành Phần Giao Diện Cần Dựng
- **BatchesPage.tsx**: Bảng danh sách lô hàng, ô lọc Sản phẩm/Trạng thái, nút Tạo lô hàng mở FormModal.
- **BatchDetailPage.tsx**: Trang chi tiết lô hàng gồm 2 cột. Cột thông tin + Timeline Stepper dọc, và cột panel QRDisplay + nút hành động Bán lẻ/Cấp lại QR.
- **TimelineStepper.tsx**: Component vẽ cây lịch sử hành trình trực quan.
- **QRDisplay.tsx**: Component hiển thị ảnh QR, hỗ trợ tải PNG và in ấn nhãn.
