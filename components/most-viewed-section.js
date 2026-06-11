import { getProducts } from "../api/products-api.js";

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

function getProductImage(product) {
  return product.most_viewed_image || product.image || product.image_url || "";
}

function itemMarkup(product) {
  const title = product.most_viewed_title || product.name;
  const price = product.most_viewed_price || product.price;

  return `
    <article class="flex gap-6">
      <a href="product-detail.html?id=${product.id}" aria-label="View ${escapeHtml(title)}">
        <img class="h-[150px] w-[130px] border border-gray-200 object-contain p-4" src="${escapeHtml(getProductImage(product))}" alt="${escapeHtml(title)}">
      </a>
      <div class="pt-3 text-[16px] text-gray-600">
        <h3>${escapeHtml(title)}</h3>
        <p class="mt-3 text-[22px] font-bold text-black">${formatPrice(price)}</p>
        <button class="mt-4 flex items-center gap-1 text-gray-500" type="button">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 4h2l2.5 11h10.7L21 7H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Add to Cart
        </button>
      </div>
    </article>
  `;
}

function arrowButton(label, path) {
  return `
    <button class="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-400" type="button" aria-label="${label}">
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="${path}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  `;
}

function sectionShell(content) {
  return `
    <section class="mx-auto w-full max-w-[1500px] px-1 pb-12 pt-8 font-serif">
      <div class="mb-8 flex items-center gap-6">
        <h2 class="whitespace-nowrap text-[27px] font-bold uppercase">Most Viewed</h2>
        <span class="h-px flex-1 bg-gray-200"></span>
        ${arrowButton("Previous", "m15 18-6-6 6-6")}
        ${arrowButton("Next", "m9 18 6-6-6-6")}
      </div>
      ${content}
    </section>
  `;
}

function renderLoading(root) {
  root.innerHTML = sectionShell('<div class="border border-gray-200 bg-white py-12 text-center text-gray-500">Loading most viewed...</div>');
}

function renderError(root, message) {
  root.innerHTML = sectionShell(`<div class="border border-red-100 bg-red-50 py-12 text-center text-red-600">${escapeHtml(message)}</div>`);
}

function renderMostViewed(root, products) {
  const items = products
    .filter((product) => Number.isFinite(Number(product.most_viewed_order)))
    .sort((left, right) => Number(left.most_viewed_order) - Number(right.most_viewed_order));

  root.innerHTML = sectionShell(`
    <div class="grid grid-cols-1 gap-x-14 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
      ${items.map(itemMarkup).join("")}
    </div>
  `);
}

export async function initMostViewedSection(root) {
  if (!root) {
    return;
  }

  renderLoading(root);

  try {
    const products = await getProducts();
    renderMostViewed(root, products);
  } catch (error) {
    renderError(root, error.message);
  }
}
