// ================================
// DOM ELEMENTS CACHE
// ================================
const elements = {
	hamburger: document.querySelector(".hamburger"),
	mobileMenu: document.getElementById("mobileMenu"),
	nav: document.querySelector("nav"),
	contactForm: document.getElementById("contactForm"),
	contactSuccess: document.getElementById("contactSuccess"),
	desktopInput: document.getElementById("searchInput"),
	mobileInput: document.getElementById("mobileSearchInput"),
	searchContainer: document.querySelector(".search-container"),
	mobileSearch: document.querySelector(".mobile-search"),
	mobileNavLinks: document.querySelectorAll(".mobile-nav-links a"),
};

let destinationsData = null;

// ================================
// UTILITY FUNCTIONS
// ================================

// ----------------- DEBOUNCE -----------------
const debounce = function (func, delay = 300) {
	let timeoutId;
	return function () {
		const args = arguments;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
};

const isMobile = () => window.matchMedia("(max-width: 968px)").matches;

// ================================
// MOBILE MENU TOGGLE
// ================================
const toggleMenu = () => {
	elements.hamburger?.classList.toggle("active");
	elements.mobileMenu?.classList.toggle("active");
};

// Setup hamburger click
elements.hamburger?.addEventListener("click", toggleMenu);

// Close mobile menu when clicking nav links
elements.mobileNavLinks.forEach((link) => {
	link.addEventListener("click", () => {
		if (elements.mobileMenu?.classList.contains("active")) {
			toggleMenu();
		}
	});
});

// Close mobile menu when clicking outside
document.addEventListener("click", (event) => {
	if (!elements.nav || !elements.mobileMenu || !elements.hamburger) return;

	const isClickInsideNav = elements.nav.contains(event.target);
	const isClickInsideMenu = elements.mobileMenu.contains(event.target);

	if (
		!isClickInsideNav &&
		!isClickInsideMenu &&
		elements.mobileMenu.classList.contains("active")
	) {
		elements.mobileMenu.classList.remove("active");
		elements.hamburger.classList.remove("active");
	}
});

// ================================
// CONTACT FORM
// ================================
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateField = (field) => {
	const value = field.value.trim();
	const group = field.closest(".form-group");
	if (!group) return true;

	const isValid = value && (field.type !== "email" || emailPattern.test(value));
	group.classList.toggle("error", !isValid);
	return isValid;
};

const validateForm = (form) => {
	const fields = form.querySelectorAll("input, textarea");
	return [...fields].every(validateField);
};

const resetForm = (form, successMsg) => {
	form.reset();
	form.style.display = "block";
	successMsg.hidden = true;
	successMsg.classList.remove("show");
	form.querySelectorAll(".form-group").forEach((g) => g.classList.remove("error"));
};

const initContactForm = () => {
	const { contactForm, contactSuccess } = elements;
	if (!contactForm || !contactSuccess) return;

	contactForm.addEventListener("submit", (e) => {
		e.preventDefault();

		if (!validateForm(contactForm)) {
			if (typeof showToast === "function") {
				showToast("Please fill in all fields correctly", true);
			}
			return;
		}

		contactForm.style.display = "none";
		contactSuccess.hidden = false;
		contactSuccess.classList.add("show");

		if (typeof showToast === "function") {
			showToast("Message sent successfully! ✓");
		}

		setTimeout(() => resetForm(contactForm, contactSuccess), 2000);
	});

	// Live validation
	contactForm.querySelectorAll("input, textarea").forEach((field) => {
		field.addEventListener("input", () => validateField(field));
	});
};

initContactForm();

// ================================
// SEARCH FUNCTIONALITY
// ================================

// ----------------- DATA LOADING -----------------
const loadDestinations = async () => {
	try {
		const res = await fetch("wanderlust_api.json");
		if (!res.ok) throw new Error("Error loading data");
		return await res.json();
	} catch (err) {
		console.error("Error:", err);
		return null;
	}
};

const flattenDestinations = (data) => {
	return [].concat(
		data.countries.flatMap((c) => c.cities),
		data.temples,
		data.beaches
	);
};

const filterDestinations = (term, destinations) => {
	const t = term.toLowerCase().trim();
	if (t.length < 2) return [];
	return destinations.filter(
		(d) => d.name.toLowerCase().includes(t) || d.description.toLowerCase().includes(t)
	);
};

// ----------------- CONTAINER MANAGEMENT -----------------
const getSuggestionsContainer = () => {
	return isMobile()
		? document.querySelector(".mobile-suggestions-container")
		: document.getElementById("suggestionsContainer");
};

const createSuggestionsContainer = () => {
	const { searchContainer, mobileSearch } = elements;
	if (!searchContainer && !mobileSearch) return false;

	// Desktop container
	if (searchContainer && !document.getElementById("suggestionsContainer")) {
		const div = document.createElement("div");
		div.id = "suggestionsContainer";
		div.className = "suggestions-container";
		searchContainer.parentElement.insertBefore(div, searchContainer.nextSibling);
	}

	// Mobile container
	if (mobileSearch && !document.querySelector(".mobile-suggestions-container")) {
		const div = document.createElement("div");
		div.className = "mobile-suggestions-container";
		mobileSearch.appendChild(div);
	}
	return true;
};

const hideSuggestions = () => {
	const containers = [
		document.getElementById("suggestionsContainer"),
		document.querySelector(".mobile-suggestions-container"),
	];

	containers.forEach((container) => {
		if (container) {
			container.style.display = "none";
			container.innerHTML = "";
		}
	});

	if (!elements.mobileMenu?.classList.contains("active")) {
		document.body.style.overflow = "auto";
	}
};

// ----------------- DISPLAY SUGGESTIONS -----------------
const displaySuggestions = (suggestions, showNoResults = false) => {
	const container = getSuggestionsContainer();
	if (!container) return;

	if (!suggestions.length) {
		if (!showNoResults) {
			container.style.display = "none";
			return;
		}
		container.style.display = "block";
		container.innerHTML = `
			<div class="suggestion-item no-results">
				<p>No results found.</p>
			</div>
		`;
		return;
	}

	container.innerHTML = suggestions
		.map(
			(dest) => `
			<div class="suggestion-item" data-destination='${JSON.stringify(dest)}'>
				<img src="${dest.imageUrl}" alt="${dest.name}" class="suggestion-image">
				<div class="suggestion-content">
					<h4>${dest.name}</h4>
					<p>${dest.description}</p>
				</div>
			</div>`
		)
		.join("");

	container.style.display = "block";

	document.body.style.overflow = "hidden";

	container.querySelectorAll(".suggestion-item").forEach((item) => {
		item.addEventListener("click", () => {
			const destData = JSON.parse(item.dataset.destination);
			sessionStorage.setItem("selectedDestination", JSON.stringify(destData));
			document.body.style.overflow = "auto";
			window.location.href = "destination.html";
		});
	});
};

// ----------------- SEARCH ACTIONS -----------------
const performSearch = (inputElement) => {
	if (!inputElement?.value.trim()) return;

	console.log("Performing search for:", inputElement.value);
	const filtered = filterDestinations(inputElement.value, destinationsData);
	displaySuggestions(filtered.slice(0, 5), true);
};

const clearSearch = (inputElement) => {
	if (!inputElement) return;

	inputElement.value = "";
	hideSuggestions();
	console.log("Search cleared");
};

// ----------------- SETUP -----------------
const setupButtons = (searchBtn, clearBtn, input) => {
	searchBtn?.addEventListener("click", () => performSearch(input));
	clearBtn?.addEventListener("click", () => clearSearch(input));
};

const setupSearchInputs = (destinations) => {
	destinationsData = destinations;

	const { desktopInput, mobileInput } = elements;

	// Input live filtering con debounce
	[desktopInput, mobileInput].filter(Boolean).forEach((input) => {
		input.addEventListener(
			"input",
			debounce((e) => {
				const filtered = filterDestinations(e.target.value, destinationsData);
				displaySuggestions(filtered.slice(0, 5), false);
			}, 300)
		);

		input.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				hideSuggestions();
			}
		});
	});

	// Setup buttons
	setupButtons(
		document.getElementById("desktopSearchBtn"),
		document.getElementById("desktopClearBtn"),
		desktopInput
	);

	setupButtons(
		document.getElementById("mobileSearchBtn"),
		document.getElementById("mobileClearBtn"),
		mobileInput
	);
};

const setupClickOutside = () => {
	document.addEventListener("click", (e) => {
		const { searchContainer, mobileSearch } = elements;
		const desktopSuggestions = document.getElementById("suggestionsContainer");
		const mobileSuggestions = document.querySelector(".mobile-suggestions-container");

		const clickedOutside = ![
			searchContainer,
			mobileSearch,
			desktopSuggestions,
			mobileSuggestions,
		].some((el) => el?.contains(e.target));

		if (clickedOutside) hideSuggestions();
	});
};

// ----------------- INIT -----------------
const initSearch = async () => {
	if (!createSuggestionsContainer()) return;

	const data = await loadDestinations();
	if (!data) return;

	const allDestinations = flattenDestinations(data);
	setupSearchInputs(allDestinations);
	setupClickOutside();
};

initSearch();
