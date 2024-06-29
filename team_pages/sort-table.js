function sortTable(columnIndex) {
    const table = document.getElementById("sortableTable");
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const th = table.querySelectorAll("th");

    // Remove sort classes from all headers except the one being sorted
    th.forEach((header, index) => {
        if (index !== columnIndex) {
            header.classList.remove("sort-asc");
            header.classList.remove("sort-desc");
        }
    });

    // Toggle sort direction for the clicked column
    let descending = !th[columnIndex].classList.contains("sort-desc");
    
    // Set the sort direction for the current column
    if (descending) {
        th[columnIndex].classList.add("sort-desc");
        th[columnIndex].classList.remove("sort-asc");
    } else {
        th[columnIndex].classList.add("sort-asc");
        th[columnIndex].classList.remove("sort-desc");
    }

    // Sort rows
    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].textContent.trim();
        const cellB = b.cells[columnIndex].textContent.trim();

        if (isNaN(cellA) || isNaN(cellB)) {
            // Compare as strings
            return descending
                ? cellB.localeCompare(cellA)
                : cellA.localeCompare(cellB);
        } else {
            // Compare as numbers
            return descending
                ? cellB - cellA
                : cellA - cellB;
        }
    });

    // Remove all rows and append sorted rows
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    tbody.append(...rows);
}