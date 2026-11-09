# CAPTAIN GUNPLA V2 — Website Gunpla Futuristic

## Chạy website
- Giải nén toàn bộ thư mục.
- Mở `index.html` bằng trình duyệt (hoặc dùng VS Code Live Server / đăng lên hosting tĩnh).
- Không đổi tên các file `index.html`, `style.css`, `products.js`, `app.js`.

## Thêm sản phẩm / cập nhật giá (không phải lập trình)
1. Mở `admin.html` trong cùng thư mục.
2. Chọn sản phẩm để sửa hoặc bấm **+ THÊM MỚI**.
3. Nhập tên, danh mục, ảnh và giá bán. Giá nhập **số nguyên VND**: `890000` = `890.000₫`; bỏ trống = "GIÁ LIÊN HỆ".
4. Mỗi dòng trong ô ảnh là **một đường dẫn ảnh** (ví dụ `assets/rx78-1.jpg`, `assets/rx78-2.jpg`). Ảnh phải được chép vào thư mục `assets`.
5. Bấm **LƯU THAY ĐỔI**, sau đó **XUẤT FILE PRODUCTS.JS**.
6. **Thay file `products.js` cũ bằng file vừa tải về**, và tải lại `index.html`. Nếu website đã online, tải file mới lên đúng đường dẫn hosting để mọi người đều thấy thay đổi.

**Lưu ý:** `admin.html` là trình chỉnh sửa tĩnh, **không phải trang quản trị có tài khoản hoặc cơ sở dữ liệu**. Nút "Lưu" chỉ lưu bản nháp trong trình duyệt máy đó, không tự thay đổi dữ liệu trên hosting. Không coi `admin.html` là hệ thống quản trị bảo mật; có thể không đăng nó lên hosting và chỉ dùng ở máy cá nhân.

## Cách sửa nhanh bằng mã nguồn
Mở `products.js` và thêm một object trong mảng `window.CAPTAIN_PRODUCTS` theo mẫu có sẵn. Mỗi sản phẩm có `id`, `name`, `category`, `grade`, `price`, `oldPrice`, `badge`, `images` (mảng nhiều ảnh), `description`, `available`.

## Ảnh
Các ảnh SVG trong `assets` là **minh họa mecha nguyên bản được tạo để dựng bản demo**, không phải ảnh thật của hàng hóa. Hãy thay ảnh, tên, giá và mô tả sản phẩm trước khi đưa web vào kinh doanh. Để đổi Hero, thay file `assets/hero-mecha.svg` hoặc thay đường dẫn trong HTML. Gallery ở section `#projects` có thể bổ sung / đổi ảnh trong `index.html`.

## Gửi yêu cầu
Form liên hệ hiện **sao chép nội dung và mở Zalo** `0395193831` để khách tự dán và gửi, không tự động gửi hoặc lưu thông tin. Đổi địa chỉ Zalo trong `app.js` (và liên kết tại `index.html`) nếu cần. Muốn có quản lý đơn hàng trực tuyến thật cần tích hợp backend, dịch vụ form hoặc API được cấp quyền.

## Tổ chức
- `index.html`: toàn bộ khối nội dung.
- `style.css`: giao diện / responsive / motion.
- `products.js`: **nguồn dữ liệu sản phẩm duy nhất**.
- `app.js`: tìm kiếm, lọc, sort, chi tiết, ảnh, gallery, form.
- `admin.html`, `admin.css`, `admin.js`: trình nhập sản phẩm và xuất dữ liệu.
- `assets/`: các hình minh họa SVG; có thể chép thêm JPG, PNG, WebP.

## Ghi chú
Tối ưu cho desktop và mobile, có hỗ trợ reduced motion và điều khiển popup bằng bàn phím. Font Google cần internet; khi offline sẽ dùng font dự phòng.
