const newsletterForm = document.getElementById("newsletter-form");
const newsletterNote = document.getElementById("newsletter-note");

newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterNote.textContent = "Newsletter signup is not connected yet. Your email was not sent or stored.";
    newsletterNote.classList.add("newsletter-note-warning");
    newsletterForm.reset();
});
