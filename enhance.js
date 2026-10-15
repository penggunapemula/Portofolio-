/**
 * enhance.js — interaksi tambahan (dimuat setelah script.js)
 * Fitur: deck sertifikat, aurora, tilt 3D, tombol magnetik,
 *        counter statistik, transisi ganti tema.
 */
(function () {
    'use strict';

    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasHover = matchMedia('(hover: hover)').matches;

    /* ==========================================================
       1. DECK SERTIFIKAT — klik / geser = kocok
       ========================================================== */
    function initCertDeck() {
        const deck = $('#deck');
        if (!deck) return;

        const counter    = $('#deckCount');
        const openButton = $('#deckOpen');
        const allCards   = $$('.dcard', deck);
        const total      = allCards.length;

        let order = [...allCards];   // order[0] = kartu paling atas
        let busy  = false;           // kunci selama animasi berjalan

        // Posisi kartu ke-i dalam tumpukan
        const poseOf = (i) => {
            const tilt = (i % 2 ? 1 : -1) * i * 2.6;
            return `translate(${i * 16}px, ${i * -12}px) rotate(${tilt}deg) scale(${1 - i * 0.05})`;
        };

        // Terapkan posisi + perbarui teks counter & tombol "Lihat penuh"
        function layout() {
            order.forEach((card, i) => {
                card.classList.remove('drag');
                card.style.zIndex = total - i;
                card.style.transform = poseOf(i);
            });
            const top = order[0];
            openButton.dataset.cert = top.dataset.cert;
            counter.textContent = `${allCards.indexOf(top) + 1} dari ${total} sertifikat`;
        }

        // Lempar kartu teratas ke samping, lalu masukkan ke belakang tumpukan
        function flyOut(direction = 1) {
            if (busy) return;
            busy = true;
            order[0].style.transform = `translate(${direction * 115}%, -8%) rotate(${direction * 20}deg)`;

            setTimeout(() => {
                order.push(order.shift());
                layout();
                setTimeout(() => (busy = false), 350);
            }, prefersReducedMotion ? 0 : 300);
        }

        // Acak Fisher-Yates; ulangi sampai kartu teratas berbeda (maks. total-1 percobaan wajar)
        function randomOrder(list) {
            let result;
            do {
                result = [...list];
                for (let i = result.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [result[i], result[j]] = [result[j], result[i]];
                }
            } while (total > 1 && result[0] === list[0]);
            return result;
        }

        // Kocok penuh: kartu menyebar seperti kipas, lalu kembali dengan urutan acak
        function shuffle() {
            if (busy) return;
            busy = true;

            const mid = (total - 1) / 2;
            order.forEach((card, i) => {
                card.style.transform = `translate(${(i - mid) * 70}%, 0) rotate(${(i - mid) * 14}deg)`;
            });

            setTimeout(() => {
                const next = randomOrder(order);   // kartu teratas pasti berganti

                order = next;
                order.forEach((card, i) => (card.style.transitionDelay = `${i * 70}ms`));
                layout();

                setTimeout(() => {
                    order.forEach((card) => (card.style.transitionDelay = ''));
                    busy = false;
                }, 900);
            }, prefersReducedMotion ? 0 : 550);
        }

        /* --- Drag / swipe / klik --- */
        let startX = 0, startY = 0, deltaX = 0;
        let isDown = false, hasMoved = false;
        const DRAG_THRESHOLD = 6;     // px, batas dianggap "geser" bukan "klik"
        const SWIPE_DISTANCE = 70;    // px, jarak minimal agar kartu terlempar

        deck.addEventListener('pointerdown', (e) => {
            if (busy) return;
            isDown = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            deck.setPointerCapture(e.pointerId);
            order[0].classList.add('drag');
        });

        deck.addEventListener('pointermove', (e) => {
            if (!isDown) return;
            deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            if (Math.abs(deltaX) > DRAG_THRESHOLD) hasMoved = true;
            order[0].style.transform = `translate(${deltaX}px, ${deltaY * 0.4}px) rotate(${deltaX / 14}deg)`;
        });

        deck.addEventListener('pointerup', () => {
            if (!isDown) return;
            isDown = false;
            order[0].classList.remove('drag');

            if (!hasMoved)                              flyOut(1);                     // klik biasa
            else if (Math.abs(deltaX) > SWIPE_DISTANCE) flyOut(deltaX > 0 ? 1 : -1);   // swipe
            else                                        layout();                      // batal, balik
            deltaX = 0;
        });

        deck.addEventListener('pointercancel', () => {
            isDown = false;
            layout();
        });

        /* --- Keyboard --- */
        deck.addEventListener('keydown', (e) => {
            const forward = ['Enter', ' ', 'ArrowRight'].includes(e.key);
            if (forward || e.key === 'ArrowLeft') {
                e.preventDefault();
                flyOut(forward ? 1 : -1);
            }
        });

        $('#deckShuffle').addEventListener('click', shuffle);
        layout();
    }

    /* ==========================================================
       2. AURORA — latar bergerak halus mengikuti kursor
       ========================================================== */
    function initAurora() {
        const aurora = $('.aurora');
        if (!aurora || prefersReducedMotion) return;

        const blobs = $$('i', aurora);
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

        addEventListener('pointermove', (e) => {
            targetX = e.clientX / innerWidth - 0.5;
            targetY = e.clientY / innerHeight - 0.5;
        }, { passive: true });

        (function animate() {
            currentX += (targetX - currentX) * 0.05;   // easing (lerp)
            currentY += (targetY - currentY) * 0.05;

            blobs.forEach((blob, i) => {
                const strength = (i + 1) * 90 * (i % 2 ? -1 : 1);
                blob.style.setProperty('--x', `${currentX * strength}px`);
                blob.style.setProperty('--y', `${currentY * strength}px`);
            });
            requestAnimationFrame(animate);
        })();
    }

    /* ==========================================================
       3. TILT 3D (kartu) + TOMBOL MAGNETIK
       ========================================================== */
    function initTiltAndMagnetic() {
        if (prefersReducedMotion || !hasHover) return;

        // Tilt: kartu miring mengikuti posisi kursor
        $$('.skill-card, .project-card').forEach((card) => {
            card.classList.add('tilt');

            card.addEventListener('mouseenter', () => (card.style.transitionDelay = '0ms'));

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.setProperty('--ry', `${x * 10}deg`);
                card.style.setProperty('--rx', `${-y * 10}deg`);
            });

            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });

        // Magnetik: tombol sedikit tertarik ke arah kursor
        $$('.btn, .glass-btn, .social-link').forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const offsetX = (e.clientX - rect.left - rect.width / 2) * 0.2;
                const offsetY = (e.clientY - rect.top - rect.height / 2) * 0.3;
                btn.style.translate = `${offsetX}px ${offsetY}px`;
            });
            btn.addEventListener('mouseleave', () => (btn.style.translate = ''));
        });
    }

    /* ==========================================================
       4. COUNTER STATISTIK — angka naik saat terlihat
       ========================================================== */
    function initCounters() {
        $$('.stat-number').forEach((el) => {
            const match = el.textContent.match(/\d+/);
            if (!match) return;

            const target = Number(match[0]);
            const suffix = el.textContent.replace(match[0], '');   // contoh: "+"
            const DURATION = 1200;

            const observer = new IntersectionObserver(([entry], obs) => {
                if (!entry.isIntersecting) return;
                obs.disconnect();

                const start = performance.now();
                (function tick(now) {
                    const progress = Math.min((now - start) / DURATION, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);   // ease-out cubic
                    el.textContent = Math.round(target * eased) + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                })(start);
            });
            observer.observe(el);
        });
    }

    /* ==========================================================
       5. GANTI TEMA — transisi lingkaran (View Transitions API)
       ========================================================== */
    function initThemeTransition() {
        const toggle = $('#themeToggle');
        if (!toggle || !document.startViewTransition || prefersReducedMotion) return;

        // Fase capture: mengambil alih klik sebelum handler bawaan di script.js
        toggle.parentElement.addEventListener('click', (e) => {
            if (!e.target.closest('#themeToggle')) return;
            e.stopPropagation();

            const root = document.documentElement;
            const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';

            // Lingkaran membesar dari posisi tombol sampai menutup layar
            const rect = toggle.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

            const transition = document.startViewTransition(() => {
                root.dataset.theme = nextTheme;
                localStorage.setItem('theme', nextTheme);
                $('i', toggle).className = `fas ${nextTheme === 'light' ? 'fa-sun' : 'fa-moon'}`;
            });

            transition.ready.then(() => {
                root.animate(
                    { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
                    { duration: 650, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
                );
            });
        }, true);
    }


    /* ==========================================================
       6. HERO — kartu foto & chip bergerak mengikuti kursor
       ========================================================== */
    function initHeroParallax() {
        const hero   = $('#hero');
        const visual = $('#heroVisual');
        if (!hero || !visual || prefersReducedMotion || !hasHover) return;

        hero.addEventListener('pointermove', (e) => {
            const rect = visual.getBoundingClientRect();
            // -1 .. 1 relatif terhadap pusat kartu
            const x = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width / 2) / (innerWidth / 2)));
            const y = Math.max(-1, Math.min(1, (e.clientY - rect.top - rect.height / 2) / (innerHeight / 2)));
            visual.style.setProperty('--hx', x.toFixed(3));
            visual.style.setProperty('--hy', y.toFixed(3));
        });
        hero.addEventListener('pointerleave', () => {
            visual.style.setProperty('--hx', 0);
            visual.style.setProperty('--hy', 0);
        });
    }

    /* ==========================================================
       7. NAV — indikator kaca meluncur ke menu hover / aktif
       ========================================================== */
    function initNavPill() {
        const list = $('#navLinks');
        if (!list) return;

        const pill = document.createElement('span');
        pill.className = 'nav-pill';
        list.prepend(pill);

        const links = $$('a', list);
        const moveTo = (link) => {
            if (!link) { pill.style.opacity = 0; return; }
            pill.style.opacity = 1;
            pill.style.width = `${link.offsetWidth}px`;
            pill.style.height = `${link.offsetHeight}px`;
            pill.style.transform = `translate(${link.offsetLeft}px, ${link.offsetTop}px)`;
        };
        const syncToActive = () => moveTo(list.querySelector('a.active'));

        links.forEach((link) => link.addEventListener('mouseenter', () => moveTo(link)));
        list.addEventListener('mouseleave', syncToActive);

        // script.js mengganti class "active" saat scroll — ikuti perubahannya
        new MutationObserver(syncToActive).observe(list, { subtree: true, attributes: true, attributeFilter: ['class'] });
        addEventListener('resize', syncToActive);
        document.fonts?.ready.then(syncToActive);
        syncToActive();
    }


    /* ==========================================================
       8. SCROLL-SPY — menu aktif ikut posisi, termasuk "Kontak"
          (script.js tidak bisa menandai section terakhir karena
           halaman sudah mentok di bawah sebelum top-nya tercapai)
       ========================================================== */
    function initScrollSpy() {
        const links = $$('#navLinks a');
        const sections = links
            .map((a) => $(a.getAttribute('href')))
            .filter(Boolean);

        function update() {
            const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
            let current = sections[0];

            if (atBottom) {
                current = sections[sections.length - 1];
            } else {
                sections.forEach((section) => {
                    if (section.getBoundingClientRect().top <= innerHeight * 0.4) current = section;
                });
            }
            links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${current.id}`));
        }

        // Didaftarkan setelah script.js, jadi hasilnya yang terakhir dipakai
        addEventListener('scroll', update, { passive: true });
        addEventListener('resize', update);
        update();
    }


    /* ==========================================================
       9. TIMELINE — garis menyala & titik aktif mengikuti scroll
       ========================================================== */
    function initTimeline() {
        const column = $('.timeline-column');
        if (!column) return;

        const cards = $$('.ios-glass-card', column);

        // Titik dipasang di kolom (bukan di dalam kartu) karena kartu memakai overflow: hidden
        const dots = cards.map(() => {
            const dot = document.createElement('span');
            dot.className = 'tl-dot';
            column.append(dot);
            return dot;
        });
        const placeDots = () => dots.forEach((dot, i) => (dot.style.top = `${cards[i].offsetTop + 28}px`));
        placeDots();
        addEventListener('resize', placeDots);
        addEventListener('load', placeDots);

        function update() {
            const rect = column.getBoundingClientRect();
            const probe = innerHeight * 0.6;                       // garis "baca" di layar
            const progress = Math.max(0, Math.min(1, (probe - rect.top) / rect.height));
            column.style.setProperty('--p', progress.toFixed(3));

            dots.forEach((dot, i) => {
                dot.classList.toggle('on', cards[i].getBoundingClientRect().top < probe);
            });
        }
        addEventListener('scroll', update, { passive: true });
        addEventListener('resize', update);
        update();
    }

    /* ---------- Jalankan semua ----------
       Dibungkus try/catch: kalau satu fitur gagal (mis. browser lama),
       fitur lain dan seluruh halaman tetap jalan. */
    [
        initCertDeck, initAurora, initTiltAndMagnetic, initCounters,
        initThemeTransition, initHeroParallax, initNavPill,
        initScrollSpy, initTimeline,
    ].forEach((init) => {
        try {
            init();
        } catch (error) {
            console.warn(`[enhance] ${init.name} dilewati:`, error);
        }
    });
})();
