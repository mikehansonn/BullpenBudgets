function dropdown() {
    document.getElementById("favoriteList").classList.toggle("show");
}
  
window.onclick = function(event) {
    if (!event.target.matches('.mobile-hamburger')) {
        var dropdowns = document.getElementsByClassName("favorite-bar2");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}