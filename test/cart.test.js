import { test } from "node:test";
import assert from "node:assert/strict";
import { Cart, filterProducts, FLAT_SHIPPING, MAX_QTY } from "../js/cart.js";

const catalog = [
  { id: "a", name: "Honey", category: "pantry", price: 14, stock: 24, description: "raw" },
  { id: "b", name: "Tee", category: "goods", price: 28, stock: 3, description: "cotton" },
  { id: "c", name: "Corn", category: "produce", price: 6, stock: 0, description: "sweet" },
];

test("adds items and totals with flat shipping under the threshold", () => {
  const cart = new Cart(catalog);
  cart.add("a", 2);
  assert.equal(cart.count, 2);
  assert.equal(cart.subtotal, 28);
  assert.equal(cart.shipping, FLAT_SHIPPING);
  assert.equal(cart.total, 34.95);
  assert.equal(cart.toFreeShipping, 22);
});

test("free shipping at or over the threshold", () => {
  const cart = new Cart(catalog);
  cart.add("a", 4); // 56
  assert.equal(cart.shipping, 0);
  assert.equal(cart.total, 56);
});

test("caps quantity at stock and at the per-item max", () => {
  const cart = new Cart(catalog);
  assert.equal(cart.add("b", 5), 3);
  assert.equal(cart.add("a", 50), MAX_QTY);
});

test("sold-out items cannot be added, and zero removes a line", () => {
  const cart = new Cart(catalog);
  assert.equal(cart.add("c"), 0);
  cart.add("a");
  cart.set("a", 0);
  assert.equal(cart.count, 0);
  assert.equal(cart.shipping, 0);
});

test("unknown products throw", () => {
  assert.throws(() => new Cart(catalog).add("zzz"), /Unknown product/);
});

test("restores saved carts and drops stale lines", () => {
  const saved = [{ id: "a", qty: 2 }, { id: "c", qty: 1 }, { id: "gone", qty: 1 }];
  const cart = new Cart(catalog, saved);
  assert.deepEqual(cart.toJSON(), [{ id: "a", qty: 2 }]);
});

test("filters by category and search, and sorts by price", () => {
  assert.deepEqual(filterProducts(catalog, { category: "goods" }).map((p) => p.id), ["b"]);
  assert.deepEqual(filterProducts(catalog, { query: "SWEET" }).map((p) => p.id), ["c"]);
  assert.deepEqual(filterProducts([...catalog], { sort: "price-desc" }).map((p) => p.id), ["b", "a", "c"]);
});
