(function() {
    if (window.sortReviews) {
        window.sortReviews = null;
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('reviews-list')) {
            return;
        }
        if (!document.querySelector('.review-button[role="button"]')) {
            return;
        }

        async function loadReviews() {
            try {
                const response = await fetch('/api/reviews', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    cache: 'no-cache'
                });
                if (!response.ok) {
                    throw new Error(`HTTP ошибка: ${response.status}`);
                }
                const reviews = await response.json();
                return reviews;
            } catch (error) {
                showNotification('Не удалось загрузить отзывы.', 'error');
                return [];
            }
        }

        function sortReviewsData(reviews, sortType) {
            let sortedReviews = [...reviews];
            if (sortType === 'rating') {
                sortedReviews.sort((a, b) => b.rating - a.rating);
            } else {
                sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
            return sortedReviews;
        }

        function renderReviews(reviews) {
            const reviewsList = document.getElementById('reviews-list');
            reviewsList.innerHTML = '';
            if (reviews.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'review-text';
                emptyMessage.textContent = 'Отзывов пока нет.';
                reviewsList.appendChild(emptyMessage);
                return;
            }
            reviews.slice(0, 20).forEach(review => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';

                const reviewHeader = document.createElement('div');
                reviewHeader.className = 'review-header';

                const reviewName = document.createElement('div');
                reviewName.className = 'review-name';
                reviewName.textContent = review.author || 'Аноним';

                const reviewDate = document.createElement('div');
                reviewDate.className = 'review-date';
                reviewDate.textContent = new Date(review.date).toLocaleDateString('ru-RU', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });

                reviewHeader.appendChild(reviewName);
                reviewHeader.appendChild(reviewDate);

                const reviewRating = document.createElement('div');
                reviewRating.className = 'review-rating';
                reviewRating.textContent = `Оценка: ${review.rating || 'N/A'}`;

                const reviewText = document.createElement('div');
                reviewText.className = 'review-text';
                reviewText.textContent = review.comment || '';

                reviewItem.appendChild(reviewHeader);
                reviewItem.appendChild(reviewRating);
                reviewItem.appendChild(reviewText);
                reviewsList.appendChild(reviewItem);
            });
        }

        window.sortReviews = async function(type) {
            const reviews = await loadReviews();
            const sortedReviews = sortReviewsData(reviews, type);
            renderReviews(sortedReviews);
        };

        sortReviews('date');

        const radioOptions = document.querySelectorAll('.radio-option');
        if (!radioOptions.length) {
            return;
        }
        radioOptions.forEach(option => {
            option.addEventListener('click', () => {
                radioOptions.forEach(opt => opt.setAttribute('aria-checked', 'false'));
                option.setAttribute('aria-checked', 'true');
            });
        });

        function collectFormData() {
            const formData = {
                author: document.querySelector('.bs-input[data-name="review-name"]')?.textContent.trim() || '',
                comment: document.querySelector('.bs-input[data-name="review-text"]')?.textContent.trim() || '',
                rating: document.querySelector('.rating-radio-group .radio-option[aria-checked="true"]')?.getAttribute('data-value') || ''
            };
            return formData;
        }

        function showNotification(message, type) {
            const notification = document.getElementById('notification');
            if (!notification) {
                return;
            }
            notification.textContent = message;
            notification.classList.add(type === 'success' ? 'bs-notification-success' : 'bs-notification-error');
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
                notification.classList.remove('bs-notification-success', 'bs-notification-error');
            }, 3000);
        }

        const submitButton = document.querySelector('.review-button[role="button"]');
        if (!submitButton) {
            return;
        }
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const formData = collectFormData();

            if (!formData.author || !formData.comment || !formData.rating) {
                showNotification('Заполните все поля!', 'error');
                return;
            }

            formData.rating = parseInt(formData.rating);

            try {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP ошибка: ${response.status}`);
                }

                await response.json();
                showNotification('Отзыв отправлен!', 'success');

                document.querySelector('.bs-input[data-name="review-name"]').textContent = '';
                document.querySelector('.bs-input[data-name="review-text"]').textContent = '';
                document.querySelectorAll('.rating-radio-group .radio-option').forEach(option => {
                    option.setAttribute('aria-checked', 'false');
                });

                sortReviews('date');
            } catch (error) {
                showNotification(error.message.includes('Missing required fields') ? 'Заполните все поля!' : 'Ошибка отправки.', 'error');
            }
        });
    });
})();