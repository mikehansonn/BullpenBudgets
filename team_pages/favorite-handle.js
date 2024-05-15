function changeStar() {
    var blackID = document.getElementById('blackID');
    var fillID = document.getElementById('fillID');

    if(window.getComputedStyle(blackID).display === 'none') {
        blackID.style.display = 'block';
        fillID.style.display = 'none';
        checkTeam();
    }
    else {
        blackID.style.display = 'none';
        fillID.style.display = 'block';
        checkTeam();
    }

    var starHolder = document.getElementById('starHolder');
    starHolder.classList.add('clicked');
    setTimeout(function() {
        starHolder.classList.remove('clicked');
    }, 100);

    //reset the favorite bar
    var favoriteBar = document.querySelector(".favorite-bar");
    favoriteBar.innerHTML = "";
    var favoriteBar2 = document.querySelector(".favorite-bar2");
    favoriteBar2.innerHTML = "";
    startRender();
}

function getPageName() {
    var path = window.location.href;
    var segments = path.split('/');
    var lastSegment = segments.pop();
    var fileName = lastSegment.split('=')[1];

    return fileName;
}

function checkTeam() {
    var name = getPageName();
    var str = localStorage.getItem("fav");
    const array = str.split(",");
    var index = arrayIndex(getPageName());

    if (index != -1) {
        array.splice(index, 1);
    }
    else {
        if(array.length > 10) {
            alert("Max 10 favorites");
            return;
        }
        array.push(name);
    }
    localStorage.setItem("fav", array);
}

function arrayIndex(name) {
    var str = localStorage.getItem("fav");
    const array = str.split(",");
    var index = -1;

    for(var i = 0; i < array.length; i++) {
        if(array[i] === name) {
            index = i;
            break;
        }
    }

    return index;
}
