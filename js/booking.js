document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.split('/').pop() === 'booking.html') {
        let bookings = [];
        const today = new Date('2025-05-25T13:36:00');

        function showNotification(message) {
            const notification = document.getElementById('notification');
            if (notification) {
                notification.textContent = message;
                notification.style.display = 'block';
                setTimeout(() => notification.style.display = 'none', 3000);
            }
        }

        function loadBookings() {
            if (localStorage.getItem('bookings')) {
                console.log('Loading bookings from localStorage');
                bookings = JSON.parse(localStorage.getItem('bookings'));
            } else {
                console.log('Fetching bookings from data/booking.json');
                fetch('data/booking.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Bookings loaded from JSON:', data);
                        bookings = data;
                        localStorage.setItem('bookings', JSON.stringify(bookings));
                    })
                    .catch(error => {
                        console.error('Error loading data/booking.json:', error);
                        console.log('Using empty bookings array');
                        bookings = [];
                        localStorage.setItem('bookings', JSON.stringify(bookings));
                    });
            }
        }

        function saveBooking(booking) {
            console.log('Attempting to save booking:', booking);
            fetch('http://localhost:3000/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Booking saved successfully:', data);
                    bookings.push(booking);
                    localStorage.setItem('bookings', JSON.stringify(bookings));
                    showNotification('Бронирование сохранено в data/booking.json!');
                })
                .catch(error => {
                    console.error('Error saving booking:', error);
                    showNotification('Ошибка при сохранении: ' + error.message);
                });
        }

        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            loadBookings();
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const name = document.getElementById('client-name')?.value;
                const date = document.getElementById('booking-date')?.value;
                const time = document.getElementById('booking-time')?.value;
                const people = document.querySelector('input[name="people"]:checked')?.value;
                const requests = document.getElementById('special-requests')?.value;

                if (!name || !date || !time || !people) {
                    showNotification('Заполни все поля!');
                    return;
                }

                const booking = {
                    name,
                    date,
                    time,
                    people,
                    requests,
                    timestamp: today.toISOString(),
                    isCalled: false
                };

                console.log('Submitting booking:', booking);
                saveBooking(booking);
                e.target.reset();
            });
        }
    }
});