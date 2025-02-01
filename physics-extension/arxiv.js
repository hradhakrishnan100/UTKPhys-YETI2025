// arxiv.js: Module for arXiv search, infinite scrolling, and saved articles

export const ArxivModule = (() => {
  // Variables to track pagination and fetching state
  let startIndex = 0;
  const resultsPerPage = 5;
  let isFetching = false;
  let currentQuery = "";

  // DOM element references (will be set in init)
  let resultsContainerEl, resultsContainer, arxivQueryInput, searchBtn, clearSavedBtn;

  // Highlight search terms in a given text
  function highlightText(text, searchQuery) {
    const terms = searchQuery.split(/\s+/).filter(Boolean);
    if (!terms.length) return text;
    // Escape special characters for regex
    function escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    let highlighted = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
      highlighted = highlighted.replace(regex, '<span class="highlighted-term">$1</span>');
    });
    return highlighted;
  }

  // Generate a citation string from article data
  function generateCitation({ title, authors, published, link }) {
    return `${authors} (${published}). ${title}. Retrieved from ${link}`;
  }

  // Copy text to the clipboard
  function copyToClipboard(text) {
    return navigator.clipboard.writeText(text);
  }

  // Load saved articles from localStorage and display them
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
      item.classList.add("arxiv-item");
      item.innerHTML = `
        <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
        <p><strong>Authors:</strong> ${article.authors}</p>
        <p><strong>Published:</strong> ${article.published}</p>
        <button class="remove-article-btn">Remove</button>
      `;
      const removeBtn = item.querySelector(".remove-article-btn");
      // When remove is clicked, remove this article
      removeBtn.addEventListener("click", () => removeSavedArticle(article.link));
      savedContainer.appendChild(item);
    });
  }

  // Remove a saved article by link
  function removeSavedArticle(link) {
    let saved = JSON.parse(localStorage.getItem("savedArxivArticles")) || [];
    saved = saved.filter(article => article.link !== link);
    localStorage.setItem("savedArxivArticles", JSON.stringify(saved));
    loadSavedArticles();
  }

  // Save an article if not already saved
  function saveArticle(data) {
    let saved = JSON.parse(localStorage.getItem("savedArxivArticles")) || [];
    const alreadySaved = saved.some(item => item.link === data.link);
    if (!alreadySaved) {
      saved.push(data);
      localStorage.setItem("savedArxivArticles", JSON.stringify(saved));
      alert("Article saved!");
      loadSavedArticles();
    } else {
      alert("This article is already saved.");
    }
  }

  // Clear all saved articles
  function clearAllSavedArticles() {
    if (confirm("Are you sure you want to clear all saved articles?")) {
      localStorage.removeItem("savedArxivArticles");
      loadSavedArticles();
    }
  }

  // Search arXiv API and display results
  async function searchArxiv(reset = true) {
    const query = arxivQueryInput.value.trim();
    if (!query) {
      console.warn("No search query entered.");
      return;
    }
    if (reset) {
      currentQuery = query;
      startIndex = 0;
      resultsContainer.innerHTML = "";
    }
    if (isFetching) return;
    isFetching = true;
    // Construct the arXiv API URL
    const arxivAPI = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=${startIndex}&max_results=${resultsPerPage}`;
    console.log(`Fetching: ${arxivAPI} (reset=${reset})`);
    try {
      const response = await fetch(arxivAPI);
      const str = await response.text();
      const data = new window.DOMParser().parseFromString(str, "text/xml");
      
      // Get all <entry> elements and sort them by published date (newest first)
      let entries = Array.from(data.getElementsByTagName("entry"))
        .sort((a, b) => {
          const dateA = new Date(a.getElementsByTagName("published")[0].textContent);
          const dateB = new Date(b.getElementsByTagName("published")[0].textContent);
          return dateB - dateA;
        });

      if (entries.length === 0) {
        if (startIndex === 0) resultsContainer.innerHTML = "<p>No results found.</p>";
        console.log("No more results to load.");
        isFetching = false;
        return;
      }
      // Process each entry and add it to the results container
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
        
        // Create a new result item element
        const resultItem = document.createElement("div");
        resultItem.classList.add("arxiv-item");
        resultItem.innerHTML = `
          <h3><a href="${link}" target="_blank">${highlightedTitle}</a></h3>
          <p><strong>Authors:</strong> ${authors}</p>
          <p><strong>Published:</strong> ${published}</p>
          <p class="abstract-preview">${highlightedSummary}</p>
          <div class="abstract-tooltip">${rawSummary}</div>
          <button class="save-article-btn">Save</button>
          <button class="citation-btn">Citation</button>
        `;
        resultsContainer.appendChild(resultItem);
        
        // Attach event listener to save button
        const saveBtn = resultItem.querySelector(".save-article-btn");
        if (saveBtn) {
          saveBtn.addEventListener("click", () => saveArticle(articleData));
        }
        // Attach event listener to citation button
        const citationBtn = resultItem.querySelector(".citation-btn");
        if (citationBtn) {
          citationBtn.addEventListener("click", async () => {
            const citationText = generateCitation(articleData);
            try {
              await copyToClipboard(citationText);
              alert("Citation copied to clipboard!");
            } catch (err) {
              console.error("Copy failed:", err);
            }
          });
        }
      });
      startIndex += resultsPerPage;
    } catch (error) {
      console.error("Error fetching arXiv data:", error);
    } finally {
      isFetching = false;
    }
  }

  // Bind event listeners to DOM elements
  function bindEvents() {
    if (resultsContainerEl) {
      resultsContainerEl.addEventListener("scroll", () => {
        if (
          resultsContainerEl.scrollTop + resultsContainerEl.clientHeight >=
          resultsContainerEl.scrollHeight - 10
        ) {
          if (!isFetching && currentQuery) searchArxiv(false);
        }
      });
    } else {
      console.error("Element with id 'arxiv-results-container' not found.");
    }
    if (searchBtn) {
      searchBtn.addEventListener("click", () => searchArxiv(true));
    } else {
      console.error("Element with id 'search-arxiv-btn' not found.");
    }
    if (clearSavedBtn) {
      clearSavedBtn.addEventListener("click", clearAllSavedArticles);
    } else {
      console.error("Element with id 'clear-saved-btn' not found.");
    }
  }

  // Initialize the module: set DOM elements, bind events, and load saved articles
  function init() {
    resultsContainerEl = document.getElementById("arxiv-results-container");
    resultsContainer = document.getElementById("arxiv-results");
    arxivQueryInput = document.getElementById("arxiv-query");
    searchBtn = document.getElementById("search-arxiv-btn");
    clearSavedBtn = document.getElementById("clear-saved-btn");
    bindEvents();
    loadSavedArticles();
  }

  return { init, loadSavedArticles };
})();
