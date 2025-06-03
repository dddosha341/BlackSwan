const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cookieParser = require('cookie-parser');


const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const SECRET_KEY = 'K@kZv3zdaVostochnogoNeba$2025'; 

const adminUser = {
    username: 'admin',
    password: '123' 
};

app.get('/admin/:page', verifyToken, (req, res) => {
    const filePath = path.join(__dirname, 'public', 'admin', req.params.page);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Страница не найдена');
    }
    res.sendFile(filePath);
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.post('/admin', (req, res) => {
    const { username, password } = req.body;
  
    if (username === adminUser.username && password === adminUser.password) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        return res.json({ 
            success: true,
            token 
        });
    }
  
    res.status(401).json({ error: 'Неверный логин или пароль' });
});

function verifyToken(req, res, next) {
    const token = req.cookies?.adminToken || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ error: 'Требуется авторизация' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Недействительный токен' });
        req.user = user;
        next();
    });
}

app.use('/admin', (req, res, next) => {
    const allowedPrefixes = ['/js/', '/styles/', '/images/', '/media/'];
    const isAsset = allowedPrefixes.some(prefix => req.path.startsWith(prefix));

    if (isAsset || req.path === '/' || req.path === '/index.html') {
        return next(); 
    }

    verifyToken(req, res, next);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/admin/check-auth', verifyToken, (req, res) => {
    res.json({ valid: true });
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'images');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext); 
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webm/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Только изображения (jpg, png, gif, webm)'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } 
});

app.get('/api/admin/bookings', verifyToken, (req, res) => {
    fs.readFile(path.join(__dirname, 'data/booking.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения booking.json:', err);
            return res.status(500).json({ error: 'Ошибка при загрузке бронирований' });
        }
        
        try {
            const bookings = JSON.parse(data);
            res.json(bookings);
        } catch (parseErr) {
            console.error('Ошибка парсинга booking.json:', parseErr);
            res.status(500).json({ error: 'Ошибка обработки данных бронирований' });
        }
    });
});

app.post('/api/admin/bookings/mark-called', verifyToken, (req, res) => {
    const { name, date, time } = req.body;

    fs.readFile(path.join(__dirname, 'data/booking.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения booking.json:', err);
            return res.status(500).json({ error: 'Ошибка при загрузке бронирований' });
        }

        try {
            let bookings = JSON.parse(data);
            
            const bookingIndex = bookings.findIndex(b => 
                b.name === name && b.date === date && b.time === time
            );

            if (bookingIndex === -1) {
                return res.status(404).json({ error: 'Бронирование не найдено' });
            }

            bookings[bookingIndex].isCalled = !bookings[bookingIndex].isCalled;

            fs.writeFile(path.join(__dirname, 'data/booking.json'), JSON.stringify(bookings, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Ошибка записи booking.json:', writeErr);
                    return res.status(500).json({ error: 'Ошибка при сохранении бронирования' });
                }

                res.json({ success: true, isCalled: bookings[bookingIndex].isCalled });
            });
        } catch (parseErr) {
            console.error('Ошибка парсинга booking.json:', parseErr);
            res.status(500).json({ error: 'Ошибка обработки данных бронирований' });
        }
    });
});


app.get('/api/admin/events', verifyToken, (req, res) => {
    fs.readFile(path.join(__dirname, 'data/events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения events.json:', err);
            return res.status(500).json({ error: 'Ошибка при загрузке мероприятий' });
        }
        
        try {
            const events = JSON.parse(data);
            res.json(events);
        } catch (parseErr) {
            console.error('Ошибка парсинга events.json:', parseErr);
            res.status(500).json({ error: 'Ошибка обработки данных мероприятий' });
        }
    });
});

app.get('/api/admin/all-images', verifyToken, (req, res) => {
    const scanDirectory = (dir, relative = '') => {
        const results = [];
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const relPath = path.join(relative, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                results.push(...scanDirectory(fullPath, relPath));
            } else if (/\.(jpg|jpeg|png|gif|webm)$/i.test(file)) {
                results.push({
                    path: path.join('images', relPath).replace(/\\/g, '/'),
                    name: file
                });
            }
        });
        
        return results;
    };
    
    try {
        const images = scanDirectory(path.join(__dirname, 'public', 'images'));
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/admin/events/:id', verifyToken, async (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync('data/events.json'));
        const event = events.find(e => e.id == req.params.id);
        
        if (!event) return res.status(404).send('Мероприятие не найдено');
        res.json(event);
        
    } catch (err) {
        res.status(500).send('Ошибка сервера');
    }
});


app.post('/api/admin/events', verifyToken, (req, res) => {
    const newEvent = req.body;

    fs.readFile(path.join(__dirname, 'data/events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения events.json:', err);
            return res.status(500).json({ error: 'Ошибка при загрузке мероприятий' });
        }
        
        try {
            let events = JSON.parse(data);

            const maxId = events.reduce((max, e) => Math.max(max, e.id), 0);
            newEvent.id = maxId + 1;

            events.push(newEvent);

            fs.writeFile(path.join(__dirname, 'data/events.json'), JSON.stringify(events, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Ошибка записи events.json:', writeErr);
                    return res.status(500).json({ error: 'Ошибка при сохранении мероприятия' });
                }

                res.status(201).json(newEvent);
            });
        } catch (parseErr) {
            console.error('Ошибка парсинга events.json:', parseErr);
            res.status(500).json({ error: 'Ошибка обработки данных мероприятий' });
        }
    });
});

