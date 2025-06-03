document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-items');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuSidebar = document.querySelector('.menu-sidebar');

    let menuItems = [];

    function displayItems(category) {
        const filteredItems = menuItems.filter(item => item.category === category);
        menuContainer.innerHTML = filteredItems.length > 0
            ? filteredItems.map(item => `
                <div class="menu-item-top" data-id="${item.id}">
                    <img src="../${item.imagePath}" alt="${item.name}">
                    <div class="menu-item-info">
                        <div class="menu-item-title">${item.name}${item.vegetarian ? ' (вег.)' : ''}</div>
                        <div class="menu-item-price">
                            ${item.price > 0 ? item.price + '₽' : item.note || 'уточните у официанта'}
                        </div>
                    </div>
                </div>
            `).join('')
            : '<div class="no-favorites">Нет блюд в этой категории</div>';
    }

    function initializeMenu() {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                displayItems(btn.dataset.category);
                menuSidebar.classList.add('gold');
            });
        });

        if (categoryButtons.length > 0) {
            categoryButtons[0].classList.add('active');
            displayItems(categoryButtons[0].dataset.category);
            menuSidebar.classList.add('gold');
        }
    }

    fetch('/api/menu')
        .then(response => {
            if (!response.ok) throw new Error('Сервер вернул ошибку');
            return response.json();
        })
        .then(data => {
            menuItems = data.map((item, index) => ({
                id: item.id ?? index + 1,
                ...item
            }));
            initializeMenu();
        })
        .catch(error => {
            console.error('Ошибка при загрузке меню:', error);
            menuContainer.innerHTML = '<div class="no-favorites">Не удалось загрузить меню</div>';
        });
});
