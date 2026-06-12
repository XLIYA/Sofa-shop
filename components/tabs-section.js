import { getPaginatedProductsForTab, getTabs } from "../api/products-api.js";

const DEFAULT_PAGE_SIZE = 9;

let tabs = [];
let activeTab = null;
let activeProducts = [];
let nextPage = null;
let totalItems = 0;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseNumber(value) {
  const parsed = Number(String(value).replace(/[^\d.]/g, ""));

  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return 0;
}

function formatPrice(value) {
  return `$ ${parseNumber(value).toFixed(2)}`;
}

function getPageSize(tab) {
  return Number(tab?.limit) || DEFAULT_PAGE_SIZE;
}

function getProductImage(product) {
  return product.image || product.image_url || "";
}

function badgeMarkup(product) {
  let badges = "";

  if (product.new) {
    badges += `
      <span class="absolute left-[-42px] top-[14px] z-10 w-[110px] -rotate-45 bg-[#5da4df] py-1 text-center text-[11px] font-bold text-white">
        NEW
      </span>
    `;
  }

  if (product.sale) {
    badges += `
      <span class="absolute right-[-42px] top-[14px] z-10 w-[110px] rotate-45 bg-[#ef4444] py-1 text-center text-[11px] font-bold text-white">
        SALE
      </span>
    `;
  }

  return badges;
}

function priceMarkup(product) {
  return `
    <p class="m-0 text-[18px] font-bold text-black">
      ${formatPrice(product.price)}
    </p>
  `;
}

function productCard(product) {
  const productName = product.name || "Product";
  const productUrl = `product-detail.html?id=${encodeURIComponent(product.id)}`;

  return `
    <article class="text-center">
      <a class="relative flex h-[320px] items-center justify-center overflow-hidden border border-gray-200 bg-white transition hover:border-gray-400" href="${productUrl}" aria-label="View ${escapeHtml(productName)}">
        ${badgeMarkup(product)}
        <img
          src="${escapeHtml(getProductImage(product))}"
          alt="${escapeHtml(productName)}"
          loading="lazy"
          class="max-h-[230px] max-w-[78%] object-contain transition hover:scale-[1.03]"
        >
      </a>
      <h3 class="mb-1 mt-4 min-h-[44px] text-[18px] font-normal leading-6 text-[#374151]">
        ${escapeHtml(productName)}
      </h3>
      ${priceMarkup(product)}
    </article>
  `;
}

function renderTabButtons() {
  let buttons = "";

  tabs.forEach((tab, index) => {
    if (index > 0) {
      buttons += '<span class="h-4 border-r border-gray-300"></span>';
    }

    buttons += `
      <button
        type="button"
        class="relative mx-3 border-b-2 border-transparent pb-2 text-[24px] uppercase leading-none text-[#2f2f2f] transition-colors hover:border-[#2f2f2f] hover:text-black"
        data-tab-id="${escapeHtml(tab.id)}"
      >
        ${escapeHtml(tab.label)}
      </button>
    `;
  });

  return buttons;
}

function setActiveButton() {
  const buttons = document.querySelectorAll("[data-tab-id]");

  buttons.forEach((button) => {
    const isActive = button.dataset.tabId === activeTab?.id;

    button.classList.toggle("border-[#2f2f2f]", isActive);
    button.classList.toggle("font-bold", isActive);
    button.classList.toggle("after:absolute", isActive);
    button.classList.toggle("after:left-1/2", isActive);
    button.classList.toggle("after:top-full", isActive);
    button.classList.toggle("after:h-0", isActive);
    button.classList.toggle("after:w-0", isActive);
    button.classList.toggle("after:-translate-x-1/2", isActive);
    button.classList.toggle("after:border-l-[6px]", isActive);
    button.classList.toggle("after:border-r-[6px]", isActive);
    button.classList.toggle("after:border-t-[6px]", isActive);
    button.classList.toggle("after:border-l-transparent", isActive);
    button.classList.toggle("after:border-r-transparent", isActive);
    button.classList.toggle("after:border-t-[#2f2f2f]", isActive);
    button.classList.toggle("border-transparent", !isActive);
  });
}

function updateResultCount() {
  const countElement = document.getElementById("tabs-result-count");

  if (!countElement) {
    return;
  }

  countElement.textContent = `Showing ${activeProducts.length} of ${totalItems} products`;
}

