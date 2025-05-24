document.addEventListener('DOMContentLoaded', () => {
    let menuItems = [];
    const menuContainer = document.getElementById('menu-items');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuSidebar = document.querySelector('.menu-sidebar');

    
    fetch('data/menu-items.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load menu-items.json');
            }
            return response.json();
        })
        .then(data => {
            
            const uniqueMenuItems = [];
            const seen = new Set();
            data.forEach(item => {
                const key = `${item.name}-${item.category}`; 
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMenuItems.push(item);
                }
            });
            menuItems = uniqueMenuItems;
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            initializeMenu();
        })
        .catch(error => {
            console.error('Error loading menu-items.json:', error);
            menuContainer.innerHTML = '<p>Ошибка загрузки меню</p>';
        });

    
    function initializeMenu() {
        
        function displayItems(category) {
            const filteredItems = category === 'all' 
                ? menuItems 
                : menuItems.filter(item => item.category === category);
            menuContainer.innerHTML = filteredItems.length > 0 
                ? filteredItems.map(item => `
                    <div class="menu-item-tile">
                        <img src="${item.imagePath}" alt="${item.name}" onerror="this.src='images/fallback.jpg'">
                        <div class="menu-item-info">
                            <div class="menu-item-title">${item.name}</div>
                            <div class="menu-item-price">${item.price > 0 ? item.price + '₽' : item.note || 'уточните у официанта'}</div>
                        </div>
                    </div>
                `).join('')
                : '<p>Нет блюд в этой категории</p>';
        }

        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                displayItems(btn.dataset.category);
                if (menuSidebar) menuSidebar.classList.add('gold');
            });
        });

        // Display initial category
        if (categoryButtons.length > 0) {
            categoryButtons[0].classList.add('active');
            displayItems(categoryButtons[0].dataset.category);
            if (menuSidebar) menuSidebar.classList.add('gold');
        }
    }
});