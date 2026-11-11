
const reviewsSupabase = window.supabase.createClient(
  "https://cskfurtcvqomyvitcfua.supabase.co",
  "sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa"
);

const reviewForm = document.getElementById("reviewForm");
const reviewName = document.getElementById("reviewName");
const reviewComment = document.getElementById("reviewComment");
const reviewStatus = document.getElementById("reviewStatus");
const reviewList = document.getElementById("reviewList");
const reviewAverage = document.getElementById("reviewAverage");
const reviewAverageStars = document.getElementById("reviewAverageStars");
const reviewCount = document.getElementById("reviewCount");
const starButtons = document.querySelectorAll("#reviewStarPicker button");

let selectedRating = 0;
let currentReviewUser = null;

function escapeReviewText(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return replacements[character];
  });
}

function setSelectedRating(rating) {
  selectedRating = rating;

  starButtons.forEach((button) => {
    const buttonRating = Number(button.dataset.rating);
    button.textContent = buttonRating <= rating ? "★" : "☆";
    button.classList.toggle("selected", buttonRating <= rating);
    button.setAttribute("aria-pressed", String(buttonRating === rating));
  });
}

starButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setSelectedRating(Number(button.dataset.rating));
  });
});

async function loadReviews() {
  const [reviewsResult, ratingsResult] = await Promise.all([
    reviewsSupabase
      .from("shop_reviews")
      .select("display_name, rating, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(50),

    reviewsSupabase
      .from("shop_reviews")
      .select("rating")
  ]);

  if (reviewsResult.error || ratingsResult.error) {
    reviewList.textContent = "Không tải được đánh giá. Vui lòng thử tải lại trang.";
    return;
  }

  const reviews = reviewsResult.data || [];
  const ratings = ratingsResult.data || [];

  if (ratings.length === 0) {
    reviewAverage.textContent = "—";
    reviewAverageStars.textContent = "☆☆☆☆☆";
    reviewCount.textContent = "Chưa có đánh giá";
  } else {
    const average =
      ratings.reduce((total, item) => total + item.rating, 0) / ratings.length;

    reviewAverage.textContent = average.toFixed(1);
    reviewAverageStars.textContent =
      "★".repeat(Math.round(average)) +
      "☆".repeat(5 - Math.round(average));
    reviewCount.textContent = `${ratings.length} đánh giá`;
  }

  if (reviews.length === 0) {
    reviewList.textContent = "Chưa có nhận xét. Hãy là người đầu tiên đánh giá shop!";
    return;
  }

  reviewList.innerHTML = reviews.map((review) => {
    const date = new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(review.created_at));

    return `
      <article class="review-card">
        <div class="review-card-top">
          <strong>${escapeReviewText(review.display_name)}</strong>
          <time>${date}</time>
        </div>
        <div class="review-card-stars" aria-label="${review.rating} trên 5 sao">
          ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
        </div>
        <p>${escapeReviewText(review.comment)}</p>
      </article>
    `;
  }).join("");
}

async function checkReviewUser() {
  const { data, error } = await reviewsSupabase.auth.getUser();

  if (error || !data.user) {
    currentReviewUser = null;
    reviewStatus.innerHTML =
      'Bạn cần <a href="dang-nhap.html">đăng nhập</a> để gửi đánh giá.';
    return;
  }

  currentReviewUser = data.user;

  const metadata = data.user.user_metadata || {};
  const savedName =
    metadata.full_name ||
    metadata.name ||
    metadata.username ||
    data.user.email?.split("@")[0] ||
    "";

  if (!reviewName.value.trim()) {
    reviewName.value = savedName;
  }

  reviewStatus.textContent =
    "Bạn có thể gửi đánh giá. Mỗi tài khoản có một đánh giá và có thể cập nhật sau.";
}

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentReviewUser) {
    reviewStatus.innerHTML =
      'Bạn cần <a href="dang-nhap.html">đăng nhập</a> trước khi gửi đánh giá.';
    return;
  }

  if (!selectedRating) {
    reviewStatus.textContent = "Hãy chọn số sao trước khi gửi.";
    return;
  }

  const comment = reviewComment.value.trim();
  if (comment.length < 3) {
    reviewStatus.textContent = "Nhận xét cần có ít nhất 3 ký tự.";
    return;
  }

  const metadata = currentReviewUser.user_metadata || {};
  const displayName =
    reviewName.value.trim() ||
    metadata.full_name ||
    metadata.name ||
    metadata.username ||
    currentReviewUser.email?.split("@")[0] ||
    "Khách hàng";

  reviewStatus.textContent = "Đang gửi đánh giá...";

  const { error } = await reviewsSupabase
    .from("shop_reviews")
    .upsert(
      {
        user_id: currentReviewUser.id,
        display_name: displayName,
        rating: selectedRating,
        comment
      },
      { onConflict: "user_id" }
    );

  if (error) {
    reviewStatus.textContent =
      "Chưa gửi được đánh giá. Kiểm tra kết nối rồi thử lại.";
    return;
  }

  reviewStatus.textContent = "Đánh giá của bạn đã được đăng.";
  reviewComment.value = "";
  setSelectedRating(0);
  await loadReviews();
});

reviewsSupabase.auth.onAuthStateChange(() => {
  checkReviewUser();
});

checkReviewUser();
loadReviews();
