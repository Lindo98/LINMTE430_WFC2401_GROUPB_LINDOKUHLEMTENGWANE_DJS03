import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

// App state management
const appState = {
  page: 1,
  matches: books,
};

// Initialize the app
const initialize = () => {
  renderPreviewElements(
    appState.matches,
    document.querySelector("[data-list-items]")
  );
  populateSelectOptions(genres, "[data-search-genres]", "All Genres");
  populateSelectOptions(authors, "[data-search-authors]", "All Authors");
  setTheme("day");
  updateShowMoreButton();
  attachEventListeners();
};

// Function to create preview elements for books and append them to the parent element
const renderPreviewElements = (matches, parentElement) => {
  const fragment = document.createDocumentFragment();

  matches.slice(0, BOOKS_PER_PAGE).forEach(({ author, id, image, title }) => {
    const buttonElement = createPreviewButton(author, id, image, title);
    fragment.appendChild(buttonElement);
  });

  parentElement.innerHTML = "";
  parentElement.appendChild(fragment);
};

// Function to create preview button elements
const createPreviewButton = (author, id, image, title) => {
  const buttonElement = document.createElement("button");
  buttonElement.classList.add("preview");
  buttonElement.setAttribute("data-preview", id);

  buttonElement.innerHTML = `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${authors[author]}</div>
    </div>
  `;

  return buttonElement;
};

// Function to populate select options for genres or authors
const populateSelectOptions = (data, selector, defaultText) => {
  const selectElement = document.querySelector(selector);
  const fragment = document.createDocumentFragment();

  const defaultOption = document.createElement("option");
  defaultOption.value = "any";
  defaultOption.innerText = defaultText;
  fragment.appendChild(defaultOption);

  Object.entries(data).forEach(([id, name]) => {
    const option = document.createElement("option");
    option.value = id;
    option.innerText = name;
    fragment.appendChild(option);
  });

  selectElement.appendChild(fragment);
};

// Function to set the theme
const setTheme = (theme) => {
  document.documentElement.classList.toggle("dark-theme", theme === "night");
  document.documentElement.classList.toggle("light-theme", theme === "day");
  document.querySelector("[data-settings-theme]").value = theme;
};

// Function to update the "Show More" button
const updateShowMoreButton = () => {
  const remaining = Math.max(
    appState.matches.length - appState.page * BOOKS_PER_PAGE,
    0
  );
  const listButton = document.querySelector("[data-list-button]");

  listButton.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${remaining})</span>
  `;
  listButton.disabled = remaining <= 0;
};

// Event handler for the search form submission
const handleSearchForm = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = filterBooks(filters);

  updateSearchResults(result);
};

// Function to filter books based on the search filters
const filterBooks = (filters) => {
  return books.filter((book) => {
    const genreMatch =
      filters.genre === "any" || book.genres.includes(filters.genre);
    const titleMatch =
      filters.title.trim() === "" ||
      book.title.toLowerCase().includes(filters.title.toLowerCase());
    const authorMatch =
      filters.author === "any" || book.author === filters.author;

    return genreMatch && titleMatch && authorMatch;
  });
};

// Function to update the search results
const updateSearchResults = (result) => {
  appState.page = 1;
  appState.matches = result;

  const listMessage = document.querySelector("[data-list-message]");
  listMessage.classList.toggle("list__message_show", result.length < 1);

  renderPreviewElements(
    result.slice(0, BOOKS_PER_PAGE),
    document.querySelector("[data-list-items]")
  );
  updateShowMoreButton();
  scrollToTopSmoothly();
  closeSearchOverlay();
};

// Function to scroll to the top smoothly
const scrollToTopSmoothly = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Function to close the search overlay
const closeSearchOverlay = () => {
  document.querySelector("[data-search-overlay]").open = false;
};

// Function to handle list item clicks
const handleListItemClick = (event) => {
  const targetBookId = event.target.closest(".preview")?.dataset?.preview;
  if (!targetBookId) return;

  const activeBook = findBookById(targetBookId);
  if (activeBook) displayActiveBook(activeBook);
};

// Function to find a book by its ID
const findBookById = (id) => {
  return books.find((book) => book.id === id) || null;
};

// Function to display the active book details
const displayActiveBook = (book) => {
  const listActive = document.querySelector("[data-list-active]");
  const listBlur = document.querySelector("[data-list-blur]");
  const listImage = document.querySelector("[data-list-image]");
  const listTitle = document.querySelector("[data-list-title]");
  const listSubtitle = document.querySelector("[data-list-subtitle]");
  const listDescription = document.querySelector("[data-list-description]");

  listActive.open = true;
  listBlur.src = book.image;
  listImage.src = book.image;
  listTitle.innerText = book.title;
  listSubtitle.innerText = `${authors[book.author]} (${new Date(
    book.published
  ).getFullYear()})`;
  listDescription.innerText = book.description;
};

// Function to attach event listeners
const attachEventListeners = () => {
  document
    .querySelector("[data-search-cancel]")
    .addEventListener("click", () => {
      document.querySelector("[data-search-overlay]").open = false;
    });

  document
    .querySelector("[data-settings-cancel]")
    .addEventListener("click", () => {
      document.querySelector("[data-settings-overlay]").open = false;
    });

  document
    .querySelector("[data-header-search]")
    .addEventListener("click", () => {
      document.querySelector("[data-search-overlay]").open = true;
      document.querySelector("[data-search-title]").focus();
    });

  document
    .querySelector("[data-header-settings]")
    .addEventListener("click", () => {
      document.querySelector("[data-settings-overlay]").open = true;
    });

  document.querySelector("[data-list-close]").addEventListener("click", () => {
    document.querySelector("[data-list-active]").open = false;
  });

  document
    .querySelector("[data-search-form]")
    .addEventListener("submit", handleSearchForm);

  document.querySelector("[data-list-button]").addEventListener("click", () => {
    const fragment = document.createDocumentFragment();

    appState.matches
      .slice(
        appState.page * BOOKS_PER_PAGE,
        (appState.page + 1) * BOOKS_PER_PAGE
      )
      .forEach(({ author, id, image, title }) => {
        const element = createPreviewButton(author, id, image, title);
        fragment.appendChild(element);
      });

    document.querySelector("[data-list-items]").appendChild(fragment);
    appState.page += 1;
    updateShowMoreButton();
  });

  document
    .querySelector("[data-list-items]")
    .addEventListener("click", handleListItemClick);
};

// Initialize the app
initialize();
