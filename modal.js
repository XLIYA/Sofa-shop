import { initCartPreviews } from "./components/cart-preview.js";

const openBtn = document.getElementById("openCart");
const overlay = document.getElementById("cartOverlay");

initCartPreviews();

openBtn.onclick = () => {
  overlay.classList.remove("hidden");
};

window.onclick = (event) => {
  if (event.target === overlay) {
    overlay.classList.add("hidden");
  }
};
