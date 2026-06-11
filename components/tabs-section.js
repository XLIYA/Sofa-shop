import { getProductsForTab, getTabs } from "../api/products-api.js";

const DEFAULT_VISIBLE_COUNT = 9;

let tabs = [];
let activeTabId = "latest";
let visibleCount = DEFAULT_VISIBLE_COUNT;
let activeProducts = [];

function priceMarkup(product) {
  if (!product.sale) {
    return `
      <p class="m-0 text-[18px] font-bold text-black">
        $ 540.00
      </p>
    `;
  }

  return `
    <p class="m-0 text-[18px] font-bold text-black">
      $ 540.00
      <span class="ml-2 text-[14px] font-normal text-gray-400 line-through">
        $ 600.00
      </span>
    </p>
  `;
}

function getProductImage(product) {
  return product.image || product.image_url || "";
}

function productCard(product) {
  return `
    <article class="text-center">
      <a class="relative flex h-[320px] items-center justify-center overflow-hidden border border-gray-200 bg-white transition hover:border-gray-400" href="product-detail.html?id=${product.id}" aria-label="View ${product.name}">
        ${product.new ? '<span class="absolute left-[-42px] top-[14px] z-10 w-[110px] -rotate-45 bg-[#5da4df] py-1 text-center text-[11px] font-bold text-white">NEW</span>' : ""}
        ${product.sale ? '<span class="absolute right-[-42px] top-[14px] z-10 w-[110px] rotate-45 bg-[#ef4444] py-1 text-center text-[11px] font-bold text-white">SALE</span>' : ""}
        <img
          src="${getProductImage(product)}"
          alt="${product.name}"
          loading="lazy"
          class="max-h-[230px] max-w-[78%] object-contain transition hover:scale-[1.03]"
        >
      </a>
      <h3 class="mb-1 mt-4 min-h-[22px] text-[18px] font-normal text-[#374151]">
        Modular Modern
      </h3>
      ${priceMarkup(product)}
    </article>
  `;
}

function renderTabButtons() {
  return tabs
    .map(
      (tab, index) => `
        ${index > 0 ? '<span class="h-4 border-r border-gray-300"></span>' : ""}
        <button
          type="button"
          class="relative mx-3 border-b-2 border-transparent pb-2 text-[24px] uppercase leading-none text-[#2f2f2f] transition-colors hover:border-[#2f2f2f] hover:text-black"
          data-tab-id="${tab.id}"
        >
          ${tab.label}
        </button>
      `
    )
    .join("");
}

function setActiveButton() {
  document.querySelectorAll("[data-tab-id]").forEach((button) => {
    const isActive = button.dataset.tabId === activeTabId;
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

function renderProducts() {
  const productsContainer = document.getElementById("tabs-products");
  const loadMoreButton = document.getElementById("tabs-load-more");
  const productsToShow = activeProducts.slice(0, visibleCount);

  productsContainer.innerHTML = productsToShow.map(productCard).join("");
  loadMoreButton.hidden = productsToShow.length >= activeProducts.length;
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

function renderError(message) {
  const productsContainer = document.getElementById("tabs-products");
  const loadMoreButton = document.getElementById("tabs-load-more");

  productsContainer.innerHTML = `
    <div class="col-span-full border border-red-100 bg-red-50 py-12 text-center text-red-600">
      ${message}
    </div>
  `;
  loadMoreButton.hidden = true;
}

async function loadTabProducts(tab) {
  renderLoading();

  try {
    activeProducts = await getProductsForTab(tab);
    renderProducts();
  } catch (error) {
    activeProducts = [];
    renderError(error.message);
  }
}

function bindEvents() {
  document.getElementById("tabs-controls").addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab-id]");

    if (!button) {
      return;
    }

    activeTabId = button.dataset.tabId;
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    visibleCount = activeTab?.limit || DEFAULT_VISIBLE_COUNT;
    loadTabProducts(activeTab);
  });

  document.getElementById("tabs-load-more").addEventListener("click", () => {
    visibleCount += DEFAULT_VISIBLE_COUNT;
    renderProducts();
  });
}

function renderSkeleton(root) {
  root.innerHTML = `
    <section class="mx-auto w-full max-w-[1450px] px-[5px] py-8 font-serif">
      <div id="tabs-controls" class="mb-7 flex items-center">
        ${renderTabButtons()}
        <span class="ml-5 flex-grow border-t border-gray-200"></span>
      </div>
      <div
        id="tabs-products"
        class="grid grid-cols-1 gap-x-6 gap-y-[34px] sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
      ></div>
      <div class="mt-10 flex justify-center">
        <button
          id="tabs-load-more"
          type="button"
          class="min-w-[325px] border border-gray-200 bg-white px-10 py-3 text-[14px] font-bold uppercase text-gray-600 transition hover:border-gray-400 hover:bg-gray-50"
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
    activeTabId = tabs[0]?.id || "latest";
    visibleCount = tabs[0]?.limit || DEFAULT_VISIBLE_COUNT;

    renderSkeleton(root);
    bindEvents();
    await loadTabProducts(tabs[0]);
  } catch (error) {
    root.innerHTML = `
      <section class="mx-auto w-full max-w-[1450px] px-[5px] py-8 font-serif">
        <div class="border border-red-100 bg-red-50 py-12 text-center text-red-600">
          ${error.message}
        </div>
      </section>
    `;
  }
}
