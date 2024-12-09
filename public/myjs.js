var imgs = document.querySelectorAll(".slider img");
var dots = document.querySelectorAll(".dot");
var currentImg = 0;
// const interval = 3000;

// Auto change slide every 3 seconds
// setInterval(function () {
//     currentImg = (currentImg + 1) % imgs.length; // Loop back to the first image after the last one
//     changeSlide(currentImg);
// }, interval);

// Change slide when clicking on a dot
dots.forEach((dot, index) => {
    dot.addEventListener("click", function() {
        changeSlide(index); // Change to the corresponding image
    });
});

function changeSlide(n) {
    // Hide all images and remove active class from all dots
    imgs.forEach((img, index) => {
        img.classList.remove("active");
        dots[index].classList.remove("active");
    });

    // Show the selected image and set the corresponding dot as active
    imgs[n].classList.add("active");
    dots[n].classList.add("active");
}




function Toggle() {
    var showpassword = document.getElementById("tog");
    if(showpassword.type === "password"){
        showpassword.type = "text";
    }
    else{
        showpassword.type = "password";
    }
};


var show = true;
var parallelBar = document.getElementsByClassName("fa-solid fa-bars")[0];
var navbar_space = document.getElementsByClassName("nav1")[0];
        var collapse = document.getElementsByClassName("para");
        var info = collapse[0];
        info.classList.add("hideContent");
        navbar_space.style.height = '35px'
        show = false;
parallelBar.addEventListener("click", function(){
    if(show){
        info.classList.add("hideContent");
        navbar_space.style.height = '35px'
        show = false;
    }else{
        navbar_space.style.height = "200px"
        show = true;
        info.classList.remove("hideContent");
    }

}

);