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

function cartImage(product) {
  return product.cart_image || product.image || product.image_url || "";
}

function cartTitle(product) {
  return product.cart_title || product.name || "";
}

function cartPrice(product) {
  return product.cart_price || product.price || "";
}

function removeButton(title) {
  return `
    <button class="flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-white" type="button" aria-label="Remove ${escapeHtml(title)}">
      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
      </svg>
    </button>
  `;
}

function itemMarkup(product) {
  const title = cartTitle(product);

  return `
    <article class="grid grid-cols-[120px_1fr_22px] gap-4">
      <img class="h-[135px] w-[120px] border border-gray-100 object-contain p-3" src="${escapeHtml(cartImage(product))}" alt="${escapeHtml(title)}">
      <div class="pt-1">
        <h3 class="m-0 text-[20px] font-normal leading-none">${escapeHtml(title)}</h3>
        <p class="mt-4 text-[24px] font-bold leading-none text-black">${formatPrice(cartPrice(product))}</p>
      </div>
      ${removeButton(title)}
    </article>
  `;
}

function renderLoading(root) {
  root.innerHTML = '<div class="py-8 text-center text-gray-500">Loading cart...</div>';
}

function renderError(root, message) {
  root.innerHTML = `<div class="py-8 text-center text-red-600">${escapeHtml(message)}</div>`;
}

function renderCart(root, items) {
  const total = items[0]?.cart_total || items[0]?.cart_price || items[0]?.price || "0";

  root.innerHTML = `
    <div class="grid gap-5">
      ${items.map(itemMarkup).join("")}
    </div>
    <div class="mt-6 border-y border-gray-100 py-8 text-right text-[22px]">
      <span>Total:</span>
      <strong class="text-black">${formatPrice(total)}</strong>
    </div>
    <a class="mt-6 flex h-12 items-center justify-center border border-gray-100 text-[18px] font-bold uppercase hover:bg-black hover:text-white" href="shopping-cart.html">
      Check Out
    </a>
  `;
}

export async function initCartPreviews(scope = document) {
  const roots = [...scope.querySelectorAll("[data-cart-preview]")];

  if (!roots.length) {
    return;
  }

  roots.forEach(renderLoading);

  try {
    const products = await getProducts();
    const items = products
      .filter((product) => Number.isFinite(Number(product.cart_order)))
      .sort((left, right) => Number(left.cart_order) - Number(right.cart_order));

    roots.forEach((root) => renderCart(root, items));
  } catch (error) {
    roots.forEach((root) => renderError(root, error.message));
  }
}
