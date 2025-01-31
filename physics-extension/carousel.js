// carousel.js: Module for carousel functionality

export function initCarousel() {
  const root = document.documentElement;
  const accentVars = {
    0: '--accent-home',
    1: '--accent-converter',
    2: '--accent-equation',
    3: '--accent-search',
    4: '--accent-saved'
  };

  let currentSlide = 0;
  const totalSlides = 5; // 0: Intro, 1: Converter, 2: Equation, 3: arXiv, 4: Saved Articles
  const carouselContainer = document.querySelector(".carousel-container");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  function updateButtonColors() {
    const accentValue = getComputedStyle(root).getPropertyValue('--current-accent').trim();
    const searchBtn = document.getElementById("search-arxiv-btn");
    if (searchBtn) {
      searchBtn.style.backgroundColor = accentValue;
      searchBtn.style.color = "#ffffff";
    }
  }

  function updateCarousel() {
    const accentVar = accentVars[currentSlide];
    root.style.setProperty('--current-accent', `var(${accentVar})`);
    const offsetPx = currentSlide * 360; // Each slide is 360px wide
    carouselContainer.style.transform = `translateX(-${offsetPx}px)`;
    updateButtonColors();
  }

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    updateCarousel();
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goToSlide(currentSlide + 1);
    else if (e.key === "ArrowLeft") goToSlide(currentSlide - 1);
  });

  document.querySelectorAll(".feature-panel").forEach(panel => {
    panel.addEventListener("click", () => {
      const targetSlide = parseInt(panel.getAttribute("data-target"), 10);
      goToSlide(targetSlide);
    });
  });

  updateCarousel();
}
