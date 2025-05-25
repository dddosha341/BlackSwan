document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.split('/').pop() === 'reviews.html') {
        let reviews = [];
        const today = new Date('2025-05-22T12:21:00'); // Current time (12:21 PM PDT)

        // Load reviews from reviews.json or localStorage
        function loadReviews() {
            if (localStorage.getItem('reviews')) {
                console.log('Loading reviews from localStorage');
                reviews = JSON.parse(localStorage.getItem('reviews'));
                populateRatingFilter();
                displayReviews();
            } else {
                console.log('Fetching reviews from reviews.json');
                fetch('reviews.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Reviews loaded from JSON:', data);
                        reviews = data;
                        localStorage.setItem('reviews', JSON.stringify(reviews));
                        populateRatingFilter();
                        displayReviews();
                    })
                    .catch(error => {
                        console.error('Error loading reviews.json:', error);
                        console.log('Using fallback reviews data');
                        reviews = fallbackReviews; // Use fallback data
                        localStorage.setItem('reviews', JSON.stringify(reviews));
                        populateRatingFilter();
                        displayReviews();
                    });
            }
        }

        const reviewsList = document.getElementById('reviews-list');
        const ratingFilter = document.getElementById('rating-filter');

        // Fallback reviews data
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

        // Populate rating filter dropdown
        function populateRatingFilter() {
            if (!reviews || reviews.length === 0) {
                console.log('No reviews to populate ratings');
                return;
            }
            const uniqueRatings = ['all', ...new Set(reviews.map(review => review.rating))].sort((a, b) => b - a);
            console.log('Unique ratings:', uniqueRatings);
            ratingFilter.innerHTML = uniqueRatings.map(rating => `<option value="${rating}">${rating === 'all' ? 'Все' : `${rating} звезд${rating === 1 ? 'а' : rating < 5 ? 'ы' : ''}`}</option>`).join('');
        }

        // Display reviews with rating filter
        function displayReviews(filterRating = 'all') {
            if (!reviews || reviews.length === 0) {
                reviewsList.innerHTML = '<p>Нет отзывов. Проверьте консоль для ошибок.</p>';
                console.log('Reviews data is empty or not loaded');
                return;
            }

            console.log('Filtering reviews with rating:', filterRating);
            const filteredReviews = reviews
                .filter(review => {
                    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
                    console.log(`Review: ${review.author}, Rating: ${review.rating}, Matches filter: ${matchesRating}`);
                    return matchesRating;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            console.log('Filtered reviews:', filteredReviews);

            if (filteredReviews.length === 0) {
                reviewsList.innerHTML = '<p>Нет отзывов, соответствующих выбранному рейтингу.</p>';
                return;
            }

            reviewsList.innerHTML = `
                ${filteredReviews.map(review => {
                const reviewDate = new Date(review.date);
                return `
                        <div class="review-card" data-id="${review.id}">
                            <div class="review-content">
                                <div class="review-date">${reviewDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                <div class="review-details">
                                    <h4>${review.author}</h4>
                                    <p><strong>Рейтинг:</strong> ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
                                    <p><strong>Отзыв:</strong> ${review.comment}</p>
                                </div>
                            </div>
                        </div>
                    `;
            }).join('')}
            `;
            animateCards();
        }

        // Animate review cards
        function animateCards() {
            const cards = document.querySelectorAll('.review-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }

        // Handle rating filter change
        ratingFilter.addEventListener('change', (e) => {
            const selectedRating = e.target.value;
            console.log('Selected filter rating:', selectedRating);
            displayReviews(selectedRating);
        });

        // Initialize on load
        loadReviews();
    }
});