function renderProducts() {
  const productsContainer = document.getElementById("tabs-products");
  const loadMoreButton = document.getElementById("tabs-load-more");

  if (!activeProducts.length) {
    productsContainer.innerHTML = `
      <div class="col-span-full border border-gray-200 bg-white py-12 text-center text-gray-500">
        No products found.
      </div>
    `;
  } else {
    let productCards = "";

    for (const product of activeProducts) {
      productCards += productCard(product);
    }

    productsContainer.innerHTML = productCards;
  }

  loadMoreButton.hidden = !nextPage;
  loadMoreButton.disabled = false;
  loadMoreButton.textContent = "LOAD MORE ITEMS";

  updateResultCount();
  setActiveButton();
}

function renderLoading() {
  const productsContainer = document.getElementById("tabs-products");
  const loadMoreButton = document.getElementById("tabs-load-more");

  productsContainer.innerHTML = `
    <div class="col-span-full border border-gray-200 bg-white py-12 text-center text-gray-500">
      Loading products...
    </div>
  `;

  loadMoreButton.hidden = true;
}

function renderLoadMoreLoading() {
  const loadMoreButton = document.getElementById("tabs-load-more");

  loadMoreButton.disabled = true;
  loadMoreButton.textContent = "LOADING...";
}

function renderError(message) {
  const productsContainer = document.getElementById("tabs-products");
  const loadMoreButton = document.getElementById("tabs-load-more");

  productsContainer.innerHTML = `
    <div class="col-span-full border border-red-100 bg-red-50 py-12 text-center text-red-600">
      ${escapeHtml(message)}
    </div>
  `;

  loadMoreButton.hidden = true;
}

function addProducts(products) {
  for (const product of products) {
    activeProducts.push(product);
  }
}

async function loadProductsPage(page) {
  const isFirstPage = page === 1;

  if (isFirstPage) {
    activeProducts = [];
    nextPage = null;
    totalItems = 0;
    renderLoading();
  } else {
    renderLoadMoreLoading();
  }

  try {
    const result = await getPaginatedProductsForTab(activeTab, {
      page,
      perPage: getPageSize(activeTab)
    });

    if (isFirstPage) {
      activeProducts = result.products;
    } else {
      addProducts(result.products);
    }

    nextPage = result.nextPage;
    totalItems = result.totalItems;

    renderProducts();
  } catch (error) {
    renderError(error.message);
  }
}

function findTabById(tabId) {
  return tabs.find((tab) => tab.id === tabId);
}

function bindEvents() {
  document.getElementById("tabs-controls").addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab-id]");

    if (!button) {
      return;
    }

    activeTab = findTabById(button.dataset.tabId);
    loadProductsPage(1);
  });

  document.getElementById("tabs-load-more").addEventListener("click", () => {
    if (!nextPage) {
      return;
    }

    loadProductsPage(nextPage);
  });
}

function renderSkeleton(root) {
  root.innerHTML = `
    <section class="mx-auto w-full max-w-[1450px] px-[5px] py-8 font-serif">
      <div id="tabs-controls" class="mb-4 flex items-center">
        ${renderTabButtons()}
        <span class="ml-5 flex-grow border-t border-gray-200"></span>
      </div>
      <p id="tabs-result-count" class="mb-7 text-[13px] text-gray-500"></p>
      <div
        id="tabs-products"
        class="grid grid-cols-1 gap-x-6 gap-y-[34px] sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
      ></div>
      <div class="mt-10 flex justify-center">
        <button
          id="tabs-load-more"
          type="button"
          class="min-w-[325px] border border-gray-200 bg-white px-10 py-3 text-[14px] font-bold uppercase text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
        >
          LOAD MORE ITEMS
        </button>
      </div>
    </section>
  `;
}

export async function initTabsSection(root) {
  if (!root) {
    return;
  }

  root.innerHTML = `
    <section class="mx-auto w-full max-w-[1450px] px-[5px] py-8 font-serif">
      <div class="border border-gray-200 bg-white py-12 text-center text-gray-500">
        Loading products...
      </div>
    </section>
  `;

  try {
    tabs = await getTabs();
    activeTab = tabs[0] || null;

    renderSkeleton(root);
    bindEvents();
    await loadProductsPage(1);
  } catch (error) {
    root.innerHTML = `
      <section class="mx-auto w-full max-w-[1450px] px-[5px] py-8 font-serif">
        <div class="border border-red-100 bg-red-50 py-12 text-center text-red-600">
          ${escapeHtml(error.message)}
        </div>
      </section>
    `;
  }
}
