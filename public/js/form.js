// function Toggle() {
//     var showpassword = document.getElementById("tog");
//     if (showpassword.type === "password") {
//         showpassword.type = "text";
//     } else {
//         showpassword.type = "password";
//     }
// }

document.getElementById('form').addEventListener('submit', function(event) {
    // Prevent form submission if validation fails
    event.preventDefault();

    // Get form values
    let username = document.querySelector('input[name="username"]').value;
    let fullname = document.querySelector('input[name="fullname"]').value;
    let phone = document.querySelector('input[name="phone"]').value;
    let description = document.querySelector('textarea[name="description"]').value;
    let email = document.querySelector('input[name="email"]').value;
    let secretCode = document.querySelector('input[name="secretCode"]').value;
    let password = document.querySelector('input[name="password"]').value;
    let password2 = document.querySelector('input[name="password2"]').value;
    let image = document.querySelector('input[name="image"]').files[0];

    // Validate username
    if (!username) {
        alert('Please enter a username');
        return;
    }

    // Validate fullname
    if (!fullname) {
        alert('Please enter your full name');
        return;
    }

    // Validate telephone (assuming it's a simple number)
    let phonePattern = /^[0-9]+$/;
    if (!phone || !phone.match(phonePattern)) {
        alert('Please enter a valid phone number');
        return;
    }

    // Validate profile description
    if (!description) {
        alert('Please provide a profile description');
        return;
    }

    // Validate email format
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email || !email.match(emailPattern)) {
        alert('Please enter a valid email address');
        return;
    }

    // Validate admin code (should be a number)
    if (!secretCode || isNaN(secretCode)) {
        alert('Please enter a valid admin code');
        return;
    }

    // Validate password
    if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    // Validate password confirmation
    if (password !== password2) {
        alert('Passwords do not match');
        return;
    }

    // Validate profile picture
    if (!image) {
        alert('Please upload a profile picture');
        return;
    }

    // If all validations pass, submit the form
    // alert('Form is valid! Submitting...');
    document.getElementById('form').submit();
});
