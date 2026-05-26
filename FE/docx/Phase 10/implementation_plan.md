# Plan to Fix Public Routes Layout, Sidebar QR Scan and Change Password

Tập trung sửa lỗi điều hướng và bổ sung các tính năng bảo mật:
1. **Bảo toàn trạng thái đăng nhập cho `/scan` và `/trace/:batchCode`**:
   - Khi đã đăng nhập (`isAuthenticated` là true), nếu truy cập hai trang công khai này, giao diện sẽ tự động chuyển sang layout có Sidebar và Header (`AppLayout`).
   - Khi chưa đăng nhập, giao diện vẫn hiển thị layout khách đơn giản (`PublicLayout`).
2. **Thêm nút "Quét Mã QR" trên thanh điều hướng**:
   - Thêm nút liên kết đến trang `/scan` trong Sidebar cho tất cả các role (`*`).
3. **Tính năng đổi mật khẩu cá nhân (Change Password)**:
   - **Backend**: Thêm endpoint `POST /auth/change-password` cho phép tài khoản hiện tại cập nhật mật khẩu của mình bằng cách xác thực mật khẩu cũ.
   - **Frontend**: Thêm nút "Đổi mật khẩu" tại Sidebar (cạnh nút Đăng xuất). Khi bấm vào sẽ hiển thị modal nhập mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới.

---

## User Review Required

> [!IMPORTANT]
> **Hành vi Layout của Trang Công Khai:**
> - `/scan` và `/trace/:batchCode` là các đường dẫn công khai (không bắt buộc đăng nhập). Nhờ tối ưu hóa này, nếu người dùng đã đăng nhập, hệ thống sẽ tự động bọc chúng bằng `AppLayout` (hiển thị Sidebar/Header), cho phép họ tiếp tục thao tác mà không bị mất menu quản trị.
> - Nếu người dùng chưa đăng nhập, các trang này sẽ hiển thị dưới `PublicLayout` truyền thống (giao diện Guest tối giản).

> [!NOTE]
> **Vị trí Đổi mật khẩu:**
> - Nút "Đổi mật khẩu" sẽ được đặt ngay phía trên nút "Đăng xuất" ở chân của Sidebar để thuận tiện truy cập từ mọi màn hình quản trị.

---

## Proposed Changes

### 1. Backend changes

#### [NEW] [change-password.dto.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/auth/dto/change-password.dto.ts)
- Định nghĩa class `ChangePasswordDto` kế thừa từ class-validator:
  - `oldPassword`: string, `@IsNotEmpty()`
  - `newPassword`: string, `@MinLength(6)`, `@IsNotEmpty()`

#### [MODIFY] [auth.controller.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/auth/auth.controller.ts)
- Import `ChangePasswordDto` và bổ sung endpoint:
  ```typescript
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: { user: { userId: string } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(req.user.userId, changePasswordDto);
    return { message: 'Thay đổi mật khẩu thành công' };
  }
  ```

#### [MODIFY] [users.service.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/BE/src/modules/users/users.service.ts)
- Bổ sung logic `changePassword` để kiểm tra mật khẩu cũ và mã hóa mật khẩu mới:
  ```typescript
  async changePassword(id: string, changePasswordDto: any): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
    await this.userRepository.save(user);
  }
  ```

---

### 2. Frontend changes

#### [MODIFY] [PublicLayout.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/PublicLayout.tsx)
- Kiểm tra `isAuthenticated` qua `useAuthStore`.
- Nếu đúng, trả về `<AppLayout />` thay thế cho cấu trúc Guest Layout.

#### [MODIFY] [auth.api.ts](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/api/auth.api.ts)
- Bổ sung hàm gọi API thay đổi mật khẩu:
  ```typescript
  changePassword: (data: any) => api.post('/auth/change-password', data),
  ```

#### [MODIFY] [Sidebar.tsx](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/components/layout/Sidebar.tsx)
- Thêm icon `QrCodeIcon` vào menu "Chuỗi cung ứng".
- Thêm nút "Đổi mật khẩu" (`KeyIcon`) phía trên nút Đăng xuất.
- Quản lý state mở modal và thực hiện gọi API để đổi mật khẩu với các ô nhập liệu: Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới.

#### [MODIFY] [vi.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/vi.json) & [en.json](file:///d:/Personal%20Projects/University%20Project/logistic-mini/FE/src/i18n/locales/en.json)
- Bổ sung các bản dịch:
  - `sidebar.scan`: "Quét mã QR" / "QR Scanner"
  - Dịch thuật phần đổi mật khẩu:
    - `auth.changePassword`: "Đổi mật khẩu" / "Change Password"
    - `auth.oldPassword`: "Mật khẩu cũ" / "Old Password"
    - `auth.newPassword`: "Mật khẩu mới" / "New Password"
    - `auth.confirmPassword`: "Xác nhận mật khẩu" / "Confirm Password"
    - `auth.passwordMismatch`: "Mật khẩu xác nhận không khớp" / "Password confirmation does not match"
    - `auth.passwordChangedSuccess`: "Đổi mật khẩu thành công!" / "Password changed successfully!"

---

## Verification Plan

### Automated Tests
- Kiểm tra TypeScript & compilation:
  ```bash
  npx tsc --noEmit (FE)
  npm run build (FE & BE)
  ```

### Manual Verification
1. **Kiểm tra trạng thái Đăng nhập trên `/scan` và `/trace`**:
   - Khi chưa đăng nhập: truy cập `/scan`, kiểm tra xem có Sidebar không (không được có).
   - Khi đã đăng nhập: truy cập `/scan`, kiểm tra xem Sidebar và Header có hiển thị bình thường không.
2. **Kiểm tra menu Sidebar**:
   - Kiểm tra xem mục "Quét mã QR" có hiển thị đúng vị trí trong mục Chuỗi cung ứng hay không.
3. **Kiểm tra Đổi mật khẩu**:
   - Bấm vào nút "Đổi mật khẩu", nhập sai mật khẩu cũ -> Hệ thống báo lỗi.
   - Nhập mật khẩu cũ đúng, mật khẩu mới và xác nhận mật khẩu mới chính xác -> Lưu thành công.
   - Đăng xuất ra và đăng nhập lại bằng mật khẩu mới để kiểm tra độ tin cậy.
