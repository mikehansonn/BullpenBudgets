
function clearFavorites() {
    var favoriteBar = document.querySelector(".favorite-bar");
    var favoriteBar2 = document.querySelector(".favorite-bar2");
    favoriteBar.innerHTML = "";
    favoriteBar2.innerHTML = "";
    localStorage.setItem("fav", "");
}

function sortFavorites() {
    var nameMap = getNameMap();
    var newArray = [""];

    for (let [key, value] of nameMap) {
        if(arrayIndex(key) != -1) {
            newArray.push(key);
        }
    }

    localStorage.setItem("fav", newArray);

    var favoriteBar = document.querySelector(".favorite-bar");
    var favoriteBar2 = document.querySelector(".favorite-bar2");
    favoriteBar.innerHTML = "";
    favoriteBar2.innerHTML = "";
    startRender();
}