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
});

document.addEventListener('DOMContentLoaded', () => {
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
});