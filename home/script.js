const asciiImage = document.querySelector(".ascii-section img");

// Add click event listener for glitch effect
asciiImage.addEventListener("click", () => {
    asciiImage.style.animation = "glitch 0.5s"; // Apply the glitch animation
    setTimeout(() => {
        asciiImage.style.animation = ""; // Remove the animation after it finishes
    }, 500); // Match the duration of the animation
});
