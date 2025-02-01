// popup.js
import initCarousel from "./carousel.js";
import { ConverterModule } from "./converter.js";
import { ArxivModule } from "./arxiv.js";
import { EquationModule } from "./equation.js";

// Use window.onload to ensure all resources (images, styles, etc.) are fully loaded.
window.addEventListener("load", () => {
  console.log("Window fully loaded; initializing modules...");
  initCarousel();
  ConverterModule.init();
  ArxivModule.init();
  EquationModule.init();
});
