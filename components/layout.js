import { tabsSection } from "./tabs.js"
import { productsContainerComponent } from "./products-container.js"
import { loadMoreButton } from "./load-more.js"

export function layout() {
  return `
    <section>
      ${tabsSection()}
      ${productsContainerComponent()}
      ${loadMoreButton()}
    </section>
  `
}
