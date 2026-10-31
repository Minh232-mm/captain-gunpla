// Dán link Google Form của bạn vào biến bên dưới sau khi tạo biểu mẫu.
const GOOGLE_FORM_URL = "";
const form = document.getElementById("orderForm");
form.addEventListener("submit", function(e){
  e.preventDefault();
  const note = document.getElementById("formNote");
  if (GOOGLE_FORM_URL) {
    window.open(GOOGLE_FORM_URL, "_blank", "noopener");
    note.textContent = "Đã mở biểu mẫu đặt hàng. Vui lòng hoàn tất và gửi biểu mẫu để lưu yêu cầu.";
  } else {
    note.textContent = "Website đang ở chế độ xem thử. Hãy kết nối Google Forms để khách gửi và lưu đơn hàng trực tuyến.";
    alert("Chưa kết nối Google Forms. Vui lòng liên hệ Captain Gunpla qua kênh tư vấn để gửi yêu cầu.");
  }
});
