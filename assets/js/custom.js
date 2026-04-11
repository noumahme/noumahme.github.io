document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
    const revealItems = document.querySelectorAll(".reveal");
    const metricValues = document.querySelectorAll("[data-count]");
    const spotlightTabs = document.querySelectorAll(".spotlight-tab");
    const spotlightPanels = document.querySelectorAll("[data-panel-content]");

    const closeMenu = () => {
        header.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const isOpen = header.classList.toggle("menu-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", closeMenu);
        });
    }

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.18 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const currentId = entry.target.getAttribute("id");

                navLinks.forEach((link) => {
                    const matches = link.getAttribute("href") === `#${currentId}`;
                    link.classList.toggle("is-active", matches);
                });
            });
        },
        {
            rootMargin: "-45% 0px -45% 0px",
            threshold: 0
        }
    );

    document.querySelectorAll("main section[id]").forEach((section) => {
        sectionObserver.observe(section);
    });

    spotlightTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.panel;

            spotlightTabs.forEach((button) => {
                const isActive = button === tab;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-selected", String(isActive));
            });

            spotlightPanels.forEach((panel) => {
                const shouldShow = panel.dataset.panelContent === target;
                panel.hidden = !shouldShow;
            });
        });
    });

    const animateCount = (element) => {
        const target = Number(element.dataset.count);
        const suffix = element.dataset.suffix || "";
        const duration = 1400;
        const start = performance.now();

        const update = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);

            element.textContent = `${value.toLocaleString()}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    const metricObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                animateCount(entry.target);
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.55 }
    );

    metricValues.forEach((metric) => {
        const suffix = metric.dataset.suffix || "";
        metric.textContent = `0${suffix}`;
        metricObserver.observe(metric);
    });
});
