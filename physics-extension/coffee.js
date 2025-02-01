// coffee.js: Module for managing the coffee counter feature
export const CoffeeModule = (() => {
  let count = 0;
  const coffeeCounter = document.getElementById("coffee-counter");
  const coffeeButton = document.getElementById("coffee-button");

  // Load coffee count if exists
  function loadCoffeeCount() {
    const savedCount = localStorage.getItem("coffeeCount");
    if (savedCount !== null) {
      count = parseInt(savedCount, 10);
    } else {
      count = 0;
    }
  }

  // Save the current coffee 
  function saveCoffeeCount() {
    localStorage.setItem("coffeeCount", count);
  }

  // Update the displayed coffee count 
  function updateDisplay() {
    if (coffeeCounter) {
      coffeeCounter.textContent = "Coffee Count: " + count;
    }
  }

  // Initialize the coffee counter
  function init() {
    if (!coffeeCounter || !coffeeButton) {
      console.error("Coffee counter elements not found.");
      return;
    }
    loadCoffeeCount();
    updateDisplay();
    coffeeButton.addEventListener("click", () => {
      count++;
      saveCoffeeCount();
      updateDisplay();
    });
  }

  return { init };
})();