document.addEventListener('DOMContentLoaded', () => {
    const pageMap = {
        'О нас': '',
        'Меню': 'menu/',
        'Бронирование': 'booking/',
        'События': 'events/',
        'Отзывы': 'reviews/'
    };

    const buttons = document.querySelectorAll('.menu-buttons-button button');

    const currentPage = window.location.pathname.split('/').pop() || '';

    const currentPath = window.location.pathname;

    buttons.forEach(button => {
        const buttonText = button.textContent.trim();
        const targetPath = '/' + pageMap[buttonText];

        if (currentPath === targetPath || (currentPath === '/' && targetPath === '/')) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            window.location.href = targetPath;
        });
    });
});