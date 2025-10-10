// ================================
// DESTINATION PAGE HANDLER
// ================================

const elements = {
	spinner: document.getElementById("loadingSpinner"),
	content: document.getElementById("destinationContent"),
	image: document.getElementById("destinationImage"),
	title: document.getElementById("destinationTitle"),
	description: document.getElementById("destinationDescription"),
	planTripBtn: document.getElementById("planTripBtn"),
	exploreBtn: document.getElementById("exploreBtn"),
};

// ================================
// UTILITY FUNCTIONS
// ================================

// ----------------- Show loading spinner -----------------
const showLoading = () => {
	if (elements.spinner) elements.spinner.style.display = "flex";
	if (elements.content) elements.content.style.display = "none";
};

// ----------------- Hide loading spinner and show content -----------------
const hideLoading = () => {
	if (elements.spinner) elements.spinner.style.display = "none";
	if (elements.content) elements.content.style.display = "block";
};

// ----------------- Get destination data from sessionStorage or search in API -----------------
const getDestinationData = async () => {
	// Try to get from sessionStorage first (set from search)
	const storedData = sessionStorage.getItem("selectedDestination");
	if (storedData) {
		sessionStorage.removeItem("selectedDestination");
		return JSON.parse(storedData);
	}

	// If no stored data, try to get from URL parameters
	const urlParams = new URLSearchParams(window.location.search);
	const destinationName = urlParams.get("name");

	if (!destinationName) {
		return null;
	}

	// Load from API
	try {
		const response = await fetch("wanderlust_api.json");
		if (!response.ok) throw new Error("Failed to load destinations");

		const data = await response.json();

		// Flatten all destinations
		const allDestinations = [].concat(
			data.countries.flatMap((c) => c.cities),
			data.temples,
			data.beaches
		);

		// Find matching destination
		return allDestinations.find(
			(dest) => dest.name.toLowerCase() === destinationName.toLowerCase()
		);
	} catch (error) {
		console.error("Error loading destination:", error);
		return null;
	}
};

// ----------------- Populate page with destination data -----------------

const populateDestination = (destination) => {
	if (!destination) return;

	// Set image
	elements.image?.setAttribute("src", destination.imageUrl);
	elements.image?.setAttribute("alt", destination.name);

	// Set title
	if (elements.title) {
		elements.title.textContent = destination.name;
	}

	// Set description
	if (elements.description) {
		elements.description.textContent = destination.description;
	}

	// Update page title
	document.title = `${destination.name} - Wanderlust`;

	hideLoading();
};

// ================================
// INITIALIZATION
// ================================

// ----------------- Setup button event listeners -----------------
const setupButtons = () => {
	if (elements.planTripBtn) {
		elements.planTripBtn.addEventListener("click", () => {
			window.location.href = "contact.html";
		});
	}

	if (elements.exploreBtn) {
		elements.exploreBtn.addEventListener("click", () => {
			window.location.href = "index.html";
		});
	}
};

//----------------- Initialize destination page -----------------
const initDestinationPage = async () => {
	showLoading();

	try {
		const destination = await getDestinationData();
		populateDestination(destination);
		setupButtons();
	} catch (error) {
		console.error("Error initializing destination page:", error);
		hideLoading();
	}
};

// ----------------- Start initialization when DOM is ready -----------------
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initDestinationPage);
} else {
	initDestinationPage();
}
