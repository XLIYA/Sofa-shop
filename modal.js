const openBtn = document.getElementById('openCart');
const overlay = document.getElementById('cartOverlay');


openBtn.onclick = () => overlay.classList.add('active');


window.onclick = (event) => {
    if (event.target == overlay) {
        overlay.classList.remove('active');
    }}