let ordinalDates = [];
var counter = 0;

function printData(data) {
  for(var i = 0; i < data.length; i++) {
    readerRow(data[i]);
  }
}

function readDates() {
  const filePath = 'dates.txt'; // Replace with the correct path to dates.txt
  return fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.text();
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      throw error; // Re-throw the error so it can be handled by the caller if needed
    });
}

async function getDates() {
  try {
    const dates = await readDates();
    return dates; // Return the fetched text
  } catch (error) {
    console.error('Error reading dates:', error);
    throw error; // Re-throw the error so it can be handled by the caller if needed
  }
}

function colorCalculateL3(string) {
  var num = parseInt(string);

  if(num < 14) {
    return "none";
  }
  else if(num < 17) {
    return "#ffec9e";
  }
  else if(num < 20) {
    return "#feff89";
  }
  else if(num < 23) {
    return "#ffb871";
  }
  else if(num < 26) {
    return "#ff9a6e";
  }
  else {
    return "#fb7474";
  }
}

function colorCalculateL7(string) {
  var num = parseInt(string);

  if(num < 30) {
    return "none";
  }
  else if(num < 36) {
    return "#ffec9e";
  }
  else if(num < 42) {
    return "#feff89";
  }
  else if(num < 48) {
    return "#ffb871";
  }
  else if(num < 54) {
    return "#ff9a6e";
  }
  else {
    return "#fb7474";
  }
}

function colorCalculateL14(string) {
  var num = parseInt(string);

  if(num < 56) {
    return "none";
  }
  else if(num < 68) {
    return "#ffec9e";
  }
  else if(num < 80) {
    return "#feff89";
  }
  else if(num < 92) {
    return "#ffb871";
  }
  else if(num < 104) {
    return "#ff9a6e";
  }
  else {
    return "#fb7474";
  }
}

function colorCalculateGame(string) {
  var num = parseInt(string);

  if(num == 0) {
    return "none";
  }
  else if(num < 10) {
    return "#ddd9b9";
  }
  else if(num < 15) {
    return "#c3bf9c";
  }
  else if(num < 20) {
    return "#b3ae83";
  }
  else if(num < 25) {
    return "#918b5b";
  }
  else {
    return "#6f6a3d";
  }
}

function readerRow(player) {
  if(player["past_days"][2] == 0) return;
  counter++;
  var tr = document.createElement("tr");

  var name = document.createElement("td");
  name.innerHTML = player["name"];
  name.setAttribute("class", "name");
  name.setAttribute("style", "text-align: left; width: 150px;");
  tr.appendChild(name);

  for(var j = 0; j < ordinalDates.length; j++) {
    var game = document.createElement("td");
    game.innerHTML = ".";
    for(var i = player["all_outings"].length - 1; i >= 0; i--) {
      if(ordinalDates[j] == player["all_outings"][i][1]) {
        game.innerHTML = player["all_outings"][i][0];
        game.style.backgroundColor = colorCalculateGame(player["all_outings"][i][0]);
        break;
      }
    }
    tr.appendChild(game);
  }

  var l3 = document.createElement("td");
  l3.innerHTML = player["past_days"][0];
  l3.setAttribute("date-label", "L3");
  l3.setAttribute("class", "date5");
  l3.style.backgroundColor = colorCalculateL3(player["past_days"][0]);
  tr.appendChild(l3);
  var l7 = document.createElement("td");
  l7.innerHTML = player["past_days"][1];
  l7.setAttribute("date-label", "L7");
  l7.style.backgroundColor = colorCalculateL7(player["past_days"][1]);
  tr.appendChild(l7);
  var l14 = document.createElement("td");
  l14.innerHTML = player["past_days"][2];
  l14.setAttribute("date-label", "L14");
  l14.style.backgroundColor = colorCalculateL14(player["past_days"][2]);
  tr.appendChild(l14);

  var tbody = document.getElementById("tbody");
  tbody.appendChild(tr);
}

getDates()
  .then(dates => {
    ordinalDates = dates.split(",");
    for(var i = 0; i < ordinalDates.length; i++) {
      var split = ordinalDates[i].split("/");
      ordinalDates[i] = daysSinceEpoch(split[0], split[1], 2024);
    }
  })
  .catch(error => {
    console.error('Error handling dates:', error);
  });

document.addEventListener("DOMContentLoaded", function() {
    var file = getPageName();
    fetch('complete_data/' + file + '.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      // Handle the data from the JSON file
      printData(data);
    })
    .catch(error => {
      console.error('ERROR: fetching team data has crashed', error);
    });
});
