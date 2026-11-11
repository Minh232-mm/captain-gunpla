const heroCharacterImages = [
  "assets/anhdautrang.jpg",
  "assets/anhdautrang2.jpg",
  "assets/anhdautrang3.jpg"
];

const heroCharacter = document.getElementById("heroMecha");

if (heroCharacter) {
  let currentCharacter = 0;

  // Tải trước ảnh để chuyển đổi mượt hơn
  heroCharacterImages.forEach((src) => {
    const preloadImage = new Image();
    preloadImage.src = src;
  });

  window.setInterval(() => {
    heroCharacter.classList.add("is-changing");

    window.setTimeout(() => {
      currentCharacter =
        (currentCharacter + 1) % heroCharacterImages.length;

      heroCharacter.src = heroCharacterImages[currentCharacter];

      heroCharacter.onload = () => {
        heroCharacter.classList.remove("is-changing");
      };

      window.setTimeout(() => {
        heroCharacter.classList.remove("is-changing");
      }, 700);
    }, 300);
  }, 3000);
}
