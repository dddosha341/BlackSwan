document.addEventListener('DOMContentLoaded', () => {
    // Load menu items from menu.json or localStorage
    let menuItems;
    if (localStorage.getItem('menuItems')) {
        menuItems = JSON.parse(localStorage.getItem('menuItems'));
    } else {
        fetch('menu.json')
            .then(response => response.json())
            .then(data => {
                menuItems = data;
                localStorage.setItem('menuItems', JSON.stringify(menuItems));
                initializeMenu();
            })
            .catch(error => {
                console.error('Error loading menu.json:', error);
                menuItems = [];
                initializeMenu();
            });
    }

    const menuContainer = document.getElementById('menu-items');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuSidebar = document.querySelector('.menu-sidebar');

    // Initialize menu functionality
    function initializeMenu() {
        // Display items by category
        function displayItems(category) {
            const filteredItems = menuItems.filter(item => item.category === category);
            menuContainer.innerHTML = filteredItems.length > 0 ? filteredItems.map(item => `
                <div class="menu-item-tile">
                    <img src="${item.imagePath}" alt="${item.name}">
                    <div class="menu-item-info">
                        <div class="menu-item-title">${item.name}${item.vegetarian ? ' (вег.)' : ''}</div>
                        <div class="menu-item-price">${item.price > 0 ? item.price + '₽' : item.note || 'уточните у официанта'}</div>
                    </div>
                </div>
            `).join('') : '<p>Нет блюд в этой категории</p>';
        }

        // Category button handling with sidebar color change
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                displayItems(btn.dataset.category);
                menuSidebar.classList.add('gold');
            });
        });

        // Display initial category with gold background
        if (categoryButtons.length > 0) {
            categoryButtons[0].classList.add('active');
            displayItems(categoryButtons[0].dataset.category);
            menuSidebar.classList.add('gold');
        }
    }

    // Если данные уже в localStorage, инициализируем меню сразу
    if (localStorage.getItem('menuItems')) {
        menuItems = JSON.parse(localStorage.getItem('menuItems'));
        initializeMenu();
    }
});