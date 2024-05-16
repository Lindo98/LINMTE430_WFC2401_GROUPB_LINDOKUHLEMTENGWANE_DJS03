import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let page = 1;
let matches = books;

// Encapsulate this code in an arrow function to make it more structured

// Here I am defining the function to create the preview elements for books then append them to parent element
const createPreviewElement = (matches, parentElement) => {
  const fragment = document.createDocumentFragment();

  matches.slice(0, BOOKS_PER_PAGE).forEach(({ author, id, image, title }) => {
    const buttonElement = document.createElement("button");
    buttonElement.classList = "preview";
    buttonElement.setAttribute("data-preview", id);

    buttonElement.innerHTML = `
      <img
        class="preview__image"
        src="${image}"
      />
      
      <div class="preview__info">
        <h3 class="preview__title">${title}</h3>
        <div class="preview__author">${authors[author]}</div>
      </div>
    `;

    fragment.appendChild(buttonElement);
  });

  parentElement.appendChild(fragment);
};

// This function is to create genre options and append them to the genre select element

const createGenreOptions = () => {
  const genreHTML = document.createDocumentFragment();
  const firstGenreElement = document.createElement("option");
  firstGenreElement.value = "any";
  firstGenreElement.innerText = "All Genres";
  genreHTML.appendChild(firstGenreElement);

  for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    genreHTML.appendChild(element);
  }

  document.querySelector("[data-search-genres]").appendChild(genreHTML);
};

const startingElement = document.querySelector("[data-list-items]");

createPreviewElement(matches, startingElement);
createGenreOptions();

// this function is to create author options and append them to the author select element

const createAuthorOptions = () => {
  const authorHTML = document.createDocumentFragment();
  const firstAuthorElement = document.createElement("option");
  firstAuthorElement.value = "any";
  firstAuthorElement.innerText = "All Authors";
  authorHTML.appendChild(firstAuthorElement);

  for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    authorHTML.appendChild(element);
  }

  document.querySelector("[data-search-authors]").appendChild(authorHTML);
};
createAuthorOptions();

// this is to set a theme to day and night
const setTheme = (theme) => {
  if (theme === "night") {
    document.documentElement.classList.add("dark-theme");
    document.documentElement.classList.remove("light-theme");
  } else {
    document.documentElement.classList.add("light-theme");
    document.documentElement.classList.remove("dark-theme");
  }

  document.querySelector("[data-settings-theme]").value = theme;
};
setTheme();

// this is to update the show more button

const updatedShowMoreButton = () => {
  if (matches.length > BOOKS_PER_PAGE) {
    document.querySelector("[data-list-button]").open = true;
  } else {
    document.querySelector("[data-list-button]").open = false;
  }

  if (matches.length - page * BOOKS_PER_PAGE < 1) {
    document.querySelector("[data-list-button]").innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        } remaining)</span>
    `;
  } else {
    document.querySelector("[data-list-button]").innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        } remaining)</span>
    `;
  }
};

updatedShowMoreButton();
// Event listeners for header search, settings, and list close

const handleSearchCancel = () => {
  document.querySelector("[data-search-overlay]").open = false;
};

const handleSettingsCancel = () => {
  document.querySelector("[data-settings-overlay]").open = false;
};

const handleHeaderSearch = () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
};

const handleHeaderSettings = () => {
  document.querySelector("[data-settings-overlay]").open = true;
};

const handleListClose = () => {
  document.querySelector("[data-list-active]").open = false;
};

// Add event listeners using the defined functions
document
  .querySelector("[data-search-cancel]")
  .addEventListener("click", handleSearchCancel);
document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", handleSettingsCancel);
document
  .querySelector("[data-header-search]")
  .addEventListener("click", handleHeaderSearch);
document
  .querySelector("[data-header-settings]")
  .addEventListener("click", handleHeaderSettings);
document
  .querySelector("[data-list-close]")
  .addEventListener("click", handleListClose);

// document...

document
  .querySelector("[data-search-form]")
  .addEventListener("submit", handleSearchForm);

function handleSearchForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = filterBooks(filters);

  updateSearchResults(result);
}

function filterBooks(filters) {
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
}

function updateSearchResults(result) {
  page = 1;
  matches = result;

  const listMessage = document.querySelector("[data-list-message]");
  listMessage.classList.toggle("list__message_show", result.length < 1);

  const listItems = document.querySelector("[data-list-items]");
  listItems.innerHTML = "";
  const newItems = document.createDocumentFragment();

  for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
    const element = createPreviewButton(author, id, image, title);
    newItems.appendChild(element);
  }

  listItems.appendChild(newItems);
  updateShowMoreButton();
  scrollToTopSmoothly();
  closeSearchOverlay();
}

function createPreviewButton(author, id, image, title) {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
    <img class="preview__image" src="${image}" />
    <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${authors[author]}</div>
    </div>
  `;

  return element;
}

function updateShowMoreButton() {
  const listButton = document.querySelector("[data-list-button]");
  const remaining = Math.max(matches.length - page * BOOKS_PER_PAGE, 0);

  listButton.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${remaining})</span>
  `;
  listButton.disabled = remaining <= 0;
}

function scrollToTopSmoothly() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeSearchOverlay() {
  document.querySelector("[data-search-overlay]").open = false;
}

// Add event listener for list button

document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();

  matches
    .slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)
    .forEach(({ author, id, image, title }) => {
      const element = createPreviewButton(author, id, image, title);
      fragment.appendChild(element);
    });

  document.querySelector("[data-list-items]").appendChild(fragment);
  page = +1;
});

const createPreviewButton = (author, id, image, title) => {
  const element = document.createElement("button");
  element.classList = "preview";
  element.setAttribute("data-preview", id);

  element.innerHTML = `
      <img class="preview__image" src="${image}" />
      <div class="preview__info">
      <h3 class="preview__title">${title}</h3>
      <div class="preview__author">${author[author]}</div>
      </div>
      `;

  return element;
};

// docs

document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

    if (active) {
      document.querySelector("[data-list-active]").open = true;
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  });
