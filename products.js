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
    name: "CỤ TỔ RX78-2 RG 2.0 BANDAI ",
    category: "custom",
    grade: "ĐÃ SƠN TOPCOAT NHÁM",
    price: 900000,
    oldPrice: 1200000,
    badge: "CUSTOM",
    images: ["assets/anhsanpham6.jpg", "assets/anhsanpham6_2.jpg"],
    description: "Sản phẩm đã sơn hoàn thiện đầy đủ box sách.",
    available: true
  },
   
/* ===== 2HAND 01 - SOLOMON GP02A ===== */
{
  id: "2hand-solomon-gp02a",
  name: "Solomon GP02A Physalis 1/100 Full Option",
  category: "secondhand",
  grade: "2HAND · SOLOMON · 1/100",

  price: 1200000,
  oldPrice: null,
  badge: "2HAND ĐÃ LẮP",

  images: [
    "assets/anh2hand1.jpg",
    "assets/anh2hand1_2.jpg",
    "assets/anh2hand1_3.jpg"
  ],

  description:
    "• Phiên bản: Full Option, kèm balo MLRS và giáp Clear.\n" +
    "• Tình trạng: Đã lắp hoàn chỉnh, thợ lắp đẹp, khớp chắc và giữ dáng tốt.\n" +
    "• Ngoại hình: Đã dán decal nước, nhựa đẹp, không nứt gãy, không dùng keo.\n" +
    "• Hộp & sách: Còn đầy đủ hộp và sách hướng dẫn.\n" +
    "• Liên hệ Zalo, TikTok hoặc Fanpage để xem thêm ảnh và chi tiết thực tế.",

  available: true
},

/* ===== 2HAND 02 - ENHANCED ZZ VER.KA ===== */
{
  id: "2hand-enhanced-zz-verka",
  name: "MG 1/100 Enhanced ZZ Gundam Ver.Ka",
  category: "secondhand",
  grade: "2HAND · BANDAI · MG 1/100",

  price: 1000000,
  oldPrice: null,
  badge: "2HAND ĐÃ LẮP",

  images: [
    "assets/anh2hand2.jpg",
    "assets/anh2hand2_2.jpg",
    "assets/anh2hand2_3.jpg"
  ],

  description:
    "• Thương hiệu: Bandai chính hãng, dòng MG Ver.Ka.\n" +
    "• Tình trạng: Đã lắp hoàn chỉnh, thợ lắp đẹp, khớp chắc, không lỏng lẻo.\n" +
    "• Biến hình: Core Fighter, Core Top, Core Base và G-Fortress hoạt động bình thường.\n" +
    "• Ngoại hình: Decal nước Ver.Ka, nhựa đẹp, không ố vàng, không dùng keo.\n" +
    "• Hộp & sách: Còn đủ hộp màu và sách hướng dẫn.\n" +
    "• Liên hệ Zalo, TikTok hoặc Fanpage để xem thêm ảnh và chi tiết thực tế.",

  available: true
},

];
