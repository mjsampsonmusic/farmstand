# Farmstand

A responsive e-commerce storefront theme for a small Indiana farm, built with HTML5, CSS3, Bootstrap 5, jQuery, and modern JavaScript (ES6+ modules and classes). No build step: it runs on any static host and deploys to GitHub Pages.

**Live demo:** https://mjsampsonmusic.github.io/farmstand/

## What it shows

- **Pixel-careful layout from a design spec:** design tokens (color, type, radius, shadow) defined once as CSS custom properties, then applied across every component
- **Responsive design:** Bootstrap 5 grid plus custom media queries; tested at 390px phone width and 1280px desktop with no horizontal scroll
- **jQuery and AJAX:** the product catalog loads with `$.getJSON`; event delegation drives add to cart, quantity steppers, filters, and remove
- **ES6+ JavaScript:** cart logic lives in a framework-free ES module (private class fields, getters, optional chaining), so it is unit tested in Node and reusable in React or Vue
- **E-commerce behavior:** stock-aware quantities, sold-out and low-stock states, free shipping progress meter, cart saved to `localStorage`
- **Cross-browser care:** `-webkit-` prefixes, `@supports` fallback for the blurred header, system font fallbacks, reduced-motion support, print styles
- **Web performance:** lightweight SVG product art, explicit image dimensions to prevent layout shift, `loading="lazy"` and `decoding="async"` below the fold, `fetchpriority` on the hero, CDN assets with Subresource Integrity hashes
- **Accessibility:** skip link, labeled controls, `aria-pressed` filter chips, live regions for cart count and toasts, focus-managed Bootstrap offcanvas drawer
- **Tests and CI:** 7 Node unit tests on pricing, shipping, stock caps, saved carts, and filtering, run by GitHub Actions on every push, which then deploys the site to GitHub Pages

## Run it

```bash
npm test        # unit tests (Node 18+)
npm start       # serve at http://localhost:8080
```

Opening `index.html` straight from disk will not load products, because browsers block AJAX on `file://`. Use `npm start` or any static server.

## Layout

```
index.html          markup: header, hero, product grid, story, cart drawer
css/styles.css      design tokens, components, breakpoints
js/cart.js          pure cart and filter logic (ES module, unit tested)
js/app.js           jQuery UI layer: AJAX load, rendering, events
data/products.json  catalog
img/                product illustrations (SVG)
test/               Node test runner specs
```
