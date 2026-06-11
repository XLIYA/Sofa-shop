import { initCartPreviews } from "./components/cart-preview.js";
import { initMostViewedSection } from "./components/most-viewed-section.js";
import { initTabsSection } from "./components/tabs-section.js";
import { initSuggestCollection } from "./components/suggest-collection.js";

initCartPreviews();
initTabsSection(document.getElementById("app"));
initSuggestCollection(document.getElementById("suggest-collection"));
initMostViewedSection(document.getElementById("most-viewed-section"));
