const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

// Define the galleries for each show
const galleries = [
    [
        "../theatre/theatreimages/cabaret1.jpg",
        "../theatre/theatreimages/cabaret2.jpg",
        "../theatre/theatreimages/cabaret3.jpg",
        "../theatre/theatreimages/cabaret4.jpg",
    ],
    [
        "../theatre/theatreimages/attempts1.jpg",
        "../theatre/theatreimages/attempts2.jpg",
        "../theatre/theatreimages/attempts3.jpg",
        "../theatre/theatreimages/attempts4.jpg",
    ],
    [
        "../theatre/theatreimages/macbeth1.jpg",
        "../theatre/theatreimages/macbeth2.jpg",
        "../theatre/theatreimages/macbeth3.jpg",
        "../theatre/theatreimages/macbeth4.jpg",
    ],
];

// Open the modal and populate it with the corresponding gallery
function openModal(index) {
    const galleryImages = galleries[index];

    // Clear any previous content
    modalContent.innerHTML = "";

    // Add images dynamically to the modal
    galleryImages.forEach((imgSrc) => {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = "Gallery Image";
        modalContent.appendChild(img);
    });

    // Show the modal
    modal.style.display = "flex";
}

// Close the modal
function closeModal() {
    modal.style.display = "none";
}
