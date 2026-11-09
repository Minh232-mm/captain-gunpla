# CAPTAIN GUNPLA V3.2 — Toàn bộ ảnh website là JPG

## Cập nhật lên GitHub
1. Sao lưu website GitHub hiện tại nếu muốn giữ bản cũ.
2. Giải nén ZIP. Vào thư mục gốc repository `Minh232-mm/captain-gunpla`, nhấn Add file → Upload files.
3. Upload các file `index.html`, `app.js`, `products.js`, `admin.js`, `admin.html`, `style.css`, `admin.css`, `README.md` và **thư mục `assets/`** từ bộ mới (chọn *nội dung bên trong ZIP*, không bọc thêm một thư mục).
4. Commit changes; sau khi GitHub Pages triển khai, kiểm tra trên điện thoại và desktop.
5. Chỉ sau khi kiểm tra thành công, xóa các ảnh `.svg` V3 cũ trong `assets/`. Có thể giữ nguyên `images/` cũ để sao lưu. Không xóa ảnh JPG vừa tải lên.

## Tên ảnh JPG
- `assets/anhdautrang.jpg`: nhân vật lớn trên Hero (đã dùng ảnh người dùng cung cấp).
- `assets/anhlogocaptain.jpg`, `assets/anhlogozalo.jpg`, `assets/anhlogofacebook.jpg`, `assets/anhlogotiktok.jpg`: logo và liên hệ.
- `assets/anhsanpham1.jpg` đến `assets/anhsanpham6.jpg`: sản phẩm chính; ảnh phụ có `_2`, `_3`.
- `assets/anhtacpham1.jpg` đến `assets/anhtacpham4.jpg`: thư viện kéo ngang.

## Cách thay ảnh sau này
Chụp ảnh hoặc xuất ảnh đúng định dạng JPEG, đặt trùng **tên file** và **đường dẫn**, ví dụ `assets/anhsanpham1.jpg`, rồi upload ghi đè trên GitHub. Không cần sửa mã nguồn nếu vẫn giữ tên file. Đối với ảnh sản phẩm mới, thêm sản phẩm trong `admin.html` rồi xuất `products.js` và upload vào repository.

## Lưu ý quan trọng
- JPG không hỗ trợ nền trong suốt, nên ảnh đầu trang mới được ghép trên nền tối gần màu giao diện. Nếu muốn giữ viền cắt nhân vật tuyệt đối sạch trên nền gradient, PNG/WebP trong suốt phù hợp hơn.
- SVG dạng hình vẽ đơn giản đôi khi nhẹ hơn JPG. Đây là bản thống nhất JPG để bạn thay ảnh dễ dàng, không phải lời đảm bảo mọi file đều giảm dung lượng.
- `admin.html` chỉ xuất dữ liệu; không tự động cập nhật lên GitHub.
