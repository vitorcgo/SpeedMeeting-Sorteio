// public/js/menu.js
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuList = document.querySelector('.menu-list');

    // Toggle menu when clicking the menu button
    menuToggle.addEventListener('click', function() {
        menuList.classList.toggle('show');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = menuList.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && menuList.classList.contains('show')) {
            menuList.classList.remove('show');
        }
    });

    // Close menu when window is resized beyond mobile breakpoint
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && menuList.classList.contains('show')) {
            menuList.classList.remove('show');
        }
    });
});