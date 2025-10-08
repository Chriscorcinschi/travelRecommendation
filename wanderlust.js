// ================================
// MOBILE MENU TOGGLE
// ================================
const toggleMenu = () => {
	const hamburger = document.querySelector(".hamburger");
	const mobileMenu = document.getElementById("mobileMenu");

	if (!hamburger || !mobileMenu) return;

	hamburger.classList.toggle("active");
	mobileMenu.classList.toggle("active");
};

// Close mobile menu when clicking outside
document.addEventListener("click", (event) => {
	const mobileMenu = document.getElementById("mobileMenu");
	const hamburger = document.querySelector(".hamburger");
	const nav = document.querySelector("nav");

	if (!mobileMenu || !hamburger || !nav) return;

	if (!nav.contains(event.target) && !mobileMenu.contains(event.target)) {
		mobileMenu.classList.remove("active");
		hamburger.classList.remove("active");
	}
});

// ================================
// CONTACT FORM
// ================================
const contactForm = document.getElementById("contactForm");
const contactSuccess = document.getElementById("contactSuccess");

if (contactForm && contactSuccess) {
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const validateField = (field) => {
		const value = field.value.trim();
		const group = field.closest(".form-group");
		if (!group) return true;

		let isValid = true;

		if (!value) {
			isValid = false;
		} else if (field.type === "email" && !emailPattern.test(value)) {
			isValid = false;
		}

		group.classList.toggle("error", !isValid);
		return isValid;
	};

	const validateForm = () => {
		const fields = contactForm.querySelectorAll("input, textarea");
		return Array.from(fields).every((field) => validateField(field));
	};

	const resetForm = () => {
		contactForm.reset();
		contactForm.style.display = "block";
		contactSuccess.hidden = true;
		contactSuccess.classList.remove("show");
		contactForm.querySelectorAll(".form-group").forEach((g) => g.classList.remove("error"));
	};

	contactForm.addEventListener("submit", (e) => {
		e.preventDefault();

		if (!validateForm()) {
			if (typeof showToast === "function") {
				showToast("Please fill in all fields correctly", true);
			}
			return;
		}

		// Hide form and show success message
		contactForm.style.display = "none";
		contactSuccess.hidden = false;
		contactSuccess.classList.add("show");

		if (typeof showToast === "function") {
			showToast("Message sent successfully! ✓");
		}

		setTimeout(resetForm, 2000);
	});

	// Live validation while typing
	contactForm.querySelectorAll("input, textarea").forEach((field) => {
		field.addEventListener("input", () => validateField(field));
	});
}

// ================================
// SEARCH FUNCTIONALITY
// ================================

// ================================
// SEARCH FUNCTIONALITY
// ================================
let destinationsData = null;
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

// SUGGESTIONS CONTAINER

const createSuggestionsContainer = () => {
	const searchContainer = document.querySelector(".search-container");
	if (!searchContainer) return null;

	const div = document.createElement("div");
	div.id = "suggestionsContainer";
	div.className = "suggestions-container";
	searchContainer.parentElement.insertBefore(div, searchContainer.nextSibling);
	return div;
};

// DATA PROCESSING

const flattenDestinations = (data) => [
	...data.countries.flatMap((c) => c.cities),
	...data.temples,
	...data.beaches,
];

const filterDestinations = (term, destinations) => {
	const t = term.toLowerCase().trim();
	if (t.length < 2) return [];
	return destinations.filter(
		(d) => d.name.toLowerCase().includes(t) || d.description.toLowerCase().includes(t)
	);
};

// DISPLAY SUGGESTIONS

const displaySuggestions = (suggestions) => {
	const container = document.getElementById("suggestionsContainer");
	if (!container) return;

	if (!suggestions.length) {
		container.style.display = "none";
		container.innerHTML = "";
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

	document.querySelectorAll(".suggestion-item").forEach((item) => {
		item.addEventListener("click", () => {
			const destData = JSON.parse(item.dataset.destination);
			localStorage.setItem("selectedDestination", JSON.stringify(destData));
			window.location.href = "destination.html";
		});
	});
};

// CLICK OUTSIDE TO HIDE
const setupClickOutside = () => {
	document.addEventListener("click", (e) => {
		const searchContainer = document.querySelector(".search-container");
		const suggestions = document.getElementById("suggestionsContainer");
		if (!searchContainer?.contains(e.target) && !suggestions?.contains(e.target)) {
			if (suggestions) suggestions.style.display = "none";
		}
	});
};

// SEARCH FUNCTIONS
const performSearch = (inputElement) => {
	if (inputElement && inputElement.value.trim()) {
		console.log("Performing search for:", inputElement.value);
		const filtered = filterDestinations(inputElement.value, destinationsData);
		displaySuggestions(filtered.slice(0, 5));
	}
};

// CLEAR FUNCTIONS
const clearSearch = (inputElement) => {
	if (inputElement) {
		inputElement.value = "";
		displaySuggestions([]);
		console.log("Search cleared for input:", inputElement);
	}
};

// SETUP INPUTS AND BUTTONS

const setupSearchInputs = (destinations) => {
	destinationsData = destinations; // save globally

	const desktopInput = document.querySelector(".search-container input");
	const mobileInput = document.getElementById("mobileSearchInput");

	const desktopSearchBtn = document.getElementById("desktopSearchBtn");
	const desktopClearBtn = document.getElementById("desktopClearBtn");

	const mobileSearchBtn = document.getElementById("mobileSearchBtn");
	const mobileClearBtn = document.getElementById("mobileClearBtn");

	// Input live filtering
	[desktopInput, mobileInput].filter(Boolean).forEach((input) => {
		input.addEventListener("input", (e) => {
			const filtered = filterDestinations(e.target.value, destinationsData);
			displaySuggestions(filtered.slice(0, 5));
		});
	});

	// Desktop buttons
	if (desktopSearchBtn && desktopInput) {
		desktopSearchBtn.addEventListener("click", () => performSearch(desktopInput));
	}
	if (desktopClearBtn && desktopInput) {
		desktopClearBtn.addEventListener("click", () => clearSearch(desktopInput));
	}

	// Mobile buttons
	if (mobileSearchBtn && mobileInput) {
		mobileSearchBtn.addEventListener("click", () => performSearch(mobileInput));
	}
	if (mobileClearBtn && mobileInput) {
		mobileClearBtn.addEventListener("click", () => clearSearch(mobileInput));
	}
};

// INIT SEARCH

const initSearch = async () => {
	if (!createSuggestionsContainer()) return;

	const data = await loadDestinations();
	if (!data) return;

	const allDestinations = flattenDestinations(data);
	setupSearchInputs(allDestinations);
	setupClickOutside();
};

// START EVERYTHING

initSearch();
