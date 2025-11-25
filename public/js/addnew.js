

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form');
    
    form.addEventListener('submit', function(event) {
        const category = form.querySelector('select[name="category"]');
        const name = form.querySelector('input[name="name"]');
        const price = form.querySelector('input[name="price"]');
        const imageInput = form.querySelector('input[name="image"]');
        const description = form.querySelector('textarea[name="description"]');

        if (!category.value) {
            alert("Please select a category.");
            event.preventDefault();
            return;
        }

        if (!name.value.trim()) {
            alert("Please enter the product's name.");
            event.preventDefault();
            return;
        }

        // Price validation only for "product" posts
        if (category.value !== "Agricultural talk") {
            const priceValue = parseFloat(price.value);
            if (isNaN(priceValue) || priceValue <= 0) {
                alert("Please enter a valid price.");
                event.preventDefault();
                return;
            }
        }

        const files = imageInput.files;
        if (files.length !== 3) {
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
