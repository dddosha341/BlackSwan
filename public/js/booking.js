document.addEventListener('DOMContentLoaded', () => {
    console.log('Документ загружен, инициализация скрипта booking.js');

    // === КАЛЕНДАРЬ ===
    const dateInput = document.querySelector('.input-date');
    const calendarPopup = document.querySelector('.calendar-popup');
    if (!dateInput || !calendarPopup) {
        console.error('Ошибка: Не найдены элементы .input-date или .calendar-popup');
    }

    let currentDate = new Date();
    let selectedDate = null;

    function formatDate(date) {
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function renderCalendar(date) {
        calendarPopup.innerHTML = '';
        const header = document.createElement('div');
        header.className = 'calendar-header';

        const prevBtn = document.createElement('button');
        prevBtn.textContent = '‹';
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });

        const nextBtn = document.createElement('button');
        nextBtn.textContent = '›';
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });

        const monthYear = document.createElement('span');
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        monthYear.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        header.append(prevBtn, monthYear, nextBtn);
        calendarPopup.appendChild(header);

        const table = document.createElement('table');
        const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        daysOfWeek.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const startDay = (firstDay.getDay() + 6) % 7;
        const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        let row = document.createElement('tr');
        for (let i = 0; i < startDay; i++) row.appendChild(document.createElement('td'));

        for (let d = 1; d <= lastDate; d++) {
            if ((startDay + d - 1) % 7 === 0) {
                table.appendChild(row);
                row = document.createElement('tr');
            }

            const td = document.createElement('td');
            td.textContent = d;

            const dayDate = new Date(date.getFullYear(), date.getMonth(), d);

            if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
                td.classList.add('selected-day');
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dayDate < today) {
                td.classList.add('disabled');
                td.style.color = '#ccc';
            } else {
                td.addEventListener('click', () => {
                    selectedDate = dayDate;
                    dateInput.textContent = formatDate(dayDate);
                    calendarPopup.style.display = 'none';
                    console.log('Выбрана дата:', dateInput.textContent);
                });
            }

            row.appendChild(td);
        }

        table.appendChild(row);
        calendarPopup.appendChild(table);
    }

    if (dateInput) {
        dateInput.addEventListener('click', () => {
            console.log('Клик по полю даты');
            calendarPopup.style.display = 'block';
            renderCalendar(currentDate);
        });

        dateInput.addEventListener('dblclick', () => {
            dateInput.textContent = '';
            selectedDate = null;
            console.log('Дата очищена');
        });
    }

    document.addEventListener('click', (e) => {
        if (!calendarPopup.contains(e.target) && e.target !== dateInput) {
            calendarPopup.style.display = 'none';
        }
    });

    // === ВРЕМЯ ===
    const timeInput = document.querySelector('.input-time');
    const timeDropdown = document.querySelector('.time-dropdown');
    if (!timeInput || !timeDropdown) {
        console.error('Ошибка: Не найдены элементы .input-time или .time-dropdown');
    }

    const timeOptions = [
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00'
    ];

    timeOptions.forEach(time => {
        const div = document.createElement('div');
        div.className = 'time-option';
        div.textContent = time;
        div.addEventListener('click', () => {
            timeInput.textContent = time;
            timeDropdown.style.display = 'none';
            console.log('Выбрано время:', time);
        });
        timeDropdown.appendChild(div);
    });

    if (timeInput) {
        timeInput.addEventListener('click', () => {
            console.log('Клик по полю времени');
            timeDropdown.style.display = 'block';
        });
    }

    document.addEventListener('click', (e) => {
        if (!timeDropdown.contains(e.target) && e.target !== timeInput) {
            timeDropdown.style.display = 'none';
        }
    });

    // === РАДИО-КНОПКИ ===
    const radioOptions = document.querySelectorAll('.radio-option');
    if (!radioOptions.length) {
        console.error('Ошибка: Не найдены элементы .radio-option');
    }
    radioOptions.forEach(option => {
        option.addEventListener('click', () => {
            radioOptions.forEach(opt => opt.setAttribute('aria-checked', 'false'));
            option.setAttribute('aria-checked', 'true');
            console.log('Выбрано количество человек:', option.getAttribute('data-value'));
        });
    });

    // === СБОР ДАННЫХ И ОТПРАВКА ===
    function collectFormData() {
        const formData = {
            name: document.querySelector('.input-text[data-name="client-name"]')?.textContent.trim() || '',
            date: document.querySelector('.input-date')?.textContent.trim() || '',
            time: document.querySelector('.input-time')?.textContent.trim() || '',
            phone: document.querySelector('.input-text[data-number="client-number"]')?.textContent.trim() || '',
            people: document.querySelector('.radio-group[data-name="people"] .radio-option[aria-checked="true"]')?.getAttribute('data-value') || '',
            requests: document.querySelector('.input-textarea[data-name="special-requests"]')?.textContent.trim() || ''
        };
        console.log('Собранные данные:', formData);
        return formData;
    }

    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        if (!notification) {
            console.error('Ошибка: Элемент #notification не найден');
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

    // Обработчик нажатия кнопки .btn-submit
    const submitButton = document.querySelector('.btn-submit');
    if (!submitButton) {
        console.error('Ошибка: Кнопка .btn-submit не найдена');
        return;
    }
    submitButton.addEventListener('click', async (e) => {
        console.log('Кнопка бронирования нажата');
        e.preventDefault(); // Предотвращаем стандартное поведение

        const formData = collectFormData();

        // Проверка обязательных полей
        if (!formData.name || !formData.date || formData.date === 'Дата' || !formData.time || !formData.phone || !formData.people) {
            console.warn('Валидация не пройдена, пустые поля:', formData);
            showNotification('Пожалуйста, заполните все обязательные поля!', 'error');
            return;
        }

        console.log('Отправка данных на /api/booking:', formData);
        try {
            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('HTTP статус:', response.status);
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('Ответ сервера:', result);
            showNotification('Бронирование успешно отправлено!', 'success');

            // Очистка формы
            document.querySelector('.input-text[data-name="client-name"]').textContent = '';
            document.querySelector('.input-date').textContent = '';
            document.querySelector('.input-time').textContent = '';
            document.querySelector('.input-text[data-number="client-number"]').textContent = '';
            document.querySelectorAll('.radio-group[data-name="people"] .radio-option').forEach(option => {
                option.setAttribute('aria-checked', 'false');
            });
            document.querySelector('.input-textarea[data-name="special-requests"]').textContent = '';
        } catch (error) {
            console.error('Ошибка при отправке:', error.message);
            showNotification('Произошла ошибка при бронировании. Попробуйте снова.', 'error');
        }
    });
});