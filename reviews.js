const reviewsSupabase = window.supabase.createClient(
  "https://cskfurtcvqomyvitcfua.supabase.co",
  "sb_publishable_6vkQOLH_jEQq_oPhz9aN8Q_6qLj8RYa"
);

const REVIEW_IMAGE_BUCKET = "review-images";
const MAX_REVIEW_IMAGES = 3;
const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_REVIEW_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const reviewForm = document.getElementById("reviewForm");
const reviewName = document.getElementById("reviewName");
const reviewComment = document.getElementById("reviewComment");
const reviewImages = document.getElementById("reviewImages");
const reviewImagePreview = document.getElementById("reviewImagePreview");
const reviewStatus = document.getElementById("reviewStatus");
const reviewList = document.getElementById("reviewList");
const reviewAverage = document.getElementById("reviewAverage");
const reviewAverageStars = document.getElementById("reviewAverageStars");
const reviewCount = document.getElementById("reviewCount");
const starButtons = document.querySelectorAll("#reviewStarPicker button");

let selectedRating = 0;
let currentReviewUser = null;
let selectedReviewFiles = [];
let previewObjectUrls = [];

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

function safeReviewImageUrl(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "cskfurtcvqomyvitcfua.supabase.co" ||
      !url.pathname.includes(`/storage/v1/object/public/${REVIEW_IMAGE_BUCKET}/`)
    ) return "";
    return url.href;
  } catch {
    return "";
  }
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

function setReviewUser(user) {
  currentReviewUser = user;
  if (!user) {
    reviewStatus.innerHTML =
      'Bạn cần <a href="dang-nhap.html">đăng nhập</a> để gửi đánh giá.';
    return;
  }

  const metadata = user.user_metadata || {};
  const savedName =
    metadata.full_name || metadata.name || metadata.username ||
    user.email?.split("@")[0] || "";
  if (!reviewName.value.trim()) reviewName.value = savedName;
  reviewStatus.textContent =
    "Bạn có thể gửi đánh giá kèm tối đa 3 ảnh. Mỗi tài khoản có một đánh giá và có thể cập nhật hoặc xóa đánh giá của mình.";
}

async function checkReviewUser() {
  const { data, error } = await reviewsSupabase.auth.getUser();
  setReviewUser(error ? null : data.user);
}

function clearReviewPreviews() {
  previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  previewObjectUrls = [];
  reviewImagePreview.innerHTML = "";
}

function renderReviewPreviews() {
  clearReviewPreviews();
  selectedReviewFiles.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    previewObjectUrls.push(url);
    const item = document.createElement("div");
    item.className = "review-image-preview-item";
    item.innerHTML = `
      <img src="${url}" alt="Ảnh xem trước ${index + 1}">
      <button type="button" data-remove-review-image="${index}" aria-label="Bỏ ảnh ${index + 1}">×</button>
    `;
    reviewImagePreview.appendChild(item);
  });
}

reviewImages.addEventListener("change", () => {
  const files = Array.from(reviewImages.files || []);
  if (files.length > MAX_REVIEW_IMAGES) {
    reviewStatus.textContent = `Bạn chỉ được chọn tối đa ${MAX_REVIEW_IMAGES} ảnh.`;
    reviewImages.value = "";
    selectedReviewFiles = [];
    renderReviewPreviews();
    return;
  }

  const invalidFile = files.find((file) =>
    !ALLOWED_REVIEW_IMAGE_TYPES.includes(file.type) || file.size > MAX_REVIEW_IMAGE_SIZE
  );
  if (invalidFile) {
    reviewStatus.textContent = "Ảnh phải có định dạng JPG, PNG hoặc WEBP và không vượt quá 5MB mỗi ảnh.";
    reviewImages.value = "";
    selectedReviewFiles = [];
    renderReviewPreviews();
    return;
  }

  selectedReviewFiles = files;
  renderReviewPreviews();
});

reviewImagePreview.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-review-image]");
  if (!button) return;
  selectedReviewFiles.splice(Number(button.dataset.removeReviewImage), 1);
  const transfer = new DataTransfer();
  selectedReviewFiles.forEach((file) => transfer.items.add(file));
  reviewImages.files = transfer.files;
  renderReviewPreviews();
});

