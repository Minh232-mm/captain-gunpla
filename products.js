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

  badge: "SALE -15%",

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
  id: "inera-azure-falcon",
  name: "IN ERA+ TR-2243EX Azure Falcon",
  category: "gunpla",
  grade: "IN ERA+ · RMD · 1/100",

  price: 1200000,
  oldPrice: 1500000,
  badge: "SALE -20%",

  images: [
    "assets/anhsanpham2.jpg",
    "assets/anhsanpham2_2.jpg"
  ],

  description:
    "• Thương hiệu: IN ERA+ (RMD - Real Minutia Designs)\n" +
    "• Tỷ lệ: 1/100 | Cao 22–24cm (Robot), dài 43cm (máy bay).\n" +
    "• Chất liệu: Nhựa ABS, POM kết hợp khung và khớp hợp kim Die-cast.\n" +
    "• Biến hình hoàn chỉnh Robot ↔ máy bay, không cần thay linh kiện.\n" +
    "• Phụ kiện: Vũ khí, bàn tay linh hoạt, phi công mini, decal nước và đế trưng bày.\n" +
    "• Tình trạng: Mới 100%.",

  available: true
},

 
{
  id: "hg-gundam-calibarn",
  name: "HG 1/144 Gundam Calibarn",
  category: "gunpla",
  grade: "BANDAI SPIRITS · HG · 1/144",

  price: 400000,
  oldPrice: 600000,
  badge: "SALE -33%",

  images: [
    "assets/anhsanpham3.jpg",
    "assets/anhsanpham3_2.jpg"
  ],

  description:
    "• Thương hiệu: Bandai Spirits (Nhật Bản)\n" +
    "• Dòng mô hình: High Grade (HG), tỷ lệ 1/144.\n" +
    "• Chiều cao hoàn thiện: Khoảng 14cm.\n" +
    "• Vũ khí: Variable Rod Rifle tích hợp 4 cụm thruster, Beam Saber.\n" +
    "• Khiên Escutcheon kết hợp từ các Bit Stave.\n" +
    "• Tình trạng: Mới 100%.",

  available: true
},

  
{
  id: "motor-nuclear-bv-xh01",
  name: "Motor Nuclear BV-XH01 Hạng Vũ (Xiang Yu)",
  category: "gunpla",
  grade: "MOTOR NUCLEAR · 1/144",

  price: 400000,
  oldPrice: 600000,
  badge: "SALE -33%",

  images: [
    "assets/anhsanpham4.jpg"
  ],

  description:
    "• Thương hiệu: Motor Nuclear.\n" +
    "• Tên sản phẩm: BV-XH01 Hạng Vũ (Xiang Yu).\n" +
    "• Tỷ lệ: 1/144.\n" +
    "• Chiều cao hoàn thiện: Khoảng 17cm.\n" +
    "• Thiết kế nhỏ gọn, phù hợp trưng bày trên bàn làm việc hoặc góc gaming.\n" +
    "• Tình trạng: Mới 100%.",

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
