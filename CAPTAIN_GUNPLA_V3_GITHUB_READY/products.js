/* CAPTAIN GUNPLA — DANH SÁCH SẢN PHẨM
   Sửa file này để thay đổi sản phẩm/giá trên toàn website.
   price là số VND, ví dụ 890000. price: null nghĩa là "Liên hệ".
   images có thể chứa nhiều ảnh, ví dụ ["assets/anhsanpham1.svg", "assets/anhsanpham1_2.svg"].
   category: gunpla | custom | tools | accessories
   badge: NEW | HOT | LIMITED | CUSTOM hoặc để trống.
*/
window.CAPTAIN_PRODUCTS = [
  {
    id: "rx78-origin",
    name: "RX-78 / ORIGIN SERIES",
    category: "gunpla",
    grade: "MG · 1/100",
    price: 890000,
    oldPrice: 1050000,
    badge: "HOT",
    images: ["assets/anhsanpham1.svg", "assets/anhsanpham1_2.svg", "assets/anhsanpham1_3.svg"],
    description: "Thiết kế lấy cảm hứng từ phong cách mecha cổ điển. Mẫu trưng bày demo — cập nhật hình ảnh và thông số thực tế trước khi bán.",
    available: true
  },
  {
    id: "astral-frame",
    name: "ASTRAL FRAME / CUSTOM",
    category: "custom",
    grade: "CUSTOM BUILD",
    price: null,
    oldPrice: null,
    badge: "CUSTOM",
    images: ["assets/anhsanpham2.svg", "assets/anhsanpham2_2.svg"],
    description: "Dịch vụ phối màu, tạo điểm nhấn và hoàn thiện mô hình theo yêu cầu. Hãy liên hệ để nhận báo giá theo độ phức tạp.",
    available: true
  },
  {
    id: "crimson-edge",
    name: "CRIMSON EDGE / DISPLAY",
    category: "gunpla",
    grade: "RG · 1/144",
    price: 650000,
    oldPrice: null,
    badge: "NEW",
    images: ["assets/anhsanpham3.svg", "assets/anhsanpham3_2.svg"],
    description: "Mẫu minh họa cho giao diện gian hàng. Thay bằng thông tin sản phẩm thực tế khi đưa website lên hoạt động.",
    available: true
  },
  {
    id: "precision-nipper",
    name: "PRECISION NIPPER / PRO",
    category: "tools",
    grade: "TOOLS / BUILD",
    price: 320000,
    oldPrice: null,
    badge: "",
    images: ["assets/anhsanpham4.svg"],
    description: "Dụng cụ hỗ trợ cắt chi tiết mô hình. Sản phẩm minh họa — thay bằng ảnh và thông số thực tế.",
    available: true
  },
  {
    id: "decal-set",
    name: "TECH DECAL / DETAIL SET",
    category: "accessories",
    grade: "ACCESSORY / DETAIL",
    price: 120000,
    oldPrice: 150000,
    badge: "LIMITED",
    images: ["assets/anhsanpham5.svg"],
    description: "Bộ decal trang trí mô hình. Giá và ảnh hiện là dữ liệu minh họa.",
    available: true
  },
  {
    id: "nightfall-custom",
    name: "NIGHTFALL / PAINT PROJECT",
    category: "custom",
    grade: "PAINT & FINISH",
    price: null,
    oldPrice: null,
    badge: "CUSTOM",
    images: ["assets/anhsanpham6.svg", "assets/anhsanpham6_2.svg"],
    description: "Nhận sơn hoàn thiện, weathering và hiệu ứng bề mặt theo concept riêng.",
    available: true
  }
];
