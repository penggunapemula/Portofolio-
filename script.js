(function() {
    // ========== PRELOADER ==========
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        preloader.classList.add('hidden');
        setTimeout(() => { if (preloader.parentNode) preloader.remove(); }, 700);
    });
    setTimeout(() => {
        if (!preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
            setTimeout(() => { if (preloader.parentNode) preloader.remove(); }, 700);
        }
    }, 4000);

    // ========== DOM REFERENS ==========
    const body = document.body;
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');
    const contactForm = document.getElementById('contactForm');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const currentYearSpan = document.getElementById('currentYear');
    const typedElement = document.getElementById('typed-text');

    // ========== CURRENT YEAR ==========
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // ========== THEME ==========
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    if (themeIcon) updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
            const metaTheme = document.querySelector('meta[name="theme-color"]');
            if (metaTheme) metaTheme.setAttribute('content', newTheme === 'dark' ? '#0b1120' : '#f8fafc');
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        themeIcon.classList.replace(theme === 'light' ? 'fa-moon' : 'fa-sun', theme === 'light' ? 'fa-sun' : 'fa-moon');
    }

    // ========== MOBILE NAV ==========
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
            body.style.overflow = isActive ? 'hidden' : '';
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                body.style.overflow = '';
            });
        });
    }

    // ========== NAVBAR SCROLL & BACK TO TOP ==========
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (navbar) navbar.classList.toggle('scrolled', scrollY > 50);
        if (backToTop) backToTop.classList.toggle('visible', scrollY > 600);
        updateActiveNavLink();
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) current = section.getAttribute('id');
        });
        if (navLinks) {
            navLinks.querySelectorAll('a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) link.classList.add('active');
            });
        }
    }

    // ========== TYPING EFFECT ==========
    const words = ['Frontend', 'UI/UX Designer', 'Tech Lover'];
    let wordIndex = 0, charIndex = 0, isDeleting = false;
    function type() {
        if (!typedElement) return;
        const currentWord = words[wordIndex];
        typedElement.textContent = currentWord.substring(0, charIndex);
        if (!isDeleting && charIndex < currentWord.length) { charIndex++; setTimeout(type, 90); }
        else if (isDeleting && charIndex > 0) { charIndex--; setTimeout(type, 45); }
        else {
            isDeleting = !isDeleting;
            if (!isDeleting) wordIndex = (wordIndex + 1) % words.length;
            setTimeout(type, isDeleting ? 600 : 1200);
        }
    }
    if (typedElement) type();

    // ========== SCROLL REVEAL ==========
    const revealEls = document.querySelectorAll('.reveal');
    const staggerEls = document.querySelectorAll('.stagger-children');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
    staggerEls.forEach(el => revealObserver.observe(el));

    const certModal = document.getElementById('certModal');
    const certModalImg = document.getElementById('certModalImg');
    const openCertBtns = document.querySelectorAll('.open-cert-btn');
    const closeModalBtn = document.querySelector('.close-modal');

    if (certModal && certModalImg) {
        openCertBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const imgSrc = this.getAttribute('data-cert');
                certModalImg.src = imgSrc;
                certModal.classList.remove('hidden');
                certModal.setAttribute('aria-hidden', 'false');
                body.style.overflow = 'hidden'; 
            });
            
            btn.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') this.click();
            });
        });

        function closeCertModal() {
            certModal.classList.add('hidden');
            certModal.setAttribute('aria-hidden', 'true');
            body.style.overflow = '';
            setTimeout(() => { certModalImg.src = ''; }, 400);
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeCertModal);
        }

        certModal.addEventListener('click', (e) => {
            if (e.target === certModal) {
                closeCertModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !certModal.classList.contains('hidden')) {
                closeCertModal();
            }
        });
    }

    // ========== PROJECT FILTER ==========
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ========== CONTACT FORM ==========
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const name = formData.get('name')?.trim();
            const email = formData.get('email')?.trim();
            const message = formData.get('message')?.trim();
            if (!name || !email || !message) { alert('Mohon lengkapi semua field.'); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Email tidak valid.'); return; }
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            submitBtn.disabled = true;
            setTimeout(() => {
                alert(`✅ Pesan berhasil dikirim! (Simulasi)\nTerima kasih, ${name}!`);
                contactForm.reset();
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }, 1200);
        });
    }

    // ========== SMOOTH SCROLL (internal links) ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navHeight = navbar ? navbar.offsetHeight + 20 : 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ========== ESC TO CLOSE NAV ==========
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
            body.style.overflow = '';
            if (hamburger) hamburger.focus();
        }
    });

    console.log('%c🚀 Portfolio siap! %cDibangun dengan performa & aksesibilitas sebagai prioritas.',
        'color: #38bdf8; font-weight: bold;', 'color: #94a3b8;');
})();