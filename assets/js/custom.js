document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const header = document.querySelector(".site-header");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
    const revealItems = document.querySelectorAll(".reveal");
    const metricValues = document.querySelectorAll("[data-count]");
    const heroShell = document.querySelector(".hero-shell");
    const switchers = document.querySelectorAll("[data-switcher]");
    const scrollProgress = document.querySelector(".scroll-progress span");
    const detailToggles = Array.from(document.querySelectorAll(".detail-toggle"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopNavBreakpoint = window.matchMedia("(min-width: 961px)");

    const closeMenu = () => {
        if (!header || !menuToggle) {
            return;
        }

        header.classList.remove("menu-open");
        body.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    if (menuToggle && header) {
        menuToggle.addEventListener("click", () => {
            const isOpen = header.classList.toggle("menu-open");
            body.classList.toggle("menu-open", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navLinks.forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", (event) => {
            if (!header.classList.contains("menu-open")) {
                return;
            }

            if (header.contains(event.target)) {
                return;
            }

            closeMenu();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        const syncMenuForDesktop = (event) => {
            if (event.matches) {
                closeMenu();
            }
        };

        if (typeof desktopNavBreakpoint.addEventListener === "function") {
            desktopNavBreakpoint.addEventListener("change", syncMenuForDesktop);
        } else if (typeof desktopNavBreakpoint.addListener === "function") {
            desktopNavBreakpoint.addListener(syncMenuForDesktop);
        }
    }

    if (prefersReducedMotion.matches) {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
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
            { threshold: 0.16 }
        );

        revealItems.forEach((item) => revealObserver.observe(item));
    }

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
            rootMargin: "-42% 0px -46% 0px",
            threshold: 0
        }
    );

    document.querySelectorAll("main section[id]").forEach((section) => {
        sectionObserver.observe(section);
    });

    switchers.forEach((switcher) => {
        const buttons = Array.from(switcher.querySelectorAll("[data-switcher-target]"));
        const panels = Array.from(switcher.querySelectorAll("[data-switcher-panel]"));

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.dataset.switcherTarget;

                buttons.forEach((item) => {
                    const isActive = item === button;
                    item.classList.toggle("is-active", isActive);
                    item.setAttribute("aria-selected", String(isActive));
                });

                panels.forEach((panel) => {
                    const shouldShow = panel.dataset.switcherPanel === target;
                    panel.classList.toggle("is-active", shouldShow);
                    panel.hidden = !shouldShow;
                });
            });
        });
    });

    const setDetailState = (button, panel, isExpanded) => {
        const openLabel = button.dataset.detailLabelOpen || "Open details";
        const closeLabel = button.dataset.detailLabelClose || "Hide details";

        button.setAttribute("aria-expanded", String(isExpanded));
        button.textContent = isExpanded ? closeLabel : openLabel;
        panel.hidden = !isExpanded;
    };

    detailToggles.forEach((button) => {
        const panelId = button.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;

        if (!panel) {
            return;
        }

        setDetailState(button, panel, false);

        button.addEventListener("click", () => {
            const isExpanded = button.getAttribute("aria-expanded") === "true";

            detailToggles.forEach((otherButton) => {
                if (otherButton === button) {
                    return;
                }

                const otherPanelId = otherButton.getAttribute("aria-controls");
                const otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;

                if (otherPanel) {
                    setDetailState(otherButton, otherPanel, false);
                }
            });

            setDetailState(button, panel, !isExpanded);
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

    if (prefersReducedMotion.matches) {
        metricValues.forEach((metric) => {
            const suffix = metric.dataset.suffix || "";
            metric.textContent = `${Number(metric.dataset.count).toLocaleString()}${suffix}`;
        });
    } else {
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
    }

    const updateScrollProgress = () => {
        if (!scrollProgress) {
            return;
        }

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

        scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    };

    let scrollTicking = false;
    const requestScrollProgressUpdate = () => {
        if (scrollTicking) {
            return;
        }

        scrollTicking = true;
        window.requestAnimationFrame(() => {
            updateScrollProgress();
            scrollTicking = false;
        });
    };

    updateScrollProgress();
    window.addEventListener("scroll", requestScrollProgressUpdate, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    if (heroShell && !prefersReducedMotion.matches && window.matchMedia("(pointer:fine)").matches) {
        heroShell.addEventListener("pointermove", (event) => {
            const bounds = heroShell.getBoundingClientRect();
            const x = ((event.clientX - bounds.left) / bounds.width) * 100;
            const y = ((event.clientY - bounds.top) / bounds.height) * 100;

            heroShell.style.setProperty("--pointer-x", `${x}%`);
            heroShell.style.setProperty("--pointer-y", `${y}%`);
        });

        heroShell.addEventListener("pointerleave", () => {
            heroShell.style.setProperty("--pointer-x", "18%");
            heroShell.style.setProperty("--pointer-y", "24%");
        });
    }
});
