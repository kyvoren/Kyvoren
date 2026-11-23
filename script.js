"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.getElementById("menu-toggle");
  const navigation = document.getElementById("navigation");
  const year = document.getElementById("current-year");

  // Atualiza automaticamente o ano do rodapé.
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Menu para celular.
  if (menuButton && navigation) {
    function closeMenu() {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menu");
    }

    menuButton.addEventListener("click", () => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Abrir menu" : "Fechar menu"
      );

      navigation.classList.toggle("open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 620) {
        closeMenu();
      }
    });
  }

  // Fallback caso alguma imagem não carregue.
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.style.display = "none";
      image.parentElement.classList.add("image-unavailable");
    });
  });
});
