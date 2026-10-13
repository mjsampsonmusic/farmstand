// Pure cart logic (no DOM), so it can be unit tested in Node and reused by any front end.

export const FREE_SHIPPING_THRESHOLD = 50;
export const FLAT_SHIPPING = 6.95;
export const MAX_QTY = 10;

export const formatMoney = (n) => `$${n.toFixed(2)}`;

export class Cart {
  #lines = new Map();
  #catalog;

  constructor(catalog = [], saved = []) {
    this.#catalog = new Map(catalog.map((p) => [p.id, p]));
    for (const { id, qty } of saved) {
      // Drop anything saved that is no longer sold or is out of stock.
      if (this.#catalog.get(id)?.stock > 0) this.set(id, qty);
    }
  }

  add(id, qty = 1) {
    return this.set(id, (this.#lines.get(id) ?? 0) + qty);
  }

  set(id, qty) {
    const product = this.#catalog.get(id);
    if (!product) throw new Error(`Unknown product: ${id}`);
    const capped = Math.min(Math.max(0, Math.floor(qty)), MAX_QTY, product.stock);
    if (capped === 0) this.#lines.delete(id);
    else this.#lines.set(id, capped);
    return capped;
  }

  remove(id) {
    this.#lines.delete(id);
  }

  get lines() {
    return [...this.#lines].map(([id, qty]) => {
      const product = this.#catalog.get(id);
      return { ...product, qty, lineTotal: +(product.price * qty).toFixed(2) };
    });
  }

  get count() {
    return [...this.#lines.values()].reduce((sum, q) => sum + q, 0);
  }

  get subtotal() {
    return +this.lines.reduce((sum, l) => sum + l.lineTotal, 0).toFixed(2);
  }

  get shipping() {
    if (this.count === 0 || this.subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return FLAT_SHIPPING;
  }

  get total() {
    return +(this.subtotal + this.shipping).toFixed(2);
  }

  get toFreeShipping() {
    return Math.max(0, +(FREE_SHIPPING_THRESHOLD - this.subtotal).toFixed(2));
  }

  toJSON() {
    return [...this.#lines].map(([id, qty]) => ({ id, qty }));
  }
}

// Filter and sort helpers used by the product grid.
export function filterProducts(products, { category = "all", query = "", sort = "featured" } = {}) {
  const q = query.trim().toLowerCase();
  const out = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (!q || `${p.name} ${p.description}`.toLowerCase().includes(q))
  );
  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return sorters[sort] ? out.sort(sorters[sort]) : out;
}
