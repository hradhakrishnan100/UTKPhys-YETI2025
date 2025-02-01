// converter.js: Module for unit conversion functionality

export const ConverterModule = (() => {
  let categoryInput, fromUnitInput, toUnitInput, fromUnitsList, toUnitsList, inputValue, resultDisplay;

  const unitConversions = {
    Length: {
      "Planck Length (ℓP)": 1.616e-35,
      "Femtometers (fm)": 1e-15,
      "Picometers (pm)": 1e-12,
      "Nanometers (nm)": 1e-9,
      "Micrometers (µm)": 1e-6,
      "Millimeters (mm)": 1e-3,
      "Centimeters (cm)": 1e-2,
      "Meters (m)": 1,
      "Kilometers (km)": 1e3,
      "Miles (mi)": 1609.34,
      "Yards (yd)": 0.9144,
      "Feet (ft)": 0.3048,
      "Inches (in)": 0.0254,
      "Lightyears (ly)": 9.461e15,
      "Parsecs (pc)": 3.086e16,
      "Astronomical Units (AU)": 1.496e11
    },
    Mass: {
      "Yoctograms (yg)": 1e-24,
      "Nanograms (ng)": 1e-9,
      "Micrograms (µg)": 1e-6,
      "Milligrams (mg)": 1e-3,
      "Grams (g)": 1,
      "Kilograms (kg)": 1e3,
      "Pounds (lb)": 0.453592,
      "Ounces (oz)": 0.0283495,
      "Solar Masses (M☉)": 1.989e30
    },
    Time: {
      "Nanoseconds (ns)": 1e-9,
      "Microseconds (µs)": 1e-6,
      "Milliseconds (ms)": 1e-3,
      "Seconds (s)": 1,
      "Minutes (min)": 60,
      "Hours (hr)": 3600,
      "Days (d)": 86400,
      "Years (yr)": 31536000
    },
    Energy: {
      "Joules (J)": 1,
      "Kilojoules (kJ)": 1e3,
      "Calories (cal)": 4.184,
      "Electron Volts (eV)": 1.60218e-19
    },
    Temperature: {
      "Celsius (°C)": "tempCtoX",
      "Fahrenheit (°F)": "tempFtoX",
      "Kelvin (K)": "tempKtoX"
    },
    Force: {
      "Newtons (N)": 1,
      "Kilonewtons (kN)": 1e3,
      "Meganewtons (MN)": 1e6,
      "Pounds-Force (lbf)": 4.44822,
      "Dynes (dyn)": 1e-5
    },
    Pressure: {
      "Pascals (Pa)": 1,
      "Kilopascals (kPa)": 1e3,
      "Megapascals (MPa)": 1e6,
      "Bars (bar)": 1e5,
      "Atmospheres (atm)": 101325,
      "Torr (torr)": 133.322
    }
  };

  function populateDatalists() {
    fromUnitsList.innerHTML = "";
    toUnitsList.innerHTML = "";
    resultDisplay.textContent = "Converted value will appear here.";
    resultDisplay.style.color = "black"; // Reset color when updating
    const category = categoryInput.value;
    if (!unitConversions[category]) {
      console.error("Invalid category: " + category);
      return;
    }
    Object.keys(unitConversions[category]).forEach(unit => {
      fromUnitsList.appendChild(new Option(unit, unit));
      toUnitsList.appendChild(new Option(unit, unit));
    });
    fromUnitInput.value = "";
    toUnitInput.value = "";
  }

  function convertUnits() {
    const cat = categoryInput.value;
    const fromUnit = fromUnitInput.value;
    const toUnit = toUnitInput.value;
    const val = parseFloat(inputValue.value);

    if (!cat || !unitConversions[cat]) {
      resultDisplay.textContent = "Please select a valid category.";
      resultDisplay.style.color = "black";
      return;
    }
    if (!fromUnit || !Object.keys(unitConversions[cat]).includes(fromUnit)) {
      resultDisplay.textContent = "Please select a valid 'From' unit.";
      resultDisplay.style.color = "black";
      return;
    }
    if (!toUnit || !Object.keys(unitConversions[cat]).includes(toUnit)) {
      resultDisplay.textContent = "Please select a valid 'To' unit.";
      resultDisplay.style.color = "black";
      return;
    }
    if (isNaN(val)) {
      resultDisplay.textContent = "Enter a number in the Value field.";
      resultDisplay.style.color = "black";
      return;
    }
    if (fromUnit === toUnit) {
      resultDisplay.textContent = "No conversion needed.";
      resultDisplay.style.color = "black";
      return;
    }

    // Easter Egg 1: If converting from or to Planck Length
    if (cat === "Length" && (fromUnit === "Planck Length (ℓP)" || toUnit === "Planck Length (ℓP)")) {
      resultDisplay.textContent = "You have reached the quantum realm!";
      resultDisplay.style.color = "black";
      return;
    }

    // Temperature conversion handling
    if (cat === "Temperature") {
      const tempConversions = {
        "Celsius (°C)": {
          "Fahrenheit (°F)": v => (v * 9 / 5) + 32,
          "Kelvin (K)": v => v + 273.15
        },
        "Fahrenheit (°F)": {
          "Celsius (°C)": v => (v - 32) * 5 / 9,
          "Kelvin (K)": v => (v - 32) * 5 / 9 + 273.15
        },
        "Kelvin (K)": {
          "Celsius (°C)": v => v - 273.15,
          "Fahrenheit (°F)": v => (v - 273.15) * 9 / 5 + 32
        }
      };
      const convertedVal = tempConversions[fromUnit]?.[toUnit]?.(val);
      if (convertedVal === undefined) {
        resultDisplay.textContent = "Invalid Temperature Conversion.";
        resultDisplay.style.color = "black";
        return;
      }
      
      // Fahrenheit 451 Easter Egg:
      if (toUnit === "Fahrenheit (°F)" && Math.abs(convertedVal - 451) < 1e-3) {
        resultDisplay.textContent = "Fahrenheit 451: Book burning temperature!";
        resultDisplay.style.color = "black";
        return;
      }
      
      // Temperature display color based on boiling/freezing points.
      let boilingPoint, freezingPoint;
      if (toUnit === "Celsius (°C)") {
        boilingPoint = 100;
        freezingPoint = 0;
      } else if (toUnit === "Fahrenheit (°F)") {
        boilingPoint = 212;
        freezingPoint = 32;
      } else if (toUnit === "Kelvin (K)") {
        boilingPoint = 373.15;
        freezingPoint = 273.15;
      }
      
      if (boilingPoint !== undefined && freezingPoint !== undefined) {
        if (convertedVal > boilingPoint) {
          resultDisplay.style.color = "red";
        } else if (convertedVal < freezingPoint) {
          resultDisplay.style.color = "blue";
        } else {
          resultDisplay.style.color = "black";
        }
      } else {
        resultDisplay.style.color = "black";
      }
      
      resultDisplay.textContent = `${convertedVal.toFixed(4)} ${toUnit}`;
      return;
    }

    // Standard conversion handling (for non-temperature categories)
    const baseVal = val * unitConversions[cat][fromUnit];
    const convertedVal = baseVal / unitConversions[cat][toUnit];

    // Check for conversion result of 42
    if (Math.abs(convertedVal - 42) < 1e-6) {
      resultDisplay.textContent = "42: The answer to Life, the Universe, and Everything!";
      resultDisplay.style.color = "black";
      return;
    }

    resultDisplay.classList.remove("result-animate");
    // Force reflow for CSS animation restart.
    void resultDisplay.offsetWidth;
    resultDisplay.classList.add("result-animate");
    resultDisplay.textContent = `${convertedVal.toExponential(6)} ${toUnit}`;
    resultDisplay.style.color = "black";
  }

  function bindEvents() {
    categoryInput.addEventListener("change", populateDatalists);
    fromUnitInput.addEventListener("change", convertUnits);
    toUnitInput.addEventListener("change", convertUnits);
    inputValue.addEventListener("input", convertUnits);
    inputValue.addEventListener("keyup", convertUnits);
  }

  function init() {
    categoryInput = document.getElementById("category-input");
    fromUnitInput = document.getElementById("from-unit-input");
    toUnitInput = document.getElementById("to-unit-input");
    fromUnitsList = document.getElementById("fromUnitsList");
    toUnitsList = document.getElementById("toUnitsList");
    inputValue = document.getElementById("input-value");
    resultDisplay = document.getElementById("conversion-result");
    populateDatalists();
    bindEvents();
  }

  return { init };
})();
