document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro-screen");
  const skipButton = document.getElementById("skip-intro");
  const siteShell = document.getElementById("site-shell");

  const menuToggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("navigation");
  const currentYear = document.getElementById("current-year");

  // ANO AUTOMÁTICO NO RODAPÉ
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // ANIMAÇÃO DE ABERTURA
  let introFinished = false;
  let introTimer = null;
  let removeIntroTimer = null;

  function finishIntro(event) {
    if (event) {
      event.preventDefault();
    }

    if (introFinished || !intro) return;

    introFinished = true;

    if (introTimer) {
      clearTimeout(introTimer);
    }

    if (removeIntroTimer) {
      clearTimeout(removeIntroTimer);
    }

    intro.classList.add("intro-hidden");

    if (siteShell) {
      siteShell.classList.remove("site-locked");
      siteShell.removeAttribute("inert");
    }

    removeIntroTimer = window.setTimeout(() => {
      if (intro && intro.parentNode) {
        intro.remove();
      }
    }, 900);
  }

  if (intro && siteShell) {
    siteShell.classList.add("site-locked");
    siteShell.setAttribute("inert", "");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishIntro();
    } else {
      // Abertura automática após aproximadamente 6 segundos
      introTimer = window.setTimeout(finishIntro, 6000);
    }
  }

  // BOTÃO PULAR — CLIQUE E TOQUE
  if (skipButton) {
    skipButton.addEventListener("click", finishIntro);

    skipButton.addEventListener("touchend", (event) => {
      finishIntro(event);
    }, { passive: false });
  }

  // MENU PARA CELULAR
  function closeMenu() {
    if (!menuToggle || !navigation) return;

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    navigation.classList.remove("is-open");
  }

  function toggleMenu() {
    if (!menuToggle || !navigation) return;

    const isOpen =
      menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Abrir menu" : "Fechar menu"
    );

    navigation.classList.toggle("is-open", !isOpen);
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener("click", toggleMenu);

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 680) {
        closeMenu();
      }
    });
  }

  // TRATAMENTO DE IMAGENS QUE NÃO CARREGAREM
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("image-error");
      img.alt = "Imagem indisponível";
    });
  });
});
