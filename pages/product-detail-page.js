import { initCartPreviews } from "../components/cart-preview.js";
import { getProduct } from "../api/products-api.js";

const root = document.getElementById("product-detail-root");
const DEFAULT_PRODUCT_ID = "35";

initCartPreviews();

function parseNumber(value) {
  const parsed = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(value) {
  return `$ ${parseNumber(value).toFixed(2)}`;
}

function ratingStars(rating) {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < rating;
    return `
      <svg class="h-4 w-4 ${filled ? "text-[#f6bf21]" : "text-gray-300"}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z" />
      </svg>
    `;
  }).join("");
}

function selectOptions(values = []) {
  return values.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function colorName(color) {
  const names = {
    "#C0392B": "Red",
    "#8A8F94": "Gray",
    "#A46A3A": "Wood",
    "#8B5A2B": "Brown",
    "#F5E8D0": "Cream",
    "#000000": "Black",
    "#FFFFFF": "White",
    "#2F80ED": "Blue",
    "#4CAF50": "Green",
    "#D8C3A5": "Beige"
  };

  return names[color] || color;
}

function colorOptions(colors = []) {
  return colors.map((color) => `<option value="${color}">${colorName(color)}</option>`).join("");
}

function getProductImage(product) {
  return product.image || product.image_url || "";
}

function renderLoading() {
  root.innerHTML = '<div class="border border-gray-200 bg-white py-12 text-center text-gray-500">Loading product...</div>';
}

function renderError(message) {
  root.innerHTML = `<div class="border border-red-100 bg-red-50 py-12 text-center text-red-600">${message}</div>`;
}

function renderProduct(product) {
  const productImage = getProductImage(product);

  root.innerHTML = `
    <div class="mb-7 flex items-center gap-2 text-[13px] text-gray-500">
      <a href="index.html" aria-label="Home">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </svg>
      </a>
      <span>/</span>
      <span>${product.name}</span>
    </div>

    <section class="grid grid-cols-1 gap-10 lg:grid-cols-[390px_1fr]">
      <div class="flex h-[468px] items-center justify-center border border-gray-200 bg-white p-10">
        <img class="max-h-full max-w-full object-contain" src="${productImage}" alt="${product.name}">
      </div>

      <div>
        <div class="border-b border-gray-200 pb-5">
          <h1 class="m-0 text-[24px] font-bold text-gray-500">${product.name}</h1>
          <p class="mt-4 text-[18px] font-bold text-black">${formatPrice(product.price)}</p>
          <p class="mt-2 text-[13px] text-black">Availability: <span>In stock</span></p>
          <div class="mt-4 flex items-center gap-1 text-[13px] text-gray-500">
            <span class="flex">${ratingStars(3)}</span>
            <span>(1 Reviews)</span>
            <span>|</span>
            <button class="hover:text-[#ef4444]" type="button">Add Your Review</button>
          </div>
        </div>

        <div class="border-b border-gray-200 py-5">
          <h2 class="mb-3 text-[14px] font-bold uppercase text-[#2f2f2f]">Quick Overview</h2>
          <p class="text-[13px] leading-6 text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel magna quis risus commodo porttitor. Praesent rutrum lectus diam, ac consequat dolor hendrerit sit amet. Nulla tincidunt tempor nulla et fermentum. Maecenas tempor massa sed sodales dignissim</p>
        </div>

        <div class="border-b border-gray-200 py-6">
          <label class="mb-4 block">
            <span class="mb-2 block text-[14px] font-bold uppercase">Size <span class="text-[#ef4444]">*</span></span>
            <select class="h-10 w-full max-w-[500px] border border-gray-200 px-3 text-[13px] text-gray-600">
              ${selectOptions(product.size || [])}
            </select>
          </label>
          <label class="block">
            <span class="mb-2 block text-[14px] font-bold uppercase">Color <span class="text-[#ef4444]">*</span></span>
            <select class="h-10 w-full max-w-[500px] border border-gray-200 px-3 text-[13px] text-gray-600">
              ${colorOptions(product.color || [])}
            </select>
          </label>
        </div>

        <div class="flex flex-wrap items-center gap-5 border-b border-gray-200 py-6">
          <span class="text-[14px] font-bold uppercase">Qty :</span>
          <div class="flex h-10 border border-gray-200">
            <button class="w-10 border-r border-gray-200 text-[24px] leading-none text-gray-500" type="button" aria-label="Decrease quantity">-</button>
            <span class="flex w-10 items-center justify-center text-[14px] font-bold">1</span>
            <button class="w-10 border-l border-gray-200 text-[24px] leading-none text-gray-500" type="button" aria-label="Increase quantity">+</button>
          </div>
          <button class="h-10 w-[220px] border border-gray-200 text-[15px] font-bold uppercase hover:bg-black hover:text-white" type="button">Add to Cart</button>
          <button class="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-500 hover:text-black" type="button" aria-label="Add to wishlist">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>
          </button>
          <button class="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-500 hover:text-black" type="button" aria-label="Compare product">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
          <button class="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-500 hover:text-black" type="button" aria-label="Preview product">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="2" /></svg>
          </button>
        </div>
      </div>
    </section>

    <section class="mt-28 px-9">
      <div class="flex border border-gray-200">
        <button class="h-[74px] border-r border-gray-200 bg-[#161616] px-8 text-[25px] font-bold uppercase text-white" type="button">Product Description</button>
        <button class="h-[74px] border-r border-gray-200 px-8 text-[25px] font-bold uppercase text-gray-600" type="button">Reviews</button>
        <button class="h-[74px] border-r border-gray-200 px-8 text-[25px] font-bold uppercase text-gray-600" type="button">Product Tags</button>
      </div>
      <div class="border-x border-b border-gray-200 px-8 py-7 text-[16px] leading-7">
        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.</p>
        <p class="mt-7">Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.</p>
        <p class="mt-7">The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form.</p>
      </div>
    </section>
  `;
}

async function init() {
  if (!root) {
    return;
  }

  renderLoading();

  try {
    const id = new URLSearchParams(window.location.search).get("id") || DEFAULT_PRODUCT_ID;
    const product = await getProduct(id);

    if (!product) {
      throw new Error("Product was not found.");
    }

    renderProduct(product);
  } catch (error) {
    renderError(error.message);
  }
}

init();
