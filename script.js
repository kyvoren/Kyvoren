/* =========================================================
   KYVOREN — SCRIPT PRINCIPAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     1. INTRODUÇÃO
     Duração aproximada: 6 segundos
  ======================================================= */

  const introScreen = document.getElementById("intro-screen");
  const skipIntroButton = document.getElementById("skip-intro");

  let introTimer = null;
  let introFinished = false;

  function finishIntro() {
    if (!introScreen || introFinished) return;

    introFinished = true;

    if (introTimer) {
      clearTimeout(introTimer);
    }

    introScreen.style.transition = "opacity 0.6s ease";
    introScreen.style.opacity = "0";
    introScreen.style.pointerEvents = "none";

    setTimeout(() => {
      introScreen.remove();
    }, 650);
  }

  if (introScreen) {
    introTimer = setTimeout(finishIntro, 6000);
  }

  if (skipIntroButton) {
    skipIntroButton.addEventListener("click", finishIntro);
  }


  /* =======================================================
     2. MENU MOBILE
  ======================================================= */

  const menuToggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("navigation");
  const siteHeader = document.querySelector(".site-header");

  function openMenu() {
    if (!menuToggle || !navigation) return;

    navigation.classList.add("open");
    menuToggle.classList.add("active");

    if (siteHeader) {
      siteHeader.classList.add("menu-open");
    }

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu");
  }

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    navigation.classList.remove("open");
    menuToggle.classList.remove("active");

    if (siteHeader) {
      siteHeader.classList.remove("menu-open");
    }

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }

  function toggleMenu() {
    if (!navigation) return;

    const isOpen = navigation.classList.contains("open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  // Fecha o menu depois que um link é selecionado.
  if (navigation) {
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  // Fecha o menu ao clicar fora dele.
  document.addEventListener("click", (event) => {
    if (!navigation || !menuToggle) return;

    const clickedInsideNavigation = navigation.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (!clickedInsideNavigation && !clickedToggle) {
      closeMenu();
    }
  });

  // Fecha o menu com a tecla Escape.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  // Garante que o menu mobile não fique aberto ao ampliar a tela.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) {
      closeMenu();
    }
  });


  /* =======================================================
     3. BUSCA E FILTROS DO CATÁLOGO
  ======================================================= */

  const searchInput = document.getElementById("product-search");
  const filterButtons = document.querySelectorAll("[data-filter]");
  const productCards = document.querySelectorAll(
    "#products-grid .product-card"
  );
  const catalogEmpty = document.getElementById("catalog-empty");

  let activeFilter = "all";
  let searchTerm = "";

  // Remove acentos para permitir buscas como:
  // "apresentacoes" e "apresentações".
  function normalizeText(text) {
    return String(text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function updateCatalog() {
    let visibleProducts = 0;

    productCards.forEach((card) => {
      const category = card.dataset.category || "";
      const cardText = normalizeText(card.textContent);

      const matchesCategory =
        activeFilter === "all" || category === activeFilter;

      const matchesSearch =
        searchTerm === "" || cardText.includes(searchTerm);

      const shouldShow = matchesCategory && matchesSearch;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleProducts++;
      }
    });

    // Mostra uma mensagem quando nenhum produto corresponde
    // à busca ou ao filtro escolhido.
    if (catalogEmpty) {
      catalogEmpty.hidden = visibleProducts !== 0;
    }
  }

  // Campo de pesquisa.
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = normalizeText(searchInput.value);
      updateCatalog();
    });
  }

  // Botões de filtros.
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;

        filterButton.classList.toggle("active", isActive);
        filterButton.setAttribute(
          "aria-pressed",
          String(isActive)
        );
      });

      updateCatalog();
    });
  });

  // Estado inicial do catálogo.
  updateCatalog();


  /* =======================================================
     4. BOTÕES DE CONSULTA DOS PRODUTOS
  ======================================================= */

  const productButtons = document.querySelectorAll("[data-product]");

  productButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productName = button.dataset.product || "produto";

      window.alert(
        `Você selecionou: ${productName}.\n\n` +
        "A consulta automática e o checkout ainda não estão disponíveis.\n\n" +
        "Acesse a seção Contato do site para verificar os canais de atendimento."
      );
    });
  });


  /* =======================================================
     5. ANIMAÇÕES DE APARECIMENTO
  ======================================================= */

  const revealElements = document.querySelectorAll(".reveal");

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
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  } else {

    // Alternativa para navegadores sem IntersectionObserver.
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });

  }


  /* =======================================================
     6. TRATAMENTO DE IMAGENS QUE NÃO CARREGAM
  ======================================================= */

  const productImages = document.querySelectorAll(
    ".product-image img"
  );

  function showImageFallback(image) {
    if (image.dataset.fallbackApplied === "true") {
      return;
    }

    image.dataset.fallbackApplied = "true";
    image.style.display = "none";

    const imageContainer = image.closest(".product-image");

    if (!imageContainer) return;

    imageContainer.classList.add("has-image-error");

    const fallback = document.createElement("div");

    fallback.className = "product-image-fallback";
    fallback.setAttribute("role", "img");
    fallback.setAttribute(
      "aria-label",
      "Imagem do produto indisponível"
    );

    fallback.textContent = "KYVOREN";

    Object.assign(fallback.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#C0C0C0",
      background:
        "radial-gradient(circle, rgba(192,192,192,0.09), transparent 65%), #111111",
      fontFamily: "Manrope, sans-serif",
      fontSize: "15px",
      fontWeight: "800",
      letterSpacing: "5px"
    });

    imageContainer.appendChild(fallback);

    const productTag = imageContainer.querySelector(".product-tag");

    if (productTag) {
      productTag.style.zIndex = "2";
    }
  }

  productImages.forEach((image) => {
    image.addEventListener("error", () => {
      showImageFallback(image);
    });

    // Também trata imagens que já falharam antes da instalação
    // do evento de erro.
    if (image.complete && image.naturalWidth === 0) {
      showImageFallback(image);
    }
  });


  /* =======================================================
     7. ANO AUTOMÁTICO NO RODAPÉ
  ======================================================= */

  const currentYear = document.getElementById("current-year");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }


  /* =======================================================
     8. NAVEGAÇÃO SUAVE
  ======================================================= */

  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      // Atualiza o endereço interno da página sem recarregá-la.
      if (history.replaceState) {
        history.replaceState(null, "", targetId);
      }
    });
  });


  /* =======================================================
     9. FAQ — FECHAR OUTRAS RESPOSTAS
  ======================================================= */

  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;

      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });


  /* =======================================================
     10. ESTADO INICIAL
  ======================================================= */

  document.body.classList.add("kyvoren-ready");

});
