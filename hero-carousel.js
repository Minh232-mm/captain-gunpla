const heroCharacterImages = [
  "assets/anhdautrang.jpg",
  "assets/anhdautrang2.png",
  "assets/anhdautrang3.png"
];

const heroCharacter = document.getElementById("heroMecha");

if (heroCharacter) {
  let currentCharacter = 0;

  // Tải trước ảnh để tránh chớp hoặc ảnh bị trống khi đổi
  const preloadedImages = heroCharacterImages.map((src) => {
    const image = new Image();
    image.src = src;
    return image;
  });

  window.setInterval(() => {
    const nextCharacter =
      (currentCharacter + 1) % heroCharacterImages.length;

    // Chỉ đổi ảnh khi ảnh kế tiếp đã tải thành công
    if (!preloadedImages[nextCharacter].complete ||
        preloadedImages[nextCharacter].naturalWidth === 0) {
      return;
    }

    heroCharacter.classList.add("is-changing");

    window.setTimeout(() => {
      heroCharacter.src = heroCharacterImages[nextCharacter];  heroCharacter.classList.remove("hero-character-2", "hero-character-3");  if (nextCharacter === 1) {   heroCharacter.classList.add("hero-character-2"); } else if (nextCharacter === 2) {   heroCharacter.classList.add("hero-character-3"); }
      currentCharacter = nextCharacter;

      requestAnimationFrame(() => {
        heroCharacter.classList.remove("is-changing");
      });
    }, 300);
  }, 3000);
}
