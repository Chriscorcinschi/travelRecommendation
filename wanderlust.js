const toggleMenu = () => {
	const hamburger = document.querySelector(".hamburger");
	const mobileMenu = document.getElementById("mobileMenu");
	hamburger.classList.toggle("active");
	mobileMenu.classList.toggle("active");
};

// Close mobile menu when clicking outside
document.addEventListener("click", (event) => {
	const mobileMenu = document.getElementById("mobileMenu");
	const hamburger = document.querySelector(".hamburger");
	const nav = document.querySelector("nav");

	if (!nav.contains(event.target) && !mobileMenu.contains(event.target)) {
		mobileMenu.classList.remove("active");
		hamburger.classList.remove("active");
	}
});
