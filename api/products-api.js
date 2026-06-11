import { fetchJson } from "./api-client.js";

export async function getTabs() {
  return fetchJson("tabs");
}

export async function getProducts(params = {}) {
  return fetchJson("products", { params });
}

export async function getProduct(id) {
  return fetchJson(`products/${id}`);
}

export async function getProductsForTab(tab) {
  return fetchJson(tab?.endpoint || "products", { params: tab?.query || {} });
}
