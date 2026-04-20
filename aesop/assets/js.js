
(function () {
	'use strict';

	let fables = [];
	let currentIndex = 0;

	function updateElementsForFable(fable) {
		const card = document.getElementById('fableCard');
		if (!card) {
			console.warn('#fableCard not found in DOM');
			return;
		}

		const titleEl = card.querySelector('.js-fable-title');
		if (titleEl && fable.title !== undefined) titleEl.textContent = fable.title;

		const imgEl = card.querySelector('.js-fable-image');
		if (imgEl) {
			// If the fable image is explicitly null, clear any existing image/alt and hide the element
			if (fable.image === null) {
				if (imgEl.tagName === 'IMG') {
					imgEl.removeAttribute('src');
					imgEl.alt = '';
				} else {
					imgEl.style.backgroundImage = '';
				}
				imgEl.style.display = 'none';
			} else if (fable.image) {
				// Set image and ensure the element is visible
				if (imgEl.tagName === 'IMG') {
					imgEl.src = fable.image;
					if (fable.imageAlt !== undefined) imgEl.alt = fable.imageAlt || '';
					else if (fable.title) imgEl.alt = fable.title;
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
			const hasHtml = /<[^>]+>/.test(fable.content);
			if (hasHtml) bodyEl.innerHTML = fable.content;
			else bodyEl.textContent = fable.content;
		}

		const backEl = card.querySelector('.js-fable-comment');
		if (backEl && fable.comment !== undefined) backEl.innerHTML = fable.comment;
	}

	async function loadFables() {
		const url = 'assets/fables.json';
		try {
			const res = await fetch(url, { cache: 'no-store' });
			if (!res.ok) {
				console.warn('Failed to fetch', url, res.status);
				return;
			}

			let data;
			try {
				data = await res.json();
			} catch (err) {
				console.warn('fables.json is empty or invalid JSON');
				return;
			}

			// Normalize to an array of fables
			if (Array.isArray(data) && data.length) fables = data;
			else if (data && typeof data === 'object') {
				if (Array.isArray(data.fables) && data.fables.length) fables = data.fables;
				else fables = [data];
			} else fables = [];

			if (!fables.length) {
				console.warn('No fables found in', url);
				return;
			}

			currentIndex = 0;
			updateElementsForFable(fables[currentIndex]);
		} catch (err) {
			console.error('Error loading fables:', err);
		}
	}

	function setupControls() {
		const nextBtn = document.querySelector('.js-fable-next') || document.getElementById('nextFable');
		const prevBtn = document.querySelector('.js-fable-prev') || document.getElementById('prevFable');

		if (nextBtn) {
			nextBtn.addEventListener('click', function () {
				if (!fables.length) return;
				currentIndex = (currentIndex + 1) % fables.length;
				updateElementsForFable(fables[currentIndex]);
			});
		}

		if (prevBtn) {
			prevBtn.addEventListener('click', function () {
				if (!fables.length) return;
				currentIndex = (currentIndex - 1 + fables.length) % fables.length;
				updateElementsForFable(fables[currentIndex]);
			});
		}
	}

	function init() {
		loadFables();
		setupControls();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();

})();

