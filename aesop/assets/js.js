
(function () {
    'use strict';

    let fables = [];
    let currentIndex = 0;
    let loadingPromise = null;

    function updateElementsForFable(fable, index) {
        const card = document.getElementById('fableCard');
        if (!card) {
            console.warn('#fableCard not found in DOM');
            return;
        }

        const titleEl = card.querySelector('.js-fable-title');
        if (titleEl && fable.title !== undefined) titleEl.textContent = fable.title;

        const imgEl = card.querySelector('.js-fable-image');
        const imgCaption = card.querySelector('.js-fable-caption');
        if (imgEl) {
            // If the fable image is explicitly null, clear any existing image/alt and hide the element
            if (fable.image === null) {
                if (imgEl.tagName === 'IMG') {
                    imgEl.removeAttribute('src');
                    imgEl.alt = '';
                    imgCaption.textContent = '';
                } else {
                    imgEl.style.backgroundImage = '';
                }
                imgEl.style.display = 'none';
            } else if (fable.image) {
                // Set image and ensure the element is visible
                if (imgEl.tagName === 'IMG') {
                    imgEl.src = fable.image;
                    if (fable.imageAlt !== undefined) {
                        imgEl.alt = fable.imageAlt || '';
                        imgCaption.textContent = fable.imageAlt || '';
                    } else if (fable.title) {
                        imgEl.alt = fable.title;
                        imgCaption.textContent = fable.title;
                    }
                } else {
                    imgEl.style.backgroundImage = `url("${fable.image}")`;
                }
                imgEl.style.display = '';
            }
        }

        const captionEl = card.querySelector('.js-fable-caption');
        if (captionEl && fable.caption !== undefined) captionEl.textContent = fable.caption;

        const bodyEl = card.querySelector('.js-fable');
        if (bodyEl && fable.content !== undefined) {
            let bodyElClasses = ['fables-active'];

            // content may contain HTML (we expect simple paragraph markup);
            // render it as HTML so callers can include <p> or other simple tags.
            bodyEl.innerHTML = fable.content;


            if (index === 0) {
                bodyElClasses.push('first-fable');
            }

            if (index === fables.length - 1) {
                bodyElClasses.push('last-fable');
            }

            bodyEl.classList.remove('first-fable', 'last-fable');
            bodyEl.classList.add(...bodyElClasses);
        }

        const backEl = card.querySelector('.js-fable-comment');
        if (backEl && fable.comment !== undefined) backEl.innerHTML = fable.comment;
    }

    async function fetchFables() {
        if (loadingPromise) return loadingPromise;
        const url = 'assets/fables.json';
        loadingPromise = (async () => {
            try {
                const res = await fetch(url, { cache: 'no-store' });
                if (!res.ok) {
                    console.warn('Failed to fetch', url, res.status);
                    return [];
                }

                let data;
                try {
                    data = await res.json();
                } catch (err) {
                    console.warn('fables.json is empty or invalid JSON');
                    return [];
                }

                // Normalize to an array of fables
                if (Array.isArray(data) && data.length) fables = data;
                else if (data && typeof data === 'object') {
                    if (Array.isArray(data.fables) && data.fables.length) fables = data.fables;
                    else fables = [data];
                } else fables = [];

                if (!fables.length) {
                    console.warn('No fables found in', url);
                    return [];
                }

                // Prepare menu now that we have fables (menu DOM created earlier in init())
                if (fables.length) {
                    populateMenu();
                }

                return fables;
            } catch (err) {
                console.error('Error loading fables:', err);
                return [];
            } finally {
                loadingPromise = null;
            }
        })();
        return loadingPromise;
    }


    // Show a specific fable by zero-based index. Ensures fables are loaded.
    async function showFableByIndex(index, opts) {
        opts = opts || {};
        const updateHistory = opts.updateHistory !== false; // default true
        const replaceState = !!opts.replace;
        const list = await fetchFables();
        if (!list || !list.length) return;
        index = Math.max(0, Math.min(index, fables.length - 1));
        currentIndex = index;
        updateElementsForFable(fables[currentIndex], currentIndex);
        // update URL/history (use 1-based f param for readability)
        if (updateHistory) {
            const url = new URL(window.location.href);
            url.hash = 'f=' + String(currentIndex + 1);
            const state = { fIndex: currentIndex };
            if (replaceState) history.replaceState(state, '', url.toString());
            else history.pushState(state, '', url.toString());
        }
    }

    function ensureMenu() {
        const toggle = document.getElementById('fableMenuToggle');
        toggle.addEventListener('click', function () {
            const menu = document.getElementById('fableMenu');
            menu.classList.toggle('fable__menu--active');
            // update aria attribute; CSS should show/hide based on the class
            menu.setAttribute('aria-hidden', menu.classList.contains('fable__menu--active'));
        });
    }

    function populateMenu() {
        const nav = document.getElementById('fableMenu');
        if (!nav) return;
        nav.innerHTML = '';
        const ul = document.createElement('ul');
        fables.forEach(function (fb, i) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#f=' + (i + 1);
            a.textContent = fb.title || ('Fable ' + (i + 1));
            a.addEventListener('click', function (e) {
                e.preventDefault();
                showFableByIndex(i, { updateHistory: true });
                // remove active class after selection; CSS should hide it
                nav.classList.remove('fable__menu--active');
                nav.setAttribute('aria-hidden', 'true');
            });
            li.appendChild(a);
            ul.appendChild(li);
        });
        nav.appendChild(ul);
    }

    // Handle back/forward navigation and manual hash changes
    function handleNavigationEvent(e) {
        let idx = null;
        if (e && e.state && typeof e.state.fIndex === 'number') idx = e.state.fIndex;
        // parse hash like #f=12
        const h = (window.location.hash || '').replace(/^#/, '');
        const m = h.match(/^f=(\d+)$/);
        if (m) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n)) idx = n - 1;
        }
        if (idx !== null) {
            showFableByIndex(idx, { updateHistory: false });
        }
    }
    window.addEventListener('popstate', handleNavigationEvent);
    window.addEventListener('hashchange', handleNavigationEvent);

    function setupControls() {
        const nextBtn = document.querySelector('.js-fable-next') || document.getElementById('nextFable');
        const prevBtn = document.querySelector('.js-fable-prev') || document.getElementById('prevFable');

        if (nextBtn) {
                nextBtn.addEventListener('click', async function () {
                    if (!fables.length) {
                        const loaded = await fetchFables();
                        if (!loaded || !loaded.length) return;

                        // show the first fable
                        showFableByIndex(0, { updateHistory: true });
                        return;
                    }
                    const nextIndex = (currentIndex + 1) % fables.length;
                    showFableByIndex(nextIndex, { updateHistory: true });
            });
        }

        if (prevBtn) {
                prevBtn.addEventListener('click', function () {
                    if (!fables.length) return;
                    const prevIndex = (currentIndex - 1 + fables.length) % fables.length;
                    showFableByIndex(prevIndex, { updateHistory: true });
            });
        }
    }

    function init() {
        // Do not fetch fables on page load; show default content.
        // Fables will be fetched when the user clicks 'Next'.
        setupControls();
        // Ensure the menu toggle/nav DOM exists immediately so it's available on first paint.
        ensureMenu();

        // Prefetch fables so the menu can be populated immediately (does not render a fable).
        fetchFables();

        // If the URL contains a bookmarked fable (#f=N), load that fable now.
        const hash = (window.location.hash || '').replace(/^#/, '');
        const m = hash.match(/^f=(\d+)$/);
        if (m) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n)) {
                (async () => {
                    const loaded = await fetchFables();
                    if (!loaded || !loaded.length) return;
                    populateMenu();
                    const idx = Math.max(0, Math.min(n - 1, fables.length - 1));
                    showFableByIndex(idx, { updateHistory: true, replace: true });
                })();
            }
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();

