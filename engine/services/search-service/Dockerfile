FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/app.js"]
