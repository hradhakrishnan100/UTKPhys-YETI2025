// popup.js
import initCarousel from "./carousel.js";
import { ConverterModule } from "./converter.js";
import { ArxivModule } from "./arxiv.js";
import { EquationModule } from "./equation.js";
import { CoffeeModule } from "./coffee.js";

window.addEventListener("load", () => {
  console.log("Window fully loaded; initializing modules...");
  initCarousel();
  ConverterModule.init();
  ArxivModule.init();
  EquationModule.init();
  CoffeeModule.init();
});
