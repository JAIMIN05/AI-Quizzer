FROM node:20-alpine

WORKDIR /Backend_Task

COPY package*.json ./

RUN npm install --production

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "app.js"]