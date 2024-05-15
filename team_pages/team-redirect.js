
// Function to handle team link clicks
document.addEventListener('DOMContentLoaded', function() {
    const teamLinks = document.querySelectorAll('.team-link');
    teamLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const teamName = link.getAttribute('data-team');
            window.location.href = `display.html?team=${teamName}`;
            document.title = teamName;
        });
    });
});
