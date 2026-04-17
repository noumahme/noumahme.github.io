document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const header = document.querySelector(".site-header");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
    const revealItems = document.querySelectorAll(".reveal");
    const metricValues = document.querySelectorAll("[data-count]");
    const scrollProgress = document.querySelector(".scroll-progress span");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopNavBreakpoint = window.matchMedia("(min-width: 921px)");

    const closeMenu = () => {
        if (!header || !menuToggle) {
            return;
        }

        header.classList.remove("menu-open");
        body.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    const syncHeaderState = () => {
        if (!header) {
            return;
        }

        header.classList.toggle("scrolled", window.scrollY > 24);
    };

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });

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

    revealItems.forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index * 70, 420)}ms`);
    });

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
                    const href = link.getAttribute("href") || "";
                    const matches = href === `#${currentId}` || href.endsWith(`#${currentId}`);
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

    const animateCount = (element) => {
        const target = Number(element.dataset.count);
        const suffix = element.dataset.suffix || "";
        const duration = 1200;
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
});
