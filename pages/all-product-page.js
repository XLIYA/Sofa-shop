import { getPaginatedProducts } from "../api/products-api.js";
import { initCartPreviews } from "../components/cart-preview.js";

const PRODUCTS_PER_PAGE = 10;

const root = document.getElementById("all-products-root");
const countRoot = document.getElementById("all-products-count");

initCartPreviews();

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
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(value) {
  return `$ ${parseNumber(value).toFixed(2)}`;
}

function productImage(product) {
  return product.image || product.image_url || "";
}

function productBadges(product) {
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

function ratingStars(rating) {
  const score = Math.max(0, Math.min(5, Number(rating) || 0));
  let stars = "";

  for (let index = 0; index < 5; index += 1) {
    const filled = index < score;
    const colorClass = filled ? "text-[#f6bf21]" : "text-gray-300";

    stars += `
      <svg class="h-4 w-4 ${colorClass}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z" />
      </svg>
    `;
  }

  return stars;
}

function stockText(product) {
  const stock = Number(product.stock);

  if (!Number.isFinite(stock)) {
    return "";
  }

  return `<p class="mt-2 text-[12px] text-gray-500">${stock} in stock</p>`;
}

function productCard(product) {
  const title = product.name || "Product";
  const category = product.category || "Furniture";
  const productUrl = `product-detail.html?id=${encodeURIComponent(product.id)}`;

  return `
    <article class="group text-center">
      <a class="relative flex h-[320px] items-center justify-center overflow-hidden border border-gray-200 bg-white transition hover:border-gray-400" href="${productUrl}" aria-label="View ${escapeHtml(title)}">
        ${productBadges(product)}
        <img
          class="max-h-[230px] max-w-[78%] object-contain transition group-hover:scale-[1.03]"
          src="${escapeHtml(productImage(product))}"
          alt="${escapeHtml(title)}"
          loading="lazy"
        >
      </a>
      <div class="pt-4">
        <p class="text-[11px] font-bold uppercase text-gray-400">${escapeHtml(category)}</p>
        <h2 class="mt-2 min-h-[48px] text-[18px] font-normal leading-6 text-[#374151]">${escapeHtml(title)}</h2>
        <div class="mt-2 flex justify-center gap-1" aria-label="${escapeHtml(String(product.rating || 0))} star rating">
          ${ratingStars(product.rating)}
        </div>
        <p class="mt-2 text-[20px] font-bold text-black">${formatPrice(product.price)}</p>
        ${stockText(product)}
        <a class="mt-4 inline-flex h-10 items-center justify-center border border-gray-200 px-5 text-[12px] font-bold uppercase hover:bg-black hover:text-white" href="${productUrl}">
          View Product
        </a>
      </div>
    </article>
  `;
}

function renderLoading() {
  countRoot.textContent = "Loading products...";

  root.innerHTML = `
    <div class="border border-gray-200 bg-white py-12 text-center text-gray-500">
      Loading products...
    </div>
  `;
}

function renderError(message) {
  countRoot.textContent = "Products could not be loaded.";
  root.innerHTML = `
    <div class="border border-red-100 bg-red-50 py-12 text-center text-red-600">
      ${escapeHtml(message)}
    </div>
  `;
}

function getFirstVisibleItem(result) {
  if (!result.totalItems) {
    return 0;
  }

  return (result.currentPage - 1) * result.perPage + 1;
}

function getLastVisibleItem(result) {
  const lastItem = result.currentPage * result.perPage;

  if (lastItem > result.totalItems) {
    return result.totalItems;
  }

  return lastItem;
}

function renderPagination(result) {
  return `
    <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
      <button
        id="previous-products-page"
        type="button"
        class="h-10 border border-gray-200 px-5 text-[13px] font-bold uppercase hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#2f2f2f]"
        ${result.previousPage ? "" : "disabled"}
      >
        Previous
      </button>
      <span class="text-[13px] text-gray-500">
        Page ${result.currentPage} of ${result.pageCount}
      </span>
      <button
        id="next-products-page"
        type="button"
        class="h-10 border border-gray-200 px-5 text-[13px] font-bold uppercase hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#2f2f2f]"
        ${result.nextPage ? "" : "disabled"}
      >
        Next
      </button>
    </div>
  `;
}

function bindPaginationButtons(result) {
  const previousButton = document.getElementById("previous-products-page");
  const nextButton = document.getElementById("next-products-page");

  previousButton.addEventListener("click", () => {
    if (result.previousPage) {
      loadProductsPage(result.previousPage);
    }
  });

  nextButton.addEventListener("click", () => {
    if (result.nextPage) {
      loadProductsPage(result.nextPage);
    }
  });
}

function renderProducts(result) {
  const firstItem = getFirstVisibleItem(result);
  const lastItem = getLastVisibleItem(result);
  const products = result.products;

  countRoot.textContent = `Showing ${firstItem}-${lastItem} of ${result.totalItems} products`;

  if (!products.length) {
    root.innerHTML = `
      <div class="border border-gray-200 bg-white py-12 text-center text-gray-500">
        No products found.
      </div>
    `;
    return;
  }

  let productCards = "";

  for (const product of products) {
    productCards += productCard(product);
  }

  root.innerHTML = `
    <div class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      ${productCards}
    </div>
    ${renderPagination(result)}
  `;

  bindPaginationButtons(result);
}

async function loadProductsPage(page) {
  if (!root) {
    return;
  }

  renderLoading();

  try {
    const result = await getPaginatedProducts({
      page,
      perPage: PRODUCTS_PER_PAGE
    });

    renderProducts(result);
  } catch (error) {
    renderError(error.message);
  }
}

function initAllProductsPage() {
  loadProductsPage(1);
}

initAllProductsPage();
