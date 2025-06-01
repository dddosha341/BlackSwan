document.addEventListener('DOMContentLoaded', () => {
    // === КАЛЕНДАРЬ ===
    const dateInput = document.querySelector('.input-date');
    const calendarPopup = document.querySelector('.calendar-popup');

    let currentDate = new Date();
    let selectedDate = null;

    function formatDate(date) {
        return date.toLocaleDateString('ru-RU');
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
        const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
        monthYear.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        header.append(prevBtn, monthYear, nextBtn);
        calendarPopup.appendChild(header);

        const table = document.createElement('table');
        const daysOfWeek = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
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

            // Подсветка выбранной даты
            if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
                td.classList.add('selected-day');
            }

            // Блокировка прошлых дней (опционально)
            const today = new Date();
            today.setHours(0,0,0,0);
            if (dayDate < today) {
                td.classList.add('disabled');
                td.style.color = '#ccc';
            } else {
                td.addEventListener('click', () => {
                    selectedDate = dayDate;
                    dateInput.textContent = formatDate(dayDate);
                    calendarPopup.style.display = 'none';
                });
            }

            row.appendChild(td);
        }

        table.appendChild(row);
        calendarPopup.appendChild(table);
    }

    dateInput.addEventListener('click', () => {
        calendarPopup.style.display = 'block';
        renderCalendar(currentDate);
    });

    // Очистка даты двойным кликом
    dateInput.addEventListener('dblclick', () => {
        dateInput.textContent = 'Дата';
        selectedDate = null;
    });

    document.addEventListener('click', (e) => {
        if (!calendarPopup.contains(e.target) && e.target !== dateInput) {
            calendarPopup.style.display = 'none';
        }
    });

    // === ВРЕМЯ ===
    const timeInput = document.querySelector('.input-time');
    const timeDropdown = document.querySelector('.time-dropdown');

    const timeOptions = ['12:00', '12:30', '13:00', '13:30', '14:00',
        '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00',
        '19:30', '20:00', '20:30', '21:00'];

    timeOptions.forEach(time => {
        const div = document.createElement('div');
        div.className = 'time-option';
        div.textContent = time;
        div.addEventListener('click', () => {
            timeInput.textContent = time;
            timeDropdown.style.display = 'none';
        });
        timeDropdown.appendChild(div);
    });

    timeInput.addEventListener('click', () => {
        timeDropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!timeDropdown.contains(e.target) && e.target !== timeInput) {
            timeDropdown.style.display = 'none';
        }
    });

    // === РАДИО-КНОПКИ ===
    const radioOptions = document.querySelectorAll('.radio-option');
    radioOptions.forEach(option => {
        option.addEventListener('click', () => {
            radioOptions.forEach(opt => opt.setAttribute('aria-checked', 'false'));
            option.setAttribute('aria-checked', 'true');
        });
    });
});
