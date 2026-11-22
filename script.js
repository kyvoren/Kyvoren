/* ========================================
   KYVOREN — FUNCIONALIDADES
======================================== */

const cart = [];

const intro = document.getElementById("intro");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");

const openCartButton = document.getElementById("open-cart");
const closeCartButton = document.getElementById("close-cart");

const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

/* INTRODUÇÃO */

function skipIntro() {
  intro.classList.add("hidden");
}

document
  .getElementById("skip-intro")
  .addEventListener("click", skipIntro);

window.addEventListener("load", () => {
  window.setTimeout(skipIntro, 4500);
});

/* TRATAMENTO DE IMAGENS */

document.querySelectorAll(".product-image").forEach((image) => {
  image.addEventListener("error", function () {
    const placeholder = document.createElement("div");

    placeholder.className = "product-image";
    placeholder.style.display = "flex";
    placeholder.style.alignItems = "center";
    placeholder.style.justifyContent = "center";
    placeholder.style.color = "#888";
    placeholder.style.fontSize = "11px";
    placeholder.style.letterSpacing = "2px";

    placeholder.textContent = "IMAGEM INDISPONÍVEL";

    this.replaceWith(placeholder);
  });
});

document.querySelectorAll(".intro-logo, .brand img, .footer-logo")
  .forEach((image) => {
    image.addEventListener("error", function () {
      this.hidden = true;
    });
  });

/* FORMATAÇÃO DE VALORES */

function formatMoney(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/* CARRINHO: ABRIR E FECHAR */

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");

  cartDrawer.setAttribute("aria-hidden", "false");

  closeCartButton.focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");

  cartDrawer.setAttribute("aria-hidden", "true");

  openCartButton.focus();
}

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

/* ADICIONAR PRODUTO */

function addCart(name, price) {
  cart.push({
    name: name,
    price: price
  });

  updateCart();
  openCart();
}

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);

    if (!name || !Number.isFinite(price) || price <= 0) {
      alert("Não foi possível adicionar este produto.");
      return;
    }

    addCart(name, price);
  });
});

/* REMOVER PRODUTO */

function removeCart(index) {
  if (index < 0 || index >= cart.length) {
    return;
  }

  cart.splice(index, 1);
  updateCart();
}

/* ATUALIZAR CARRINHO */

function updateCart() {
  cartCount.textContent = String(cart.length);

  cartItems.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");

    empty.className = "empty-cart";
    empty.textContent = "Seu carrinho está vazio.";

    cartItems.appendChild(empty);
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item";

      const details = document.createElement("div");

      const name = document.createElement("strong");
      name.textContent = item.name;

      const price = document.createElement("span");
      price.style.color = "#aaa";
      price.textContent = formatMoney(item.price);

      details.append(
        name,
        document.createElement("br"),
        price
      );

      const removeButton = document.createElement("button");

      removeButton.className = "remove-button";
      removeButton.type = "button";
      removeButton.textContent = "Remover";

      removeButton.addEventListener("click", () => {
        removeCart(index);
      });

      row.append(details, removeButton);
      cartItems.appendChild(row);
    });
  }

  const total = cart.reduce((sum, item) => {
    return sum + item.price;
  }, 0);

  cartTotal.textContent = formatMoney(total);
}

/* FILTROS DO CATÁLOGO */

function filterProducts(category) {
  document.querySelectorAll("#catalogo .product").forEach((product) => {
    const visible =
      category === "todos" ||
      product.dataset.category === category;

    product.hidden = !visible;
  });

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.filter === category
    );
  });
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    filterProducts(button.dataset.filter);
  });
});

/* SOLICITAÇÃO DE SERVIÇOS */

document.querySelectorAll(".service-button").forEach((button) => {
  button.addEventListener("click", () => {
    const service = button.dataset.service;

    alert(
      "Serviço selecionado: " + service + "\n\n" +
      "A central de solicitações ainda está em desenvolvimento. " +
      "Nenhum pedido foi enviado."
    );
  });
});

/* CHECKOUT DEMONSTRATIVO */

document
  .getElementById("checkout-button")
  .addEventListener("click", () => {
    alert(
      "O checkout e os pagamentos ainda serão integrados. " +
      "Nenhuma compra foi realizada."
    );
  });

/* ESTADO INICIAL */

updateCart();
