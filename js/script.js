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