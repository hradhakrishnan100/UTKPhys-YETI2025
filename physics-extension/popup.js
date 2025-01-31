// popup.js: Main entry point for the PhysX extension

import { initCarousel } from "./carousel.js";
import { initArxiv } from "./arxiv.js";
import { initConverter } from "./converter.js";

document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  initArxiv();
  initConverter();
});
