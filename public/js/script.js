document.addEventListener('DOMContentLoaded', function() {
    const allButtons = document.querySelectorAll('.searchbtn');
    const searchBar = document.querySelector('.searchbar');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');



    // Open search bar when any search button is clicked
    allButtons.forEach(button => {
        button.addEventListener('click', function() {
            searchBar.classList.add('open');
            searchBar.style.visibility = 'visible';
            searchBar.style.opacity = '1';
            this.setAttribute('aria-expanded', 'true');
            searchInput.focus();
        });
    });

    // Close search bar when close button is clicked
    searchClose.addEventListener('click', function() {
        searchBar.classList.remove('open');
        searchBar.style.opacity = '0';
        setTimeout(() => {
            searchBar.style.visibility = 'hidden';
        }, 200); // Matches the CSS transition time
        this.setAttribute('aria-expanded', 'false');
    });
});

function toggleForm() {
    const signInForm = document.getElementById('signInForm');
    const registerForm = document.getElementById('registerForm');

    if (signInForm.style.display === "none") {
        signInForm.style.display = "block";
        registerForm.style.display = "none";
    } else {
        signInForm.style.display = "none";
        registerForm.style.display = "block";
    }
}


function toggleSidebar() {
    const sidebar = document.getElementById("sidebarMenu");
    sidebar.classList.toggle("show");
}
