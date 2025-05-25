document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.split('/').pop() === 'events.html') {
        let events = [];
        const today = new Date('2025-05-22T12:21:00'); // Текущее время (12:21 PM PDT)


        // Загрузка данных из events.json или localStorage
        function loadEvents() {
            if (localStorage.getItem('events')) {
                console.log('Loading events from localStorage');
                events = JSON.parse(localStorage.getItem('events'));
                populateEventTypes();
                displayEvents();
            } else {
                console.log('Fetching events from events.json');
                fetch('data/events.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Events loaded from JSON:', data);
                        events = data;
                        localStorage.setItem('events', JSON.stringify(events));
                        populateEventTypes();
                        displayEvents();
                    })
                    .catch(error => {
                        console.error('Error loading events.json:', error);
                        console.log('Using fallback events data');
                        events = fallbackEvents; // Используем встроенные данные
                        localStorage.setItem('events', JSON.stringify(events));
                        populateEventTypes();
                        displayEvents();
                    });
            }
        }

        const eventsList = document.getElementById('events-list');
        const eventTypeFilter = document.getElementById('event-type');

        // Функция заполнения выпадающего списка уникальными типами
        function populateEventTypes() {
            if (!events || events.length === 0) {
                console.log('No events to populate types');
                return;
            }
            const uniqueTypes = ['all', ...new Set(events.map(event => event.type))];
            console.log('Unique event types:', uniqueTypes);
            eventTypeFilter.innerHTML = uniqueTypes.map(type => `<option value="${type}">${type === 'all' ? 'Все' : type}</option>`).join('');
        }

        // Функция отображения событий с фильтрацией по типу
        function displayEvents(filterType = 'all') {
            if (!events || events.length === 0) {
                eventsList.innerHTML = '<p>Нет событий. Проверьте консоль для ошибок.</p>';
                console.log('Events data is empty or not loaded');
                return;
            }

            console.log('Filtering events with type:', filterType);
            const filteredEvents = events
                .filter(event => {
                    const matchesType = filterType === 'all' || event.type === filterType;
                    console.log(`Event: ${event.title}, Type: ${event.type}, Matches filter: ${matchesType}`);
                    return matchesType;
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            console.log('Filtered events:', filteredEvents);

            if (filteredEvents.length === 0) {
                eventsList.innerHTML = '<p>Нет событий, соответствующих выбранному типу.</p>';
                return;
            }

            eventsList.innerHTML = `
                ${filteredEvents.map(event => {
                    const eventDate = new Date(event.date);
                    const isUpcoming = eventDate > today && event.status === 'upcoming';
                    const actionButton = isUpcoming ? 'Забронировать столик' : 'Забронировать';
                    return `
                        <div class="event-card ${isUpcoming ? 'upcoming' : 'past'}" data-id="${event.id}">
                            <img src="${event.imagePath || 'images/placeholder.jpg'}" alt="${event.title}" class="event-image">
                            <div class="event-content">
                                <div class="event-date">${eventDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, ${eventDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                <div class="event-details">
                                    <h4>${event.title}</h4>
                                    ${event.performer ? `<p><strong>Исполнитель:</strong> ${event.performer}</p>` : ''}
                                    <p><strong>Описание:</strong> ${event.description}</p>
                                    ${event.price ? `<p class="event-price"><em>Вход: ${event.price}₽</em></p>` : ''}
                                    ${event.note ? `<p class="event-note"><em>${event.note}</em></p>` : ''}
                                    <button class="event-action">${actionButton}</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            `;
            animateCards();
        }

        // Анимация появления карточек
        function animateCards() {
            const cards = document.querySelectorAll('.event-card');
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

        // Обработчик изменения фильтра
        eventTypeFilter.addEventListener('change', (e) => {
            const selectedType = e.target.value;
            console.log('Selected filter type:', selectedType);
            displayEvents(selectedType);
        });

        // Инициализация при загрузке
        loadEvents();
    }
});