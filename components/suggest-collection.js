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

function byOrder(field) {
  return (left, right) => Number(left[field]) - Number(right[field]);
}

function getCategoryImage(product) {
  return product.suggest_category_image || product.image || product.image_url || "";
}

function getCardImage(product) {
  return product.suggest_product_image || product.image || product.image_url || "";
}

function badgeMarkup(product) {
  return `
    ${product.new ? '<span class="absolute left-[-34px] top-[14px] -rotate-45 bg-[#5da4df] px-10 py-1 text-[13px] font-bold text-white">NEW</span>' : ""}
    ${product.sale ? '<span class="absolute right-[-34px] top-[14px] rotate-45 bg-[#ef4444] px-10 py-1 text-[13px] font-bold text-white">SALE</span>' : ""}
  `;
}

function categoryMarkup(product, index, total) {
  const borderClass = index < total - 1 ? "border-r border-gray-200" : "";
  const label = product.suggest_category_label || product.name;
  const image = getCategoryImage(product);

  return `
    <article class="${borderClass} px-6 py-6 text-center">
      <img class="mx-auto h-[55px] object-contain" src="${escapeHtml(image)}" alt="${escapeHtml(label)}">
      <p class="mt-3 text-[16px] text-gray-700">${escapeHtml(label)}</p>
    </article>
  `;
}

function productMarkup(product) {
  const title = product.suggest_title || product.name;
  const price = product.suggest_price || product.price;
  const oldPrice = product.suggest_old_price || product.old_price || "";
  const image = getCardImage(product);

  return `
    <article class="text-center">
      <a class="relative flex h-[350px] items-center justify-center overflow-hidden border border-gray-200 bg-white" href="product-detail.html?id=${product.id}" aria-label="View ${escapeHtml(title)}">
        ${badgeMarkup(product)}
        <img class="h-[240px] max-w-[82%] object-contain" src="${escapeHtml(image)}" alt="${escapeHtml(title)}">
      </a>
      <h3 class="mt-4 text-[20px] text-gray-700">${escapeHtml(title)}</h3>
      <p class="mt-1 text-[22px] font-bold text-black">
        ${formatPrice(price)}
        ${oldPrice ? `<span class="text-[15px] font-normal text-gray-400 line-through">${formatPrice(oldPrice)}</span>` : ""}
      </p>
    </article>
  `;
}

function arrowButton(label, direction) {
  const path = direction === "previous" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6";
  const position = direction === "previous" ? "left-0" : "right-0";

  return `
    <button
      class="absolute ${position} top-[170px] z-10 flex h-10 w-10 items-center justify-center border border-gray-200 bg-white text-gray-400"
      type="button"
      aria-label="${label}"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="${path}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  `;
}

function renderLoading(root) {
  root.innerHTML = `
    <section class="mx-auto w-full max-w-[1500px] px-4 py-8 font-serif">
      <h2 class="mb-8 text-[28px] font-black uppercase">Suggest Collection</h2>
      <div class="border border-gray-200 bg-white py-12 text-center text-gray-500">
        Loading suggest collection...
      </div>
    </section>
  `;
}

function renderError(root, message) {
  root.innerHTML = `
    <section class="mx-auto w-full max-w-[1500px] px-4 py-8 font-serif">
      <h2 class="mb-8 text-[28px] font-black uppercase">Suggest Collection</h2>
      <div class="border border-red-100 bg-red-50 py-12 text-center text-red-600">
        ${escapeHtml(message)}
      </div>
    </section>
  `;
}

function renderCollection(root, products) {
  const categories = products
    .filter((product) => Number.isFinite(Number(product.suggest_category_order)))
    .sort(byOrder("suggest_category_order"));

  const collectionProducts = products
    .filter((product) => Number.isFinite(Number(product.suggest_product_order)))
    .sort(byOrder("suggest_product_order"));

  const groupLabel = categories.find((product) => product.suggest_group_label)?.suggest_group_label || "";

  root.innerHTML = `
    <section class="mx-auto w-full max-w-[1500px] px-4 py-8 font-serif">
      <h2 class="mb-8 text-[28px] font-black uppercase">Suggest Collection</h2>
      <div class="relative grid grid-cols-2 border border-gray-200 sm:grid-cols-4 lg:grid-cols-8">
        ${groupLabel ? `<span class="absolute left-12 top-[-14px] bg-white px-4 text-[16px] text-gray-700">${escapeHtml(groupLabel)}</span>` : ""}
        ${categories.map((product, index) => categoryMarkup(product, index, categories.length)).join("")}
      </div>

      <div class="relative mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
        ${arrowButton("Previous", "previous")}
        ${arrowButton("Next", "next")}
        ${collectionProducts.map(productMarkup).join("")}
      </div>
    </section>
  `;
}

export async function initSuggestCollection(root) {
  if (!root) {
    return;
  }

  renderLoading(root);

  try {
    const products = await getProducts();
    renderCollection(root, products);
  } catch (error) {
    renderError(root, error.message);
  }
}
