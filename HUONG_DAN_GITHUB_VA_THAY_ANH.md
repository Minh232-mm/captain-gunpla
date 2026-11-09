# CAPTAIN GUNPLA V3 — CÁCH UPLOAD LÊN GITHUB VÀ THAY ẢNH

## 1. Upload một lần để thay toàn bộ website
1. Tải ZIP này, chọn **Extract All / Giải nén** trên máy tính.
2. Vào GitHub > repository **Minh232-mm/captain-gunpla** > nhánh **main**, bấm tên repository để đang ở **thư mục gốc** (cùng cấp `index.html`).
3. Bấm **Add file > Upload files**. Kéo **toàn bộ file và thư mục nằm BÊN TRONG `CAPTAIN_GUNPLA_V3_GITHUB`** vào GitHub, **không kéo bản ZIP hay chính thư mục bọc ngoài**.
4. Bấm **Commit changes** để ghi đè file trùng tên và thêm file mới. Giữ nguyên thư mục `images/` cũ nếu chưa cần xóa.
5. GitHub Pages: Settings > Pages > Deploy from a branch > main > /(root). Mở https://minh232-mm.github.io/captain-gunpla/ . Nếu thấy bản cũ, Ctrl+F5 hoặc tải lại sau khi Pages hoàn tất.
6. GitHub **không xóa file cũ** khi upload, vì vậy `script.js` cũ, ảnh cũ tên khác trong `assets/` hay các file V2 bị đặt nhầm `images/` có thể còn tồn tại nhưng không còn được bản V3 tham chiếu.

## 2. Toàn bộ ảnh giao diện hiện dùng nằm trong `assets/`
| Tên ảnh | Vị trí |
|---|---|
| `anhdautrang.jpg` | Nhân vật Gunpla lớn đầu trang |
| `anhlogocaptain.jpg` | Logo ở đầu trang và chân trang |
| `anhlogofacebook.jpg` | Biểu tượng Facebook phần Liên hệ |
| `anhlogotiktok.jpg` | Biểu tượng TikTok phần Liên hệ |
| `anhlogozalo.jpg` | Biểu tượng Zalo phần Liên hệ |
| `anhsanpham1.jpg` … `anhsanpham6.jpg` | Ảnh chính 6 sản phẩm mẫu |
| `anhsanpham1_2.jpg`, `anhsanpham1_3.jpg`, `anhsanpham2_2.jpg`, `anhsanpham3_2.jpg`, `anhsanpham6_2.jpg` | Ảnh phụ trong hộp chi tiết sản phẩm |
| `anhtacpham1.jpg` … `anhtacpham4.jpg` | 4 ảnh trong bộ sưu tập kéo ngang |

**Mọi ảnh trong bộ V3.2 hiện là JPG.** Muốn thay ảnh, hãy dùng file JPEG thực sự (không chỉ đổi đuôi) với đúng tên `.jpg` trong `assets/`. Với ảnh sản phẩm, thay đường dẫn trong `products.js` hoặc ở `admin.html`, rồi xuất `products.js` để upload.

Ví dụ thay ảnh đầu trang trong `index.html`:
```html
<img class="hero-mecha" src="assets/anhdautrang.jpg" alt="Gunpla Captain Gunpla">
```

## 3. Thêm sản phẩm và thay giá
1. Mở file `admin.html` trên máy tính (hoặc trang Pages admin, nhưng không có đăng nhập / không lưu vào server).
2. Chọn sản phẩm, nhập tên, giá, danh mục và đường dẫn ảnh (mỗi dòng một ảnh); bấm **LƯU THAY ĐỔI**.
3. Bấm **XUẤT FILE PRODUCTS.JS** và upload file `products.js` vừa tải về vào **thư mục gốc repo** để thay bản cũ.
4. Ảnh mới phải được upload riêng vào `assets/`; editor không tự upload ảnh lên GitHub.
5. Refresh trang để kiểm tra.

## 4. Điện thoại
Website V3 giữ cùng tông đen–đỏ, vòng quét chuyển động, ảnh hero, danh mục, 2 cột sản phẩm, popup ảnh vuốt ngang và gallery vuốt ngang. Menu thu gọn thành ☰ để đủ chỗ trên màn hình nhỏ. Không cần thay file riêng cho di động.

## 5. Lưu ý
- Website chạy tĩnh trên GitHub Pages, **không có backend, tài khoản quản trị hay thanh toán trực tuyến**.
- `admin.html` công khai chỉ cho phép xuất `products.js`, không có quyền tự sửa repo nếu không đăng nhập GitHub.
- Giá và ảnh demo cần thay bằng thông tin thật trước khi bán.
- Nên lưu bản sao ZIP cũ để có thể quay lại khi cần.
