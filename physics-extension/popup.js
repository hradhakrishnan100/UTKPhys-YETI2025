console.log("Popup.js loaded successfully!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded!");

  /* --------------------------------------------------------------------------
   * CAROUSEL LOGIC
   * ------------------------------------------------------------------------ */
  const root = document.documentElement;

  // Now we have 5 slides total: 0,1,2,3,4 (the 4th index is the new "Saved Articles" slide)
  const accentVars = {
    0: '--accent-home',
    1: '--accent-converter',
    2: '--accent-equation',
    3: '--accent-search',
    4: '--accent-saved'  // new pink accent for the Saved Articles slide
  };

  let currentSlide = 0;
  const totalSlides = 5; // changed to 5
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const carouselContainer = document.querySelector(".carousel-container");

  function updateButtonColors() {
    const accentValue = getComputedStyle(root).getPropertyValue('--current-accent').trim();
    const searchBtn = document.getElementById("search-arxiv-btn");
    if (searchBtn) {
      searchBtn.style.backgroundColor = accentValue;
      searchBtn.style.color = "#ffffff";
    }
  }

  function updateCarousel() {
    console.log("Updating carousel to slide:", currentSlide);
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

  // Carousel events
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    else if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
  });

  document.querySelectorAll('.feature-panel').forEach(panel => {
    panel.addEventListener('click', () => {
      const targetSlide = parseInt(panel.getAttribute('data-target'), 10);
      console.log("Navigating to slide", targetSlide);
      goToSlide(targetSlide);
    });
  });



  /* --------------------------------------------------------------------------
   * ARXIV SEARCH LOGIC (Infinite Scrolling + Save/Citation)
   * ------------------------------------------------------------------------ */

  let startIndex = 0;        // For pagination
  const resultsPerPage = 5;  // You can adjust to any chunk size you want
  let isFetching = false;    // Prevent overlapping fetch calls
  let currentQuery = "";     // Track the user’s current search term

  // For infinite scrolling, we listen to the scroll event on #arxiv-results-container
  const resultsContainerEl = document.getElementById("arxiv-results-container");
  if (resultsContainerEl) {
    resultsContainerEl.addEventListener("scroll", () => {
      // If scrolled near bottom, fetch next batch
      if (
        resultsContainerEl.scrollTop + resultsContainerEl.clientHeight >=
        resultsContainerEl.scrollHeight - 10
      ) {
        // Load more results if not already fetching
        if (!isFetching && currentQuery) {
          searchArxiv(false); 
        }
      }
    });
  }

  function highlightText(text, searchQuery) {
    const terms = searchQuery.split(/\s+/).filter(Boolean);
    if (!terms.length) return text;

    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    let highlighted = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
      highlighted = highlighted.replace(
        regex,
        '<span class="highlighted-term">$1</span>'
      );
    });
    return highlighted;
  }

  function generateCitation({ title, authors, published, link }) {
    return `${authors} (${published}). ${title}. Retrieved from ${link}`;
  }

  function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
  }

  function loadSavedArticles() {
    const savedContainer = document.getElementById("saved-articles");
    if (!savedContainer) {
      console.warn("No #saved-articles container found in DOM.");
      return;
    }

    savedContainer.innerHTML = ""; 
    const saved = JSON.parse(localStorage.getItem("savedArxivArticles")) || [];
    if (saved.length === 0) {
      savedContainer.innerHTML = "<p>No saved articles yet.</p>";
      return;
    }

    saved.forEach(article => {
      const item = document.createElement("div");
      item.classList.add("arxiv-item"); // reuse that styling

      item.innerHTML = `
        <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
        <p><strong>Authors:</strong> ${article.authors}</p>
        <p><strong>Published:</strong> ${article.published}</p>
        <button class="remove-article-btn">Remove</button>
      `;

      // Remove button
      const removeBtn = item.querySelector(".remove-article-btn");
      removeBtn.addEventListener("click", () => removeSavedArticle(article.link));

      savedContainer.appendChild(item);
    });
  }

  function removeSavedArticle(link) {
    let saved = JSON.parse(localStorage.getItem("savedArxivArticles")) || [];
    saved = saved.filter(article => article.link !== link);
    localStorage.setItem("savedArxivArticles", JSON.stringify(saved));
    loadSavedArticles();
  }

  function saveArticle(data) {
    let saved = JSON.parse(localStorage.getItem('savedArxivArticles')) || [];
    const alreadySaved = saved.some(item => item.link === data.link);
    if (!alreadySaved) {
      saved.push(data);
      localStorage.setItem('savedArxivArticles', JSON.stringify(saved));
      alert('Article saved!');
      loadSavedArticles(); // refresh the UI
    } else {
      alert('This article is already saved.');
    }
  }

  /**
   * searchArxiv(reset = true):
   *  - If reset is true, we start from the beginning of the results.
   *  - Otherwise, we fetch more results (infinite scrolling).
   */
  function searchArxiv(reset = true) {
    const query = document.getElementById("arxiv-query").value.trim();
    
    if (!query) {
      console.warn("No search query entered.");
      return;
    }

    // If this is a new query, reset everything
    if (reset) {
      currentQuery = query;
      startIndex = 0;
      document.getElementById("arxiv-results").innerHTML = "";
    } else {
      // If we're continuing the same query, do nothing
      // If user typed a new query but didn't press "Search" button again,
      // you could handle that scenario as well.
    }

    if (isFetching) return; // avoid duplicate calls
    isFetching = true;

    // arXiv API with pagination
    const arxivAPI = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=${startIndex}&max_results=${resultsPerPage}`;
    console.log(`Fetching from: ${arxivAPI}, reset=${reset}, startIndex=${startIndex}`);

    fetch(arxivAPI)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => {
        const entries = Array.from(data.getElementsByTagName("entry"))
          .map(entry => ({
          entry,
          publishedDate: new Date(entry.getElementsByTagName("published")[0].textContent.trim())
        }))
       .sort((a, b) => b.publishedDate - a.publishedDate) // Sort newest first
       .map(e => e.entry); 

        const resultsContainer = document.getElementById("arxiv-results");
        if (entries.length === 0 && startIndex === 0) {
          // no results at all
          resultsContainer.innerHTML = "<p>No results found.</p>";
          isFetching = false;
          return;
        }

        if (entries.length === 0 && startIndex > 0) {
          // no more results
          console.log("No more results to load.");
          isFetching = false;
          return;
        }

        entries.forEach(entry => {
          const rawTitle = entry.getElementsByTagName("title")[0]?.textContent || "";
          const rawSummary = entry.getElementsByTagName("summary")[0]?.textContent || "";
          const link = entry.getElementsByTagName("id")[0]?.textContent || "";
          const authorsList = Array.from(entry.getElementsByTagName("author"))
            .map(a => a.getElementsByTagName("name")[0]?.textContent || "");
          const authors = authorsList.join(", ");
          const publishedFull = entry.getElementsByTagName("published")[0]?.textContent || "";
          const published = publishedFull.split("T")[0];

          const partialSummary = rawSummary.substring(0, 300) + "...";
          const highlightedTitle = highlightText(rawTitle, query);
          const highlightedSummary = highlightText(partialSummary, query);

          const articleData = { title: rawTitle, summary: rawSummary, link, authors, published };

          const resultItem = document.createElement("div");
          resultItem.classList.add("arxiv-item");
          resultItem.innerHTML = `
            <h3><a href="${link}" target="_blank">${highlightedTitle}</a></h3>
            <p><strong>Authors:</strong> ${authors}</p>
            <p><strong>Published:</strong> ${published}</p>
            <p>${highlightedSummary}</p>
            <button class="save-article-btn">Save</button>
            <button class="citation-btn">Citation</button>
          `;

          resultsContainer.appendChild(resultItem);


          // Hook up "Save"
          resultItem.querySelector(".save-article-btn").addEventListener("click", () => saveArticle(articleData));
          // Hook up "Citation"
          resultItem.querySelector(".citation-btn").addEventListener("click", () => {
            const citationText = generateCitation(articleData);
            copyToClipboard(citationText).then(() => {
              alert("Citation copied to clipboard!");
            }).catch(err => console.error("Copy failed:", err));
          });
        });

        // Update pagination
        startIndex += resultsPerPage;
        isFetching = false;
      })
      .catch(error => {
        console.error("Error fetching arXiv data:", error);
        isFetching = false;
      });
  }

  /* --------------------------------------------------------------------------
   * UNIT CONVERTER LOGIC (Unchanged in functionality, as requested)
   * ------------------------------------------------------------------------ */
  const categoryInput = document.getElementById("category-input");
  const fromUnitInput = document.getElementById("from-unit-input");
  const toUnitInput = document.getElementById("to-unit-input");
  const fromUnitsList = document.getElementById("fromUnitsList");
  const toUnitsList = document.getElementById("toUnitsList");
  const inputValue = document.getElementById("input-value");
  const resultDisplay = document.getElementById("conversion-result");

  if (!categoryInput || !fromUnitInput || !toUnitInput || !resultDisplay) {
    console.error("ERROR: Missing unit converter elements.");
    return;
  }

  console.log("Unit converter elements found!");

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
    console.log("Populating unit datalists for category:", categoryInput.value);
    const category = categoryInput.value;
    fromUnitsList.innerHTML = "";
    toUnitsList.innerHTML = "";
    resultDisplay.textContent = "Converted value will appear here.";

    if (!unitConversions[category]) {
      console.error("ERROR: Invalid category selected:", category);
      return;
    }
    Object.keys(unitConversions[category]).forEach(unit => {
      fromUnitsList.appendChild(new Option(unit, unit));
      toUnitsList.appendChild(new Option(unit, unit));
    });

    fromUnitInput.value = "";
    toUnitInput.value = "";
    console.log("Units populated for:", category);
  }

  function convertUnits() {
    console.log("Attempting unit conversion...");
    const cat = categoryInput.value;
    const fromUnit = fromUnitInput.value;
    const toUnit = toUnitInput.value;
    const val = parseFloat(inputValue.value);

    if (!cat || !unitConversions[cat]) {
      resultDisplay.textContent = "Please select a valid category (e.g., Length, Mass, Time).";
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
      resultDisplay.textContent = `No conversion needed.`;
      return;
    }

    console.log("Converting", val, fromUnit, "to", toUnit, "in", cat);

    // Temperature
    if (cat === "Temperature") {
      const tempConversions = {
        "Celsius (°C)": {
          "Fahrenheit (°F)": val => (val * 9 / 5) + 32,
          "Kelvin (K)": val => val + 273.15
        },
        "Fahrenheit (°F)": {
          "Celsius (°C)": val => (val - 32) * 5 / 9,
          "Kelvin (K)": val => (val - 32) * 5 / 9 + 273.15
        },
        "Kelvin (K)": {
          "Celsius (°C)": val => val - 273.15,
          "Fahrenheit (°F)": val => (val - 273.15) * 9 / 5 + 32
        }
      };

      const convertedVal = tempConversions[fromUnit]?.[toUnit]?.(val);
      if (convertedVal === undefined) {
        resultDisplay.textContent = "Invalid Temperature Conversion.";
        resultDisplay.style.color = "black";
        return;
      }

      const tempC = tempConversions[fromUnit]?.["Celsius (°C)"]?.(val) ?? val;
      resultDisplay.style.color = tempC <= 0 ? "blue" : tempC >= 100 ? "red" : "";

      resultDisplay.textContent = `${convertedVal.toFixed(4)} ${toUnit}`;
      return;
    }

    // Restore default color
    resultDisplay.style.color = "black";

    // Easter Eggs
    if (fromUnit.includes("Planck Length") || toUnit.includes("Planck Length")) {
      resultDisplay.textContent = "You've reached the quantum realm.";
      return;
    }
    if (fromUnit.includes("Newtons") || toUnit.includes("Newtons")) {
      resultDisplay.textContent = `${val.toFixed(4)} ${toUnit}`;
      resultDisplay.style.animation = "fallingEffect 1s ease-out";
      return;
    }
    if (val === 42) {
      resultDisplay.textContent = "42! The Answer to Life, the Universe, and Everything.";
      return;
    }

    // Standard conversion
    const baseVal = val * unitConversions[cat][fromUnit];
    const convertedVal = baseVal / unitConversions[cat][toUnit];
    resultDisplay.classList.remove("result-animate");
    void resultDisplay.offsetWidth; // Force reflow
    resultDisplay.classList.add("result-animate");
    resultDisplay.textContent = `${convertedVal.toExponential(6)} ${toUnit}`;
  }

  // Converter events
  categoryInput.addEventListener("change", () => {
    console.log("Category changed:", categoryInput.value);
    populateDatalists();
  });
  fromUnitInput.addEventListener("change", () => {
    console.log("From unit changed:", fromUnitInput.value);
    convertUnits();
  });
  toUnitInput.addEventListener("change", () => {
    console.log("To unit changed:", toUnitInput.value);
    convertUnits();
  });
  inputValue.addEventListener("input", () => {
    console.log("Input value changed:", inputValue.value);
    convertUnits();
  });
  inputValue.addEventListener("keyup", convertUnits);

  // Init converter + carousel
  populateDatalists();
  updateCarousel();

  /* --------------------------------------------------------------------------
   * Attach the arXiv search event listener
   * Load saved articles on startup
   * ------------------------------------------------------------------------ */
  const arxivBtn = document.getElementById("search-arxiv-btn");
  if (arxivBtn) {
    arxivBtn.addEventListener("click", () => {
      // If user clicks "Search," we do a fresh search
      searchArxiv(true);
    });
  } else {
    console.error("No #search-arxiv-btn found in DOM.");
  }

  // Display previously saved articles right away
  loadSavedArticles();
});
