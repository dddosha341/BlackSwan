document.addEventListener('DOMContentLoaded', () => {
    const favoritesContainer = document.getElementById('favorite-dishes');

    fetch('/api/menu')
        .then(response => {
            if (!response.ok) throw new Error('Ошибка сервера');
            return response.json();
        })
        .then(data => {
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
            console.error('Ошибка при загрузке любимых блюд:', error);
            favoritesContainer.innerHTML = '<div class="no-favorites">Скоро добавим</div>';
        });
});
