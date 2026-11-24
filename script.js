/* =========================================================
   KYVOREN — SCRIPT PRINCIPAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  /* =======================================================
     1. INTRODUÇÃO
  ======================================================= */

  const intro = $("#intro-screen");
  const skipIntro = $("#skip-intro");
  let introTimer;

  function finishIntro() {
    if (!intro || intro.dataset.finished === "true") return;

    intro.dataset.finished = "true";
    clearTimeout(introTimer);
    intro.style.opacity = "0";
    intro.style.pointerEvents = "none";

    setTimeout(() => intro.remove(), 650);
  }

  if (intro) introTimer = setTimeout(finishIntro, 6000);
  skipIntro?.addEventListener("click", finishIntro);

  /* =======================================================
     2. MENU MOBILE
  ======================================================= */

  const menuToggle = $("#menu-toggle");
  const navigation = $("#navigation");
  const header = $(".site-header");

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    navigation.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    header?.classList.remove("menu-open");
  }

  function toggleMenu() {
    if (!menuToggle || !navigation) return;

    const willOpen = !navigation.classList.contains("open");

    navigation.classList.toggle("open", willOpen);
    menuToggle.classList.toggle("active", willOpen);
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute(
      "aria-label",
      willOpen ? "Fechar menu" : "Abrir menu"
    );
    header?.classList.toggle("menu-open", willOpen);
  }

  menuToggle?.addEventListener("click", toggleMenu);

  $$("#navigation a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!navigation || !menuToggle) return;

    if (
      !navigation.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });

  /* =======================================================
     3. MENSAGENS TEMPORÁRIAS
  ======================================================= */

  const toast = $("#site-toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  /* =======================================================
     4. BUSCA DO CATÁLOGO
  ======================================================= */

  const searchInput = $("#product-search");
  const productCards = $$("#products-grid .product-card");
  const catalogEmpty = $("#catalog-empty");

  function normalizeText(value) {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function updateCatalog() {
    const searchTerm = normalizeText(searchInput?.value || "");
    let visibleCount = 0;

    productCards.forEach((card) => {
      const searchableText = normalizeText(card.textContent);
      const matches = searchableText.includes(searchTerm);

      card.hidden = !matches;

      if (matches) visibleCount++;
    });

    if (catalogEmpty) {
      catalogEmpty.hidden = visibleCount > 0;
    }
  }

  searchInput?.addEventListener("input", updateCatalog);

  /* =======================================================
     5. CARRINHO DE COMPRAS
  ======================================================= */

  const STORAGE_KEY = "kyvoren-cart-v1";

  const cartDrawer = $("#cart-drawer");
  const cartOverlay = $("#cart-overlay");
  const cartOpenButton = $("#cart-open");
  const cartCloseButton = $("#cart-close");
  const cartCount = $("#cart-count");
  const cartItemsContainer = $("#cart-items");
  const cartSubtotalCount = $("#cart-subtotal-count");
  const cartTotal = $("#cart-total");
  const checkoutButton = $("#checkout-button");
  const clearCartButton = $("#cart-clear");

  /*
   * Os produtos não têm preços cadastrados.
   * Por isso, o carrinho registra quantidades e nomes,
   * mas não inventa valores ou calcula cobranças.
   */

  const availableProducts = new Map();

  productCards.forEach((card) => {
    const id = card.dataset.productId;
    const name = card.dataset.productName;

    if (id && name) {
      availableProducts.set(id, {
        id,
        name,
        price: null
      });
    }
  });

  function loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return {};

      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }

      const validCart = {};

      Object.entries(parsed).forEach(([id, quantity]) => {
        if (!availableProducts.has(id)) return;

        const safeQuantity = Math.floor(Number(quantity));

        if (Number.isInteger(safeQuantity) && safeQuantity > 0 && safeQuantity <= 99) {
          validCart[id] = safeQuantity;
        }
      });

      return validCart;
    } catch {
      return {};
    }
  }

  let cart = loadCart();

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      showToast("Não foi possível salvar o carrinho neste navegador.");
    }
  }

  function getCartQuantity() {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  }

  function renderCart() {
    if (!cartItemsContainer) return;

    const entries = Object.entries(cart).filter(([id, quantity]) => {
      return availableProducts.has(id) && quantity > 0;
    });

    const totalQuantity = getCartQuantity();

    if (cartCount) {
      cartCount.textContent = String(totalQuantity);
      cartCount.setAttribute(
        "aria-label",
        `${totalQuantity} ${totalQuantity === 1 ? "item" : "itens"} no carrinho`
      );
    }

    if (cartSubtotalCount) {
      cartSubtotalCount.textContent = String(totalQuantity);
    }

    // Não há preços confirmados, então o total não é calculado.
    if (cartTotal) {
      cartTotal.textContent = entries.length ? "A CONFIRMAR" : "A CONFIRMAR";
    }

    if (entries.length === 0) {
      cartItemsContainer.innerHTML = `
        <p class="cart-empty">
          Seu carrinho está vazio. Explore o catálogo e adicione
          os itens que deseja consultar.
        </p>
      `;
      return;
    }

    cartItemsContainer.innerHTML = entries.map(([id, quantity]) => {
      const product = availableProducts.get(id);

      return `
        <article class="cart-item" data-cart-item="${id}">
          <div>
            <h3>${escapeHTML(product.name)}</h3>
            <p>PRODUTO DIGITAL · VALOR SOB CONSULTA</p>

            <div class="cart-item-actions">
              <button
                class="cart-quantity-button"
                type="button"
                data-cart-action="decrease"
                data-product-id="${id}"
                aria-label="Diminuir quantidade de ${escapeHTML(product.name)}"
              >−</button>

              <span class="cart-quantity">${quantity}</span>

              <button
                class="cart-quantity-button"
                type="button"
                data-cart-action="increase"
                data-product-id="${id}"
                aria-label="Aumentar quantidade de ${escapeHTML(product.name)}"
              >+</button>

              <button
                class="cart-remove"
                type="button"
                data-cart-action="remove"
                data-product-id="${id}"
              >REMOVER</button>
            </div>
          </div>

          <span class="cart-item-price">A CONFIRMAR</span>
        </article>
      `;
    }).join("");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    });
  }

  function addToCart(id) {
    if (!availableProducts.has(id)) {
      showToast("Não foi possível identificar este produto.");
      return;
    }

    const currentQuantity = cart[id] || 0;

    if (currentQuantity >= 99) {
      showToast("Limite de quantidade atingido para este item.");
      return;
    }

    cart[id] = currentQuantity + 1;
    saveCart();
    renderCart();

    const product = availableProducts.get(id);
    showToast(`${product.name} adicionado ao carrinho.`);
  }

  function updateQuantity(id, change) {
    if (!availableProducts.has(id) || !cart[id]) return;

    const nextQuantity = cart[id] + change;

    if (nextQuantity <= 0) {
      delete cart[id];
    } else if (nextQuantity <= 99) {
      cart[id] = nextQuantity;
    }

    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    if (!cart[id]) return;

    delete cart[id];
    saveCart();
    renderCart();
    showToast("Item removido do carrinho.");
  }

  function clearCart() {
    if (getCartQuantity() === 0) {
      showToast("O carrinho já está vazio.");
      return;
    }

    cart = {};
    saveCart();
    renderCart();
    showToast("Carrinho esvaziado.");
  }

  function openCart() {
    if (!cartDrawer || !cartOverlay) return;

    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartDrawer.inert = false;

    cartOverlay.hidden = false;
    document.body.style.overflow = "hidden";

    cartCloseButton?.focus();
  }

  function closeCart() {
    if (!cartDrawer || !cartOverlay) return;

    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartDrawer.inert = true;

    cartOverlay.hidden = true;
    document.body.style.overflow = "";

    cartOpenButton?.focus();
  }

  cartOpenButton?.addEventListener("click", openCart);
  cartCloseButton?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);
  clearCartButton?.addEventListener("click", clearCart);

  // Botões de adicionar presentes nos cards dos produtos.
  productCards.forEach((card) => {
    const button = $("[data-add-to-cart]", card);

    button?.addEventListener("click", () => {
      addToCart(card.dataset.productId);
    });
  });

  // Controles de quantidade e remoção dentro do carrinho.
  cartItemsContainer?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const id = button.dataset.productId;
    const action = button.dataset.cartAction;

    if (action === "increase") updateQuantity(id, 1);
    if (action === "decrease") updateQuantity(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  /*
   * O checkout ainda não está conectado a um serviço de pagamento.
   * Esta ação apenas informa o estado real da implementação.
   */
  checkoutButton?.addEventListener("click", () => {
    if (getCartQuantity() === 0) {
      showToast("Adicione pelo menos um produto antes de continuar.");
      return;
    }

    showToast(
      "Sua seleção está organizada. O checkout e os pagamentos ainda precisam ser configurados pela KYVOREN."
    );
  });

  renderCart();

  /* =======================================================
     6. FECHAMENTO COM ESCAPE
  ======================================================= */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();

      if (cartDrawer?.classList.contains("open")) {
        closeCart();
      }
    }
  });

  /* =======================================================
     7. ANIMAÇÕES DE APARECIMENTO
  ======================================================= */

  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  /* =======================================================
     8. TRATAMENTO DE IMAGENS
  ======================================================= */

  function showImageFallback(image) {
    if (image.dataset.fallbackApplied === "true") return;

    image.dataset.fallbackApplied = "true";
    image.style.display = "none";

    const container = image.closest(".product-image");
    if (!container) return;

    container.classList.add("has-image-error");

    const fallback = document.createElement("div");
    fallback.className = "product-image-fallback";
    fallback.setAttribute("role", "img");
    fallback.setAttribute("aria-label", "Imagem do produto indisponível");
    fallback.textContent = "KYVOREN";

    Object.assign(fallback.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#C0C0C0",
      background:
        "radial-gradient(circle,rgba(38,59,70,.25),transparent 65%),#111416",
      fontFamily: "Manrope,sans-serif",
      fontSize: "15px",
      fontWeight: "800",
      letterSpacing: "5px"
    });

    container.appendChild(fallback);
  }

  $$(".product-image img").forEach((image) => {
    image.addEventListener("error", () => showImageFallback(image));

    if (image.complete && image.naturalWidth === 0) {
      showImageFallback(image);
    }
  });

  /* =======================================================
     9. ANO AUTOMÁTICO
  ======================================================= */

  const currentYear = $("#current-year");

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  /* =======================================================
     10. NAVEGAÇÃO ATIVA
  ======================================================= */

  const navLinks = $$("#navigation .nav-link");
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle("active", isActive);
          });
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* =======================================================
     11. ESTADO INICIAL
  ======================================================= */

  document.body.classList.add("kyvoren-ready");
});
