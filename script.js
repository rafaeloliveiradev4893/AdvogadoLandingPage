(function () {
  const header = document.getElementById("header");
  const menuButton = document.querySelector(".header-menu");
  const mobileMenu = document.getElementById("menu-mobile");
  const desktop = window.matchMedia("(min-width: 767px)");

  function menuIsOpen() {
    return menuButton.getAttribute("aria-expanded") === "true";
  }

  function closedHeight() {
    return desktop.matches ? "70px" : "60px";
  }

  function setMenu(open, options) {
    options = options || {};
    if (open && desktop.matches) return;

    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");

    if (open) {
      mobileMenu.removeAttribute("inert");
      header.style.maxHeight = header.scrollHeight + "px";
      return;
    }

    header.style.maxHeight = closedHeight();
    mobileMenu.setAttribute("inert", "");
    if (!options.keepFocus && mobileMenu.contains(document.activeElement)) {
      menuButton.focus();
    }
  }

  menuButton.addEventListener("click", function (event) {
    const open = !menuIsOpen();
    setMenu(open);
    if (open && event.detail === 0) {
      const firstLink = mobileMenu.querySelector("a");
      if (firstLink) firstLink.focus();
    }
  });

  header.addEventListener("transitionend", function (event) {
    if (event.propertyName !== "max-height" || event.target !== header) return;
    if (!menuIsOpen()) header.style.maxHeight = "";
  });

  document.addEventListener("keydown", function (event) {
    if (!menuIsOpen()) return;

    if (event.key === "Escape") {
      setMenu(false);
      menuButton.focus();
      return;
    }

    if (event.key !== "Tab") return;

    const items = [menuButton].concat(Array.from(mobileMenu.querySelectorAll("a")));
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("pointerdown", function (event) {
    if (!menuIsOpen()) return;
    if (!header.contains(event.target)) setMenu(false);
  });

  mobileMenu.addEventListener("click", function (event) {
    const link = event.target.closest("a");
    if (!link) return;
    const target = document.getElementById(link.getAttribute("href").slice(1));
    if (target) target.focus({ preventScroll: true });
    setMenu(false, { keepFocus: true });
  });

  function onBreakpointChange() {
    if (desktop.matches) {
      header.style.maxHeight = "";
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menu");
      mobileMenu.setAttribute("inert", "");
    }
  }

  if (typeof desktop.addEventListener === "function") {
    desktop.addEventListener("change", onBreakpointChange);
  } else if (typeof desktop.addListener === "function") {
    desktop.addListener(onBreakpointChange);
  }

  const navLinks = Array.from(document.querySelectorAll("header nav a[href^='#']"));
  const sections = [];
  const linksById = new Map();

  navLinks.forEach(function (link) {
    const id = link.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    if (!section) return;
    if (!linksById.has(id)) {
      linksById.set(id, []);
      sections.push(section);
    }
    linksById.get(id).push(link);
  });

  function setCurrent(id) {
    navLinks.forEach(function (link) {
      link.removeAttribute("aria-current");
    });
    (linksById.get(id) || []).forEach(function (link) {
      link.setAttribute("aria-current", "true");
    });
  }

  let currentFrame = 0;

  function updateCurrent() {
    const marker = 100;
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    let current = sections[0] ? sections[0].id : "";

    if (atBottom && window.scrollY > 0) {
      current = sections[sections.length - 1].id;
    } else {
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= marker) current = section.id;
      });
    }

    if (current) setCurrent(current);
  }

  function requestCurrent() {
    if (currentFrame) return;
    currentFrame = window.requestAnimationFrame(function () {
      currentFrame = 0;
      updateCurrent();
    });
  }

  window.addEventListener("scroll", requestCurrent, { passive: true });
  window.addEventListener("resize", requestCurrent);
  updateCurrent();

  const questions = Array.from(document.querySelectorAll(".question"));

  function setQuestion(question, open) {
    const button = question.querySelector("button");
    const panel = question.querySelector(".response");
    question.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) panel.removeAttribute("inert");
    else panel.setAttribute("inert", "");
  }

  questions.forEach(function (question) {
    const button = question.querySelector("button");
    button.addEventListener("click", function () {
      const willOpen = button.getAttribute("aria-expanded") !== "true";
      questions.forEach(function (other) {
        if (other !== question) setQuestion(other, false);
      });
      setQuestion(question, willOpen);
    });
  });
})();
