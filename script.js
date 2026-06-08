// ============================================
// MOBILE MENU TOGGLE
// ============================================
const menuToggle = document.querySelector('.mobile-menu-toggle');
const desktopNav = document.querySelector('.desktop-nav');

if (menuToggle && desktopNav) {
    let mobileNav = null;

    menuToggle.addEventListener('click', () => {
        if (!mobileNav) {
            // Create mobile nav if it doesn't exist
            mobileNav = document.createElement('nav');
            mobileNav.className = 'mobile-nav';
            mobileNav.innerHTML = `
                <a href="index.html">Home</a>
                <a href="services.html">Services</a>
                <a href="hours.html">Hours</a>
            `;
            mobileNav.style.cssText = `
                display: none;
                position: absolute;
                top: 60px;
                left: 0;
                width: 100%;
                background: var(--black);
                border-bottom: 2px solid var(--gold);
                flex-direction: column;
                padding: 20px;
                z-index: 999;
            `;

            mobileNav.querySelectorAll('a').forEach(link => {
                link.style.cssText = `
                    color: var(--white);
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(255, 140, 66, 0.2);
                    display: block;
                    transition: all 0.3s ease;
                `;
                link.addEventListener('hover', function() {
                    this.style.paddingLeft = '10px';
                    this.style.color = 'var(--orange)';
                });
            });

            desktopNav.parentNode.appendChild(mobileNav);
        }

        if (mobileNav.style.display === 'none') {
            mobileNav.style.display = 'flex';
            menuToggle.style.color = 'var(--gold)';
        } else {
            mobileNav.style.display = 'none';
            menuToggle.style.color = 'var(--orange)';
        }
    });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with fade-in classes
document.querySelectorAll('.fade-in, .service-card, .testimonial-card, .pricing-card, .info-card, .hours-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ============================================
// SMOOTH SCROLLING
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// ACTIVE NAVIGATION
// ============================================
const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
navLinks.forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

// ============================================
// BUTTON RIPPLE EFFECT
// ============================================
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            animation: ripple-animation 0.6s ease-out;
        `;

        if (!button.style.position || button.style.position === 'static') {
            button.style.position = 'relative';
        }

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// ============================================
// PAGE LOAD ANIMATION
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    document.body.style.animation = 'fadeIn 0.6s ease-out';
});

// ============================================
// COUNTER ANIMATION
// ============================================
const animateCounter = (element) => {
    if (!element.dataset.animated) {
        const target = parseInt(element.textContent);
        let current = 0;
        const increment = target / 30;

        const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(counter);
                element.dataset.animated = 'true';
            } else {
                element.textContent = Math.floor(current);
            }
        }, 50);
    }
};

// ============================================
// CONTACT LINK TRACKING
// ============================================
document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
        console.log('Contact link clicked:', link.href);
    });
});

// ============================================
// UTILITY ANIMATIONS CSS
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            width: 100px;
            height: 100px;
            opacity: 0;
            transform: translate(-50%, -50%);
        }
    }

    body {
        opacity: 0;
    }
`;
document.head.appendChild(style);