// const BASE_URL = "http://localhost:3000"

//با mockapi ساخته شده
const API_URL = "https://6a258fe55447714a6f838904.mockapi.io/api/products"

const productsContainer = document.getElementById("products")

let allProducts = []

//گرفتن محصولات 
async function getProducts() {
    const response = await fetch(API_URL)
    const data = await response.json()

    allProducts = data

    //مرتب کردن بر اساس زمان اضافه شدن (LATEST)
    const latest = [...allProducts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )

    renderProducts(latest)

    //استایل دکمه
    setActiveButton(document.getElementById("latestBtn"))
}

//ساخت محصولات و نمایش در صفحه
function renderProducts(products) {
    productsContainer.innerHTML = ""

    products.forEach(product => {

        let priceHTML = ""

        if (product.saleOff > 0) {
            //محاسبه تخفیف
            const finalPrice = product.price - (product.price * product.saleOff / 100)

            priceHTML = `
        <div class="text-xs flex gap-2 items-center">
          <span class="line-through text-gray-400">
            $${product.price}
          </span>
          <span class="font-bold">
            $${finalPrice.toFixed(2)}
          </span>
        </div>
      `
        } else {
            priceHTML = `
        <div class="text-xs">
          $${product.price}
        </div>
      `
        }

        productsContainer.innerHTML += `
  <div class="flex flex-col gap-1 items-center">

<div class="relative w-32 h-44 overflow-hidden">

  ${product.saleOff > 0 ? `
    <div class="absolute -top-1 -right-8 rotate-45 bg-red-600 text-white text-[10px] px-7 py-[5px] font-semibold text-center">
      SALE
    </div>
  ` : ""}

  ${product.bestSale ? `
    <div class="absolute -top-1 -left-8 -rotate-45 bg-blue-600 text-white text-[10px] px-7 py-[5px] font-semibold text-center">
      BEST
    </div>
  ` : ""}

  <img src="${product.image}" class="w-32 h-44 border object-cover" />

</div>

    <div class="text-xs">${product.title}</div>
    ${priceHTML}

  </div>
`
    })
}

getProducts()

//دکمه LATEST
document.getElementById("latestBtn").addEventListener("click", (e) => {
    setActiveButton(e.target)

    const latest = [...allProducts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )
    renderProducts(latest)
})

//دکمه SALE OFF
document.getElementById("saleBtn").addEventListener("click", (e) => {
    setActiveButton(e.target)

    const sale = allProducts.filter(product => product.saleOff > 0)
    renderProducts(sale)
})

//دکمه BEST SALE
document.getElementById("bestBtn").addEventListener("click", (e) => {
    setActiveButton(e.target)

    const best = allProducts.filter(product => product.bestSale === true)
    renderProducts(best)
})

//استایل دکمه های فیلتر
const buttons = document.querySelectorAll(".filterBtn")

function setActiveButton(clickedBtn){
  buttons.forEach(btn=>{
    btn.classList.remove("border-b-2","border-gray-700","font-bold")
  })

  clickedBtn.classList.add("border-b-2","border-gray-700","font-bold")
}
