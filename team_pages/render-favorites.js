window.onload = (event1) => {
    if(localStorage.getItem("fav") == null) {
        localStorage.setItem("fav", '');
    }
    startRender();
};  

function startRender() {
    var str = localStorage.getItem("fav");
    const array = str.split(",");
    var map = getMap();

    for(var i = 1; i < array.length; i++) {
        var img = map.get(array[i]);
        newFavorite(array[i], img);
        newFavorite2(array[i], img);
    }

    if (doesClassNameExist("star-holder")) { //ensure that we are not on the home page
        setStar();
        renderTemplate();
    }
}

function renderTemplate() {
    var name = getPageName();
    var map = getMap();
    var nameMap = getNameMap();
    var img = map.get(name);
    var displayName = nameMap.get(name);
    var teamLogo = document.getElementById('teamLogo');
    var teamName = document.getElementById('teamName');

    teamLogo.src = "logos/" + img;
    teamName.innerHTML = displayName;
}

function doesClassNameExist(className) {
    var elements = document.getElementsByClassName(className);
    return elements.length > 0;
}

function setStar() {
    var index = arrayIndex(getPageName());

    if(index != -1) {
        fillID.style.display = 'block';
        blackID.style.display = 'none';
    }
    else {
        fillID.style.display = 'none';
        blackID.style.display = 'block';
    }
}

// <a href="https://www.google.com/"><div class="favorite-logo-container"><img class="favorite-logo" src="logos/mlb-new-york-yankees-logo-300x300.png"></div></a>
function newFavorite(name, logo) {
    var a = document.createElement("a");
    a.href = `display.html?team=${name}`;
    var div = document.createElement("div");
    div.classList.add("favorite-logo-container");
    var img = document.createElement("img");
    img.classList.add("favorite-logo");
    img.src = "logos/" + logo;
    div.appendChild(img);
    a.appendChild(div);

    var favoriteBar = document.querySelector(".favorite-bar");
    favoriteBar.appendChild(a);
}

function newFavorite2(name, logo) {
    var a = document.createElement("a");
    a.href = `display.html?team=${name}`;
    var div = document.createElement("div");
    div.classList.add("favorite-logo-container");
    var img = document.createElement("img");
    img.classList.add("favorite-logo");
    img.src = "logos/" + logo;
    div.appendChild(img);
    a.appendChild(div);

    var favoriteBar2 = document.querySelector(".favorite-bar2");
    favoriteBar2.appendChild(a);
}

function getMap() {
    var map = new Map([
        [ "diamondbacks"    , "mlb-arizona-diamondbacks-logo-300x300.png"   ],
        [  "braves"    , "mlb-atlanta-braves-logo-300x300.png"        ],   
        [  "orioles"   , "mlb-baltimore-orioles-logo-300x300.png"     ],
        [  "red-sox"   , "mlb-boston-red-sox-logo-300x300.png"        ],
        [  "cubs"      , "mlb-chicago-cubs-logo-300x300.png"          ],
        [  "white-sox" , "mlb-chicago-white-sox-logo-300x300.png"     ],
        [  "reds"      , "mlb-cincinnati-reds-logo-300x300.png"       ],
        [  "guardians" , "mlb-cleveland-guardians-logo-300x300.png"   ],
        [  "rockies"   , "mlb-colorado-rockies-logo-300x300.png"      ],
        [  "tigers"    , "mlb-detroit-tigers-logo-300x300.png"        ],
        [  "astros"    , "mlb-Houston-Astros-Logo-300x300.png"        ],
        [  "royals"    , "mlb-kansas-city-royals-logo-300x300.png"    ],
        [  "angels"    , "mlb-los-angeles-angels-logo-300x300.png"    ],
        [  "dodgers"   , "mlb-los-angeles-dodgers-logo-300x300.png"   ],
        [  "marlins"   , "mlb-miami-marlins-logo-300x300.png"         ],
        [  "brewers"   , "mlb-milwaukee-brewers-logo-300x300.png"     ],
        [  "twins"     , "mlb-minnesota-twins-logo-300x300.png"       ],
        [  "mets"      , "mlb-new-york-mets-logo-300x300.png"         ],
        [  "yankees"   , "mlb-new-york-yankees-logo-300x300.png"      ],
        [  "athletics" , "mlb-oakland-athletics-logo-300x300.png"     ],
        [  "phillies"  , "mlb-Philadelphia-Phillies-Logo-300x300.png" ],
        [  "pirates"   , "mlb-pittsburgh-pirates-logo-300x300.png"    ],
        [  "padres"    , "mlb-san-diego-padres-logo-300x300.png"      ],
        [  "giants"    , "mlb-san-francisco-giants-logo-300x300.png"  ],
        [  "mariners"  , "mlb-seattle-mariners-logo-300x300.png"      ],
        [  "cardinals" , "mlb-st-louis-cardinals-logo-300x300.png"    ],
        [  "rays"      , "mlb-tampa-bay-rays-logo-300x300.png"        ],
        [  "rangers"   , "mlb-texas-rangers-logo-300x300.png"         ],
        [  "blue-jays" , "mlb-toronto-blue-jays-logo-300x300.png"     ],
        [  "nationals" , "mlb-Washington-Nationals-Logo-300x300.png"  ]
        ]);
    return map;
}

function getNameMap() {
    var map = new Map([
        ["diamondbacks", "Arizona Diamondbacks"],
        ["braves", "Atlanta Braves"],
        ["orioles", "Baltimore Orioles"],
        ["red-sox", "Boston Red Sox"],
        ["cubs", "Chicago Cubs"],
        ["white-sox", "Chicago White Sox"],
        ["reds", "Cincinnati Reds"],
        ["guardians", "Cleveland Guardians"],
        ["rockies", "Colorado Rockies"],
        ["tigers", "Detroit Tigers"],
        ["astros", "Houston Astros"],
        ["royals", "Kansas City Royals"],
        ["angels", "Los Angeles Angels"],
        ["dodgers", "Los Angeles Dodgers"],
        ["marlins", "Miami Marlins"],
        ["brewers", "Milwaukee Brewers"],
        ["twins", "Minnesota Twins"],
        ["mets", "New York Mets"],
        ["yankees", "New York Yankees"],
        ["athletics", "Oakland Athletics"],
        ["phillies", "Philadelphia Phillies"],
        ["pirates", "Pittsburgh Pirates"],
        ["padres", "San Diego Padres"],
        ["giants", "San Francisco Giants"],
        ["mariners", "Seattle Mariners"],
        ["cardinals", "St. Louis Cardinals"],
        ["rays", "Tampa Bay Rays"],
        ["rangers", "Texas Rangers"],
        ["blue-jays", "Toronto Blue Jays"],
        ["nationals", "Washington Nationals"]
    ]);
    
    return map;
}