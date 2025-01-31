// arxiv.js: Module for arXiv search and saved articles functionality

export function initArxiv() {
  let startIndex = 0;
  const resultsPerPage = 5;
  let isFetching = false;
  let currentQuery = "";
  
  const resultsContainerEl = document.getElementById("arxiv-results-container");
  const resultsContainer = document.getElementById("arxiv-results");
  const arxivQueryInput = document.getElementById("arxiv-query");
  const searchBtn = document.getElementById("search-arxiv-btn");
  const clearSavedBtn = document.getElementById("clear-saved-btn");

  function highlightText(text, searchQuery) {
    const terms = searchQuery.split(/\s+/).filter(Boolean);
    if (!terms.length) return text;
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
      item.classList.add("arxiv-item");
      item.innerHTML = `
        <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
        <p><strong>Authors:</strong> ${article.authors}</p>
        <p><strong>Published:</strong> ${article.published}</p>
        <button class="remove-article-btn">Remove</button>
      `;
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

  function clearAllSavedArticles() {
    if (confirm("Are you sure you want to clear all saved articles?")) {
      localStorage.removeItem("savedArxivArticles");
      loadSavedArticles();
    }
  }

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
    const arxivAPI = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=${startIndex}&max_results=${resultsPerPage}`;
    try {
      const response = await fetch(arxivAPI);
      const str = await response.text();
      const data = new window.DOMParser().parseFromString(str, "text/xml");
      let entries = Array.from(data.getElementsByTagName("entry"))
        .map(entry => ({
          entry,
          publishedDate: new Date(entry.getElementsByTagName("published")[0].textContent.trim())
        }))
        .sort((a, b) => b.publishedDate - a.publishedDate)
        .map(e => e.entry);
      if (entries.length === 0) {
        if (startIndex === 0) resultsContainer.innerHTML = "<p>No results found.</p>";
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
        resultItem.querySelector(".save-article-btn")
          .addEventListener("click", () => saveArticle(articleData));
        resultItem.querySelector(".citation-btn")
          .addEventListener("click", async () => {
            const citationText = generateCitation(articleData);
            try {
              await copyToClipboard(citationText);
              alert("Citation copied to clipboard!");
            } catch (err) {
              console.error("Copy failed:", err);
            }
          });
      });
      startIndex += resultsPerPage;
    } catch (error) {
      console.error("Error fetching arXiv data:", error);
    } finally {
      isFetching = false;
    }
  }

  if (resultsContainerEl) {
    resultsContainerEl.addEventListener("scroll", () => {
      if (
        resultsContainerEl.scrollTop + resultsContainerEl.clientHeight >=
        resultsContainerEl.scrollHeight - 10
      ) {
        if (!isFetching && currentQuery) searchArxiv(false);
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => searchArxiv(true));
  } else {
    console.error("No #search-arxiv-btn found in DOM.");
  }

  if (clearSavedBtn) {
    clearSavedBtn.addEventListener("click", clearAllSavedArticles);
  }

  // Load saved articles on startup.
  loadSavedArticles();
}
