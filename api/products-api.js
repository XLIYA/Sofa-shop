import { fetchJson } from "./api-client.js";

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

function cleanPageNumber(value, fallback) {
  const pageNumber = Number(value);

  if (Number.isFinite(pageNumber) && pageNumber > 0) {
    return pageNumber;
  }

  return fallback;
}

function normalizePaginatedProducts(response, currentPage, perPage) {
  return {
    products: response.data || [],
    currentPage,
    perPage,
    firstPage: response.first || 1,
    previousPage: response.prev,
    nextPage: response.next,
    lastPage: response.last || 1,
    pageCount: response.pages || 1,
    totalItems: response.items || 0
  };
}

export async function getTabs() {
  return fetchJson("tabs");
}

export async function getProducts(params = {}) {
  return fetchJson("products", { params });
}

export async function getProduct(id) {
  return fetchJson(`products/${id}`);
}

export async function getPaginatedProducts(options = {}) {
  const page = cleanPageNumber(options.page, DEFAULT_PAGE);
  const perPage = cleanPageNumber(options.perPage, DEFAULT_PER_PAGE);
  const query = options.query || {};

  const response = await fetchJson("products", {
    params: {
      ...query,
      _page: page,
      _per_page: perPage
    }
  });

  return normalizePaginatedProducts(response, page, perPage);
}

export async function getPaginatedProductsForTab(tab, options = {}) {
  return getPaginatedProducts({
    page: options.page,
    perPage: options.perPage,
    query: tab?.query || {}
  });
}
