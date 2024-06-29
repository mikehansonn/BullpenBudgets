function printDates(data) {
    for(var i = 0; i < 5; i++) {
        var th = document.getElementById(`date${i + 1}`);
        th.textContent = data[i];
    }
}

function handleDatesData() {
    const filePath = 'dates.txt'; // Replace with the correct path to dates.txt

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        })
        .then(text => {
            printDates(text.split(',')); // Assuming you want to print each line separately
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
    });
}
  
document.addEventListener("DOMContentLoaded", function() {
    handleDatesData();
});
