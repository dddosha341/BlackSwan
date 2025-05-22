document.addEventListener('DOMContentLoaded', () => {
       if (window.location.pathname.split('/').pop() === 'events.html') {
           let events;
           const today = new Date('2025-05-22T08:01:00'); // Обновлено до текущего времени (08:01 AM EDT)

           // Загрузка данных из events.json или localStorage
           function loadEvents() {
               if (localStorage.getItem('events')) {
                   events = JSON.parse(localStorage.getItem('events'));
                   displayEvents();
               } else {
                   fetch('events.json')
                       .then(response => response.json())
                       .then(data => {
                           events = data;
                           localStorage.setItem('events', JSON.stringify(events));
                           displayEvents();
                       })
                       .catch(error => {
                           console.error('Error loading events.json:', error);
                           events = [];
                           displayEvents();
                       });
               }
           }

           const eventsList = document.getElementById('events-list');
           const eventTypeFilter = document.getElementById('event-type');

           // Функция отображения событий с фильтрацией только по типу
           function displayEvents(filterType = 'all') {
               if (!events || events.length === 0) {
                   eventsList.innerHTML = '<p>Нет событий. Проверь консоль для ошибок.</p>';
                   console.log('Events data is empty or not loaded');
                   return;
               }

               console.log('Filter type:', filterType); // Отладка: выводим выбранный тип
               // Фильтрация событий только по типу
               const filteredEvents = events.filter(event => {
                   return filterType === 'all' || event.type === filterType;
               }).sort((a, b) => new Date(b.date) - new Date(a.date));

               console.log('Filtered events:', filteredEvents); // Отладка: выводим отфильтрованные события

               eventsList.innerHTML = `
                   ${filteredEvents.map(event => {
                       const eventDate = new Date(event.date);
                       const isUpcoming = eventDate > today && event.status === 'upcoming';
                       const actionButton = isUpcoming ? 'Забронировать столик' : 'Подробнее';
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
               displayEvents(e.target.value);
           });

           // Инициализация при загрузке
           loadEvents();
       }
   });