app.put('/api/admin/events/:id', verifyToken, async (req, res) => {
    try {
        const events = JSON.parse(fs.readFileSync('data/events.json'));
        const index = events.findIndex(e => e.id == req.params.id);
        
        if (index === -1) return res.status(404).send('Мероприятие не найдено');

        const oldData = {
            id: events[index].id,
            createdAt: events[index].createdAt || new Date().toISOString()
        };

        events[index] = { ...req.body, ...oldData };
        
        fs.writeFileSync('data/events.json', JSON.stringify(events, null, 2));
        res.json({ success: true });
        
    } catch (err) {
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/api/admin/menu-items', verifyToken, async (req, res) => {
    try {
        const data = await fs.promises.readFile('data/menu-items.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Ошибка чтения меню' });
    }
});

app.get('/api/admin/menu-items/:id', verifyToken, async (req, res) => {
    try {
        const data = await fs.promises.readFile('data/menu-items.json', 'utf8');
        const menuItems = JSON.parse(data);
        const item = menuItems.find(i => i.id == req.params.id);
        
        if (!item) return res.status(404).json({ error: 'Пункт меню не найден' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/admin/menu-items', verifyToken, async (req, res) => {
    try {
        const filePath = 'data/menu-items.json';
        const data = await fs.promises.readFile(filePath, 'utf8');
        let menuItems = JSON.parse(data);

        if (!req.body.id) {
            const maxId = menuItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
            req.body.id = maxId + 1;
            menuItems.push(req.body);
        } else {
            const index = menuItems.findIndex(i => i.id == req.body.id);
            if (index === -1) return res.status(404).json({ error: 'Пункт не найден' });
            menuItems[index] = req.body;
        }
        
        await fs.promises.writeFile(filePath, JSON.stringify(menuItems, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сохранения' });
    }
});

app.put('/api/admin/menu-items/:id', verifyToken, async (req, res) => {
    try {
        const filePath = 'data/menu-items.json';
        const data = await fs.promises.readFile(filePath, 'utf8');
        let menuItems = JSON.parse(data);
        const index = menuItems.findIndex(i => i.id == req.params.id);
        
        if (index === -1) return res.status(404).json({ error: 'Пункт не найден' });
        
        menuItems[index] = { ...menuItems[index], ...req.body };
        await fs.promises.writeFile(filePath, JSON.stringify(menuItems, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка обновления' });
    }
});

app.delete('/api/admin/menu-items/:id', verifyToken, async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data', 'menu-items.json');
        
        const data = await fs.promises.readFile(filePath, 'utf8');
        let menuItems = JSON.parse(data);
        
        menuItems = menuItems.filter(i => i.id !== parseInt(req.params.id));

        await fs.promises.writeFile(filePath, JSON.stringify(menuItems, null, 2));
        res.json({ success: true, message: 'Удалено' });
    } catch (err) {
        console.error('Ошибка, сука:', err);
        res.status(500).json({ error: 'Не вышло' });
    }
});

app.delete('/api/admin/events/:id', verifyToken, (req, res) => {
    const eventId = req.params.id;
    
    fs.readFile(path.join(__dirname, 'data', 'events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения файла:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        
        try {
            let events = JSON.parse(data);
            const initialLength = events.length;

            events = events.filter(event => event.id != eventId);
            
            if (events.length === initialLength) {
                return res.status(404).json({ error: 'Мероприятие не найдено' });
            }

            fs.writeFile(path.join(__dirname, 'data', 'events.json'), JSON.stringify(events, null, 2), (err) => {
                if (err) {
                    console.error('Ошибка записи файла:', err);
                    return res.status(500).json({ error: 'Ошибка сохранения' });
                }
                
                res.json({ success: true });
            });
        } catch (parseErr) {
            console.error('Ошибка парсинга:', parseErr);
            res.status(500).json({ error: 'Ошибка обработки данных' });
        }
    });
});

app.post('/api/admin/upload-image', verifyToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }

    const imagePath = path.join('images', req.file.filename).replace(/\\/g, '/');
    res.json({ path: imagePath });
});

app.get('/api/admin/images', verifyToken, (req, res) => {
    try {
        const imagesDir = path.join(__dirname, 'public/images');
        const images = fs.readdirSync(imagesDir)
            .filter(file => /\.(jpg|jpeg|png|gif|webm)$/i.test(file))
            .map(file => ({
                path: `images/${file}`,
                name: file.split('.')[0]
            }));
        
        res.json(images);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.get('/api/admin/dashboard', verifyToken, (req, res) => {
    res.json({ message: 'Добро пожаловать в админку!' });
});

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/api/reviews', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/reviews.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Ошибка при загрузке отзывов' });
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

app.post('/api/booking', (req, res) => {
    const { name, date, time, phone, people, requests } = req.body;

    if (!name || !date || !time || !phone || !people) {
        return res.status(400).json({ error: 'Неполные данные бронирования' });
    }

    const newBooking = {
        name,
        date,
        time,
        phone,
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

app.get('/api/reviews', (req, res) => {
    console.log('GET /api/reviews'); // Отладка
    fs.readFile(path.join(__dirname, 'data/reviews.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading reviews.json:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        let reviews = [];
        try {
            reviews = JSON.parse(data);
            console.log('Всего отзывов в файле:', reviews.length); // Отладка
        } catch (e) {
            console.error('Invalid JSON in reviews.json:', e);
            reviews = [];
        }
        // Ограничение до 20 отзывов
        const limitedReviews = reviews.slice(0, 20);
        console.log('Отправлено отзывов:', limitedReviews.length); // Отладка
        res.json(limitedReviews);
    });
});

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

