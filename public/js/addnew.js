document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form');
    const categorySelect = form.querySelector('select[name="category"]');
    const priceWrapper = document.getElementById('priceWrapper');
    const name = form.querySelector('input[name="name"]');
    const price = form.querySelector('input[name="price"]');
    const imageInput = form.querySelector('input[name="image"]');
    const description = form.querySelector('textarea[name="description"]');

    function togglePriceInput() {
        if (categorySelect.value === "Agricultural talk") {
            priceWrapper.style.display = "none";
        } else {
            priceWrapper.style.display = "block";
        }
    }

    // Run on load
    togglePriceInput();

    // Run when category changes
    categorySelect.addEventListener("change", togglePriceInput);

    form.addEventListener('submit', function(event) {

        if (!categorySelect.value) {
            alert("Please select a category.");
            event.preventDefault();
            return;
        }

        if (!name.value.trim()) {
            alert("Please enter the product's name.");
            event.preventDefault();
            return;
        }

        // Price validation only for non-Agricultural Talk
        if (categorySelect.value !== "Agricultural talk") {
            const priceValue = parseFloat(price.value);
            if (isNaN(priceValue) || priceValue <= 0) {
                alert("Please enter a valid price.");
                event.preventDefault();
                return;
            }
        }

        if (imageInput.files.length !== 3) {
            alert("You must upload exactly 3 images.");
            event.preventDefault();
            return;
        }

        if (!description.value.trim()) {
            alert("Please enter a product description.");
            event.preventDefault();
            return;
        }
    });
});

