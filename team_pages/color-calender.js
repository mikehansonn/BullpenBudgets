document.addEventListener("DOMContentLoaded", function() {
    const gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach(item => {
        const h2Element = item.querySelector('h2');
        if (h2Element) {
            const number = parseInt(h2Element.textContent, 10);
            if (!isNaN(number)) {
                if (number >= 80) {
                    item.style.backgroundColor = '#CC4444';
                } 
                else if (number >= 60) {
                    item.style.backgroundColor = '#CC8844';
                }
                else if (number >= 40) {
                    item.style.backgroundColor = '#CCCC44'; 
                }
                else if (number > 0) {
                    item.style.backgroundColor = '#F0F0F0';
                }
            }
        }
    });
});