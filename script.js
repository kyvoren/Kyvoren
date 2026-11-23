/* =========================================
   KYVOREN — FUNCIONALIDADES DO SITE
========================================= */

"use strict";

/* =========================================
   CONFIGURAÇÃO
========================================= */

// Coloque aqui o e-mail oficial de atendimento da KYVOREN.
// Exemplo: "atendimento@seudominio.com"
const EMAIL_DE_ATENDIMENTO = "";

// Chave usada para salvar o carrinho neste navegador.
const CART_STORAGE_KEY = "kyvoren_cart_v1";


/* =========================================
   MENU PARA CELULAR
========================================= */

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Fechar menu" : "Abrir menu"
    );

    menuToggle.textContent = isOpen ? "×" : "☰";
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      menuToggle.textContent = "☰";
    });
  });
}


/* =========================================
   FILTROS DO CATÁLOGO
========================================= */

const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".product[data-category]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    productCards.forEach((card) => {
      const category = card.dataset.category;

      const shouldShow =
        selectedFilter === "todos" ||
        category === selectedFilter;

      card.hidden = !shouldShow;
    });
  });
});


/* =========================================
   IMAGENS
   Mostra um fundo alternativo se o arquivo
   não for encontrado.
========================================= */

document.querySelectorAll(".product-image img, .service-image img").forEach((img) => {
  img.addEventListener("error", () => {
    const container = img.parentElement;
    const fallback = container.querySelector(".image-fallback");

    img.hidden = true;

    if (fallback) {
      fallback.hidden = false;
    }

    container.classList.add("image-missing");
  });
});


/* =========================================
   CARRINHO
========================================= */

const openCartButton = document.getElementById("open-cart");
const closeCartButton = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartDrawer = document.getElementById("cart-drawer");

const cartCount = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalElement = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");

let cart = loadCart();


/* Lê o carrinho salvo no navegador. */
function loadCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart.filter((item) => {
      return (
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      );
    });
  } catch (error) {
    console.warn("Não foi possível recuperar o carrinho.", error);
    return [];
  }
}


/* Salva o carrinho no navegador. */
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("Não foi possível salvar o carrinho.", error);
  }
}


/* Formata valores em reais. */
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}


/* Atualiza a quantidade de itens no cabeçalho. */
function updateCartCount() {
  const quantity = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  if (cartCount) {
    cartCount.textContent = String(quantity);
  }
}


/* Adiciona um produto. */
function addToCart(name, price) {
  if (!name || !Number.isFinite(price) || price <= 0) {
    return;
  }

  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
}


/* Remove um produto inteiro do carrinho. */
function removeFromCart(name) {
  cart = cart.filter((item) => item.name !== name);

  saveCart();
  renderCart();
}


/* Desenha o conteúdo do carrinho. */
function renderCart() {
  if (!cartItemsContainer || !cartTotalElement) {
    return;
  }

  cartItemsContainer.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "empty-cart";
    emptyMessage.textContent = "Seu carrinho está vazio.";

    cartItemsContainer.appendChild(emptyMessage);
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;

    const itemElement = document.createElement("article");
    itemElement.className = "cart-item";

    const details = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = item.name;

    const description = document.createElement("p");
    description.textContent =
      `${item.quantity} × ${formatCurrency(item.price)}`;

    details.appendChild(title);
    details.appendChild(description);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-item";
    removeButton.textContent = "Remover";
    removeButton.setAttribute("aria-label", `Remover ${item.name}`);

    removeButton.addEventListener("click", () => {
      removeFromCart(item.name);
    });

    itemElement.appendChild(details);
    itemElement.appendChild(removeButton);

    cartItemsContainer.appendChild(itemElement);
  });

  cartTotalElement.textContent = formatCurrency(total);

  if (checkoutButton) {
    checkoutButton.disabled = cart.length === 0;
  }

  updateCartCount();
}


/* Abre o carrinho. */
function openCart() {
  if (!cartDrawer || !cartOverlay) {
    return;
  }

  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");

  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");

  if (closeCartButton) {
    closeCartButton.focus();
  }
}


/* Fecha o carrinho. */
function closeCart() {
  if (!cartDrawer || !cartOverlay) {
    return;
  }

  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");

  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");

  if (openCartButton) {
    openCartButton.focus();
  }
}


/* Eventos dos botões de adicionar. */
document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    addToCart(name, price);

    const originalText = button.textContent;

    button.textContent = "Adicionado ✓";
    button.disabled = true;

    window.setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 900);
  });
});


/* Eventos de abrir e fechar. */
if (openCartButton) {
  openCartButton.addEventListener("click", openCart);
}

if (closeCartButton) {
  closeCartButton.addEventListener("click", closeCart);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCart);
}


/* Fecha o carrinho com a tecla Escape. */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer?.classList.contains("open")) {
    closeCart();
  }
});


/* Atualiza o carrinho na primeira abertura da página. */
renderCart();


/* =========================================
   BOTÃO DE CONTINUAR
========================================= */

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
      return;
    }

    alert(
      "Seu carrinho está organizado!\\n\\n" +
      "O checkout e o pagamento ainda não estão conectados. " +
      "Nenhuma cobrança foi realizada."
    );
  });
}


/* =========================================
   SOLICITAÇÃO DE SERVIÇOS
========================================= */

const serviceLinks = document.querySelectorAll("[data-service]");
const subjectSelect = document.getElementById("contact-subject");
const messageField = document.getElementById("contact-message");

serviceLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const serviceName = link.dataset.service;

    if (subjectSelect) {
      subjectSelect.value = "Solicitação de serviço";
    }

    if (messageField) {
      messageField.value =
        `Olá! Gostaria de solicitar o seguinte serviço: ${serviceName}.\\n\\n` +
        "Minha ideia/projeto é: ";
    }
  });
});


/* =========================================
   FORMULÁRIO DE CONTATO
========================================= */

const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    if (
      !EMAIL_DE_ATENDIMENTO ||
      EMAIL_DE_ATENDIMENTO.includes("COLOQUE") ||
      !EMAIL_DE_ATENDIMENTO.includes("@")
    ) {
      alert(
        "O formulário está pronto, mas o e-mail oficial da KYVOREN " +
        "ainda precisa ser configurado no arquivo script.js."
      );

      return;
    }

    const formData = new FormData(contactForm);

    const name = formData.get("name");
    const email = formData.get("email");
    const subject = formData.get("subject");
    const message = formData.get("message");

    const emailSubject = encodeURIComponent(
      `KYVOREN — ${subject}`
    );

    const emailBody = encodeURIComponent(
      `Nome: ${name}\\n` +
      `E-mail: ${email}\\n` +
      `Assunto: ${subject}\\n\\n` +
      `Mensagem:\\n${message}`
    );

    const mailtoLink =
      `mailto:${EMAIL_DE_ATENDIMENTO}` +
      `?subject=${emailSubject}` +
      `&body=${emailBody}`;

    window.location.href = mailtoLink;
  });
}


/* =========================================
   ANO AUTOMÁTICO NO RODAPÉ
========================================= */

const currentYear = document.getElementById("current-year");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}
