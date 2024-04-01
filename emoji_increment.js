function changeStar() {
    var starSVG = document.querySelector('.star');

    if (starSVG.getAttribute('fill') === '#222203') {
        starSVG.setAttribute('fill', '#f0e389'); // Change fill color to gold or any other color you prefer
    } else {
        starSVG.setAttribute('fill', '#222203'); // Change fill color back to original color
    }
}