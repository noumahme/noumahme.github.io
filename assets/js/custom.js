document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const header = document.querySelector(".site-header");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
    const allReveal = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const metricValues = document.querySelectorAll("[data-count]");
    const motionShells = document.querySelectorAll(".hero-shell, .page-hero-shell");
    const motionCards = document.querySelectorAll(
        ".focus-card, .proof-card, .metric-card, .work-card, .timeline-card, .skill-group, .info-card, .detail-card"
    );
    const switchers = document.querySelectorAll("[data-switcher]");
    const scrollProgressEl = document.querySelector(".scroll-progress span");
    const detailToggles = Array.from(document.querySelectorAll(".detail-toggle"));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopNavBreakpoint = window.matchMedia("(min-width: 961px)");

    /* ─── HEADER SCROLL ─── */
    const handleHeaderScroll = () => {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 60);
    };
    handleHeaderScroll();
    window.addEventListener("scroll", handleHeaderScroll, { passive: true });

    /* ─── MOBILE MENU ─── */
    const closeMenu = () => {
        if (!header || !menuToggle) return;
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
        navLinks.forEach(link => link.addEventListener("click", closeMenu));
        document.addEventListener("click", (e) => {
            if (header.classList.contains("menu-open") && !header.contains(e.target)) closeMenu();
        });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

        const syncMenuForDesktop = (e) => { if (e.matches) closeMenu(); };
        if (typeof desktopNavBreakpoint.addEventListener === "function") {
            desktopNavBreakpoint.addEventListener("change", syncMenuForDesktop);
        } else if (typeof desktopNavBreakpoint.addListener === "function") {
            desktopNavBreakpoint.addListener(syncMenuForDesktop);
        }
    }

    /* ─── REVEAL ANIMATIONS ─── */
    let revealIndex = 0;
    allReveal.forEach((item) => {
        item.style.setProperty("--reveal-delay", `${Math.min(revealIndex * 60, 480)}ms`);
        revealIndex++;
    });

    if (prefersReducedMotion.matches) {
        allReveal.forEach(item => item.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        allReveal.forEach(item => revealObserver.observe(item));
    }

    /* ─── ACTIVE NAV ─── */
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute("id");
            navLinks.forEach(link => {
                const href = link.getAttribute("href") || "";
                link.classList.toggle("is-active", href === `#${id}` || href.endsWith(`#${id}`));
            });
        });
    }, { rootMargin: "-42% 0px -46% 0px", threshold: 0 });
    document.querySelectorAll("main section[id]").forEach(s => sectionObserver.observe(s));

    /* ─── SWITCHER TABS ─── */
    switchers.forEach(switcher => {
        const buttons = Array.from(switcher.querySelectorAll("[data-switcher-target]"));
        const panels = Array.from(switcher.querySelectorAll("[data-switcher-panel]"));
        buttons.forEach(button => {
            button.addEventListener("click", () => {
                const target = button.dataset.switcherTarget;
                buttons.forEach(b => {
                    const active = b === button;
                    b.classList.toggle("is-active", active);
                    b.setAttribute("aria-selected", String(active));
                });
                panels.forEach(panel => {
                    const show = panel.dataset.switcherPanel === target;
                    panel.classList.toggle("is-active", show);
                    panel.hidden = !show;
                });
            });
        });
    });

    /* ─── DETAIL TOGGLES ─── */
    const setDetailState = (btn, panel, expanded) => {
        const openLabel = btn.dataset.detailLabelOpen || "Open details";
        const closeLabel = btn.dataset.detailLabelClose || "Hide details";
        btn.setAttribute("aria-expanded", String(expanded));
        btn.textContent = expanded ? closeLabel : openLabel;
        panel.hidden = !expanded;
    };
    detailToggles.forEach(button => {
        const panelId = button.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;
        setDetailState(button, panel, false);
        button.addEventListener("click", () => {
            const isExpanded = button.getAttribute("aria-expanded") === "true";
            detailToggles.forEach(other => {
                if (other === button) return;
                const otherId = other.getAttribute("aria-controls");
                const otherPanel = otherId ? document.getElementById(otherId) : null;
                if (otherPanel) setDetailState(other, otherPanel, false);
            });
            setDetailState(button, panel, !isExpanded);
        });
    });

    /* ─── METRIC COUNTERS ─── */
    const animateCount = (el) => {
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const duration = 1600;
        const start = performance.now();
        const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = `${Math.round(target * eased).toLocaleString()}${suffix}`;
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };
    if (prefersReducedMotion.matches) {
        metricValues.forEach(m => { m.textContent = `${Number(m.dataset.count).toLocaleString()}${m.dataset.suffix || ""}`; });
    } else {
        const metricObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                animateCount(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.55 });
        metricValues.forEach(m => {
            m.textContent = `0${m.dataset.suffix || ""}`;
            metricObserver.observe(m);
        });
    }

    /* ─── SCROLL PROGRESS ─── */
    const updateScrollProgress = () => {
        if (!scrollProgressEl) return;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        scrollProgressEl.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    };
    let scrollTick = false;
    window.addEventListener("scroll", () => {
        if (scrollTick) return;
        scrollTick = true;
        requestAnimationFrame(() => { updateScrollProgress(); scrollTick = false; });
    }, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    updateScrollProgress();

    /* ─── 3D CARD + SHELL MOTION ─── */
    if (!prefersReducedMotion.matches && window.matchMedia("(pointer:fine)").matches) {
        motionShells.forEach(shell => {
            shell.addEventListener("pointermove", (e) => {
                const b = shell.getBoundingClientRect();
                shell.style.setProperty("--pointer-x", `${((e.clientX - b.left) / b.width) * 100}%`);
                shell.style.setProperty("--pointer-y", `${((e.clientY - b.top) / b.height) * 100}%`);
            });
            shell.addEventListener("pointerleave", () => {
                shell.style.setProperty("--pointer-x", "50%");
                shell.style.setProperty("--pointer-y", "50%");
            });
        });

        motionCards.forEach(card => {
            card.addEventListener("pointermove", (e) => {
                const b = card.getBoundingClientRect();
                const x = (e.clientX - b.left) / b.width;
                const y = (e.clientY - b.top) / b.height;
                card.style.setProperty("--card-rotate-x", `${((0.5 - y) * 8).toFixed(2)}deg`);
                card.style.setProperty("--card-rotate-y", `${((x - 0.5) * 8).toFixed(2)}deg`);
                card.style.setProperty("--card-glow-x", `${(x * 100).toFixed(2)}%`);
                card.style.setProperty("--card-glow-y", `${(y * 100).toFixed(2)}%`);
            });
            card.addEventListener("pointerleave", () => {
                card.style.setProperty("--card-rotate-x", "0deg");
                card.style.setProperty("--card-rotate-y", "0deg");
                card.style.setProperty("--card-glow-x", "50%");
                card.style.setProperty("--card-glow-y", "20%");
            });
        });
    }

    /* ─── TYPING ANIMATION ─── */
    const typedTarget = document.getElementById("typed-target");
    const typedCursor = document.querySelector(".typed-cursor");
    if (typedTarget && !prefersReducedMotion.matches) {
        const words = [
            "full-stack applications",
            "scalable backend systems",
            "AI-powered features",
            "products users love"
        ];
        let wordIdx = 0;
        let charIdx = 0;
        let deleting = false;
        let delay = 90;

        const type = () => {
            const word = words[wordIdx];
            if (deleting) {
                typedTarget.textContent = word.substring(0, charIdx - 1);
                charIdx--;
                delay = 45;
            } else {
                typedTarget.textContent = word.substring(0, charIdx + 1);
                charIdx++;
                delay = 90;
            }

            if (!deleting && charIdx === word.length) {
                delay = 2200;
                deleting = true;
            } else if (deleting && charIdx === 0) {
                deleting = false;
                wordIdx = (wordIdx + 1) % words.length;
                delay = 350;
            }

            setTimeout(type, delay);
        };

        setTimeout(type, 900);
    } else if (typedTarget && prefersReducedMotion.matches) {
        typedTarget.textContent = "full-stack applications";
        if (typedCursor) typedCursor.style.display = "none";
    }
});
