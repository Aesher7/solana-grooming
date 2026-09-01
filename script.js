/* =============================================================================
   SOLANA DOG SPA — interaction & motion

   Every entrance here uses gsap.from(). Nothing is hidden by CSS first, so if
   the GSAP CDN is blocked or this file fails to parse, the page is simply
   visible and static rather than blank. The previous build did the opposite —
   it injected `body { opacity: 0 }` and only restored it on window.load, which
   meant any JS error rendered the whole site invisible.
   ========================================================================== */

(function () {
    'use strict';

    // Gates the handful of styles that only make sense once JS is running —
    // chiefly the mobile nav swap, where the links are replaced by the palette.
    document.body.classList.add('js');

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canHover = window.matchMedia('(hover: hover)').matches;
    var hasGSAP = typeof window.gsap !== 'undefined';
    var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

    if (hasST) {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* =========================================================================
       COMMAND PALETTE
       Also the mobile navigation. Built from real markup in the document rather
       than from JS strings, so it can be styled, translated and inspected.
       ====================================================================== */

    var palette = document.querySelector('[data-palette]');

    if (palette) {
        var input = palette.querySelector('[data-palette-input]');
        var list = palette.querySelector('[data-palette-list]');
        var openers = document.querySelectorAll('[data-palette-open]');
        var items = Array.prototype.slice.call(
            list.querySelectorAll('.palette__item')
        );
        var active = 0;
        // Remembered so focus can be handed back to whatever opened the dialog,
        // rather than dumped at the top of the document on close.
        var lastFocus = null;

        function visibleItems() {
            return items.filter(function (el) {
                return !el.hidden;
            });
        }

        function paint() {
            var vis = visibleItems();
            if (active >= vis.length) active = 0;
            if (active < 0) active = vis.length - 1;

            items.forEach(function (el) {
                el.classList.remove('is-active');
                el.setAttribute('aria-selected', 'false');
            });

            if (vis[active]) {
                vis[active].classList.add('is-active');
                vis[active].setAttribute('aria-selected', 'true');
                // block:'nearest' so filtering doesn't yank the list around when
                // the highlighted row is already on screen.
                vis[active].scrollIntoView({ block: 'nearest' });
            }
        }

        function filter(q) {
            var needle = q.trim().toLowerCase();
            items.forEach(function (el) {
                var hay = (el.textContent + ' ' + (el.dataset.keywords || ''))
                    .toLowerCase();
                el.hidden = needle !== '' && hay.indexOf(needle) === -1;
            });
            active = 0;
            paint();

            var empty = palette.querySelector('[data-palette-empty]');
            if (empty) empty.hidden = visibleItems().length > 0;
        }

        function openPalette() {
            lastFocus = document.activeElement;
            palette.classList.add('is-open');
            palette.setAttribute('aria-hidden', 'false');
            input.value = '';
            filter('');
            input.focus();
            // The dialog scrolls internally; letting the page scroll behind it
            // makes the backdrop drift away from the panel.
            document.body.style.overflow = 'hidden';
        }

        function closePalette() {
            palette.classList.remove('is-open');
            palette.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        openers.forEach(function (btn) {
            btn.addEventListener('click', openPalette);
        });

        input.addEventListener('input', function () {
            filter(input.value);
        });

        document.addEventListener('keydown', function (e) {
            var isOpen = palette.classList.contains('is-open');

            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                isOpen ? closePalette() : openPalette();
                return;
            }

            if (!isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closePalette();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                active++;
                paint();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                active--;
                paint();
            } else if (e.key === 'Enter') {
                var vis = visibleItems();
                if (vis[active]) {
                    e.preventDefault();
                    vis[active].click();
                }
            } else if (e.key === 'Tab') {
                // The dialog holds exactly two focusable regions; trapping is a
                // matter of keeping Tab on the input rather than cycling a list
                // that is already driven by the arrow keys.
                e.preventDefault();
                input.focus();
            }
        });

        // Click on the backdrop only — not on the panel itself.
        palette.addEventListener('mousedown', function (e) {
            if (e.target === palette) closePalette();
        });

        items.forEach(function (el, i) {
            el.addEventListener('mouseenter', function () {
                active = visibleItems().indexOf(el);
                paint();
            });
            el.addEventListener('click', function () {
                closePalette();
            });
            if (i === 0) el.classList.add('is-active');
        });
    }

    /* =========================================================================
       CARD POINTER HIGHLIGHT
       Writes --mx/--my for the radial overlay. Pointer-driven work is throttled
       to one rAF frame; without it this fires far more often than the compositor
       can consume and the highlight lags the cursor.
       ====================================================================== */

    if (canHover) {
        var cards = document.querySelectorAll('.card, .spangrid__cta');
        var queued = false;
        var pending = [];

        function flush() {
            queued = false;
            pending.forEach(function (job) {
                job.el.style.setProperty('--mx', job.x + '%');
                job.el.style.setProperty('--my', job.y + '%');
            });
            pending.length = 0;
        }

        cards.forEach(function (card) {
            card.addEventListener('pointermove', function (e) {
                var r = card.getBoundingClientRect();
                pending.push({
                    el: card,
                    x: (((e.clientX - r.left) / r.width) * 100).toFixed(1),
                    y: (((e.clientY - r.top) / r.height) * 100).toFixed(1)
                });
                if (!queued) {
                    queued = true;
                    requestAnimationFrame(flush);
                }
            });
        });
    }

    /* =========================================================================
       3D TILT
       Capped at 7 degrees. Past roughly 8 the text on the far edge starts to
       blur from the perspective divide and the card reads as a gimmick.
       ====================================================================== */

    if (canHover && !reduced && hasGSAP) {
        document.querySelectorAll('[data-tilt]').forEach(function (el) {
            var frame = null;

            el.addEventListener('pointermove', function (e) {
                if (frame) return;
                frame = requestAnimationFrame(function () {
                    frame = null;
                    var r = el.getBoundingClientRect();
                    var px = (e.clientX - r.left) / r.width - 0.5;
                    var py = (e.clientY - r.top) / r.height - 0.5;
                    gsap.to(el, {
                        rotateY: px * 7,
                        rotateX: -py * 7,
                        duration: 0.4,
                        ease: 'power2.out',
                        transformPerspective: 900
                    });
                });
            });

            el.addEventListener('pointerleave', function () {
                gsap.to(el, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.6,
                    ease: 'power3.out'
                });
            });
        });
    }

    /* =========================================================================
       MAGNETIC CTAs
       Two on the site, no more. The pull is clamped to 12px so the element can
       never travel outside its own hit box — a magnetic button that outruns its
       clickable area is worse than a static one.
       ====================================================================== */

    if (canHover && !reduced && hasGSAP) {
        document.querySelectorAll('[data-magnetic]').forEach(function (el) {
            var xTo = gsap.quickTo(el, 'x', {
                duration: 0.5,
                ease: 'elastic.out(1, 0.4)'
            });
            var yTo = gsap.quickTo(el, 'y', {
                duration: 0.5,
                ease: 'elastic.out(1, 0.4)'
            });

            function clamp(v) {
                return Math.max(-12, Math.min(12, v));
            }

            el.addEventListener('pointermove', function (e) {
                var r = el.getBoundingClientRect();
                xTo(clamp((e.clientX - (r.left + r.width / 2)) * 0.3));
                yTo(clamp((e.clientY - (r.top + r.height / 2)) * 0.3));
            });

            el.addEventListener('pointerleave', function () {
                xTo(0);
                yTo(0);
            });
        });
    }

    /* Everything past this point is animation. Bail out cleanly and leave the
       static page exactly as the CSS renders it. */
    if (!hasGSAP || reduced) return;

    /* =========================================================================
       SHARED HEADING REVEAL
       Every display heading on every page reveals the same way: lines masked,
       inner span rising from below. This single repeated gesture is what makes
       five separately-laid-out pages read as one system.
       ====================================================================== */

    function splitLines(el) {
        // Wrap each word so line boxes can be measured, then group words by
        // their offsetTop — that is the only reliable way to find where the
        // browser actually broke the line for a given font and width.
        var words = el.textContent.trim().split(/\s+/);
        var html = el.innerHTML;
        var hasMarkup = /<[a-z]/i.test(html);

        // A heading containing a gradient <span> can't be naively re-split
        // without losing the emphasis, so those animate as a single line.
        if (hasMarkup) {
            var only = document.createElement('span');
            only.className = 'line-mask';
            var inner = document.createElement('span');
            inner.innerHTML = html;
            only.appendChild(inner);
            el.innerHTML = '';
            el.appendChild(only);
            return [inner];
        }

        el.innerHTML = words
            .map(function (w) {
                return '<span class="w">' + w + '</span>';
            })
            .join(' ');

        var lines = [];
        var current = null;
        var lastTop = null;

        Array.prototype.forEach.call(el.querySelectorAll('.w'), function (w) {
            var top = w.offsetTop;
            if (lastTop === null || Math.abs(top - lastTop) > 4) {
                current = [];
                lines.push(current);
                lastTop = top;
            }
            current.push(w.textContent);
        });

        el.innerHTML = lines
            .map(function (words) {
                return (
                    '<span class="line-mask"><span>' +
                    words.join(' ') +
                    '</span></span>'
                );
            })
            .join('');

        return Array.prototype.slice.call(el.querySelectorAll('.line-mask > span'));
    }

    var heroHeading = document.querySelector('[data-reveal-hero]');

    if (heroHeading) {
        // The hero is the only load-time animation on the site. expo.out is
        // reserved for headline reveals.
        gsap.from(splitLines(heroHeading), {
            yPercent: 110,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.08
        });

        gsap.from('[data-hero-stagger] > *', {
            y: 18,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.06,
            delay: 0.25
        });
    }

    if (hasST) {
        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            gsap.from(splitLines(el), {
                yPercent: 110,
                duration: 0.9,
                ease: 'expo.out',
                stagger: 0.07,
                scrollTrigger: { trigger: el, start: 'top 86%' }
            });
        });
    }

    if (!hasST) return;

    /* =========================================================================
       PROGRESS BAR
       One scrubbed ScrollTrigger. A scroll listener would fire on every frame
       and set the same property the compositor is already animating.
       ====================================================================== */

    var bar = document.querySelector('.progress');
    if (bar) {
        gsap.to(bar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: document.documentElement,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3
            }
        });
    }

    /* =========================================================================
       PER-SECTION ENTRANCE VERBS
       Each section enters differently so the page reads as a sequence rather
       than one fade-up repeated eight times.
       ====================================================================== */

    function onScroll(target, vars) {
        gsap.from(
            target,
            Object.assign(
                {
                    scrollTrigger: {
                        trigger: vars.trigger || target,
                        start: 'top 84%'
                    }
                },
                vars
            )
        );
    }

    // Cards settle in from the grid's start with a slight overshoot. back.out is
    // used here and nowhere else on the site.
    document.querySelectorAll('[data-verb="settle"]').forEach(function (grid) {
        onScroll(grid.children, {
            trigger: grid,
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: 'back.out(1.4)',
            stagger: 0.08
        });
    });

    // Cells tilt up from below, hinged on their bottom edge.
    document.querySelectorAll('[data-verb="tilt"]').forEach(function (grid) {
        onScroll(grid.children, {
            trigger: grid,
            rotateX: -34,
            y: 30,
            opacity: 0,
            transformOrigin: 'center bottom',
            duration: 0.75,
            ease: 'power3.out',
            stagger: 0.07
        });
    });

    // Chips populate fast and tight — noticeably quicker than any other
    // entrance, which is what keeps a dense list from feeling slow to arrive.
    document.querySelectorAll('[data-verb="chips"]').forEach(function (row) {
        onScroll(row.children, {
            trigger: row,
            y: 12,
            opacity: 0,
            duration: 0.32,
            ease: 'power2.out',
            stagger: 0.02
        });
    });

    // One card is *placed* — it arrives rotated and slightly small, then settles
    // flat, as though set down on the one beneath it.
    document.querySelectorAll('[data-verb="place"]').forEach(function (el) {
        onScroll(el, {
            rotate: 2.4,
            scale: 0.96,
            y: 30,
            opacity: 0,
            duration: 0.9,
            ease: 'power3.out'
        });
    });

    // The closing section is the calmest on the page: nothing overshoots,
    // nothing rotates.
    document.querySelectorAll('[data-verb="calm"]').forEach(function (el) {
        onScroll(el.children, {
            trigger: el,
            y: 16,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.1
        });
    });

    /* =========================================================================
       RAIL
       The line draws on scrub while the rows enter from alternating sides.
       ====================================================================== */

    var rail = document.querySelector('.rail');

    if (rail) {
        var line = rail.querySelector('.rail__line');

        if (line) {
            gsap.fromTo(
                line,
                { scaleY: 0 },
                {
                    scaleY: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: rail,
                        start: 'top 74%',
                        end: 'bottom 62%',
                        scrub: 0.4
                    }
                }
            );
        }

        Array.prototype.forEach.call(rail.querySelectorAll('.rail__row'), function (
            row,
            i
        ) {
            gsap.from(row, {
                x: i % 2 === 0 ? -26 : 26,
                opacity: 0,
                duration: 0.55,
                ease: 'power2.out',
                scrollTrigger: { trigger: row, start: 'top 90%' }
            });
        });
    }
})();
