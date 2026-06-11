export const BASE_URL = "http://localhost:3000";

const responseCache = new Map();

function buildUrl(endpoint, params = {}) {
  const url = new URL(endpoint.replace(/^\/+/, ""), `${BASE_URL}/`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url;
}

export async function fetchJson(endpoint, options = {}) {
  const { params = {}, useCache = true } = options;
  const url = buildUrl(endpoint, params);
  const cacheKey = url.toString();

  if (useCache && responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    })
    .catch((error) => {
      responseCache.delete(cacheKey);
      throw new Error(`Unable to load ${url.pathname}: ${error.message}`);
    });

  if (useCache) {
    responseCache.set(cacheKey, request);
  }

  return request;
}
