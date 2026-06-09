import { layout } from "./components/layout.js"
import { getProducts } from "./component/tabs-section.js"
import {renderProducts, setActiveButton, getFinalPrice, productCard, filterProducts } from "./component/tabs-section.js";

document.getElementById("app").innerHTML = layout()

getProducts()