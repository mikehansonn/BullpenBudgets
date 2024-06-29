function calculateBG() {
    const gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach(item => {
        const h2Element = item.querySelector('h2');
        if (h2Element) {
            const number = parseInt(h2Element.textContent, 10);
            if (!isNaN(number)) {
                if (number >= 70) {
                    item.style.backgroundColor = '#e05353';
                } else if (number >= 50) {
                    item.style.backgroundColor = '#d5d966';
                } else if (number > 0) {
                    item.style.backgroundColor = '#7bdb8b';
                }
            }
        }
    });
}
window.onload = calculateBG;