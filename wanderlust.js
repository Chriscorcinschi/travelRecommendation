// MOBILE MENU TOGGLE
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

	// Check if click is outside both nav and mobile menu
	if (!nav.contains(event.target) && !mobileMenu.contains(event.target)) {
		mobileMenu.classList.remove("active");
		hamburger.classList.remove("active");
	}
});

// CONTACT FORM
document.addEventListener("DOMContentLoaded", () => {
	const contactForm = document.getElementById("contactForm");
	const contactSuccess = document.getElementById("contactSuccess");

	if (!contactForm || !contactSuccess) return;

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
});
