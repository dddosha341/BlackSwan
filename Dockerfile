FROM node:18

WORKDIR /app

COPY package.json ./
RUN npm install

RUN npm install multer jsonwebtoken cookie-parser helmet express-rate-limit
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
