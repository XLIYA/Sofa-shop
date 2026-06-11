export function tabsSection() {
  return `
      <div class="p-3 flex items-center">
        <button
          id="latestBtn"
          class="filterBtn cursor-pointer mx-3 hover:border-b-2 hover:border-gray-700 hover:font-bold"
        >
          LATEST
        </button>
        <span class="h-4 border-r border-gray-300"></span>
        <button
          id="saleBtn"
          class="filterBtn cursor-pointer mx-3 hover:border-b-2 hover:border-gray-700 hover:font-bold"
        >
          SALE OFF
        </button>
        <span class="h-4 border-r border-gray-300"></span>
        <button
          id="bestBtn"
          class="filterBtn cursor-pointer mx-3 hover:border-b-2 hover:border-gray-700 hover:font-bold"
        >
          BEST SALE
        </button>
        <span class="flex-grow border-b border-gray-300 ml-4"></span>
      </div>
  `
}
