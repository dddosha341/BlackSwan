# Dockerfile
FROM node:18

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json ./
RUN npm install

RUN npm install multer jsonwebtoken cookie-parser helmet express-rate-limit
# Копируем весь проект (кроме игнорируемых файлов)
COPY . .

# Порт, который будет слушать сервер
EXPOSE 3000

# Команда запуска
CMD ["npm", "start"]
