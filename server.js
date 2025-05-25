const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Простенькое API
app.get('/api/menu', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/menu-items.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении menu-items.json:', err);
            return res.status(500).json({ error: 'Ошибка при загрузке меню' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Можно добавить другие API по аналогии:
app.get('/api/reviews', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/reviews.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Ошибка при загрузке отзывов' });
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// Обработка бронирований
app.post('/api/booking', (req, res) => {
    const { name, date, time, people, requests } = req.body;

    if (!name || !date || !time || !people) {
        return res.status(400).json({ error: 'Неполные данные бронирования' });
    }

    const newBooking = {
        name,
        date,
        time,
        people,
        requests,
        isCalled: false
    };

    const bookingPath = path.join(__dirname, 'data', 'booking.json');

    fs.readFile(bookingPath, 'utf8', (err, data) => {
        let bookings = [];

        if (!err && data.trim()) {
            try {
                bookings = JSON.parse(data);
            } catch (parseErr) {
                return res.status(500).json({ error: 'Ошибка чтения данных бронирования' });
            }
        }

        bookings.push(newBooking);

        fs.writeFile(bookingPath, JSON.stringify(bookings, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: 'Ошибка записи бронирования' });
            }

            res.status(201).json({ message: 'Бронирование принято' });
        });
    });
});

app.get('/api/events', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении events.json:', err);
            return res.status(500).json({ error: 'Ошибка при загрузке событий' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// Получить все отзывы
app.get('/api/reviews', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/reviews.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading reviews.json:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        let reviews = [];
        try {
            reviews = JSON.parse(data);
        } catch {
            reviews = [];
        }
        res.json(reviews);
    });
});

// Добавить новый отзыв
app.post('/api/reviews', (req, res) => {
    const { author, rating, comment } = req.body;

    if (!author || !rating || !comment) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    fs.readFile(path.join(__dirname, 'data/reviews.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading reviews.json:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        let reviews = [];
        try {
            reviews = JSON.parse(data);
        } catch (e) {
            console.error('Invalid JSON in reviews.json');
        }

        const maxId = reviews.reduce((max, r) => Math.max(max, r.id), 0);
        const newReview = {
            id: maxId + 1,
            author,
            rating: parseInt(rating),
            date: new Date().toISOString(),
            comment
        };

        reviews.push(newReview);

        fs.writeFile(path.join(__dirname, 'data/reviews.json'), JSON.stringify(reviews, null, 2), (err) => {
            if (err) {
                console.error('Error writing reviews.json:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json(newReview);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер работает на http://localhost:${PORT}`);
});

