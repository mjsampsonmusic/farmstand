// UI layer: jQuery for DOM and AJAX, Bootstrap for the drawer and toast, cart.js for the logic.
import { Cart, filterProducts, formatMoney, FREE_SHIPPING_THRESHOLD } from "./cart.js";

const STORAGE_KEY = "farmstand-cart";
const state = { products: [], category: "all", query: "", sort: "featured" };
let cart;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; } catch { return []; }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* storage blocked: cart still works this session */ }
}

function cardTemplate(p) {
  const soldOut = p.stock === 0;
  const low = !soldOut && p.stock < 10;
  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <article class="product-card${soldOut ? " sold-out" : ""}">
        <div class="product-media">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" width="400" height="400" loading="lazy" decoding="async">
          ${p.badge ? `<span class="badge-tag">${escapeHtml(p.badge)}</span>` : ""}
        </div>
        <div class="product-body">
          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description)}</p>
          ${low ? `<span class="stock-low">Only ${p.stock} left</span>` : ""}
          <div class="product-foot">
            <span class="price">${formatMoney(p.price)}</span>
            <button class="btn btn-brand btn-sm add-to-cart" type="button" data-id="${p.id}" ${soldOut ? "disabled" : ""}>
              ${soldOut ? "Sold out" : "Add to cart"}
            </button>
          </div>
        </div>
      </article>
    </div>`;
}

function renderGrid() {
  const list = filterProducts([...state.products], state);
  $("#grid").html(list.map(cardTemplate).join(""));
  $("#empty").prop("hidden", list.length > 0);
}

function renderCart() {
  const lines = cart.lines;
  $("#cartLines").html(
    lines.length
      ? lines.map((l) => `
        <li data-id="${l.id}">
          <img src="${l.image}" alt="" width="56" height="56">
          <div>
            <div class="name">${escapeHtml(l.name)}</div>
            <div class="qty" aria-label="Quantity for ${escapeHtml(l.name)}">
              <button type="button" class="dec" aria-label="Decrease">&minus;</button>
              <span>${l.qty}</span>
              <button type="button" class="inc" aria-label="Increase">+</button>
            </div>
            <button type="button" class="link-remove">Remove</button>
          </div>
          <strong>${formatMoney(l.lineTotal)}</strong>
        </li>`).join("")
      : `<li class="text-muted border-0">Your cart is empty.</li>`
  );

  const pct = Math.min(100, (cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  $("#shipBar").css("width", `${pct}%`).parent().attr("aria-valuenow", Math.round(pct));
  $("#shipNote").text(
    cart.count === 0 ? `Free shipping on orders over ${formatMoney(FREE_SHIPPING_THRESHOLD)}.`
      : cart.toFreeShipping > 0 ? `${formatMoney(cart.toFreeShipping)} away from free shipping.`
      : "You get free shipping."
  );
  $("#subtotal").text(formatMoney(cart.subtotal));
  $("#shipping").text(cart.shipping ? formatMoney(cart.shipping) : "Free");
  $("#total").text(formatMoney(cart.total));
  $("#checkout").prop("disabled", cart.count === 0);
  $(".cart-count").text(cart.count).removeClass("bump");
  void $(".cart-count")[0]?.offsetWidth; // restart the animation
  $(".cart-count").addClass("bump");
  save();
}

function toast(message) {
  $("#toast .toast-body").text(message);
  bootstrap.Toast.getOrCreateInstance($("#toast")[0], { delay: 2000 }).show();
}

function bindEvents() {
  $("#grid").on("click", ".add-to-cart", function () {
    const id = $(this).data("id");
    const before = cart.count;
    cart.add(id);
    renderCart();
    const name = state.products.find((p) => p.id === id).name;
    toast(cart.count > before ? `${name} added to cart` : `That is all the ${name} we have`);
  });

  $("#cartLines")
    .on("click", ".inc, .dec", function () {
      const id = $(this).closest("li").data("id");
      const line = cart.lines.find((l) => l.id === id);
      cart.set(id, line.qty + ($(this).hasClass("inc") ? 1 : -1));
      renderCart();
    })
    .on("click", ".link-remove", function () {
      cart.remove($(this).closest("li").data("id"));
      renderCart();
    });

  $(".chip").on("click", function () {
    $(".chip").removeClass("active").attr("aria-pressed", "false");
    $(this).addClass("active").attr("aria-pressed", "true");
    state.category = $(this).data("category");
    renderGrid();
  });

  let debounce;
  $("#q").on("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(() => { state.query = this.value; renderGrid(); }, 150);
  });
  $("#sort").on("change", function () { state.sort = this.value; renderGrid(); });
  $(".filters").on("submit", (e) => e.preventDefault());
  $("#checkout").on("click", () => toast("Checkout is disabled in this demo."));
}

$.getJSON("data/products.json")
  .done((products) => {
    state.products = products;
    cart = new Cart(products, loadSaved());
    renderGrid();
    renderCart();
    bindEvents();
  })
  .fail((_xhr, status) => {
    $("#grid").html(`<p class="text-center text-muted">Products could not load (${escapeHtml(status)}). Please refresh.</p>`);
  });
