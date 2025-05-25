document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('booking-form');
    const notification = document.getElementById('notification');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookingData = {
            name: document.getElementById('client-name').value.trim(),
            date: document.getElementById('booking-date').value,
            time: document.getElementById('booking-time').value,
            people: form.elements['people'].value,
            requests: document.getElementById('special-requests').value.trim()
        };

        try {
            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) throw new Error('Ошибка при отправке формы');

            notification.innerText = 'Бронирование отправлено!';
            notification.classList.add('success');
            form.reset();
        } catch (err) {
            console.error(err);
            notification.innerText = 'Не удалось отправить бронирование.';
            notification.classList.add('error');
        }

        setTimeout(() => {
            notification.innerText = '';
            notification.classList.remove('success', 'error');
        }, 4000);
    });
});
