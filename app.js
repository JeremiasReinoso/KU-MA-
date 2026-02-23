const WHATSAPP_NUMBER = "5491112345678";

// Base para agregar productos de forma dinamica en el futuro.
const products = [
  {
    id: 1,
    name: "KUMA Ridge Runner",
    price: "$149.900",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "KUMA Trail Pulse",
    price: "$132.500",
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Rompeviento Summit",
    price: "$94.000",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Buzo Alpine Core",
    price: "$86.900",
    image:
      "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=800&q=80",
  },
];

function buildWhatsAppLink(productName) {
  const message = `Hola KUMA, quiero consultar por el producto: ${productName}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const cards = products
    .map(
      (product) => `
      <article class="product-card section-reveal">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" />
        <div class="product-body">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">${product.price}</p>
          <a
            class="button whatsapp-btn"
            href="${buildWhatsAppLink(product.name)}"
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
      root: null,
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

renderProducts();
initScrollReveal();