async function uploadReviewImages(files) {
  const uploadedPaths = [];
  const publicUrls = [];

  for (const file of files) {
    const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const path = `${currentReviewUser.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await reviewsSupabase.storage
      .from(REVIEW_IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      if (uploadedPaths.length) {
        await reviewsSupabase.storage.from(REVIEW_IMAGE_BUCKET).remove(uploadedPaths);
      }
      throw error;
    }

    uploadedPaths.push(path);
    const { data } = reviewsSupabase.storage.from(REVIEW_IMAGE_BUCKET).getPublicUrl(path);
    publicUrls.push(data.publicUrl);
  }

  return { uploadedPaths, publicUrls };
}

function getReviewStoragePath(publicUrl) {
  const safeUrl = safeReviewImageUrl(publicUrl);
  if (!safeUrl) return null;
  const marker = `/storage/v1/object/public/${REVIEW_IMAGE_BUCKET}/`;
  const pathname = new URL(safeUrl).pathname;
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex < 0) return null;
  return decodeURIComponent(pathname.slice(markerIndex + marker.length));
}

async function removeReviewImages(publicUrls) {
  const paths = (publicUrls || []).map(getReviewStoragePath).filter(Boolean);
  if (paths.length) {
    await reviewsSupabase.storage.from(REVIEW_IMAGE_BUCKET).remove(paths);
  }
}

async function loadReviews() {
  const [reviewsResult, ratingsResult] = await Promise.all([
    reviewsSupabase
      .from("shop_reviews")
      .select("user_id, display_name, rating, comment, image_urls, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    reviewsSupabase.from("shop_reviews").select("rating")
  ]);

  if (reviewsResult.error || ratingsResult.error) {
    reviewList.textContent =
      "Không tải được đánh giá. Vui lòng kiểm tra cấu hình cơ sở dữ liệu rồi tải lại trang.";
    return;
  }

  const reviews = reviewsResult.data || [];
  const ratings = ratingsResult.data || [];

  if (!ratings.length) {
    reviewAverage.textContent = "—";
    reviewAverageStars.textContent = "☆☆☆☆☆";
    reviewCount.textContent = "Chưa có đánh giá";
  } else {
    const average = ratings.reduce((total, item) => total + item.rating, 0) / ratings.length;
    const roundedAverage = Math.round(average);
    reviewAverage.textContent = average.toFixed(1);
    reviewAverageStars.textContent = "★".repeat(roundedAverage) + "☆".repeat(5 - roundedAverage);
    reviewCount.textContent = `${ratings.length} đánh giá`;
  }

  if (!reviews.length) {
    reviewList.textContent = "Chưa có nhận xét. Hãy là người đầu tiên đánh giá shop!";
    return;
  }

  reviewList.innerHTML = reviews.map((review) => {
    const date = new Intl.DateTimeFormat("vi-VN", {
      year: "numeric", month: "2-digit", day: "2-digit"
    }).format(new Date(review.created_at));
    const isOwnReview = currentReviewUser && currentReviewUser.id === review.user_id;
    const imageMarkup = (Array.isArray(review.image_urls) ? review.image_urls : [])
      .map((url, index) => {
        const safeUrl = safeReviewImageUrl(url);
        return safeUrl ? `
          <a class="review-photo-link" href="${escapeReviewText(safeUrl)}" target="_blank" rel="noopener noreferrer">
            <img class="review-photo" src="${escapeReviewText(safeUrl)}" alt="Ảnh khách hàng đính kèm ${index + 1}" loading="lazy">
          </a>` : "";
      }).join("");

    return `
      <article class="review-card">
        <div class="review-card-top">
          <strong>${escapeReviewText(review.display_name)}</strong>
          <div class="review-card-actions">
            <time>${date}</time>
            ${isOwnReview ? `<button class="review-delete" type="button" data-delete-review>XÓA</button>` : ""}
          </div>
        </div>
        <div class="review-card-stars" aria-label="${review.rating} trên 5 sao">
          ${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}
        </div>
        <p>${escapeReviewText(review.comment)}</p>
        ${imageMarkup ? `<div class="review-card-photos">${imageMarkup}</div>` : ""}
      </article>
    `;
  }).join("");
}

starButtons.forEach((button) => {
  button.addEventListener("click", () => setSelectedRating(Number(button.dataset.rating)));
});

reviewForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentReviewUser) {
    reviewStatus.innerHTML = 'Bạn cần <a href="dang-nhap.html">đăng nhập</a> trước khi gửi đánh giá.';
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
  if (selectedReviewFiles.length > MAX_REVIEW_IMAGES) {
    reviewStatus.textContent = `Bạn chỉ được chọn tối đa ${MAX_REVIEW_IMAGES} ảnh.`;
    return;
  }

  const metadata = currentReviewUser.user_metadata || {};
  const displayName = reviewName.value.trim() || metadata.full_name || metadata.name ||
    metadata.username || currentReviewUser.email?.split("@")[0] || "Khách hàng";

  const submitButton = reviewForm.querySelector('[type="submit"]');
  submitButton.disabled = true;
  reviewStatus.textContent = "Đang gửi đánh giá...";

  let uploadedPaths = [];
  try {
    const { data: previousReview, error: previousError } = await reviewsSupabase
      .from("shop_reviews")
      .select("image_urls")
      .eq("user_id", currentReviewUser.id)
      .maybeSingle();
    if (previousError) throw previousError;

    let imageUrls = Array.isArray(previousReview?.image_urls) ? previousReview.image_urls : [];
    if (selectedReviewFiles.length) {
      const uploaded = await uploadReviewImages(selectedReviewFiles);
      uploadedPaths = uploaded.uploadedPaths;
      imageUrls = uploaded.publicUrls;
    }

    const { error } = await reviewsSupabase
      .from("shop_reviews")
      .upsert({
        user_id: currentReviewUser.id,
        display_name: displayName,
        rating: selectedRating,
        comment,
        image_urls: imageUrls
      }, { onConflict: "user_id" });

    if (error) throw error;

    if (selectedReviewFiles.length && previousReview?.image_urls?.length) {
      await removeReviewImages(previousReview.image_urls);
    }

    reviewStatus.textContent = "Đánh giá của bạn đã được đăng/cập nhật.";
    reviewComment.value = "";
    setSelectedRating(0);
    selectedReviewFiles = [];
    reviewImages.value = "";
    renderReviewPreviews();
    await loadReviews();
  } catch (error) {
    if (uploadedPaths.length) {
      await reviewsSupabase.storage.from(REVIEW_IMAGE_BUCKET).remove(uploadedPaths);
    }
    console.error("Review submission error:", error);
    reviewStatus.textContent =
      "Chưa gửi được đánh giá. Kiểm tra cấu hình Supabase Storage/Database rồi thử lại.";
  } finally {
    submitButton.disabled = false;
  }
});

reviewList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-review]");
  if (!deleteButton || !currentReviewUser) return;

  const confirmed = window.confirm("Bạn có chắc muốn xóa đánh giá của mình không?");
  if (!confirmed) return;

  deleteButton.disabled = true;
  deleteButton.textContent = "ĐANG XÓA...";

  const { data: reviewToDelete, error: readError } = await reviewsSupabase
    .from("shop_reviews")
    .select("image_urls")
    .eq("user_id", currentReviewUser.id)
    .maybeSingle();
  if (readError) {
    deleteButton.disabled = false;
    deleteButton.textContent = "XÓA";
    reviewStatus.textContent = "Không đọc được dữ liệu đánh giá. Vui lòng thử lại.";
    return;
  }

  const { error } = await reviewsSupabase
    .from("shop_reviews")
    .delete()
    .eq("user_id", currentReviewUser.id);
  if (error) {
    deleteButton.disabled = false;
    deleteButton.textContent = "XÓA";
    reviewStatus.textContent = "Không xóa được đánh giá. Vui lòng thử lại.";
    return;
  }

  if (reviewToDelete?.image_urls?.length) {
    await removeReviewImages(reviewToDelete.image_urls);
  }
  reviewStatus.textContent = "Đánh giá của bạn đã được xóa.";
  setSelectedRating(0);
  await loadReviews();
});

reviewsSupabase.auth.onAuthStateChange((_event, session) => {
  setReviewUser(session?.user || null);
  loadReviews();
});

checkReviewUser().then(loadReviews);
