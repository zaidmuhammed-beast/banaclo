/* ECONSCO: mobile menu and reveal-on-scroll. */
(function () {
	document.documentElement.classList.add('js');

	var toggle = document.querySelector('.nav-toggle');
	var nav = document.getElementById('site-nav');
	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			var open = toggle.getAttribute('aria-expanded') === 'true';
			toggle.setAttribute('aria-expanded', String(!open));
			nav.classList.toggle('is-open', !open);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && nav.classList.contains('is-open')) {
				toggle.setAttribute('aria-expanded', 'false');
				nav.classList.remove('is-open');
				toggle.focus();
			}
		});
	}

	// Live local time for each office.
	var clocks = document.querySelectorAll('time[data-tz]');
	function tick() {
		var now = new Date();
		clocks.forEach(function (el) {
			try {
				el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: el.getAttribute('data-tz') });
			} catch (e) {}
		});
	}
	if (clocks.length) {
		tick();
		setInterval(tick, 30000);
	}

	var items = document.querySelectorAll('.reveal');
	if (!('IntersectionObserver' in window)) {
		items.forEach(function (el) { el.classList.add('is-visible'); });
		return;
	}
	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('is-visible');
				io.unobserve(entry.target);
			}
		});
	}, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
	items.forEach(function (el) { io.observe(el); });
})();
