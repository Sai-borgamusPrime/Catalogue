(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const transition = document.querySelector(".page-transition");
  const progress = document.querySelector(".scroll-progress span");

  const updateProgress = () => {
    if (!progress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("visible"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });

  document.querySelectorAll("a.page-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = link.getAttribute("target");
      const isHash = href && href.startsWith("#");
      const isExternal = href && /^(https?:)?\/\//.test(href);
      const isSamePage = href && window.location.pathname.endsWith(href);

      if (!href || isHash || isExternal || target === "_blank" || isSamePage || prefersReducedMotion) return;

      event.preventDefault();
      transition?.classList.add("is-active");
      window.setTimeout(() => {
        window.location.href = href;
      }, 430);
    });
  });

  const fillOrderFields = ({ product = "", price = "" }) => {
    const itemInput = document.querySelector("#item-ordered");
    const quantityInput = document.querySelector("#quantity-of-item");
    if (itemInput && product) itemInput.value = price ? `${product} — ${price}` : product;
    if (quantityInput && !quantityInput.value) quantityInput.value = "1";
  };

  document.querySelectorAll(".order-button").forEach((button) => {
    button.addEventListener("click", () => {
      fillOrderFields({ product: button.dataset.product, price: button.dataset.price });
    });
  });

  const form = document.getElementById("sheetdb-form");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton?.textContent;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
        });

        if (!response.ok) throw new Error("Order submission failed");

        transition?.classList.add("is-active");
        window.setTimeout(() => {
          window.location.href = "Order-message.html";
        }, prefersReducedMotion ? 0 : 430);
      } catch (error) {
        console.error(error);
        alert("The order could not be submitted. Please check your connection and try again.");
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText || "Confirm Order";
        }
      }
    });
  }

  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt-card]").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = ((y / rect.height) - 0.5) * -5;
        const rotateY = ((x / rect.width) - 0.5) * 5;
        card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
})();
