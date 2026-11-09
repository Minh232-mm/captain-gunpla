/* CAPTAIN GUNPLA — DANH SÁCH SẢN PHẨM
   Sửa file này để thay đổi sản phẩm/giá trên toàn website.
   price là số VND, ví dụ 890000. price: null nghĩa là "Liên hệ".
   images có thể chứa nhiều ảnh, ví dụ ["assets/anhsanpham1.jpg", "assets/anhsanpham1_2.jpg"].
   category: gunpla | custom | tools | accessories
   badge: NEW | HOT | LIMITED | CUSTOM hoặc để trống.
*/
window.CAPTAIN_PRODUCTS = [
 
{
  id: "inera-fnr009-fenrir",
  name: "IN ERA+ FNR009 Fenrir 1/72 RMD Series",
  category: "gunpla",
  grade: "IN ERA+ · RMD · 1/72",

  price: 1700000,
  oldPrice: 2000000,

  badge: "SALE",

  images: [
    "assets/anhsanpham1.jpg",
    "assets/anhsanpham1_2.jpg",
    "assets/anhsanpham1_3.jpg"
  ],

  description:
    "THÔNG TIN CHI TIẾT SẢN PHẨM:\n" +
    "• Thương hiệu: IN ERA+ (RMD - Real Minutia Design)\n" +
    "• Tên sản phẩm: FNR009 Fenrir\n" +
    "• Tỷ lệ: 1/72\n" +
    "• Chiều cao hoàn thiện: khoảng 27cm đến đỉnh đầu, " +
    "khoảng 30cm tính cả trang bị sau lưng.\n" +
    "• Chất liệu: Nhựa ABS, POM cao cấp kết hợp " +
    "khung xương hợp kim Die-cast đúc sẵn.\n" +
    "• Tình trạng: Mới 100%, nguyên seal, " +
    "đầy đủ hộp và phụ kiện từ nhà sản xuất.",

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
    images: ["assets/anhsanpham2.jpg", "assets/anhsanpham2_2.jpg"],
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
    images: ["assets/anhsanpham3.jpg", "assets/anhsanpham3_2.jpg"],
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
    images: ["assets/anhsanpham4.jpg"],
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
    images: ["assets/anhsanpham5.jpg"],
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
    images: ["assets/anhsanpham6.jpg", "assets/anhsanpham6_2.jpg"],
    description: "Nhận sơn hoàn thiện, weathering và hiệu ứng bề mặt theo concept riêng.",
    available: true
  }
];
