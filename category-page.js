const CART_KEY = "kuma_cart_v1";
const WHATSAPP_NUMBER = "5491112345678";

function formatPrice(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function buildWhatsAppCartLink(cart) {
  if (!cart.length) return "#";

  const lines = cart.map((item) => `- ${item.name} x${item.qty} (${formatPrice(item.price * item.qty)})`);
  const total = formatPrice(cartTotal(cart));
  const message = [
    "Hola KUMA, quiero avanzar con este pedido:",
    "",
    ...lines,
    "",
    `Total estimado: ${total}`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function renderCatalog(products) {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const cards = products
    .map(
      (product) => `
      <article class="product-card section-reveal">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="product-body">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-meta">
            <p class="product-price">${formatPrice(product.price)}</p>
            <button class="add-cart-btn" type="button" data-add-id="${product.id}">Agregar</button>
          </div>
          <a
            class="button whatsapp-btn"
            href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola KUMA, quiero consultar por ${product.name}.`)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </article>
    `
    )
    .join("");

  grid.innerHTML = cards;
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll(".section-reveal");
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initCart(productsById) {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  const toggle = document.getElementById("cart-toggle");
  const close = document.getElementById("cart-close");
  const itemsNode = document.getElementById("cart-items");
  const totalNode = document.getElementById("cart-total");
  const whatsappLink = document.getElementById("cart-whatsapp");
  const counters = document.querySelectorAll(".cart-count");

  let cart = getCart();

  function updateBadge() {
    const totalItems = cartCount(cart);
    counters.forEach((node) => {
      node.textContent = totalItems;
    });
  }

  function renderDrawer() {
    if (!itemsNode || !totalNode || !whatsappLink) return;

    if (!cart.length) {
      itemsNode.innerHTML = `<p class="empty-cart">Tu carrito esta vacio.</p>`;
    } else {
      itemsNode.innerHTML = cart
        .map(
          (item) => `
          <article class="cart-item">
            <div class="cart-item-top">
              <h3>${item.name}</h3>
              <p class="cart-price">${formatPrice(item.price * item.qty)}</p>
            </div>
            <div class="cart-controls">
              <div class="qty-controls">
                <button class="qty-btn" type="button" data-dec-id="${item.id}">-</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" type="button" data-inc-id="${item.id}">+</button>
              </div>
              <button class="remove-btn" type="button" data-remove-id="${item.id}">Eliminar</button>
            </div>
          </article>
        `
        )
        .join("");
    }

    totalNode.textContent = formatPrice(cartTotal(cart));
    whatsappLink.href = buildWhatsAppCartLink(cart);
    whatsappLink.classList.toggle("is-disabled", !cart.length);
    updateBadge();
  }

  function persistAndRender() {
    saveCart(cart);
    renderDrawer();
  }

  function openDrawer() {
    drawer?.classList.add("is-open");
    overlay?.classList.add("is-open");
  }

  function closeDrawer() {
    drawer?.classList.remove("is-open");
    overlay?.classList.remove("is-open");
  }

  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-add-id]");
    if (addBtn) {
      const id = addBtn.getAttribute("data-add-id");
      const product = productsById.get(id);
      if (!product) return;

      const existing = cart.find((item) => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
      }
      persistAndRender();
      openDrawer();
      return;
    }

    const incBtn = event.target.closest("[data-inc-id]");
    if (incBtn) {
      const id = incBtn.getAttribute("data-inc-id");
      cart = cart.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      persistAndRender();
      return;
    }

    const decBtn = event.target.closest("[data-dec-id]");
    if (decBtn) {
      const id = decBtn.getAttribute("data-dec-id");
      cart = cart
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0);
      persistAndRender();
      return;
    }

    const removeBtn = event.target.closest("[data-remove-id]");
    if (removeBtn) {
      const id = removeBtn.getAttribute("data-remove-id");
      cart = cart.filter((item) => item.id !== id);
      persistAndRender();
    }
  });

  toggle?.addEventListener("click", openDrawer);
  close?.addEventListener("click", closeDrawer);
  overlay?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });

  renderDrawer();
}

(function initCategoryPage() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const slugFromPath = pathParts.length >= 2 && pathParts[0] === "categoria" ? pathParts[1] : "";
  const pageCategory = slugFromPath || document.body.dataset.category;
  const allProducts = window.KUMA_PRODUCTS || [];
  const filtered = allProducts.filter((product) => product.category === pageCategory);
  const byId = new Map(allProducts.map((product) => [product.id, product]));

  renderCatalog(filtered);
  initCart(byId);
  initScrollReveal();
})();
