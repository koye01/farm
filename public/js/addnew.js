<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form');
    
    form.addEventListener('submit', function(event) {
        // Grab the form inputs
        const category = form.querySelector('select[name="category"]');
        const name = form.querySelector('input[name="name"]');
        const price = form.querySelector('input[name="price"]');
        const imageInput = form.querySelector('input[name="image"]');
        const description = form.querySelector('textarea[name="description"]');

        // Validate the category
        if (!category.value) {
            alert("Please select a category.");
            event.preventDefault();
            return;
        }

        // Validate the name
        if (!name.value.trim()) {
            alert("Please enter the product's name.");
            event.preventDefault();
            return;
        }

        // Validate the price (ensure it's a positive number)
        const priceValue = parseFloat(price.value);
        if (isNaN(priceValue) || priceValue <= 0) {
            alert("Please enter a valid price.");
            event.preventDefault();
            return;
        }

        // Validate the image input (must be exactly 3 images)
        const files = imageInput.files;
        if (files.length !== 3) {
            alert("You must upload exactly 3 images.");
            event.preventDefault();
            return;
        }

        // Validate the description
        if (!description.value.trim()) {
            alert("Please enter a product description.");
            event.preventDefault();
            return;
        }
    });
});
=======
function validateForm() {
    // Get the file input element
    var imageInput = document.getElementById('imageInput');
    
    // Check if the number of files selected is not exactly 3
    if (imageInput.files.length !== 3) {
        alert("You must upload exactly 3 images.");
        return false; // Prevent form submission
    }
    return true; // Allow form submission
}
>>>>>>> 19a0e54 (form validation 1)
