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
    const scrollProgress = document.getElementById('scrollProgress');
    const toastContainer = document.getElementById('toastContainer');

    // ========== TOAST NOTIFICATIONS (pengganti alert()) ==========
    function showToast(message, type = 'info', duration = 3200) {
        if (!toastContainer) return;
        const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'status');
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}" aria-hidden="true"></i><span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-hide');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, duration);
    }

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
        if (scrollProgress) {
            const docHeight = html.scrollHeight - html.clientHeight;
            const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
            scrollProgress.style.width = progress + '%';
        }
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
                certModalImg.classList.remove('loaded');
                certModalImg.src = imgSrc;
                certModalImg.onload = () => certModalImg.classList.add('loaded');
                certModalImg.onerror = () => {
                    showToast('Gambar sertifikat tidak ditemukan. Cek kembali nama file/path.', 'error', 4000);
                    closeCertModal();
                };
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
            certModalImg.onerror = null;
            certModalImg.onload = null;
            setTimeout(() => { certModalImg.removeAttribute('src'); }, 400);
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

    // ========== RIPPLE EFFECT (.btn & .filter-btn) ==========
    function addRipple(e) {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        el.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    }
    document.querySelectorAll('.btn, .filter-btn').forEach(btn => {
        btn.addEventListener('click', addRipple);
    });

    // ========== CURSOR GLOW (skill-card & ios-glass-card) ==========
    document.querySelectorAll('.skill-card, .ios-glass-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
        });
    });

    // ========== COPY TO CLIPBOARD (info kontak) ==========
    document.querySelectorAll('.copyable').forEach(item => {
        item.addEventListener('click', async () => {
            const text = item.dataset.copy;
            try {
                await navigator.clipboard.writeText(text);
            } catch (err) {
                const temp = document.createElement('textarea');
                temp.value = text;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                temp.remove();
            }
            item.classList.add('copied');
            showToast(`Tersalin: ${text}`, 'success', 2000);
            setTimeout(() => item.classList.remove('copied'), 1500);
        });
    });

    // ========== PROJECT FILTER (dengan transisi halus) ==========
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                const category = card.dataset.category;
                const shouldShow = filter === 'all' || category === filter;
                if (shouldShow) {
                    card.classList.remove('hidden');
                    requestAnimationFrame(() => card.classList.remove('filtering-out'));
                } else if (!card.classList.contains('hidden')) {
                    card.classList.add('filtering-out');
                    setTimeout(() => card.classList.add('hidden'), 250);
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
            if (!name || !email || !message) { showToast('Mohon lengkapi semua field.', 'error'); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Email tidak valid.', 'error'); return; }
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            submitBtn.disabled = true;
            setTimeout(() => {
                const safeName = name.replace(/[<>&]/g, '');
                showToast(`Pesan berhasil dikirim! Terima kasih, ${safeName}. (Simulasi)`, 'success', 4000);
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