document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =====================================================
     ELEMENTOS PRINCIPAIS
     ===================================================== */

  const intro = document.getElementById("intro-screen");
  const skipButton = document.getElementById("skip-intro");
  const siteShell = document.getElementById("site-shell");

  const menuToggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("navigation");

  const currentYear = document.getElementById("current-year");

  /* =====================================================
     ANO AUTOMÁTICO NO RODAPÉ
     ===================================================== */

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* =====================================================
     INTRODUÇÃO — DURAÇÃO DE 6 SEGUNDOS
     ===================================================== */

  let introFinished = false;
  let introTimer = null;
  let introRemovalTimer = null;

  function finishIntro() {
    if (introFinished) return;

    introFinished = true;

    if (introTimer) {
      window.clearTimeout(introTimer);
    }

    if (intro) {
      intro.classList.add("intro-hidden");

      introRemovalTimer = window.setTimeout(() => {
        intro.remove();
      }, 900);
    }

    if (siteShell) {
      siteShell.classList.remove("site-locked");
      siteShell.removeAttribute("inert");
    }
  }

  if (intro && siteShell) {
    siteShell.classList.add("site-locked");
    siteShell.setAttribute("inert", "");

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      finishIntro();
    } else {
      introTimer = window.setTimeout(finishIntro, 6000);
    }
  }

  if (skipButton) {
    skipButton.addEventListener("click", finishIntro);
  }

  /* =====================================================
     MENU RESPONSIVO
     ===================================================== */

  function openMenu() {
    if (!menuToggle || !navigation) return;

    menuToggle.classList.add("active");
    navigation.classList.add("menu-open");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu");
  }

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    menuToggle.classList.remove("active");
    navigation.classList.remove("menu-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }

  function toggleMenu() {
    if (!navigation) return;

    const isOpen = navigation.classList.contains("menu-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  /* Fecha o menu depois de selecionar uma seção. */

  if (navigation) {
    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  /* Fecha o menu com a tecla Escape. */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  /* Fecha o menu quando a tela volta ao tamanho desktop. */

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });

  /* =====================================================
     ANIMAÇÕES AO ROLAR A PÁGINA
     ===================================================== */

  const revealElements = document.querySelectorAll(".reveal");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  } else {
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
  }

  /* =====================================================
     DESTAQUE DO LINK DA SEÇÃO ATUAL
     ===================================================== */

  const sections = document.querySelectorAll(
    "main section[id]"
  );

  const navLinks = document.querySelectorAll(
    ".navigation .nav-link"
  );

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const sectionId = entry.target.id;

          navLinks.forEach((link) => {
            const isCurrent =
              link.getAttribute("href") === `#${sectionId}`;

            link.classList.toggle("active", isCurrent);
          });
        });
      },
      {
        threshold: 0,
        rootMargin: "-30% 0px -60% 0px"
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* =====================================================
     CATÁLOGO — AVISO SOBRE DISPONIBILIDADE
     ===================================================== */

  const productButtons = document.querySelectorAll(
    ".product-button[data-product]"
  );

  productButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productName = button.dataset.product || "Produto";

      window.alert(
        `${productName}\n\n` +
        "Este produto ainda não possui compra automática pelo site.\n\n" +
        "Entre em contato com a KYVOREN para consultar valores " +
        "e disponibilidade."
      );
    });
  });

  /* =====================================================
     FAQ — MANTÉM UMA RESPOSTA ABERTA POR VEZ
     ===================================================== */

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

  /* =====================================================
     PROTEÇÃO VISUAL PARA IMAGENS COM ERRO
     ===================================================== */

  const images = document.querySelectorAll("img");

  images.forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-error");
      image.setAttribute("data-image-error", "true");
    });
  });

  /* =====================================================
     ROLAGEM SUAVE PARA LINKS INTERNOS
     ===================================================== */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });

      closeMenu();
    });
  });

  /* =====================================================
     FINALIZAÇÃO
     ===================================================== */

  document.documentElement.classList.add("js-ready");
});
