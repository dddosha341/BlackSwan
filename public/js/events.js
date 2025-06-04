document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('events')) {
        let events = [];
        const today = new Date(); // Используем текущую дату

        function loadEvents() {
            console.log('Fetching events from API...');
            fetch('/api/events')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Events loaded from API:', data);
                    events = data.map(event => ({
                        ...event,
                        // Создаем объект Date, если дата есть, иначе null
                        dateObj: event.date ? new Date(event.date) : null,
                        // Флаг для событий без даты
                        hasNoDate: !event.date
                    }));
                    populateEventTypes();
                    displayEvents();
                })
                .catch(error => {
                    console.error('Error loading events from API:', error);
                    eventsList.innerHTML = '<p>Не удалось загрузить события. Повторите позже.</p>';
                });
        }

        const eventsList = document.getElementById('events-list');
        const eventTypeFilter = document.getElementById('event-type');

        function populateEventTypes() {
            if (!events || events.length === 0) {
                console.log('No events to populate types');
                return;
            }
            const eventTypes = [...new Set(events.map(event => event.type))];
            eventTypeFilter.innerHTML = `
                <option value="all">Все</option>
               
                ${eventTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            `;
        }

        function displayEvents(filterType = 'all') {
            if (!events || events.length === 0) {
                eventsList.innerHTML = '<p>Нет событий. Проверьте консоль для ошибок.</p>';
                return;
            }

            const filteredEvents = events.filter(event => {
                const isUpcoming = event.dateObj ? event.dateObj > today : false;
                const isPast = event.dateObj ? event.dateObj <= today : false;
                
                if (filterType === 'upcoming') return isUpcoming;
                if (filterType === 'past') return isPast;
                if (filterType === 'no_date') return event.hasNoDate;
                if (filterType === 'all') return true;
                return event.type === filterType;
            }).sort((a, b) => {
                // События без даты всегда в конце
                if (a.hasNoDate && !b.hasNoDate) return 1;
                if (!a.hasNoDate && b.hasNoDate) return -1;
                if (a.hasNoDate && b.hasNoDate) return 0;
                
          
                const aIsUpcoming = a.dateObj > today;
                const bIsUpcoming = b.dateObj > today;
                
                if (aIsUpcoming && bIsUpcoming) return a.dateObj - b.dateObj;
                if (!aIsUpcoming && !bIsUpcoming) return b.dateObj - a.dateObj;
                return aIsUpcoming ? -1 : 1;
            });

            if (filteredEvents.length === 0) {
                eventsList.innerHTML = '<p>Нет событий, соответствующих выбранному типу.</p>';
                return;
            }

            eventsList.innerHTML = filteredEvents.map(event => {
                const isUpcoming = event.dateObj ? event.dateObj > today : false;
                const actionButton = isUpcoming ? 'Забронировать' : 
                                  event.hasNoDate ? 'Узнать подробности' : 'Посмотреть фото';
                
                return `
                    <div class="event-card ${isUpcoming ? 'upcoming' : event.hasNoDate ? 'no-date' : 'past'}" data-id="${event.id}">
                        <img src="../${event.imagePath || 'images/placeholder.jpg'}" alt="${event.title}" class="event-image">
                        <div class="event-content">
                            <div class="event-details">
                                <h4>${event.title}</h4>
                                ${event.performer ? `<p><strong>Исполнитель:</strong> ${event.performer}</p>` : ''}
                                <p><strong>Описание:</strong> ${event.description}</p>
                                ${event.price ? `<p class="event-price"><em>Вход: ${event.price}₽</em></p>` : ''}
                                ${event.note ? `<p class="event-note"><em>${event.note}</em></p>` : ''}
                                <button class="event-action" data-event-id="${event.id}">${actionButton}</button>
                            </div>
                            <div class="event-date">
                                ${event.dateObj ? 
                                    `${event.dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, 
                                     ${event.dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}` :
                                    'Дата уточняется'}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            animateCards();

            document.querySelectorAll('.event-action').forEach(button => {
                button.addEventListener('click', (e) => {
                    const eventId = e.target.getAttribute('data-event-id');
                    const event = events.find(ev => ev.id == eventId);
                    
                    if (event.hasNoDate) {
                        window.location.href = `../details?eventId=${eventId}`;
                    } else {
                        const isUpcoming = event.dateObj > today;
                        window.location.href = isUpcoming ? 
                            `../booking?eventId=${eventId}` : 
                            `../gallery?eventId=${eventId}`;
                    }
                });
            });
        }

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

        eventTypeFilter.addEventListener('change', (e) => {
            displayEvents(e.target.value);
        });

        loadEvents();
    }
});