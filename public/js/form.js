function Toggle() {
    var showpassword = document.getElementById("tog");
    if (showpassword.type === "password") {
        showpassword.type = "text";
    } else {
        showpassword.type = "password";
    }
}