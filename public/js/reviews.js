document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('reviews')) return;

    let reviews = [];

    const reviewsList = document.getElementById('reviews-list');

    let ratingFilter = document.getElementById('rating-filter');
    if (!ratingFilter) {
        ratingFilter = document.createElement('select');
        ratingFilter.id = 'rating-filter';
        ratingFilter.style.margin = '10px 0 20px 0';
        reviewsList.parentNode.insertBefore(ratingFilter, reviewsList);
    }

    const fallbackReviews = [
        {
            id: 1,
            author: "Анна Иванова",
            rating: 5,
            date: "2025-05-20T14:30:00",
            comment: "Отличный ресторан! Еда вкусная, атмосфера уютная, персонал очень вежливый."
        },
        {
            id: 2,
            author: "Михаил Петров",
            rating: 4,
            date: "2025-05-18T19:00:00",
            comment: "Хорошее место, но ожидание заказа было немного долгим."
        }
    ];

    document.getElementById('review-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const author = document.getElementById('review-name').value.trim();
        const comment = document.getElementById('review-text').value.trim();
        const rating = document.querySelector('input[name="rating"]:checked')?.value;

        if (!author || !comment || !rating) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author, comment, rating })
            });

            if (!response.ok) throw new Error('Ошибка при отправке');

            const savedReview = await response.json();
            alert('Отзыв отправлен!');
            location.reload();
        } catch (err) {
            console.error(err);
            alert('Не удалось отправить отзыв');
        }
    });

    function loadReviews() {
        if (localStorage.getItem('reviews')) {
            reviews = JSON.parse(localStorage.getItem('reviews'));
            setupFilter();
            displayReviews();
        } else {
            fetch('reviews.json')
                .then(response => {
                    if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    reviews = data;
                    localStorage.setItem('reviews', JSON.stringify(reviews));
                    setupFilter();
                    displayReviews();
                })
                .catch(() => {
                    reviews = fallbackReviews;
                    localStorage.setItem('reviews', JSON.stringify(reviews));
                    setupFilter();
                    displayReviews();
                });
        }
    }

    function setupFilter() {
        const ratings = Array.from(new Set(reviews.map(r => r.rating))).sort((a, b) => b - a);
        const options = ['all', ...ratings];
        ratingFilter.innerHTML = options.map(r => {
            if (r === 'all') return `<option value="all">Все рейтинги</option>`;
            let starWord = (r === 1) ? 'звезда' : (r >= 2 && r <= 4) ? 'звезды' : 'звёзд';
            return `<option value="${r}">${r} ${starWord}</option>`;
        }).join('');
    }

    function displayReviews(filter = 'all') {
        let filtered = reviews;
        if (filter !== 'all') {
            filtered = reviews.filter(r => r.rating === parseInt(filter));
        }

        if (!filtered.length) {
            reviewsList.innerHTML = `<p>Нет отзывов с выбранным рейтингом.</p>`;
            return;
        }

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        reviewsList.innerHTML = filtered.map(r => {
            const dateStr = new Date(r.date).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            return `
                <div class="review-card" style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
                    <div><strong>${r.author}</strong> — <em>${dateStr}</em></div>
                    <div>Рейтинг: ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                    <p>${r.comment}</p>
                </div>
            `;
        }).join('');
    }

    ratingFilter.addEventListener('change', e => {
        displayReviews(e.target.value);
    });

    loadReviews();
});
