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