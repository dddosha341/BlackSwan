document.addEventListener('DOMContentLoaded', () => {
    // Map button text to page URLs
    const pageMap = {
        'О нас': 'index.html',
        'Меню': 'menu.html',
        'Бронирование': 'booking.html',
        'События': 'events.html',
        'Отзывы': 'reviews.html'
    };

    // Get all menu buttons
    const buttons = document.querySelectorAll('.menu-buttons-button button');

    // Get current page from URL (e.g., 'index.html')
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    buttons.forEach(button => {
        const buttonText = button.textContent.trim();

        // Apply active class if button matches current page
        if (pageMap[buttonText] === currentPage) {
            button.classList.add('active');
        }

        // Add click event listener
        button.addEventListener('click', () => {
            const targetPage = pageMap[buttonText];
            if (targetPage && targetPage !== currentPage) {
                window.location.href = targetPage;
            }
        });
    });

    // Existing code for fetching favorite dishes (unchanged)
    if (currentPage === 'index.html') {
        fetch('data/menu-items.json')
            .then(response => response.json())
            .then(data => {
                const favoritesContainer = document.getElementById('favorite-dishes');
                const favorites = data.filter(item => item.isFavorite);

                if (favorites.length === 0) {
                    favoritesContainer.innerHTML = '<div class="no-favorites">Скоро добавим</div>';
                    return;
                }

                favoritesContainer.innerHTML = favorites.map(item => `
                    <div class="menu-item-top">
                        <img src="${item.imagePath}" alt="${item.name}">
                        <div class="menu-item-info">
                            <div class="menu-item-title">${item.name}</div>
                            <div class="menu-item-price">${item.price}₽</div>
                        </div>
                    </div>
                `).join('');
            })
            .catch(error => {
                console.error('Error loading menu:', error);
                document.getElementById('favorite-dishes').innerHTML = '<div class="no-favorites">Скоро добавим</div>';
            });
    }

    // Menu functionality for menu.html
    if (currentPage === 'menu.html') {
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
                    menuItems = []; // Заглушка на случай ошибки
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
                    <div class="menu-item-top">
                        <div class="menu-item-info">
                            <div class="menu-item-title">${item.name}${item.vegetarian ? ' (вег.)' : ''}</div>
                            <div class="menu-item-price">${item.price > 0 ? item.price + '₽' : item.note || 'уточните у официанта'}</div>
                        </div>
                    </div>
                `).join('') : '<div class="no-favorites">Нет блюд в этой категории</div>';
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
    }
});